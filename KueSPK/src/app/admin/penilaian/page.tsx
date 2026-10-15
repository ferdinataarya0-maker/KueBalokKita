'use client';

import React from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useDSS, getReadiness } from '@/lib/dss-store';

export default function PenilaianPage() {
  const { alternatives, criteria, assessments, setAssessment } = useDSS();
  const r = getReadiness(alternatives, criteria, assessments);

  const valueOf = (altId: string, critId: string) =>
    assessments.find((a) => a.alternativeId === altId && a.criteriaId === critId)?.nilai;

  const handleChange = (altId: string, critId: string, raw: string) => {
    if (raw.trim() === '') return setAssessment(altId, critId, null);
    const n = Number(raw);
    if (Number.isFinite(n)) setAssessment(altId, critId, n);
  };

  return (
    <AdminLayout title="Penilaian" breadcrumbs={[{ label: 'Admin' }, { label: 'Penilaian' }]}>
      <div className="space-y-6 animate-fade-in">
        {!r.hasData ? (
          <div className="card-warm p-8 text-center space-y-2">
            <p className="text-base font-bold">Belum ada yang bisa dinilai</p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Tambahkan minimal satu varian dan satu kriteria dulu.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Link href="/admin/varian" className="btn-primary text-sm px-4 py-2">Tambah varian</Link>
              <Link href="/admin/kriteria" className="btn-secondary text-sm px-4 py-2">Tambah kriteria</Link>
            </div>
          </div>
        ) : (
          <>
            <div
              className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: r.lengkap ? 'var(--success-bg)' : 'var(--warning-bg)',
                color: r.lengkap ? 'var(--success)' : 'var(--warning)',
              }}
            >
              {r.lengkap
                ? `Semua ${r.expected} nilai sudah terisi.`
                : `${r.filled} dari ${r.expected} nilai terisi. Sel kosong ditandai kuning.`}
            </div>

            <div className="card-warm overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h3 className="text-base font-bold">Matriks penilaian</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  Isi nilai tiap varian per kriteria (kriteria yang punya sub kriteria dipilih dari daftar). Perubahan tersimpan otomatis.
                </p>
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                      <th className="text-left font-semibold px-5 py-2.5 whitespace-nowrap">Varian</th>
                      {criteria.map((c) => (
                        <th key={c.id} className="text-left font-semibold px-3 py-2.5 whitespace-nowrap">
                          {c.kode} · {c.nama}
                          <span className="block text-xs font-normal">{c.jenis === 'BENEFIT' ? 'Benefit' : 'Cost'}, {c.bobot}%</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((a) => (
                      <tr key={a.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td className="px-5 py-2 font-medium whitespace-nowrap">
                          <span className="font-semibold" style={{ color: 'var(--primary)' }}>{a.kode}</span> {a.nama}
                        </td>
                        {criteria.map((c) => {
                          const v = valueOf(a.id, c.id);
                          return (
                            <td key={c.id} className="px-3 py-2">
                              {c.subKriteria && c.subKriteria.length > 0 ? (
                                <select
                                  aria-label={`${a.nama} — ${c.nama}`}
                                  className="input-warm w-44 px-2 py-1.5"
                                  style={v === undefined ? { backgroundColor: 'var(--warning-bg)' } : undefined}
                                  value={v === undefined ? '' : String(v)}
                                  onChange={(e) => handleChange(a.id, c.id, e.target.value)}
                                >
                                  <option value="">Pilih…</option>
                                  {[...c.subKriteria].sort((x, y) => y.nilai - x.nilai).map((s) => (
                                    <option key={s.id} value={String(s.nilai)}>
                                      {s.label} ({s.nilai})
                                    </option>
                                  ))}
                                  {v !== undefined && !c.subKriteria.some((s) => s.nilai === v) && (
                                    <option value={String(v)}>Nilai {v} (di luar pilihan)</option>
                                  )}
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  step="any"
                                  min={0}
                                  aria-label={`${a.nama} — ${c.nama}`}
                                  className="input-warm w-28 px-2 py-1.5 font-tabular"
                                  style={v === undefined ? { backgroundColor: 'var(--warning-bg)' } : undefined}
                                  value={v ?? ''}
                                  onChange={(e) => handleChange(a.id, c.id, e.target.value)}
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {r.ready && (
              <div className="flex justify-end">
                <Link href="/admin/saw" className="btn-primary text-sm px-5 py-2">Lanjut hitung SAW</Link>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
