// Backend integration point: Replace all mock data with Supabase queries
// import { createClient } from '@supabase/supabase-js';

export interface Alternative {
  id: string;
  kode: string;
  nama: string;
  harga: number;
  deskripsi: string;
  bestSeller?: boolean; // ditandai admin, tampil di panel owner
}

export interface SubCriteria {
  id: string;
  label: string; // misal "Sangat enak"
  nilai: number; // skor yang dipakai di perhitungan, misal 5
}

export interface Criteria {
  id: string;
  kode: string;
  nama: string;
  jenis: 'BENEFIT' | 'COST';
  bobot: number; // dalam persen, misal 20 berarti 20%
  // Pilihan skala penilaian. Kosong/tidak ada = nilai diketik bebas (angka).
  subKriteria?: SubCriteria[];
}

export interface Assessment {
  id: string;
  alternativeId: string;
  criteriaId: string;
  nilai: number;
}

export interface SAWResult {
  alternativeId: string;
  kode: string;
  nama: string;
  normalizedValues: Record<string, number>;
  weightedValues: Record<string, number>;
  nilaiSAW: number;
  ranking: number;
}

export interface WASPASResult {
  alternativeId: string;
  kode: string;
  nama: string;
  normalizedValues: Record<string, number>;
  wsm: number;
  wpm: number;
  nilaiQ: number;
  ranking: number;
}

