import OwnerLayout from '@/components/OwnerLayout';
import OwnerVarian from '../components/OwnerVarian';

export default function OwnerVarianPage() {
  return (
    <OwnerLayout title="Daftar Varian" subtitle="Semua varian kue balok beserta harga dan peringkatnya">
      <OwnerVarian />
    </OwnerLayout>
  );
}
