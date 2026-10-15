import OwnerLayout from '@/components/OwnerLayout';
import OwnerSimulasi from '../components/OwnerSimulasi';

export default function OwnerSimulasiPage() {
  return (
    <OwnerLayout title="Simulasi Bobot" subtitle="Coba ubah kepentingan kriteria dan lihat dampaknya pada ranking">
      <OwnerSimulasi />
    </OwnerLayout>
  );
}
