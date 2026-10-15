'use client';

import React, { useState } from 'react';
import { RotateCcw, ArrowUp, ArrowDown, Minus, Info } from 'lucide-react';
import { useDSS, getReadiness } from '@/lib/dss-store';
import { calculateWASPAS, formatNumber } from '@/lib/dss-data';

export default function OwnerSimulasi() {
  const { alternatives, criteria, assessments, lambda } = useDSS();
  const [sim, setSim] = useState<Record<string, number>>({});
  const r = getReadiness(alternatives, criteria, assessments);

  if (!r.ready) {
    return (
      <div
        className="flex items-start gap-3 px-4 py-4 rounded-xl text-sm"
        style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <p>Simulasi belum bisa dipakai karena bobot atau penilaian belum lengkap. Hubungi admin untuk melengkapinya.</p>
      </div>
    );
  }

  const weightOf = (id: string, def: number) => sim[id] ?? def;
  const total = criteria.reduce((s, c) => s + weightOf(c.id, c.bobot), 0);
  const changed = criteria.some((c) => sim[c.id] !== undefined && sim[c.id] !== c.bobot);

  const original = calculateWASPAS(alternatives, criteria, assessments, lambda);
  const simCriteria = criteria.map((c) => ({
    ...c,
    bobot: total > 0 ? (weightOf(c.id, c.bobot) / total) * 100 : 0,
  }));
  const simulated = total > 0 ? calculateWASPAS(alternatives, simCriteria, assessments, lambda) : [];

  const juaraAsli = original[0];
  const juaraSim = simulated[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-warm p-5">
        <p className="text-sm" style={{ color: 'var(--brown-800)' }}>
          Geser bobot kriteria untuk melihat apakah varian juara berubah. Ini hanya percobaan di layar ini:
          tidak disimpan dan tidak mengubah data admin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Slider bobot */}
        <div className="card-warm p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Bobot kriteria</h3>
            <button
              onClick={() => setSim({})}
              disabled={!changed}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
            >
              <RotateCcw size={12} /> Kembalikan
            </button>
          </div>
          <ul className="space-y-5">
            {criteria.map((c) => {
              const w = weightOf(c.id, c.bobot);
              const efektif = total > 0 ? (w / total) * 100 : 0;
              return (
                <li key={c.id}>
                  <div className="flex justify-between text-sm gap-2">
                    <label htmlFor={`sim-${c.id}`} className="font-medium">{c.nama}</label>
                    <span className="font-tabular" style={{ color: 'var(--muted-foreground)' }}>
                      {efektif.toFixed(1)}% <span className="text-xs">(asli {c.bobot}%)</span>
                    </span>
                  </div>
                  <input
                    id={`sim-${c.id}`}
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={w}
                    onChange={(e) => setSim({ ...sim, [c.id]: Number(e.target.value) })}
                    className="w-full mt-1"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                </li>
              );
            })}
          </ul>
          <p className="text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
            Total bobot otomatis disesuaikan menjadi 100%.
          </p>
        </div>

        {/* Hasil */}
        <div className="lg:col-span-3 space-y-4">
          {total === 0 ? (
            <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
              Semua bobot nol. Naikkan minimal satu kriteria.
            </p>
          ) : (
            <>
              <div
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: juaraSim.alternativeId === juaraAsli.alternativeId ? 'var(--success-bg)' : 'var(--warning-bg)',
                  color: juaraSim.alternativeId === juaraAsli.alternativeId ? 'var(--success)' : 'var(--warning)',
                }}
              >
                {juaraSim.alternativeId === juaraAsli.alternativeId
                  ? `Juara tetap ${juaraAsli.nama}${changed ? ', meski bobot diubah.' : '.'}`
                  : `Juara berubah dari ${juaraAsli.nama} menjadi ${juaraSim.nama}.`}
              </div>

              <div className="card-warm overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        <th className="text-center font-semibold px-4 py-2.5">Simulasi</th>
                        <th className="text-left font-semibold px-4 py-2.5">Varian</th>
                        <th className="text-right font-semibold px-4 py-2.5">Nilai Q</th>
                        <th className="text-center font-semibold px-4 py-2.5">Asli</th>
                        <th className="text-center font-semibold px-4 py-2.5">Perubahan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulated.map((s) => {
                        const asli = original.find((o) => o.alternativeId === s.alternativeId)?.ranking ?? s.ranking;
                        const delta = asli - s.ranking;
                        return (
                          <tr key={s.alternativeId} className="table-row-hover" style={{ borderTop: '1px solid var(--border)' }}>
                            <td className="px-4 py-3 text-center font-bold">{s.ranking}</td>
                            <td className="px-4 py-3 font-medium">{s.kode} {s.nama}</td>
                            <td className="px-4 py-3 text-right font-tabular">{formatNumber(s.nilaiQ)}</td>
                            <td className="px-4 py-3 text-center" style={{ color: 'var(--muted-foreground)' }}>{asli}</td>
                            <td className="px-4 py-3">
                              <span
                                className="flex items-center justify-center gap-1 text-xs font-semibold"
                                style={{ color: delta > 0 ? 'var(--success)' : delta < 0 ? 'var(--error)' : 'var(--muted-foreground)' }}
                              >
                                {delta > 0 ? <ArrowUp size={12} /> : delta < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
                                {delta === 0 ? 'tetap' : `${Math.abs(delta)} peringkat`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