export interface ComparisonResult {
  alternativeId: string;
  kode: string;
  nama: string;
  nilaiSAW: number;
  rankingSAW: number;
  nilaiWASPAS: number;
  rankingWASPAS: number;
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
// Backend integration point: fetch from Supabase table 'alternatives'
export const mockAlternatives: Alternative[] = [
  { id: 'alt-001', kode: 'A1', nama: 'Cokelat', harga: 12000, deskripsi: 'Varian klasik dengan topping cokelat leleh' },
  { id: 'alt-002', kode: 'A2', nama: 'Keju', harga: 13000, deskripsi: 'Topping keju parut melimpah dengan rasa gurih' },
  { id: 'alt-003', kode: 'A3', nama: 'Tiramisu', harga: 15000, deskripsi: 'Perpaduan kopi dan mascarpone premium' },
  { id: 'alt-004', kode: 'A4', nama: 'Matcha', harga: 14000, deskripsi: 'Kue balok dengan bubuk matcha Jepang asli' },
  { id: 'alt-005', kode: 'A5', nama: 'Cokelat Keju', harga: 15000, deskripsi: 'Kombinasi cokelat dan keju yang sempurna' },
  { id: 'alt-006', kode: 'A6', nama: 'Red Velvet', harga: 16000, deskripsi: 'Kue balok merah elegan dengan cream cheese' },
];

// Backend integration point: fetch from Supabase table 'criteria'
export const mockCriteria: Criteria[] = [
  { id: 'crit-001', kode: 'C1', nama: 'Harga', jenis: 'COST', bobot: 20 },
  {
    id: 'crit-002', kode: 'C2', nama: 'Rasa', jenis: 'BENEFIT', bobot: 25,
    // CONTOH sementara, ganti sesuai informasi dari pemilik kue balok
    subKriteria: [
      { id: 'sub-002-5', label: 'Sangat enak', nilai: 5 },
      { id: 'sub-002-4', label: 'Enak', nilai: 4 },
      { id: 'sub-002-3', label: 'Cukup enak', nilai: 3 },
      { id: 'sub-002-2', label: 'Kurang enak', nilai: 2 },
      { id: 'sub-002-1', label: 'Tidak enak', nilai: 1 },
    ],
  },
  {
    id: 'crit-003', kode: 'C3', nama: 'Tekstur', jenis: 'BENEFIT', bobot: 15,
    // CONTOH sementara, ganti sesuai informasi dari pemilik kue balok
    subKriteria: [
      { id: 'sub-003-5', label: 'Sangat lembut', nilai: 5 },
      { id: 'sub-003-4', label: 'Lembut', nilai: 4 },
      { id: 'sub-003-3', label: 'Cukup lembut', nilai: 3 },
      { id: 'sub-003-2', label: 'Agak keras', nilai: 2 },
      { id: 'sub-003-1', label: 'Keras', nilai: 1 },
    ],
  },
  { id: 'crit-004', kode: 'C4', nama: 'Tingkat Penjualan', jenis: 'BENEFIT', bobot: 25 },
  { id: 'crit-005', kode: 'C5', nama: 'Minat Pelanggan', jenis: 'BENEFIT', bobot: 15 },
];

// Backend integration point: fetch from Supabase table 'assessments'
export const mockAssessments: Assessment[] = [
  // A1 Cokelat
  { id: 'ass-001', alternativeId: 'alt-001', criteriaId: 'crit-001', nilai: 12000 },
  { id: 'ass-002', alternativeId: 'alt-001', criteriaId: 'crit-002', nilai: 4 },
  { id: 'ass-003', alternativeId: 'alt-001', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-004', alternativeId: 'alt-001', criteriaId: 'crit-004', nilai: 80 },
  { id: 'ass-005', alternativeId: 'alt-001', criteriaId: 'crit-005', nilai: 85 },
  // A2 Keju
  { id: 'ass-006', alternativeId: 'alt-002', criteriaId: 'crit-001', nilai: 13000 },
  { id: 'ass-007', alternativeId: 'alt-002', criteriaId: 'crit-002', nilai: 4 },
  { id: 'ass-008', alternativeId: 'alt-002', criteriaId: 'crit-003', nilai: 5 },
  { id: 'ass-009', alternativeId: 'alt-002', criteriaId: 'crit-004', nilai: 75 },
  { id: 'ass-010', alternativeId: 'alt-002', criteriaId: 'crit-005', nilai: 80 },
  // A3 Tiramisu
  { id: 'ass-011', alternativeId: 'alt-003', criteriaId: 'crit-001', nilai: 15000 },
  { id: 'ass-012', alternativeId: 'alt-003', criteriaId: 'crit-002', nilai: 5 },
  { id: 'ass-013', alternativeId: 'alt-003', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-014', alternativeId: 'alt-003', criteriaId: 'crit-004', nilai: 70 },
  { id: 'ass-015', alternativeId: 'alt-003', criteriaId: 'crit-005', nilai: 78 },
  // A4 Matcha
  { id: 'ass-016', alternativeId: 'alt-004', criteriaId: 'crit-001', nilai: 14000 },
  { id: 'ass-017', alternativeId: 'alt-004', criteriaId: 'crit-002', nilai: 4 },
  { id: 'ass-018', alternativeId: 'alt-004', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-019', alternativeId: 'alt-004', criteriaId: 'crit-004', nilai: 65 },
  { id: 'ass-020', alternativeId: 'alt-004', criteriaId: 'crit-005', nilai: 70 },
  // A5 Cokelat Keju
  { id: 'ass-021', alternativeId: 'alt-005', criteriaId: 'crit-001', nilai: 15000 },
  { id: 'ass-022', alternativeId: 'alt-005', criteriaId: 'crit-002', nilai: 5 },
  { id: 'ass-023', alternativeId: 'alt-005', criteriaId: 'crit-003', nilai: 5 },
  { id: 'ass-024', alternativeId: 'alt-005', criteriaId: 'crit-004', nilai: 90 },
  { id: 'ass-025', alternativeId: 'alt-005', criteriaId: 'crit-005', nilai: 95 },
  // A6 Red Velvet
  { id: 'ass-026', alternativeId: 'alt-006', criteriaId: 'crit-001', nilai: 16000 },
  { id: 'ass-027', alternativeId: 'alt-006', criteriaId: 'crit-002', nilai: 4 },
  { id: 'ass-028', alternativeId: 'alt-006', criteriaId: 'crit-003', nilai: 4 },
  { id: 'ass-029', alternativeId: 'alt-006', criteriaId: 'crit-004', nilai: 60 },
  { id: 'ass-030', alternativeId: 'alt-006', criteriaId: 'crit-005', nilai: 68 },
];

// ── CALCULATION FUNCTIONS ─────────────────────────────────────────────────────

export function getAssessmentMatrix(
  alternatives: Alternative[],
  criteria: Criteria[],
  assessments: Assessment[]
): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {};
  for (const alt of alternatives) {
    matrix[alt.id] = {};
    for (const crit of criteria) {
      const ass = assessments.find(
        (a) => a.alternativeId === alt.id && a.criteriaId === crit.id
      );
      matrix[alt.id][crit.id] = ass ? ass.nilai : 0;
    }
  }
  return matrix;
}

export function normalizeSAW(
  alternatives: Alternative[],
  criteria: Criteria[],
  matrix: Record<string, Record<string, number>>
): Record<string, Record<string, number>> {
  const normalized: Record<string, Record<string, number>> = {};

  for (const alt of alternatives) {
    normalized[alt.id] = {};
  }

  for (const crit of criteria) {
    const values = alternatives.map((alt) => matrix[alt.id][crit.id]);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    for (const alt of alternatives) {
      const xij = matrix[alt.id][crit.id];
      if (crit.jenis === 'BENEFIT') {
        normalized[alt.id][crit.id] = maxVal !== 0 ? xij / maxVal : 0;
      } else {
        // COST
        normalized[alt.id][crit.id] = xij !== 0 ? minVal / xij : 0;
      }
    }
  }

  return normalized;
}

export function calculateSAW(
  alternatives: Alternative[],
  criteria: Criteria[],
  assessments: Assessment[]
): SAWResult[] {
  const matrix = getAssessmentMatrix(alternatives, criteria, assessments);
  const normalized = normalizeSAW(alternatives, criteria, matrix);

  const results: SAWResult[] = alternatives.map((alt) => {
    const weightedValues: Record<string, number> = {};
    let nilaiSAW = 0;

    for (const crit of criteria) {
      const w = crit.bobot / 100; // konversi persen ke desimal
      const r = normalized[alt.id][crit.id];
      weightedValues[crit.id] = w * r;
      nilaiSAW += w * r;
    }

    return {
      alternativeId: alt.id,
      kode: alt.kode,
      nama: alt.nama,
      normalizedValues: normalized[alt.id],
      weightedValues,
      nilaiSAW,
      ranking: 0,
    };
  });

  // Sort descending dan assign ranking
  results.sort((a, b) => b.nilaiSAW - a.nilaiSAW);
  results.forEach((r, i) => { r.ranking = i + 1; });

  return results;
}

export function calculateWSM(
  alternatives: Alternative[],
  criteria: Criteria[],
  normalized: Record<string, Record<string, number>>
): Record<string, number> {
  const wsm: Record<string, number> = {};
  for (const alt of alternatives) {
    let sum = 0;
    for (const crit of criteria) {
      const w = crit.bobot / 100;
      sum += w * normalized[alt.id][crit.id];
    }
    wsm[alt.id] = sum;
  }
  return wsm;
}

export function calculateWPM(
  alternatives: Alternative[],
  criteria: Criteria[],
  normalized: Record<string, Record<string, number>>
): Record<string, number> {
  const wpm: Record<string, number> = {};
  for (const alt of alternatives) {
    let product = 1;
    for (const crit of criteria) {
      const w = crit.bobot / 100;
      const r = normalized[alt.id][crit.id];
      product *= Math.pow(r > 0 ? r : 0.0001, w);
    }
    wpm[alt.id] = product;
  }
  return wpm;
}

export function calculateWASPAS(
  alternatives: Alternative[],
  criteria: Criteria[],
  assessments: Assessment[],
  lambda: number = 0.5
): WASPASResult[] {
  const matrix = getAssessmentMatrix(alternatives, criteria, assessments);
  const normalized = normalizeSAW(alternatives, criteria, matrix);
  const wsm = calculateWSM(alternatives, criteria, normalized);
  const wpm = calculateWPM(alternatives, criteria, normalized);

  const results: WASPASResult[] = alternatives.map((alt) => {
    const Q = lambda * wsm[alt.id] + (1 - lambda) * wpm[alt.id];
    return {
      alternativeId: alt.id,
      kode: alt.kode,
      nama: alt.nama,
      normalizedValues: normalized[alt.id],
      wsm: wsm[alt.id],
      wpm: wpm[alt.id],
      nilaiQ: Q,
      ranking: 0,
    };
  });

  results.sort((a, b) => b.nilaiQ - a.nilaiQ);
  results.forEach((r, i) => { r.ranking = i + 1; });

  return results;
}

export function generateComparison(
  sawResults: SAWResult[],
  waspasResults: WASPASResult[]
): ComparisonResult[] {
  return sawResults.map((saw) => {
    const wasp = waspasResults.find((w) => w.alternativeId === saw.alternativeId);
    return {
      alternativeId: saw.alternativeId,
      kode: saw.kode,
      nama: saw.nama,
      nilaiSAW: saw.nilaiSAW,
      rankingSAW: saw.ranking,
      nilaiWASPAS: wasp ? wasp.nilaiQ : 0,
      rankingWASPAS: wasp ? wasp.ranking : 0,
    };
  });
}

export function formatNumber(n: number, decimals: number = 4): string {
  return n.toFixed(decimals);
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}