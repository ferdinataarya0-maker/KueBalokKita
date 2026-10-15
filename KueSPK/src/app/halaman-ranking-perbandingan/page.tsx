'use client';

import AdminLayout from '@/components/AdminLayout';
import RankingContent from './components/RankingContent';

export default function HalamanRankingPage() {
  return (
    <AdminLayout
      title="Ranking & Perbandingan"
      breadcrumbs={[
        { label: 'Admin', href: '/dashboard-admin' },
        { label: 'Hasil Perhitungan' },
        { label: 'Ranking & Perbandingan' },
      ]}
    >
      <RankingContent />
    </AdminLayout>
  );
}