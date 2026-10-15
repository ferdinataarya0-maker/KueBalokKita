'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  LogOut,
  ArrowLeft,
  User,
  Cookie,
  FileText,
  Sliders,
  Menu,
  X,
  ChevronRight,
  Crown,
  Clock,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { useRole, clearRole } from '@/lib/auth';
import { useDSS } from '@/lib/dss-store';

const navGroups = [
  {
    id: 'own-g-utama',
    label: 'UTAMA',
    items: [{ id: 'own-ringkasan', label: 'Ringkasan', href: '/dashboard-owner', icon: LayoutDashboard }],
  },
  {
    id: 'own-g-hasil',
    label: 'HASIL KEPUTUSAN',
    items: [
      { id: 'own-varian', label: 'Varian', href: '/dashboard-owner/varian', icon: Cookie },
      { id: 'own-ranking', label: 'Ranking', href: '/dashboard-owner/ranking', icon: BarChart3 },
    ],
  },
  {
    id: 'own-g-analisis',
    label: 'ANALISIS',
    items: [
      { id: 'own-simulasi', label: 'Simulasi', href: '/dashboard-owner/simulasi', icon: Sliders },
      { id: 'own-laporan', label: 'Laporan', href: '/dashboard-owner/laporan', icon: FileText },
    ],
  },
];

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function OwnerLayout({ children, title, subtitle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, ready } = useRole();
  const { activity } = useDSS();
  const [mobileOpen, setMobileOpen] = useState(false);

  const terakhir = activity[0]?.time
    ? new Date(activity[0].time).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  useEffect(() => {
    if (ready && role === null) router.replace('/login');
  }, [ready, role, router]);

  if (!ready || role === null) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }} />;
  }

  const email = role === 'Owner' ? 'owner@linera.id' : 'admin@linera.id';
  const sidebarBg = 'linear-gradient(180deg, #5C2E08 0%, #3B1F0A 100%)';

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden print:hidden"
          style={{ backgroundColor: 'rgba(59,31,10,0.5)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-64 flex-shrink-0 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out print:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: sidebarBg }}
      >
        {/* dekorasi */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: 'var(--secondary)' }}
        />
        <div
          className="absolute bottom-24 -left-12 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: 'var(--peach-300)' }}
        />

        <div
          className="relative flex items-center justify-between px-5 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(253,246,236,0.12)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AppLogo size={32} />
            <div className="min-w-0">
              <span className="font-bold text-sm block" style={{ color: 'var(--brown-50)' }}>
                LineraDSS
              </span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5"
                style={{ backgroundColor: 'rgba(244,162,97,0.2)', color: 'var(--secondary)' }}
              >
                <Crown size={9} /> PANEL OWNER
              </span>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-md"
            style={{ color: 'rgba(253,246,236,0.7)' }}
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
          {navGroups.map((group) => (
            <div key={group.id} className="mb-5">
              <p
                className="text-[11px] font-semibold px-3 mb-2"
                style={{ color: 'rgba(253,246,236,0.45)', letterSpacing: '0.08em' }}
              >
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative"
                        style={{
                          backgroundColor: active ? 'rgba(244,162,97,0.18)' : 'transparent',
                          color: active ? 'var(--secondary)' : 'rgba(253,246,236,0.8)',
                        }}
                      >
                        {active && (
                          <span
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                            style={{ backgroundColor: 'var(--secondary)' }}
                          />
                        )}
                        <Icon size={18} className="flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight size={14} />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className="relative flex-shrink-0 p-3"
          style={{ borderTop: '1px solid rgba(253,246,236,0.12)' }}
        >
          {role === 'Admin' && (
            <Link
              href="/dashboard-admin"
              className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-xs font-medium"
              style={{ backgroundColor: 'rgba(253,246,236,0.1)', color: 'var(--brown-50)' }}
            >
              <ArrowLeft size={12} /> Kembali ke panel admin
            </Link>
          )}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
            style={{ backgroundColor: 'rgba(253,246,236,0.08)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--secondary)', color: 'var(--brown-900)' }}
            >
              <User size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--brown-50)' }}>
                {role === 'Owner' ? 'Owner Linera' : 'Admin Linera'}
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(253,246,236,0.55)' }}>
                {email}
              </p>
            </div>
          </div>
          <Link
            href="/login"
            onClick={() => clearRole()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full"
            style={{ color: '#FEB2B2' }}
          >
            <LogOut size={16} /> <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Konten */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-8 h-16 print:hidden"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(181,101,29,0.06)',
          }}
        >
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ color: 'var(--muted-foreground)' }}
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>
          <nav className="flex items-center gap-1.5 text-xs min-w-0" style={{ color: 'var(--muted-foreground)' }}>
            <Link href="/dashboard-owner" className="hover:underline">
              Owner
            </Link>
            <ChevronRight size={12} />
            <span className="truncate font-semibold" style={{ color: 'var(--primary)' }}>
              {title}
            </span>
          </nav>
          {terakhir && (
            <span
              className="ml-auto hidden md:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              <Clock size={12} /> Diperbarui admin: {terakhir}
            </span>
          )}
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </main>
      </div>
      <p><p className="text-[11px] text-center py-2 opacity-40 hover:opacity-100 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
  Developed by Muhammad Arya Ferdynata
</p>
</p>
    </div>
  );
}
