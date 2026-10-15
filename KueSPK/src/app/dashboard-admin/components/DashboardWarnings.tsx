'use client';

import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { useDSS, getReadiness } from '@/lib/dss-store';

export default function DashboardWarnings() {
  const { alternatives, criteria, assessments } = useDSS();
  const r = getReadiness(alternatives, criteria, assessments);
  const totalBobot = r.totalBobot;
  const bobotValid = r.bobotValid;
  const totalExpected = r.expected;
  const totalAssessments = r.filled;
  const penilaianLengkap = r.lengkap;

  if (!r.hasData) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
        style={{ backgroundColor: 'var(--info-bg)', border: '1px solid rgba(43,108,176,0.25)', color: 'var(--info)' }}
      >
        <Info size={16} className="flex-shrink-0" />
        <span className="font-medium">
          Belum ada data. Mulai dengan menambah <Link href="/admin/varian" className="underline">varian</Link> dan{' '}
          <Link href="/admin/kriteria" className="underline">kriteria</Link>.
        </span>
      </div>
    );
  }

  if (bobotValid && penilaianLengkap) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
        style={{
          backgroundColor: 'var(--success-bg)',
          border: '1px solid rgba(45,106,79,0.25)',
          color: 'var(--success)',
        }}
      >
        <CheckCircle size={16} className="flex-shrink-0" />
        <span className="font-medium">
          Semua data siap — bobot valid (100%) dan semua penilaian telah diisi. Perhitungan dapat dilakukan.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!bobotValid && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'var(--error-bg)',
            border: '1px solid rgba(197,48,48,0.25)',
            color: 'var(--error)',
          }}
        >
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span className="font-medium">
            Total bobot kriteria saat ini {totalBobot}% — harus berjumlah tepat 100% sebelum perhitungan dilakukan.
          </span>
        </div>
      )}
      {!penilaianLengkap && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid rgba(183,121,31,0.25)',
            color: 'var(--warning)',
          }}
        >
          <Info size={16} className="flex-shrink-0" />
          <span className="font-medium">
            Penilaian belum lengkap — {totalAssessments}/{totalExpected} nilai telah diisi. Lengkapi penilaian untuk semua varian dan kriteria.
          </span>
        </div>
      )}
    </div>
  );
}