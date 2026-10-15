import * as XLSX from 'xlsx';
import {
  Alternative,
  Criteria,
  Assessment,
  calculateSAW,
  calculateWASPAS,
  generateComparison,
} from '@/lib/dss-data';

/** Unduh laporan hasil (varian, kriteria, SAW, WASPAS, perbandingan) sebagai .xlsx. */
export function exportResultReport(
  alternatives: Alternative[],
  criteria: Criteria[],
  assessments: Assessment[],
  lambda: number
) {
  const saw = calculateSAW(alternatives, criteria, assessments);
  const waspas = calculateWASPAS(alternatives, criteria, assessments, lambda);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      alternatives.map((a) => ({
        Kode: a.kode,
        Nama: a.nama,
        Harga: a.harga,
        'Best seller': a.bestSeller ? 'Ya' : '',
        Deskripsi: a.deskripsi,
      }))
    ),
    'Varian'
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(criteria.map((c) => ({ Kode: c.kode, Nama: c.nama, Jenis: c.jenis, Bobot: c.bobot }))),
    'Kriteria'
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      generateComparison(saw, waspas)
        .sort((a, b) => a.rankingWASPAS - b.rankingWASPAS)
        .map((c) => ({
          'Ranking WASPAS': c.rankingWASPAS,
          Kode: c.kode,
          Varian: c.nama,
          'Nilai WASPAS': Number(c.nilaiWASPAS.toFixed(4)),
          'Ranking SAW': c.rankingSAW,
          'Nilai SAW': Number(c.nilaiSAW.toFixed(4)),
        }))
    ),
    'Hasil & Perbandingan'
  );

  XLSX.writeFile(wb, 'LineraDSS-laporan-owner.xlsx');
}
