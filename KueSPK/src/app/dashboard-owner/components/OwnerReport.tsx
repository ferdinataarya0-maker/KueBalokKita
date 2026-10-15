'use client';

import { Download, Printer, Info } from 'lucide-react';
import { useDSS, getReadiness } from '@/lib/dss-store';
import { exportResultReport } from '@/lib/dss-export';
import {
  calculateSAW,
  calculateWASPAS,
  generateComparison,
  formatNumber,
  formatRupiah,
} from '@/lib/dss-data';

export default function OwnerReport() {
  const { alternatives, criteria, assessments, lambda } = useDSS();
  const r = getReadiness(alternatives, criteria, assessments);

  if (!r.ready) {
    return (
      <div
        className="flex items-start gap-3 px-4 py-4 rounded-xl text-sm"
        style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <p>Laporan belum bisa dibuat karena bobot atau penilaian belum lengkap. Hubungi admin untuk melengkapinya.</p>
      </div>
    );
  }

  const saw = calculateSAW(alternatives, criteria, assessments);
  const waspas = calculateWASPAS(alternatives, criteria, assessments, lambda);
  const rows = generateComparison(saw, waspas).sort((a, b) => a.rankingWASPAS - b.rankingWASPAS);
  const juara = waspas[0];
  const juaraAlt = alternatives.find((a) => a.id === juara.alternativeId);
  const sama = saw[0].alternativeId === juara.alternativeId;
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          onClick={() => exportResultReport(alternatives, criteria, assessments, lambda)}
          className="btn-primary px-5 py-2 text-sm flex items-center gap-2"
        >
          <Download size={14} /> Unduh Excel
        </button>
        <button onClick={() => window.print()} className="btn-secondary px-5 py-2 text-sm flex items-center gap-2">
          <Printer size={14} /> Cetak / simpan PDF
        </button>
      </div>

      <div className="card-warm p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold">Laporan Pemilihan Varian Kue Balok</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Usaha Kue Balok Linera · {tanggal}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-1">Kesimpulan</h3>
          <p className="text-sm" style={{ color: 'var(--brown-800)' }}>
            {sama
              ? `Metode SAW dan WASPAS sama-sama menempatkan ${juara.nama} di peringkat 1`
              : `WASPAS menempatkan ${juara.nama} di peringkat 1, sedangkan SAW memilih ${saw[0].nama}`}
            {juaraAlt ? ` (harga ${formatRupiah(juaraAlt.harga)})` : ''}. Dari {alternatives.length} varian dengan {criteria.length} kriteria,
            nilai WASPAS tertinggi adalah {formatNumber(juara.nilaiQ)} dengan λ = {lambda.toFixed(2)}.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-2">Peringkat varian</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  <th className="text-center font-semibold px-3 py-2">Ranking</th>
                  <th className="text-left font-semibold px-3 py-2">Varian</th>
                  <th className="text-right font-semibold px-3 py-2">Nilai WASPAS</th>
                  <th className="text-right font-semibold px-3 py-2">Nilai SAW</th>
                  <th className="text-center font-semibold px-3 py-2">Ranking SAW</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.alternativeId} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-3 py-2 text-center font-semibold">{c.rankingWASPAS}</td>
                    <td className="px-3 py-2">{c.kode} {c.nama}</td>
                    <td className="px-3 py-2 text-right font-tabular">{formatNumber(c.nilaiWASPAS)}</td>
                    <td className="px-3 py-2 text-right font-tabular">{formatNumber(c.nilaiSAW)}</td>
                    <td className="px-3 py-2 text-center">{c.rankingSAW}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-2">Kriteria dan bobot</h3>
          <ul className="text-sm space-y-1">
            {criteria.map((c) => (
              <li key={c.id}>
                {c.kode} {c.nama}: {c.bobot}% ({c.jenis === 'BENEFIT' ? 'benefit' : 'cost'})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
