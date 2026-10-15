'use client';

import Link from 'next/link';
import { Cookie, Sliders, ClipboardList, Calculator, FileSpreadsheet, Settings, History } from 'lucide-react';
import { useDSS, ActivityType } from '@/lib/dss-store';

const typeMeta: Record<ActivityType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  varian: { icon: Cookie, color: 'var(--primary)', bg: 'var(--muted)', label: 'Varian' },
  kriteria: { icon: Sliders, color: 'var(--info)', bg: 'var(--info-bg)', label: 'Kriteria' },
  penilaian: { icon: ClipboardList, color: 'var(--success)', bg: 'var(--success-bg)', label: 'Penilaian' },
  hitung: { icon: Calculator, color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'Perhitungan' },
  excel: { icon: FileSpreadsheet, color: 'var(--brown-700)', bg: 'var(--brown-100)', label: 'Excel' },
  sistem: { icon: Settings, color: 'var(--muted-foreground)', bg: 'var(--muted)', label: 'Sistem' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return 'Baru saja';
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function DashboardRecentActivity() {
  const { activity, ready } = useDSS();
  const items = activity.slice(0, 8);

  return (
    <div className="card-warm p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
          Aktivitas Terbaru
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Perubahan data yang baru kamu lakukan
        </p>
      </div>

      {!ready || items.length === 0 ? (
        <div className="flex flex-col items-center text-center py-8 gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}
          >
            <History size={18} />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Belum ada aktivitas
          </p>
          <p className="text-xs max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
            Tambah varian, ubah bobot kriteria, atau isi penilaian — riwayatnya muncul di sini.
          </p>
          <Link href="/admin/varian" className="btn-primary text-sm px-4 py-2 mt-2">
            Tambah varian
          </Link>
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {items.map((item) => {
            const meta = typeMeta[item.type] ?? typeMeta.sistem;
            const Icon = meta.icon;
            return (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: meta.bg }}
                >
                  <Icon size={14} style={{ color: meta.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate" style={{ color: 'var(--foreground)' }}>
                    {item.message}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {meta.label}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  {formatTime(item.time)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
