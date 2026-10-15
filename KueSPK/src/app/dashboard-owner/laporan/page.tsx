import OwnerLayout from '@/components/OwnerLayout';
import OwnerReport from '../components/OwnerReport';

export default function OwnerLaporanPage() {
  return (
    <OwnerLayout title="Laporan" subtitle="Ringkasan hasil keputusan untuk diunduh atau dicetak">
      <OwnerReport />
    </OwnerLayout>
  );
}
