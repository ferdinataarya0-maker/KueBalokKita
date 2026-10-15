import OwnerLayout from '@/components/OwnerLayout';
import OwnerContent from './components/OwnerContent';

export default function DashboardOwnerPage() {
  return (
    <OwnerLayout title="Ringkasan Keputusan" subtitle="Hasil pemilihan varian kue balok terbaik Usaha Kue Balok Linera">
      <OwnerContent />
    </OwnerLayout>
  );
}
