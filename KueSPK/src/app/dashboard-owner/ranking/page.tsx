import OwnerLayout from '@/components/OwnerLayout';
import RankingContent from '@/app/halaman-ranking-perbandingan/components/RankingContent';

export default function OwnerRankingPage() {
  return (
    <OwnerLayout title="Ranking & Perbandingan" subtitle="Perbandingan hasil metode SAW dan WASPAS">
      <RankingContent lockLambda />
    </OwnerLayout>
  );
}
