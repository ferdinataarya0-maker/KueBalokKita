'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, FileDown } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useDSS, getReadiness } from '@/lib/dss-store';
import {
  Alternative,
  Criteria,
  Assessment,
  calculateSAW,
  calculateWASPAS,
  generateComparison,
  getAssessmentMatrix,
} from '@/lib/dss-data';

type Msg = { type: 'ok' | 'error'; text: string } | null;

export default function ExcelPage() {
  const { alternatives, criteria, assessments, lambda, replaceAll, logActivity } = useDSS();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const r = getReadiness(alternatives, criteria, assessments);

  const buildDataSheets = (wb: XLSX.WorkBook) => {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        alternatives.map((a) => ({ Kode: a.kode, Nama: a.nama, Harga: a.harga, Deskripsi: a.deskripsi }))
      ),
      'Varian'
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        criteria.map((c) => ({ Kode: c.kode, Nama: c.nama, Jenis: c.jenis, Bobot: c.bobot }))
      ),
      'Kriteria'
    );
    const matrix = getAssessmentMatrix(alternatives, criteria, assessments);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        alternatives.map((a) => {
          const row: Record<string, string | number> = { 'Kode Varian': a.kode };
          criteria.forEach((c) => {
            const has = assessments.some((x) => x.alternativeId === a.id && x.criteriaId === c.id);
            row[c.kode] = has ? matrix[a.id][c.id] : '';
          });
          return row;
        })
      ),
      'Penilaian'
    );
  };

  const exportAll = () => {
    const wb = XLSX.utils.book_new();
    buildDataSheets(wb);

    if (r.ready) {
      const saw = calculateSAW(alternatives, criteria, assessments);
      const waspas = calculateWASPAS(alternatives, criteria, assessments, lambda);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          saw.map((s) => ({
            Ranking: s.ranking,
            Kode: s.kode,
            Varian: s.nama,
            ...Object.fromEntries(criteria.map((c) => [`R ${c.kode}`, Number(s.normalizedValues[c.id].toFixed(4))])),
            'Nilai SAW': Number(s.nilaiSAW.toFixed(4)),
          }))
        ),
        'Hasil SAW'
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          waspas.map((w) => ({
            Ranking: w.ranking,
            Kode: w.kode,
            Varian: w.nama,
            WSM: Number(w.wsm.toFixed(4)),
            WPM: Number(w.wpm.toFixed(4)),
            [`Q (λ=${lambda.toFixed(2)})`]: Number(w.nilaiQ.toFixed(4)),
          }))
        ),
        'Hasil WASPAS'
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          generateComparison(saw, waspas).map((c) => ({
            Kode: c.kode,
            Varian: c.nama,
            'Nilai SAW': Number(c.nilaiSAW.toFixed(4)),
            'Ranking SAW': c.rankingSAW,
            'Nilai WASPAS': Number(c.nilaiWASPAS.toFixed(4)),
            'Ranking WASPAS': c.rankingWASPAS,
          }))
        ),
        'Perbandingan'
      );
    }

    XLSX.writeFile(wb, 'LineraDSS-laporan.xlsx');
    logActivity('excel', r.ready ? 'Mengekspor laporan lengkap ke Excel' : 'Mengekspor data ke Excel (tanpa hasil hitung)');
    setMsg({
      type: 'ok',
      text: r.ready
        ? 'Laporan diunduh: data, hasil SAW, WASPAS, dan perbandingan.'
        : 'Data diunduh. Hasil SAW/WASPAS belum disertakan karena bobot atau penilaian belum lengkap.',
    });
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Kode: 'A1', Nama: 'Cokelat', Harga: 12000, Deskripsi: 'Topping cokelat leleh' }]),
      'Varian'
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { Kode: 'C1', Nama: 'Harga', Jenis: 'COST', Bobot: 50 },
        { Kode: 'C2', Nama: 'Rasa', Jenis: 'BENEFIT', Bobot: 50 },
      ]),
      'Kriteria'
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ 'Kode Varian': 'A1', C1: 12000, C2: 4 }]), 'Penilaian');
    XLSX.writeFile(wb, 'LineraDSS-template.xlsx');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMsg(null);

    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const need = ['Varian', 'Kriteria', 'Penilaian'];
      const missing = need.filter((n) => !wb.SheetNames.includes(n));
      if (missing.length) throw new Error(`Sheet tidak ditemukan: ${missing.join(', ')}. Unduh template untuk melihat formatnya.`);

      const rows = (name: string) => XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[name], { defval: '' });
      const str = (v: unknown) => String(v ?? '').trim();

      const alts: Alternative[] = rows('Varian').map((row, i) => {
        const harga = Number(row['Harga']);
        if (!str(row['Kode']) || !str(row['Nama'])) throw new Error(`Sheet Varian baris ${i + 2}: Kode dan Nama wajib diisi.`);
        if (!Number.isFinite(harga) || harga <= 0) throw new Error(`Sheet Varian baris ${i + 2}: Harga harus angka lebih dari 0.`);
        return { id: `alt-imp-${i + 1}`, kode: str(row['Kode']).toUpperCase(), nama: str(row['Nama']), harga, deskripsi: str(row['Deskripsi']) };
      });

      const crits: Criteria[] = rows('Kriteria').map((row, i) => {
        const jenis = str(row['Jenis']).toUpperCase();
        const bobot = Number(row['Bobot']);
        if (!str(row['Kode']) || !str(row['Nama'])) throw new Error(`Sheet Kriteria baris ${i + 2}: Kode dan Nama wajib diisi.`);
        if (jenis !== 'BENEFIT' && jenis !== 'COST') throw new Error(`Sheet Kriteria baris ${i + 2}: Jenis harus BENEFIT atau COST.`);
        if (!Number.isFinite(bobot) || bobot <= 0) throw new Error(`Sheet Kriteria baris ${i + 2}: Bobot harus angka lebih dari 0.`);
        const kode = str(row['Kode']).toUpperCase();
        // pertahankan sub kriteria untuk kriteria dengan kode yang sama
        const subKriteria = criteria.find((x) => x.kode === kode)?.subKriteria;
        return { id: `crit-imp-${i + 1}`, kode, nama: str(row['Nama']), jenis, bobot, ...(subKriteria ? { subKriteria } : {}) };
      });

      if (alts.length === 0 || crits.length === 0) throw new Error('Sheet Varian dan Kriteria tidak boleh kosong.');
      const dupe = (list: { kode: string }[]) => list.find((x, i) => list.findIndex((y) => y.kode === x.kode) !== i)?.kode;
      if (dupe(alts)) throw new Error(`Kode varian ganda: ${dupe(alts)}.`);
      if (dupe(crits)) throw new Error(`Kode kriteria ganda: ${dupe(crits)}.`);

      const asses: Assessment[] = [];
      rows('Penilaian').forEach((row, i) => {
        const alt = alts.find((a) => a.kode === str(row['Kode Varian']).toUpperCase());
        if (!alt) throw new Error(`Sheet Penilaian baris ${i + 2}: kode varian "${str(row['Kode Varian'])}" tidak ada di sheet Varian.`);
        crits.forEach((c) => {
          const raw = row[c.kode];
          if (raw === '' || raw === undefined) return;
          const nilai = Number(raw);
          if (!Number.isFinite(nilai)) throw new Error(`Sheet Penilaian baris ${i + 2}, kolom ${c.kode}: nilai harus angka.`);
          asses.push({ id: `ass-imp-${asses.length + 1}`, alternativeId: alt.id, criteriaId: c.id, nilai });
        });
      });

      if (!window.confirm(`Impor ${alts.length} varian, ${crits.length} kriteria, ${asses.length} nilai? Data saat ini akan diganti.`)) return;
      replaceAll({ alternatives: alts, criteria: crits, assessments: asses }, `Mengimpor data dari ${file.name}`);
      setMsg({ type: 'ok', text: `Impor berhasil: ${alts.length} varian, ${crits.length} kriteria, ${asses.length} nilai.` });
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'File tidak bisa dibaca. Pastikan formatnya .xlsx.' });
    }
  };

  return (
    <AdminLayout title="Import / Export Excel" breadcrumbs={[{ label: 'Admin' }, { label: 'Import / Export Excel' }]}>
      <div className="space-y-6 animate-fade-in">
        {msg && (
          <p
            className="text-sm font-medium px-4 py-3 rounded-xl"
            style={{
              backgroundColor: msg.type === 'ok' ? 'var(--success-bg)' : 'var(--error-bg)',
              color: msg.type === 'ok' ? 'var(--success)' : 'var(--error)',
            }}
          >
            {msg.text}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-warm p-5 space-y-3">
            <h3 className="text-base font-bold">Ekspor laporan</h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Unduh file Excel berisi varian, kriteria, penilaian
              {r.ready ? ', hasil SAW, hasil WASPAS, dan perbandingan.' : '. Hasil hitung ikut disertakan setelah bobot valid dan penilaian lengkap.'}
            </p>
            <button onClick={exportAll} className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
              <Download size={14} /> Unduh laporan (.xlsx)
            </button>
          </div>

          <div className="card-warm p-5 space-y-3">
            <h3 className="text-base font-bold">Impor data</h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Unggah file .xlsx dengan sheet <b>Varian</b>, <b>Kriteria</b>, dan <b>Penilaian</b>. Data saat ini akan diganti setelah kamu konfirmasi.
            </p>
            <div className="flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
              <button onClick={() => fileRef.current?.click()} className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
                <Upload size={14} /> Pilih file
              </button>
              <button onClick={downloadTemplate} className="btn-secondary px-5 py-2 text-sm flex items-center gap-2">
                <FileDown size={14} /> Unduh template
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
