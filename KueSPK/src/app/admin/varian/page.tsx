'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Plus, X, Star } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useDSS, nextKode } from '@/lib/dss-store';
import { formatRupiah } from '@/lib/dss-data';

interface FormState {
  kode: string;
  nama: string;
  harga: string;
  deskripsi: string;
  bestSeller: boolean;
}

const emptyForm: FormState = { kode: '', nama: '', harga: '', deskripsi: '', bestSeller: false };

export default function VarianPage() {
  const { alternatives, addAlternative, updateAlternative, deleteAlternative } = useDSS();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const kodeSaran = nextKode('A', alternatives);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const startEdit = (id: string) => {
    const a = alternatives.find((x) => x.id === id);
    if (!a) return;
    setEditingId(id);
    setForm({ kode: a.kode, nama: a.nama, harga: String(a.harga), deskripsi: a.deskripsi, bestSeller: !!a.bestSeller });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kode = (form.kode || kodeSaran).trim().toUpperCase();
    const nama = form.nama.trim();
    const harga = Number(form.harga);

    if (!nama) return setError('Nama varian wajib diisi.');
    if (!Number.isFinite(harga) || harga <= 0) return setError('Harga harus berupa angka lebih dari 0.');
    if (alternatives.some((a) => a.kode === kode && a.id !== editingId))
      return setError(`Kode ${kode} sudah dipakai varian lain.`);

    const payload = { kode, nama, harga, deskripsi: form.deskripsi.trim(), bestSeller: form.bestSeller };
    if (editingId) updateAlternative(editingId, payload);
    else addAlternative(payload);
    resetForm();
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Hapus varian "${nama}"? Semua penilaiannya ikut terhapus.`)) {
      deleteAlternative(id);
      if (editingId === id) resetForm();
    }
  };

  return (
    <AdminLayout title="Varian Kue" breadcrumbs={[{ label: 'Admin' }, { label: 'Varian Kue' }]}>
      <div className="space-y-6 animate-fade-in">
        <form onSubmit={handleSubmit} className="card-warm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
              {editingId ? 'Ubah varian' : 'Tambah varian'}
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
              <input
                className="input-warm w-full px-3 py-2"
                value={form.kode}
                placeholder={kodeSaran}
                onChange={(e) => setForm({ ...form, kode: e.target.value })}
              />
            </label>
            <label className="text-sm font-medium space-y-1 md:col-span-2">
              <span>Nama varian</span>
              <input
                className="input-warm w-full px-3 py-2"
                value={form.nama}
                placeholder="Contoh: Oreo"
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </label>
            <label className="text-sm font-medium space-y-1">
              <span>Harga (Rp)</span>
              <input
                type="number"
                min={0}
                className="input-warm w-full px-3 py-2"
                value={form.harga}
                placeholder="12000"
                onChange={(e) => setForm({ ...form, harga: e.target.value })}
              />
            </label>
          </div>
          <label className="text-sm font-medium space-y-1 block">
            <span>Deskripsi</span>
            <input
              className="input-warm w-full px-3 py-2"
              value={form.deskripsi}
              placeholder="Cerita singkat tentang varian ini"
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.bestSeller}
              onChange={(e) => setForm({ ...form, bestSeller: e.target.checked })}
              style={{ accentColor: 'var(--primary)' }}
            />
            Tandai sebagai best seller
          </label>

          {error && (
            <p className="text-sm font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
            <Plus size={14} /> {editingId ? 'Simpan perubahan' : 'Tambah varian'}
          </button>
        </form>

        <div className="card-warm overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
              Daftar varian ({alternatives.length})
            </h3>
          </div>
          {alternatives.length === 0 ? (
            <p className="px-5 pb-8 pt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Belum ada varian. Isi formulir di atas untuk menambahkan yang pertama.
            </p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    <th className="text-left font-semibold px-5 py-2.5">Kode</th>
                    <th className="text-left font-semibold px-4 py-2.5">Nama</th>
                    <th className="text-right font-semibold px-4 py-2.5">Harga</th>
                    <th className="text-center font-semibold px-4 py-2.5">Best seller</th>
                    <th className="text-left font-semibold px-4 py-2.5">Deskripsi</th>
                    <th className="px-4 py-2.5 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((a) => (
                    <tr key={a.id} className="table-row-hover" style={{ borderTop: '1px solid var(--border)' }}>
                      <td className="px-5 py-3 font-semibold" style={{ color: 'var(--primary)' }}>{a.kode}</td>
                      <td className="px-4 py-3 font-medium">{a.nama}</td>
                      <td className="px-4 py-3 text-right font-tabular">{formatRupiah(a.harga)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => updateAlternative(a.id, { bestSeller: !a.bestSeller })}
                          className="p-2 rounded-lg"
                          style={{ color: a.bestSeller ? '#D69E2E' : 'var(--brown-300)' }}
                          title={a.bestSeller ? 'Hapus tanda best seller' : 'Tandai best seller'}
                          aria-label={`${a.bestSeller ? 'Hapus' : 'Tandai'} best seller ${a.nama}`}
                          aria-pressed={!!a.bestSeller}
                        >
                          <Star size={16} fill={a.bestSeller ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{a.deskripsi}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => startEdit(a.id)} className="p-2 rounded-lg sidebar-item-hover" title="Ubah" aria-label={`Ubah ${a.nama}`}>
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(a.id, a.nama)}
                            className="p-2 rounded-lg"
                            style={{ color: 'var(--error)' }}
                            title="Hapus"
                            aria-label={`Hapus ${a.nama}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
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
