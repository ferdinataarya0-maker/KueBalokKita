'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alternative,
  Criteria,
  SubCriteria,
  Assessment,
  mockAlternatives,
  mockCriteria,
  mockAssessments,
} from '@/lib/dss-data';

// Backend integration point: ganti localStorage dengan query/mutasi Supabase.

export type ActivityType = 'varian' | 'kriteria' | 'penilaian' | 'hitung' | 'excel' | 'sistem';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  time: string; // ISO string
}

interface DSSData {
  alternatives: Alternative[];
  criteria: Criteria[];
  assessments: Assessment[];
  lambda: number;
  activity: ActivityItem[];
}

export interface DSSPayload {
  alternatives: Alternative[];
  criteria: Criteria[];
  assessments: Assessment[];
}

const STORAGE_KEY = 'linera-dss-v1';
const MAX_ACTIVITY = 30;

const seed = (): DSSData => ({
  alternatives: mockAlternatives,
  criteria: mockCriteria,
  assessments: mockAssessments,
  lambda: 0.5,
  activity: [],
});

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function withLog(
  data: DSSData,
  type: ActivityType,
  message: string,
  coalesce = false
): DSSData {
  const now = new Date();
  const last = data.activity[0];
  if (
    coalesce &&
    last &&
    last.type === type &&
    now.getTime() - new Date(last.time).getTime() < 60_000
  ) {
    return {
      ...data,
      activity: [{ ...last, message, time: now.toISOString() }, ...data.activity.slice(1)],
    };
  }
  return {
    ...data,
    activity: [{ id: uid('act'), type, message, time: now.toISOString() }, ...data.activity].slice(
      0,
      MAX_ACTIVITY
    ),
  };
}

