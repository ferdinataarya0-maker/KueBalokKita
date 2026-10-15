'use client';

import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useDSS } from '@/lib/dss-store';

export default function PengaturanPage() {
  const { lambda, setLambda, resetToSample, clearAll, alternatives, criteria, assessments } = useDSS();

  return (
    <AdminLayout title="Pengaturan" breadcrumbs={[{ label: 'Admin' }, { label: 'Pengaturan' }]}>
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div className="card-warm p-5 space-y-3">
          <h3 className="text-base font-bold">Nilai λ WASPAS</h3>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Dipakai di dashboard, halaman WASPAS, dan ranking. Nilai 0,5 memberi bobot sama pada WSM dan WPM.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={lambda}
              onChange={(e) => setLambda(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: 'var(--primary)' }}
              aria-label="Nilai lambda"
            />
            <span className="font-tabular font-bold w-12 text-right" style={{ color: 'var(--primary)' }}>{lambda.toFixed(2)}</span>
          </div>
        </div>

        <div className="card-warm p-5 space-y-3">
          <h3 className="text-base font-bold">Data</h3>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Saat ini tersimpan {alternatives.length} varian, {criteria.length} kriteria, dan {assessments.length} nilai di browser ini.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.confirm('Kembalikan semua data ke contoh awal? Perubahanmu akan hilang.') && resetToSample()}
              className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
            >
              <RotateCcw size={14} /> Kembalikan data contoh
            </button>
            <button
              onClick={() => window.confirm('Hapus semua varian, kriteria, dan penilaian?') && clearAll()}
              className="px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2"
              style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}
            >
              <Trash2 size={14} /> Hapus semua data
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
