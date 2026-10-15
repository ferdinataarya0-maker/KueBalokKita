'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { setRole, homeFor, Role } from '@/lib/auth';
import {
  Eye,
  EyeOff,
  LogIn,
  Cookie,
  Star,
  ChefHat,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

// Backend integration point: Replace with Supabase auth.signInWithPassword()
const MOCK_CREDENTIALS = [
     { role: 'Admin', email: 'ferdinataarya0@gmail.com', password: 'admin123' },
   { role: 'Owner', email: 'ferdinataaryaarya0@gmail.com', password: 'owner123' },
];

export default function LoginPageContent() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: { remember: false } });

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleUseCredential = (cred: typeof MOCK_CREDENTIALS[0]) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
    setAuthError(null);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    // Backend integration point: Replace with Supabase auth.signInWithPassword({ email, password })
    await new Promise((r) => setTimeout(r, 1200));

    const valid = MOCK_CREDENTIALS.find(
      (c) => c.email === data.email && c.password === data.password
    );

    if (valid) {
      // Backend integration point: Store session token, set cookie for auth guard
      setRole(valid.role as Role);
      router.push(homeFor(valid.role as Role));
    } else {
      setAuthError(
        'Kredensial tidak valid — gunakan akun demo di bawah untuk masuk.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left Panel — Branding */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col items-center justify-center relative overflow-hidden p-10"
        style={{ background: 'linear-gradient(145deg, #B5651D 0%, #9B5418 50%, #7D4010 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-20"
          style={{ backgroundColor: 'var(--peach-300)' }}
        />
        <div
          className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full opacity-15"
          style={{ backgroundColor: 'var(--peach-200)' }}
        />
        <div
          className="absolute top-1/3 left-[-30px] w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--secondary)' }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: 'rgba(253,246,236,0.15)', backdropFilter: 'blur(8px)' }}
            >
              <Cookie size={40} style={{ color: 'var(--brown-50)' }} />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--primary-foreground)' }}>
            LineraDSS
          </h1>
          <p className="text-base font-medium mb-1" style={{ color: 'rgba(253,246,236,0.85)' }}>
            Sistem Pendukung Keputusan
          </p>
          <p className="text-sm mb-8" style={{ color: 'rgba(253,246,236,0.65)' }}>
            Kue Balok Linera
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 text-left">
            {[
              { icon: ChefHat, text: 'Kelola 6 varian kue balok premium' },
              { icon: Star, text: 'Perhitungan SAW & WASPAS otomatis' },
              { icon: Cookie, text: 'Rekomendasi varian terbaik berbasis data' },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={`feat-${idx}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(253,246,236,0.12)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(253,246,236,0.2)' }}
                  >
                    <Icon size={16} style={{ color: 'var(--brown-50)' }} />
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(253,246,236,0.85)' }}>
                    {feat.text}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-xs mt-8" style={{ color: 'rgba(253,246,236,0.45)' }}>
            © 2026 Kue Balok Linera. Semua hak dilindungi.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <AppLogo size={36} />
          <span className="font-bold text-xl" style={{ color: 'var(--primary)' }}>
            LineraDSS
          </span>
        </div>

        <div
          className="w-full max-w-md animate-slide-up"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 24px rgba(181,101,29,0.12)',
            padding: '2.5rem',
          }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              Masuk ke Panel Admin
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Masukkan kredensial Anda untuk mengakses sistem
            </p>
          </div>

          {/* Auth Error */}
          {authError && (
            <div
              className="flex items-start gap-3 p-4 rounded-lg mb-5 animate-fade-in"
              style={{ backgroundColor: 'var(--error-bg)', border: '1px solid rgba(197,48,48,0.2)' }}
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
              <p className="text-sm" style={{ color: 'var(--error)' }}>{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@linera.id"
                className="input-warm w-full px-4 py-3 text-sm"
                style={{
                  borderColor: errors.email ? 'var(--error)' : undefined,
                }}
                {...register('email', {
                  required: 'Email wajib diisi',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Format email tidak valid',
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--error)' }}>
                  <AlertCircle size={12} />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-warm w-full px-4 py-3 pr-12 text-sm"
                  style={{
                    borderColor: errors.password ? 'var(--error)' : undefined,
                  }}
                  {...register('password', {
                    required: 'Kata sandi wajib diisi',
                    minLength: { value: 6, message: 'Minimal 6 karakter' },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--error)' }}>
                  <AlertCircle size={12} />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--primary)' }}
                  {...register('remember')}
                />
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Ingat saya
                </span>
              </label>
              <button
                type="button"
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ minHeight: '48px' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div
            className="mt-6 p-4 rounded-xl"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>
            </p>
            <div className="space-y-2">
              {MOCK_CREDENTIALS.map((cred) => (
                <div
                  key={`cred-${cred.role}`}
                  className="flex items-center justify-between p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full mr-2"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: '10px' }}
                    >
                      {cred.role}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>
                      {cred.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(cred.email, `email-${cred.role}`)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                      title="Salin email"
                    >
                      {copiedField === `email-${cred.role}` ? (
                        <Check size={12} style={{ color: 'var(--success)' }} />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUseCredential(cred)}
                      className="text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        fontSize: '11px',
                      }}
                    >
                      Gunakan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-center mt-5" style={{ color: 'var(--muted-foreground)' }}>
            Kembali ke{' '}
            <Link href="/" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
              Halaman Utama
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}