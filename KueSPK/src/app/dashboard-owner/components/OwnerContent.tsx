'use client';

import Link from 'next/link';
import { Info, ArrowRight, Star, Cookie, Wallet, Flame, TrendingUp, Trophy } from 'lucide-react';
import { useDSS, getReadiness } from '@/lib/dss-store';
import { calculateSAW, calculateWASPAS, formatNumber, formatRupiah } from '@/lib/dss-data';
import DashboardCharts from '@/app/dashboard-admin/components/DashboardCharts';

export default function OwnerContent() {
  const { alternatives, criteria, assessments, lambda } = useDSS();
  const r = getReadiness(alternatives, criteria, assessments);

  if (!r.ready) {
    const alasan = !r.hasData
      ? 'Data varian dan kriteria belum diisi.'
      : !r.bobotValid
      ? `Total bobot kriteria baru ${r.totalBobot}% (harus 100%).`
      : `Penilaian baru terisi ${r.filled} dari ${r.expected} nilai.`;
    return (
      <div
        className="flex items-start gap-3 px-4 py-4 rounded-xl text-sm"
        style={{ backgroundColor: 'var(--info-bg)', border: '1px solid rgba(43,108,176,0.25)', color: 'var(--info)' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Hasil belum tersedia</p>
          <p>{alasan} Admin perlu melengkapinya dulu sebelum rekomendasi bisa ditampilkan.</p>
        </div>
      </div>
    );
  }

  const saw = calculateSAW(alternatives, criteria, assessments);
  const waspas = calculateWASPAS(alternatives, criteria, assessments, lambda);
  const bestSAW = saw[0];
  const bestWASPAS = waspas[0];
  const sama = bestSAW?.alternativeId === bestWASPAS?.alternativeId;
  const pemenang = alternatives.find((a) => a.id === bestWASPAS?.alternativeId);
  const maxQ = Math.max(...waspas.map((w) => w.nilaiQ), 0.0001);
  const top3 = waspas.slice(0, 3);
  const bestSellers = alternatives.filter((a) => a.bestSeller);
  const hargaList = alternatives.map((a) => a.harga);
  const hargaMin = Math.min(...hargaList);
  const hargaMax = Math.max(...hargaList);
  const selisihJuara = waspas.length > 1 ? waspas[0].nilaiQ - waspas[1].nilaiQ : 0;
  const winnerSAW = saw.find((s) => s.alternativeId === bestWASPAS.alternativeId);
  const kekuatan = criteria
    .map((c) => ({ c, r: winnerSAW?.normalizedValues[c.id] ?? 0 }))
    .sort((a, b) => b.r - a.r)
    .slice(0, 3);
  const kpi = [
    { id: 'o-kpi-varian', label: 'Total varian', value: String(alternatives.length), sub: `${criteria.length} kriteria penilaian`, icon: Cookie, color: 'var(--primary)', bg: 'var(--muted)' },
    { id: 'o-kpi-harga', label: 'Kisaran harga', value: hargaMin === hargaMax ? formatRupiah(hargaMin) : `${formatRupiah(hargaMin)} – ${formatRupiah(hargaMax)}`, sub: 'termurah sampai termahal', icon: Wallet, color: 'var(--info)', bg: 'var(--info-bg)' },
    { id: 'o-kpi-best', label: 'Best seller', value: String(bestSellers.length), sub: 'varian ditandai admin', icon: Flame, color: '#B7791F', bg: 'var(--warning-bg)' },
    { id: 'o-kpi-selisih', label: 'Keunggulan juara', value: formatNumber(selisihJuara), sub: 'selisih nilai peringkat 1 dan 2', icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-bg)' },
  ];
  const isBestSeller = (id: string) => !!alternatives.find((a) => a.id === id)?.bestSeller;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Rekomendasi */}
      <div className="gradient-hero rounded-2xl p-6 md:p-8 relative overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-30 pointer-events-none" style={{ backgroundColor: 'var(--peach-300)' }} />
        <div className="absolute -bottom-16 right-24 w-40 h-40 rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: 'var(--secondary)' }} />
        <div className="absolute top-6 right-6 hidden md:flex w-16 h-16 rounded-2xl items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>
          <Trophy size={30} style={{ color: 'var(--primary-foreground)' }} />
        </div>
        <span className="relative inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'rgba(181,101,29,0.15)', color: 'var(--brown-700)' }}>
          <Star size={12} fill="currentColor" /> REKOMENDASI UTAMA
        </span>
        {sama ? (
          <>
            <p className="relative text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              Varian kue balok yang direkomendasikan
            </p>
            <h2 className="relative text-3xl md:text-4xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>
              {bestWASPAS.nama}
            </h2>
            <p className="relative text-sm mt-3 max-w-xl" style={{ color: 'var(--brown-800)' }}>
              SAW dan WASPAS sama-sama menempatkan {bestWASPAS.nama} di peringkat 1
              {pemenang ? `, dengan harga ${formatRupiah(pemenang.harga)}` : ''}.
            </p>
          </>
        ) : (
          <>
            <p className="relative text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              Dua metode memberi hasil berbeda
            </p>
            <h2 className="relative text-2xl md:text-3xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>
              SAW memilih {bestSAW.nama}, WASPAS memilih {bestWASPAS.nama}
            </h2>
            <p className="relative text-sm mt-3 max-w-xl" style={{ color: 'var(--brown-800)' }}>
              Selisih nilainya biasanya kecil. Buka perbandingan lengkap untuk melihat varian mana yang konsisten di atas.
            </p>
          </>
        )}
        <div className="relative flex flex-wrap gap-6 mt-5 text-sm">
          <div>
            <p style={{ color: 'var(--muted-foreground)' }}>Nilai SAW</p>
            <p className="text-lg font-bold font-tabular">{formatNumber(bestSAW.nilaiSAW)}</p>
          </div>
          <div>
            <p style={{ color: 'var(--muted-foreground)' }}>Nilai WASPAS (Q)</p>
            <p className="text-lg font-bold font-tabular">{formatNumber(bestWASPAS.nilaiQ)}</p>
          </div>
        </div>
        <Link href="/dashboard-owner/ranking" className="btn-primary relative inline-flex items-center gap-2 text-sm px-5 py-2.5 mt-6">
          Lihat ranking lengkap <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map((k) => {
          const KIcon = k.icon;
          return (
            <div key={k.id} className="card-warm card-warm-hover p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.06em' }}>
                  {k.label.toUpperCase()}
                </p>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: k.bg }}>
                  <KIcon size={16} style={{ color: k.color }} />
                </div>
              </div>
              <div>
                <p className="text-xl font-bold font-tabular leading-tight">{k.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-warm p-5">
        <h3 className="text-base font-bold">Kenapa {bestWASPAS.nama} unggul</h3>
        <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--muted-foreground)' }}>
          Tiga kriteria terkuat. 100% berarti terbaik di antara semua varian.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kekuatan.map(({ c, r }) => (
            <li key={c.id}>
              <div className="flex justify-between text-sm gap-2">
                <span className="font-medium">{c.nama}</span>
                <span className="font-tabular" style={{ color: 'var(--muted-foreground)' }}>{Math.round(r * 100)}%</span>
              </div>
              <div className="h-2 rounded-full mt-1.5 overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="h-full rounded-full" style={{ width: `${r * 100}%`, backgroundColor: 'var(--success)' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Bobot {c.bobot}%</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tiga teratas */}
        <div className="card-warm p-5">
          <h3 className="text-base font-bold">Tiga varian teratas</h3>
          <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Berdasarkan nilai WASPAS (λ = {lambda.toFixed(2)})
          </p>
          <ul className="space-y-4">
            {top3.map((w, i) => (
              <li key={w.alternativeId} className="flex items-center gap-3">
                <span
                  className={`badge-rank-${i + 1} w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0`}
                >
                  {w.ranking}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm gap-2">
                    <span className="font-semibold truncate flex items-center gap-1.5">
                      {w.nama}
                      {isBestSeller(w.alternativeId) && (
                        <Star size={12} fill="#D69E2E" style={{ color: '#D69E2E' }} aria-label="Best seller" />
                      )}
                    </span>
                    <span className="font-tabular" style={{ color: 'var(--muted-foreground)' }}>{formatNumber(w.nilaiQ)}</span>
                  </div>
                  <div className="h-2 rounded-full mt-1.5 overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(w.nilaiQ / maxQ) * 100}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Dasar penilaian */}
        <div className="card-warm p-5">
          <h3 className="text-base font-bold">Dasar penilaian</h3>
          <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--muted-foreground)' }}>
            {alternatives.length} varian dinilai dengan {criteria.length} kriteria
          </p>
          <ul className="space-y-3">
            {criteria.map((c) => (
              <li key={c.id}>
                <div className="flex justify-between text-sm gap-2">
                  <span className="font-medium">{c.nama}</span>
                  <span className="font-tabular" style={{ color: 'var(--muted-foreground)' }}>
                    {c.bobot}% · {c.jenis === 'BENEFIT' ? 'makin besar makin baik' : 'makin kecil makin baik'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${c.bobot}%`, backgroundColor: 'var(--secondary)' }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {bestSellers.length > 0 && (
        <div className="card-warm p-5">
          <h3 className="text-base font-bold">Varian best seller</h3>
          <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Ditandai oleh admin berdasarkan penjualan
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bestSellers.map((a) => {
              const rank = waspas.find((w) => w.alternativeId === a.id)?.ranking;
              return (
                <li key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ border: '1px solid var(--border)' }}>
                  <Star size={16} fill="#D69E2E" style={{ color: '#D69E2E' }} className="flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{a.nama}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {formatRupiah(a.harga)}{rank ? ` · peringkat ${rank}` : ''}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <DashboardCharts />

      <details className="card-warm p-5 group">
        <summary className="cursor-pointer text-base font-bold list-none flex items-center justify-between">
          Cara membaca hasil ini
          <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Buka / tutup</span>
        </summary>
        <div className="mt-4 space-y-3 text-sm" style={{ color: 'var(--brown-800)' }}>
          <p>
            <b>Penilaian.</b> Setiap varian diberi nilai pada tiap kriteria (misalnya rasa, tekstur, harga). Kriteria yang lebih penting
            diberi bobot lebih besar. Untuk harga, makin murah makin baik.
          </p>
          <p>
            <b>SAW</b> menjumlahkan nilai tiap kriteria setelah dikalikan bobotnya. <b>WASPAS</b> menggabungkan cara penjumlahan itu dengan
            cara perkalian, sehingga varian yang sangat lemah di satu kriteria tidak bisa menang hanya karena unggul di kriteria lain.
          </p>
          <p>
            <b>Nilai λ</b> mengatur campuran kedua cara di WASPAS. Pada 0,5 keduanya sama kuat. Kalau SAW dan WASPAS memilih varian yang sama,
            keputusannya semakin meyakinkan.
          </p>
          <p>
            Ingin menguji apakah hasilnya berubah kalau prioritas berbeda? Coba menu <b>Simulasi</b>.
          </p>
        </div>
      </details>
    </div>
  );
}