/** Saran kode berikutnya, misalnya A7 atau C6. */
export function nextKode(prefix: string, existing: { kode: string }[]): string {
  const max = existing.reduce((m, e) => {
    const n = parseInt(e.kode.replace(prefix, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}${max + 1}`;
}

/** Cek apakah data siap dihitung. */
export function getReadiness(
  alternatives: Alternative[],
  criteria: Criteria[],
  assessments: Assessment[]
) {
  const totalBobot = Math.round(criteria.reduce((s, c) => s + c.bobot, 0) * 100) / 100;
  const bobotValid = Math.abs(totalBobot - 100) < 0.01;
  const expected = alternatives.length * criteria.length;
  const filled = alternatives.reduce(
    (n, a) =>
      n +
      criteria.filter((c) =>
        assessments.some((x) => x.alternativeId === a.id && x.criteriaId === c.id)
      ).length,
    0
  );
  const hasData = alternatives.length > 0 && criteria.length > 0;
  const lengkap = hasData && filled === expected;
  return { totalBobot, bobotValid, expected, filled, hasData, lengkap, ready: hasData && bobotValid && lengkap };
}

interface DSSContextValue extends DSSData {
  ready: boolean; // true setelah data dibaca dari localStorage
  addAlternative: (a: Omit<Alternative, 'id'>) => void;
  updateAlternative: (id: string, patch: Partial<Omit<Alternative, 'id'>>) => void;
  deleteAlternative: (id: string) => void;
  addCriteria: (c: Omit<Criteria, 'id'>) => void;
  updateCriteria: (id: string, patch: Partial<Omit<Criteria, 'id'>>) => void;
  deleteCriteria: (id: string) => void;
  addSubCriteria: (criteriaId: string, sub: Omit<SubCriteria, 'id'>) => void;
  updateSubCriteria: (criteriaId: string, subId: string, patch: Partial<Omit<SubCriteria, 'id'>>) => void;
  deleteSubCriteria: (criteriaId: string, subId: string) => void;
  normalizeBobot: () => void;
  setAssessment: (alternativeId: string, criteriaId: string, nilai: number | null) => void;
  setLambda: (lambda: number) => void;
  replaceAll: (payload: DSSPayload, message: string) => void;
  resetToSample: () => void;
  clearAll: () => void;
  logActivity: (type: ActivityType, message: string) => void;
}

const DSSContext = createContext<DSSContextValue | null>(null);

export function DSSProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DSSData>(seed);
  const [ready, setReady] = useState(false);

  // Baca dari localStorage setelah halaman tampil (menghindari hydration mismatch)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          Array.isArray(parsed?.alternatives) &&
          Array.isArray(parsed?.criteria) &&
          Array.isArray(parsed?.assessments)
        ) {
          setData({
            alternatives: parsed.alternatives,
            criteria: parsed.criteria,
            assessments: parsed.assessments,
            lambda: typeof parsed.lambda === 'number' ? parsed.lambda : 0.5,
            activity: Array.isArray(parsed.activity) ? parsed.activity : [],
          });
        }
      }
    } catch {
      // data rusak → pakai data contoh
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // penyimpanan penuh / diblokir → abaikan
    }
  }, [data, ready]);

  const addAlternative = useCallback((a: Omit<Alternative, 'id'>) => {
    setData((p) =>
      withLog(
        { ...p, alternatives: [...p.alternatives, { ...a, id: uid('alt') }] },
        'varian',
        `Menambah varian ${a.nama} (${a.kode})`
      )
    );
  }, []);

  const updateAlternative = useCallback(
    (id: string, patch: Partial<Omit<Alternative, 'id'>>) => {
      setData((p) => {
        const old = p.alternatives.find((x) => x.id === id);
        return withLog(
          {
            ...p,
            alternatives: p.alternatives.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          },
          'varian',
          `Mengubah varian ${patch.nama ?? old?.nama ?? ''}`
        );
      });
    },
    []
  );

  const deleteAlternative = useCallback((id: string) => {
    setData((p) => {
      const old = p.alternatives.find((x) => x.id === id);
      return withLog(
        {
          ...p,
          alternatives: p.alternatives.filter((x) => x.id !== id),
          assessments: p.assessments.filter((x) => x.alternativeId !== id),
        },
        'varian',
        `Menghapus varian ${old?.nama ?? ''}`
      );
    });
  }, []);

  const addCriteria = useCallback((c: Omit<Criteria, 'id'>) => {
    setData((p) =>
      withLog(
        { ...p, criteria: [...p.criteria, { ...c, id: uid('crit') }] },
        'kriteria',
        `Menambah kriteria ${c.nama} (${c.kode})`
      )
    );
  }, []);

  const updateCriteria = useCallback((id: string, patch: Partial<Omit<Criteria, 'id'>>) => {
    setData((p) => {
      const old = p.criteria.find((x) => x.id === id);
      return withLog(
        { ...p, criteria: p.criteria.map((x) => (x.id === id ? { ...x, ...patch } : x)) },
        'kriteria',
        `Mengubah kriteria ${patch.nama ?? old?.nama ?? ''}`
      );
    });
  }, []);

  const deleteCriteria = useCallback((id: string) => {
    setData((p) => {
      const old = p.criteria.find((x) => x.id === id);
      return withLog(
        {
          ...p,
          criteria: p.criteria.filter((x) => x.id !== id),
          assessments: p.assessments.filter((x) => x.criteriaId !== id),
        },
        'kriteria',
        `Menghapus kriteria ${old?.nama ?? ''}`
      );
    });
  }, []);

  const mapSub = (
    p: DSSData,
    criteriaId: string,
    fn: (subs: SubCriteria[]) => SubCriteria[]
  ): DSSData => ({
    ...p,
    criteria: p.criteria.map((c) =>
      c.id === criteriaId ? { ...c, subKriteria: fn(c.subKriteria ?? []) } : c
    ),
  });

  const addSubCriteria = useCallback((criteriaId: string, sub: Omit<SubCriteria, 'id'>) => {
    setData((p) => {
      const c = p.criteria.find((x) => x.id === criteriaId);
      return withLog(
        mapSub(p, criteriaId, (subs) => [...subs, { ...sub, id: uid('sub') }]),
        'kriteria',
        `Menambah sub kriteria "${sub.label}" pada ${c?.nama ?? 'kriteria'}`
      );
    });
  }, []);

  const updateSubCriteria = useCallback(
    (criteriaId: string, subId: string, patch: Partial<Omit<SubCriteria, 'id'>>) => {
      setData((p) => {
        const c = p.criteria.find((x) => x.id === criteriaId);
        return withLog(
          mapSub(p, criteriaId, (subs) => subs.map((s) => (s.id === subId ? { ...s, ...patch } : s))),
          'kriteria',
          `Mengubah sub kriteria pada ${c?.nama ?? 'kriteria'}`,
          true
        );
      });
    },
    []
  );

  const deleteSubCriteria = useCallback((criteriaId: string, subId: string) => {
    setData((p) => {
      const c = p.criteria.find((x) => x.id === criteriaId);
      const old = c?.subKriteria?.find((s) => s.id === subId);
      return withLog(
        mapSub(p, criteriaId, (subs) => subs.filter((s) => s.id !== subId)),
        'kriteria',
        `Menghapus sub kriteria "${old?.label ?? ''}" dari ${c?.nama ?? 'kriteria'}`
      );
    });
  }, []);

  // Skala ulang bobot agar totalnya tepat 100 (selisih pembulatan masuk ke bobot terbesar)
  const normalizeBobot = useCallback(() => {
    setData((p) => {
      const total = p.criteria.reduce((s, c) => s + c.bobot, 0);
      if (p.criteria.length === 0) return p;
      const scaled = p.criteria.map((c) => ({
        ...c,
        bobot:
          total > 0
            ? Math.round((c.bobot / total) * 100 * 100) / 100
            : Math.round((100 / p.criteria.length) * 100) / 100,
      }));
      const diff = Math.round((100 - scaled.reduce((s, c) => s + c.bobot, 0)) * 100) / 100;
      if (diff !== 0) {
        const iMax = scaled.reduce((m, c, i, arr) => (c.bobot > arr[m].bobot ? i : m), 0);
        scaled[iMax].bobot = Math.round((scaled[iMax].bobot + diff) * 100) / 100;
      }
      return withLog({ ...p, criteria: scaled }, 'kriteria', 'Menormalkan total bobot menjadi 100%');
    });
  }, []);

  const setAssessment = useCallback(
    (alternativeId: string, criteriaId: string, nilai: number | null) => {
      setData((p) => {
        const rest = p.assessments.filter(
          (x) => !(x.alternativeId === alternativeId && x.criteriaId === criteriaId)
        );
        const next =
          nilai === null || !Number.isFinite(nilai)
            ? rest
            : [...rest, { id: uid('ass'), alternativeId, criteriaId, nilai }];
        return withLog({ ...p, assessments: next }, 'penilaian', 'Memperbarui nilai penilaian', true);
      });
    },
    []
  );

  const setLambda = useCallback((lambda: number) => {
    setData((p) => ({ ...p, lambda }));
  }, []);

  const replaceAll = useCallback((payload: DSSPayload, message: string) => {
    setData((p) => withLog({ ...p, ...payload }, 'excel', message));
  }, []);

  const resetToSample = useCallback(() => {
    setData((p) =>
      withLog(
        {
          ...p,
          alternatives: mockAlternatives,
          criteria: mockCriteria,
          assessments: mockAssessments,
          lambda: 0.5,
        },
        'sistem',
        'Mengembalikan data ke contoh awal'
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setData((p) =>
      withLog(
        { ...p, alternatives: [], criteria: [], assessments: [] },
        'sistem',
        'Menghapus semua data varian, kriteria, dan penilaian'
      )
    );
  }, []);

  const logActivity = useCallback((type: ActivityType, message: string) => {
    setData((p) => withLog(p, type, message));
  }, []);

  const value = useMemo<DSSContextValue>(
    () => ({
      ...data,
      ready,
      addAlternative,
      updateAlternative,
      deleteAlternative,
      addCriteria,
      updateCriteria,
      deleteCriteria,
      addSubCriteria,
      updateSubCriteria,
      deleteSubCriteria,
      normalizeBobot,
      setAssessment,
      setLambda,
      replaceAll,
      resetToSample,
      clearAll,
      logActivity,
    }),
    [
      data,
      ready,
      addAlternative,
      updateAlternative,
      deleteAlternative,
      addCriteria,
      updateCriteria,
      deleteCriteria,
      addSubCriteria,
      updateSubCriteria,
      deleteSubCriteria,
      normalizeBobot,
      setAssessment,
      setLambda,
      replaceAll,
      resetToSample,
      clearAll,
      logActivity,
    ]
  );

  return <DSSContext.Provider value={value}>{children}</DSSContext.Provider>;
}

export function useDSS(): DSSContextValue {
  const ctx = useContext(DSSContext);
  if (!ctx) throw new Error('useDSS harus dipakai di dalam <DSSProvider>');
  return ctx;
}
