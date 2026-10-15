'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Plus, X, Scale, ListTree, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useDSS, nextKode, getReadiness } from '@/lib/dss-store';

interface FormState {
  kode: string;
  nama: string;
  jenis: 'BENEFIT' | 'COST';
  bobot: string;
}

const emptyForm: FormState = { kode: '', nama: '', jenis: 'BENEFIT', bobot: '' };

export default function KriteriaPage() {
  const { alternatives, criteria, assessments, addCriteria, updateCriteria, deleteCriteria, normalizeBobot, addSubCriteria, updateSubCriteria, deleteSubCriteria } = useDSS();
  const [openSubId, setOpenSubId] = useState<string | null>(null);
  const [subForm, setSubForm] = useState({ label: '', nilai: '' });
  const [subError, setSubError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const kodeSaran = nextKode('C', criteria);
  const r = getReadiness(alternatives, criteria, assessments);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const startEdit = (id: string) => {
    const c = criteria.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setForm({ kode: c.kode, nama: c.nama, jenis: c.jenis, bobot: String(c.bobot) });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kode = (form.kode || kodeSaran).trim().toUpperCase();
    const nama = form.nama.trim();
    const bobot = Number(form.bobot);

    if (!nama) return setError('Nama kriteria wajib diisi.');
    if (!Number.isFinite(bobot) || bobot <= 0 || bobot > 100) return setError('Bobot harus berupa angka antara 0 dan 100.');
    if (criteria.some((c) => c.kode === kode && c.id !== editingId))
      return setError(`Kode ${kode} sudah dipakai kriteria lain.`);

    const payload = { kode, nama, jenis: form.jenis, bobot };
    if (editingId) updateCriteria(editingId, payload);
    else addCriteria(payload);
    resetForm();
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Hapus kriteria "${nama}"? Semua penilaiannya ikut terhapus.`)) {
      deleteCriteria(id);
      if (editingId === id) resetForm();
    }
  };

  const handleAddSub = (e: React.FormEvent, criteriaId: string) => {
    e.preventDefault();
    const label = subForm.label.trim();
    const nilai = Number(subForm.nilai);
    if (!label) return setSubError('Nama sub kriteria wajib diisi.');
    if (subForm.nilai.trim() === '' || !Number.isFinite(nilai)) return setSubError('Nilai harus berupa angka.');
    const c = criteria.find((x) => x.id === criteriaId);
    if (c?.subKriteria?.some((s) => s.nilai === nilai))
      return setSubError(`Nilai ${nilai} sudah dipakai sub kriteria lain.`);
    addSubCriteria(criteriaId, { label, nilai });
    setSubForm({ label: '', nilai: '' });
    setSubError(null);
  };

  const toggleSub = (id: string) => {
    setOpenSubId(openSubId === id ? null : id);
    setSubForm({ label: '', nilai: '' });
    setSubError(null);
  };

  const barColor = r.bobotValid ? 'var(--success)' : r.totalBobot > 100 ? 'var(--error)' : 'var(--warning)';

  return (
    <AdminLayout title="Kriteria" breadcrumbs={[{ label: 'Admin' }, { label: 'Kriteria' }]}>
      <div className="space-y-6 animate-fade-in">
        {/* Total bobot */}
        <div className="card-warm p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                Total bobot: <span className="font-tabular" style={{ color: barColor }}>{r.totalBobot}%</span>
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {r.bobotValid
                  ? 'Bobot valid, perhitungan bisa dijalankan.'
                  : 'Total bobot harus tepat 100% sebelum menghitung SAW dan WASPAS.'}
              </p>
            </div>
            {!r.bobotValid && criteria.length > 0 && (
              <button onClick={normalizeBobot} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                <Scale size={14} /> Sesuaikan ke 100%
              </button>
            )}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(r.totalBobot, 100)}%`, backgroundColor: barColor }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-warm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
              {editingId ? 'Ubah kriteria' : 'Tambah kriteria'}
            </h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <X size={12} /> Batal
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="text-sm font-medium space-y-1">
              <span>Kode</span>
              <input className="input-warm w-full px-3 py-2" value={form.kode} placeholder={kodeSaran} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
            </label>
            <label className="text-sm font-medium space-y-1">
              <span>Nama kriteria</span>
              <input className="input-warm w-full px-3 py-2" value={form.nama} placeholder="Contoh: Kemasan" onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </label>
            <label className="text-sm font-medium space-y-1">
              <span>Jenis</span>
              <select className="input-warm w-full px-3 py-2" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as 'BENEFIT' | 'COST' })}>
                <option value="BENEFIT">Benefit (makin besar makin baik)</option>
                <option value="COST">Cost (makin kecil makin baik)</option>
              </select>
            </label>
            <label className="text-sm font-medium space-y-1">
              <span>Bobot (%)</span>
              <input type="number" min={0} max={100} step="any" className="input-warm w-full px-3 py-2" value={form.bobot} placeholder="20" onChange={(e) => setForm({ ...form, bobot: e.target.value })} />
            </label>
          </div>
          {error && (
            <p className="text-sm font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
            <Plus size={14} /> {editingId ? 'Simpan perubahan' : 'Tambah kriteria'}
          </button>
        </form>

        <div className="card-warm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
              Daftar kriteria ({criteria.length})
            </h3>
          </div>
          {criteria.length === 0 ? (
            <p className="px-5 pb-8 pt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Belum ada kriteria. Isi formulir di atas untuk menambahkan yang pertama.
            </p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    <th className="text-left font-semibold px-5 py-2.5">Kode</th>
                    <th className="text-left font-semibold px-4 py-2.5">Nama</th>
                    <th className="text-left font-semibold px-4 py-2.5">Jenis</th>
                    <th className="text-right font-semibold px-4 py-2.5">Bobot</th>
                    <th className="text-left font-semibold px-4 py-2.5">Sub kriteria</th>
                    <th className="px-4 py-2.5 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c) => (
                    <React.Fragment key={c.id}>
                    <tr className="table-row-hover" style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-5 py-3 font-semibold" style={{ color: 'var(--primary)' }}>{c.kode}</td>
                      <td className="px-4 py-3 font-medium">{c.nama}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: c.jenis === 'BENEFIT' ? 'var(--success-bg)' : 'var(--warning-bg)',
                            color: c.jenis === 'BENEFIT' ? 'var(--success)' : 'var(--warning)',
                          }}
                        >
                          {c.jenis === 'BENEFIT' ? 'Benefit' : 'Cost'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-tabular">{c.bobot}%</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSub(c.id)}
                          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap"
                          aria-expanded={openSubId === c.id}
                        >
                          <ListTree size={12} />
                          {(c.subKriteria?.length ?? 0) > 0 ? `${c.subKriteria!.length} sub` : 'Atur'}
                          {openSubId === c.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => startEdit(c.id)} className="p-2 rounded-lg sidebar-item-hover" title="Ubah" aria-label={`Ubah ${c.nama}`}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(c.id, c.nama)} className="p-2 rounded-lg" style={{ color: 'var(--error)' }} title="Hapus" aria-label={`Hapus ${c.nama}`}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {openSubId === c.id && (
                      <tr style={{ backgroundColor: 'var(--muted)' }}>
                        <td colSpan={6} className="px-5 py-4 space-y-3">
                          <p className="text-sm font-bold">Sub kriteria {c.nama}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Pilihan skala yang muncul di halaman Penilaian. Kalau kosong, nilai diketik bebas berupa angka.
                          </p>
                          {(c.subKriteria ?? []).length > 0 && (
                            <div className="space-y-2">
                              {[...(c.subKriteria ?? [])].sort((a, b) => b.nilai - a.nilai).map((s) => (
                                <div key={`${s.id}-${s.label}-${s.nilai}`} className="flex items-center gap-2">
                                  <input
                                    className="input-warm flex-1 px-3 py-1.5 text-sm"
                                    defaultValue={s.label}
                                    aria-label="Nama sub kriteria"
                                    onBlur={(e) => {
                                      const v = e.target.value.trim();
                                      if (v && v !== s.label) updateSubCriteria(c.id, s.id, { label: v });
                                    }}
                                  />
                                  <input
                                    type="number"
                                    step="any"
                                    className="input-warm w-24 px-3 py-1.5 text-sm font-tabular"
                                    defaultValue={s.nilai}
                                    aria-label="Nilai sub kriteria"
                                    onBlur={(e) => {
                                      const n = Number(e.target.value);
                                      if (e.target.value.trim() === '' || !Number.isFinite(n) || n === s.nilai) return;
                                      if (c.subKriteria?.some((x) => x.id !== s.id && x.nilai === n)) {
                                        e.target.value = String(s.nilai);
                                        return setSubError(`Nilai ${n} sudah dipakai sub kriteria lain.`);
                                      }
                                      updateSubCriteria(c.id, s.id, { nilai: n });
                                    }}
                                  />
                                  <button
                                    onClick={() => deleteSubCriteria(c.id, s.id)}
                                    className="p-2 rounded-lg"
                                    style={{ color: 'var(--error)' }}
                                    title="Hapus"
                                    aria-label={`Hapus ${s.label}`}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <form onSubmit={(e) => handleAddSub(e, c.id)} className="flex flex-wrap items-center gap-2">
                            <input
                              className="input-warm flex-1 min-w-[10rem] px-3 py-1.5 text-sm"
                              placeholder="Contoh: Sangat enak"
                              value={subForm.label}
                              onChange={(e) => setSubForm({ ...subForm, label: e.target.value })}
                            />
                            <input
                              type="number"
                              step="any"
                              className="input-warm w-24 px-3 py-1.5 text-sm font-tabular"
                              placeholder="Nilai"
                              value={subForm.nilai}
                              onChange={(e) => setSubForm({ ...subForm, nilai: e.target.value })}
                            />
                            <button type="submit" className="btn-primary text-sm px-4 py-1.5 flex items-center gap-1.5">
                              <Plus size={14} /> Tambah
                            </button>
                          </form>
                          {subError && (
                            <p className="text-sm font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}>
                              {subError}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
