'use client';

import { useState } from 'react';
import { Star, Search } from 'lucide-react';
import { useDSS, getReadiness } from '@/lib/dss-store';
import { calculateSAW, calculateWASPAS, formatNumber, formatRupiah } from '@/lib/dss-data';

export default function OwnerVarian() {
  const { alternatives, criteria, assessments, lambda } = useDSS();
  const r = getReadiness(alternatives, criteria, assessments);
  const [q, setQ] = useState('');
  const [onlyBest, setOnlyBest] = useState(false);
  const [sort, setSort] = useState<'ranking' | 'murah' | 'mahal' | 'nama'>('ranking');

  const saw = r.ready ? calculateSAW(alternatives, criteria, assessments) : [];
  const waspas = r.ready ? calculateWASPAS(alternatives, criteria, assessments, lambda) : [];

  const allRows = alternatives
    .map((a) => ({
      a,
      saw: saw.find((s) => s.alternativeId === a.id),
      wp: waspas.find((w) => w.alternativeId === a.id),
    }));

  const rows = allRows
    .filter(({ a }) => (!onlyBest || a.bestSeller) && `${a.kode} ${a.nama} ${a.deskripsi}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((x, y) => {
      if (sort === 'murah') return x.a.harga - y.a.harga;
      if (sort === 'mahal') return y.a.harga - x.a.harga;
      if (sort === 'nama') return x.a.nama.localeCompare(y.a.nama);
      return (x.wp?.ranking ?? 999) - (y.wp?.ranking ?? 999);
    });

  if (alternatives.length === 0) {
    return (
      <div className="card-warm p-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Belum ada varian. Admin perlu menambahkannya terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {!r.ready && (
        <p className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
          Nilai dan peringkat belum tersedia karena data penilaian belum lengkap.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            className="input-warm w-full pl-9 pr-3 py-2 text-sm"
            placeholder="Cari nama atau deskripsi varian"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cari varian"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="checkbox" checked={onlyBest} onChange={(e) => setOnlyBest(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
          Best seller saja
        </label>
        <select
          className="input-warm px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Urutkan"
        >
          <option value="ranking">Urut peringkat</option>
          <option value="murah">Harga termurah</option>
          <option value="mahal">Harga termahal</option>
          <option value="nama">Nama A–Z</option>
        </select>
      </div>

      <div className="card-warm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                <th className="text-center font-semibold px-4 py-2.5">Peringkat</th>
                <th className="text-left font-semibold px-4 py-2.5">Varian</th>
                <th className="text-right font-semibold px-4 py-2.5">Harga</th>
                <th className="text-right font-semibold px-4 py-2.5">Nilai SAW</th>
                <th className="text-right font-semibold px-4 py-2.5">Nilai WASPAS</th>
                <th className="text-left font-semibold px-4 py-2.5">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                    Tidak ada varian yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
              {rows.map(({ a, saw: s, wp }) => (
                <tr key={a.id} className="table-row-hover" style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 text-center">
                    {wp ? (
                      <span
                        className={`${wp.ranking <= 3 ? `badge-rank-${wp.ranking}` : ''} inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-semibold`}
                      >
                        {wp.ranking}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold flex items-center gap-1.5">
                      <span style={{ color: 'var(--primary)' }}>{a.kode}</span> {a.nama}
                      {a.bestSeller && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}
                        >
                          <Star size={10} fill="currentColor" /> Best seller
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-tabular">{formatRupiah(a.harga)}</td>
                  <td className="px-4 py-3 text-right font-tabular">{s ? formatNumber(s.nilaiSAW) : '—'}</td>
                  <td className="px-4 py-3 text-right font-tabular">{wp ? formatNumber(wp.nilaiQ) : '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{a.deskripsi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
