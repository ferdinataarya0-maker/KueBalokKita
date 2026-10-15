'use client';

import React from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import CalcGuard from '@/components/dss/CalcGuard';
import MatrixTable from '@/components/dss/MatrixTable';
import { useDSS, getReadiness } from '@/lib/dss-store';
import { calculateSAW, getAssessmentMatrix, formatNumber, formatRupiah } from '@/lib/dss-data';

export default function SAWPage() {
  const { alternatives, criteria, assessments } = useDSS();
  const r = getReadiness(alternatives, criteria, assessments);

  const results = r.ready ? calculateSAW(alternatives, criteria, assessments) : [];
  const matrix = r.ready ? getAssessmentMatrix(alternatives, criteria, assessments) : {};
  const colLabels = criteria.map((c) => `${c.kode} ${c.nama}`);

  return (
    <AdminLayout title="Hitung SAW" breadcrumbs={[{ label: 'Admin' }, { label: 'Hitung SAW' }]}>
      <div className="space-y-6 animate-fade-in">
        <div className="card-warm p-5">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Simple Additive Weighting: setiap nilai dinormalisasi (benefit dibagi nilai maksimum, cost = nilai minimum dibagi nilai),
            dikalikan bobot, lalu dijumlahkan. Varian dengan total tertinggi menjadi peringkat 1.
          </p>
        </div>

        <CalcGuard alternatives={alternatives} criteria={criteria} assessments={assessments} />

        {r.ready && (
          <>
            <MatrixTable
              title="1. Matriks keputusan (X)"
              description="Nilai asli dari halaman Penilaian."
              columns={colLabels}
              rows={alternatives.map((a) => ({
                key: a.id,
                label: `${a.kode} ${a.nama}`,
                cells: criteria.map((c) =>
                  c.nama.toLowerCase() === 'harga' ? formatRupiah(matrix[a.id][c.id]) : matrix[a.id][c.id]
                ),
              }))}
            />
            <MatrixTable
              title="2. Matriks ternormalisasi (R)"
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
              title="3. Nilai terbobot dan hasil akhir"
              description="Bobot × nilai normalisasi, dijumlahkan menjadi nilai SAW."
              columns={[...colLabels, 'Nilai SAW', 'Ranking']}
              rows={results.map((res) => ({
                key: res.alternativeId,
                label: `${res.kode} ${res.nama}`,
                highlight: res.ranking === 1,
                cells: [
                  ...criteria.map((c) => formatNumber(res.weightedValues[c.id])),
                  formatNumber(res.nilaiSAW),
                  res.ranking,
                ],
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
