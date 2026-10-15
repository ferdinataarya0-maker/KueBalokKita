'use client';

import React from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import CalcGuard from '@/components/dss/CalcGuard';
import MatrixTable from '@/components/dss/MatrixTable';
import { useDSS, getReadiness } from '@/lib/dss-store';
import { calculateWASPAS, formatNumber } from '@/lib/dss-data';

export default function WASPASPage() {
  const { alternatives, criteria, assessments, lambda, setLambda } = useDSS();
  const r = getReadiness(alternatives, criteria, assessments);

  const results = r.ready ? calculateWASPAS(alternatives, criteria, assessments, lambda) : [];
  const colLabels = criteria.map((c) => `${c.kode} ${c.nama}`);

  return (
    <AdminLayout title="Hitung WASPAS" breadcrumbs={[{ label: 'Admin' }, { label: 'Hitung WASPAS' }]}>
      <div className="space-y-6 animate-fade-in">
        <div className="card-warm p-5 space-y-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            WASPAS menggabungkan WSM (penjumlahan terbobot) dan WPM (perkalian terbobot): Q = λ·WSM + (1−λ)·WPM.
          </p>
          <label className="block text-sm font-medium">
            Nilai λ: <span className="font-tabular" style={{ color: 'var(--primary)' }}>{lambda.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={lambda}
              onChange={(e) => setLambda(Number(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: 'var(--primary)' }}
            />
            <span className="flex justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span>0 = hanya WPM</span>
              <span>1 = hanya WSM</span>
            </span>
          </label>
        </div>

        <CalcGuard alternatives={alternatives} criteria={criteria} assessments={assessments} />

        {r.ready && (
          <>
            <MatrixTable
              title="Matriks ternormalisasi (R)"
              columns={colLabels}
              rows={results
                .slice()
                .sort((x, y) => x.kode.localeCompare(y.kode, undefined, { numeric: true }))
                .map((res) => ({
                  key: res.alternativeId,
                  label: `${res.kode} ${res.nama}`,
                  cells: criteria.map((c) => formatNumber(res.normalizedValues[c.id])),
                }))}
            />
            <MatrixTable
              title="Hasil WASPAS"
              description={`Dihitung dengan λ = ${lambda.toFixed(2)}.`}
              columns={['WSM', 'WPM', 'Nilai Q', 'Ranking']}
              rows={results.map((res) => ({
                key: res.alternativeId,
                label: `${res.kode} ${res.nama}`,
                highlight: res.ranking === 1,
                cells: [formatNumber(res.wsm), formatNumber(res.wpm), formatNumber(res.nilaiQ), res.ranking],
              }))}
            />
            <div className="flex justify-end">
              <Link href="/halaman-ranking-perbandingan" className="btn-primary text-sm px-5 py-2">
                Lihat ranking & perbandingan
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
