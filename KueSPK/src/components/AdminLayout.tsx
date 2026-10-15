'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRole, clearRole } from '@/lib/auth';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, Cookie, Sliders, ClipboardList, Calculator, BarChart3, FileSpreadsheet, Settings, LogOut, Menu, ChevronRight, Bell, User,  } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { useDSS, getReadiness } from '@/lib/dss-store';


interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'group-utama',
    label: 'UTAMA',
    items: [
      { id: 'nav-dashboard', label: 'Dashboard', href: '/dashboard-admin', icon: LayoutDashboard },
    ],
  },
  {
    id: 'group-data',
    label: 'MANAJEMEN DATA',
    items: [
      { id: 'nav-varian', label: 'Varian Kue', href: '/admin/varian', icon: Cookie },
      { id: 'nav-kriteria', label: 'Kriteria', href: '/admin/kriteria', icon: Sliders },
      { id: 'nav-penilaian', label: 'Penilaian', href: '/admin/penilaian', icon: ClipboardList },
    ],
  },
  {
    id: 'group-perhitungan',
    label: 'PERHITUNGAN',
    items: [
      { id: 'nav-saw', label: 'Hitung SAW', href: '/admin/saw', icon: Calculator },
      { id: 'nav-waspas', label: 'Hitung WASPAS', href: '/admin/waspas', icon: Calculator },
      { id: 'nav-ranking', label: 'Ranking & Perbandingan', href: '/halaman-ranking-perbandingan', icon: BarChart3 },
    ],
  },
  {
    id: 'group-tools',
    label: 'ALAT BANTU',
    items: [
      { id: 'nav-excel', label: 'Import / Export Excel', href: '/admin/excel', icon: FileSpreadsheet },
      { id: 'nav-pengaturan', label: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AdminLayout({ children, title, breadcrumbs }: AdminLayoutProps) {
  const pathname = usePathname();
  const { alternatives, criteria, assessments } = useDSS();
  const missing = (() => { const r = getReadiness(alternatives, criteria, assessments); return r.expected - r.filled; })();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const { role, ready } = useRole();

  useEffect(() => {
    if (!ready) return;
    if (role === null) router.replace('/login');
    else if (role === 'Owner') router.replace('/dashboard-owner');
  }, [ready, role, router]);

  const isActive = (href: string) => pathname === href;

  if (!ready || role !== 'Admin') {
    return <div className="h-screen" style={{ backgroundColor: 'var(--background)' }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(59,31,10,0.4)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 lg:z-auto h-full flex flex-col
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-60' : 'w-16'}
        `}
        style={{
          backgroundColor: 'var(--card)',
          borderRight: '1px solid var(--border)',
          boxShadow: '2px 0 8px rgba(181,101,29,0.08)',
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between px-4 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', minHeight: '64px' }}
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-2 min-w-0">
              <AppLogo size={32} />
              <div className="min-w-0">
                <span className="font-bold text-sm truncate block" style={{ color: 'var(--primary)' }}>
                  LineraDSS
                </span>
                <span className="text-xs truncate block" style={{ color: 'var(--muted-foreground)' }}>
                  Panel Admin
                </span>
              </div>
            </div>
          ) : (
            <AppLogo size={32} />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md transition-colors flex-shrink-0"
            style={{ color: 'var(--muted-foreground)' }}
            title={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          >
            <ChevronRight
              size={16}
              className="transition-transform duration-300"
              style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
          {navGroups.map((group) => (
            <div key={group.id} className="mb-4">
              {sidebarOpen && (
                <p
                  className="text-xs font-semibold tracking-wider px-3 mb-2"
                  style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}
                >
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((rawItem) => {
                  const item = rawItem.id === 'nav-penilaian' && missing > 0 ? { ...rawItem, badge: missing } : rawItem;
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                          transition-all duration-150 relative group
                          ${active ? 'sidebar-item-active' : 'sidebar-item-hover'}
                          ${!sidebarOpen ? 'justify-center' : ''}
                        `}
                        style={{
                          color: active ? 'var(--primary)' : 'var(--foreground)',
                          backgroundColor: active ? 'var(--muted)' : 'transparent',
                        }}
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        {sidebarOpen && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge !== undefined && (
                              <span
                                className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: 'var(--primary)',
                                  color: 'var(--primary-foreground)',
                                  fontSize: '10px',
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {/* Tooltip for collapsed state */}
                        {!sidebarOpen && (
                          <span
                            className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                            style={{
                              backgroundColor: 'var(--foreground)',
                              color: 'var(--background)',
                              fontSize: '12px',
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          className="flex-shrink-0 p-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2"
              style={{ backgroundColor: 'var(--muted)' }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                <User size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                  Admin Linera
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                  admin@linera.id
                </p>
              </div>
            </div>
          ) : null}
          <Link
            href="/login"
            onClick={() => clearRole()}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150 w-full
              ${!sidebarOpen ? 'justify-center' : ''}
            `}
            style={{ color: 'var(--error)' }}
            title={!sidebarOpen ? 'Keluar' : undefined}
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Keluar</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 h-16"
          style={{
            backgroundColor: 'var(--card)',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(181,101,29,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              {title && (
                <h1 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                  {title}
                </h1>
              )}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={`crumb-${idx}`}>
                      {idx > 0 && <ChevronRight size={12} />}
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:underline">{crumb.label}</Link>
                      ) : (
                        <span style={{ color: 'var(--primary)' }}>{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              title="Notifikasi"
            >
              <Bell size={18} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <User size={14} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 xl:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}