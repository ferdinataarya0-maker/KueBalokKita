'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { getReadiness } from '@/lib/dss-store';
import type { Alternative, Criteria, Assessment } from '@/lib/dss-data';

interface Props {
  alternatives: Alternative[];
  criteria: Criteria[];
  assessments: Assessment[];
}

/** Menampilkan alasan perhitungan belum bisa dijalankan. Mengembalikan null jika data siap. */
export default function CalcGuard({ alternatives, criteria, assessments }: Props) {
  const r = getReadiness(alternatives, criteria, assessments);
  if (r.ready) return null;

  const msg = !r.hasData
    ? { text: 'Belum ada varian atau kriteria.', href: '/admin/varian', cta: 'Tambah data' }
    : !r.bobotValid
    ? { text: `Total bobot ${r.totalBobot}% — harus tepat 100%.`, href: '/admin/kriteria', cta: 'Atur bobot' }
    : { text: `Penilaian baru terisi ${r.filled} dari ${r.expected} sel.`, href: '/admin/penilaian', cta: 'Lengkapi penilaian' };

  return (
    <div
      className="card-warm p-6 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{ borderColor: 'rgba(183,121,31,0.4)' }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}
      >
        <AlertTriangle size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          Perhitungan belum bisa dijalankan
        </p>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {msg.text}
        </p>
      </div>
      <Link href={msg.href} className="btn-primary text-sm px-4 py-2 text-center">
        {msg.cta}
      </Link>
    </div>
  );
}
