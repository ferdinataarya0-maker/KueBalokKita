'use client';

import { useEffect, useState } from 'react';

// Backend integration point: ganti dengan Supabase Auth + cek peran dari tabel profil.
// Catatan: peran di localStorage hanya mengatur tampilan (demo), bukan pengamanan data.

export type Role = 'Admin' | 'Owner';

const KEY = 'linera-role';

export const homeFor = (role: Role) => (role === 'Owner' ? '/dashboard-owner' : '/dashboard-admin');

export function setRole(role: Role) {
  try {
    window.localStorage.setItem(KEY, role);
  } catch {
    // diabaikan
  }
}

export function clearRole() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // diabaikan
  }
}

export function useRole() {
  const [role, setRoleState] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === 'Admin' || v === 'Owner') setRoleState(v);
    } catch {
      // diabaikan
    }
    setReady(true);
  }, []);

  return { role, ready };
}
