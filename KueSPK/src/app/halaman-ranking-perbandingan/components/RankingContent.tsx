'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDSS, getReadiness } from '@/lib/dss-store';
import {
  calculateSAW,
  calculateWASPAS,
  generateComparison,
} from '@/lib/dss-data';
import RankingTabs from './RankingTabs';
import RankingTableSAW from './RankingTableSAW';
import RankingTableWASPAS from './RankingTableWASPAS';
import RankingComparison from './RankingComparison';
import RankingConclusion from './RankingConclusion';
import RankingDetailAccordion from './RankingDetailAccordion';
import RankingComparisonChart from './RankingComparisonChart';
import LambdaControl from './LambdaControl';

export default function RankingContent({ lockLambda = false }: { lockLambda?: boolean }) {
  const { alternatives: mockAlternatives, criteria: mockCriteria, assessments: mockAssessments, lambda: storeLambda, setLambda: setStoreLambda } = useDSS();
  const [localLambda, setLocalLambda] = useState<number | null>(null);
  // Owner hanya melihat: mengubah λ di sini tidak mengubah pengaturan admin
  const lambda = lockLambda ? (localLambda ?? storeLambda) : storeLambda;
  const setLambda = lockLambda ? setLocalLambda : setStoreLambda;
  const [activeTab, setActiveTab] = useState<'overview' | 'saw' | 'waspas' | 'detail'>('overview');
  const readiness = getReadiness(mockAlternatives, mockCriteria, mockAssessments);

  if (!readiness.ready) {
    return (
      <div className="card-warm p-8 text-center space-y-2">
        <p className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
          Ranking belum bisa dihitung
        </p>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {!readiness.hasData
            ? 'Belum ada varian atau kriteria.'
            : !readiness.bobotValid
            ? `Total bobot ${readiness.totalBobot}% — harus tepat 100%.`
            : `Penilaian baru terisi ${readiness.filled} dari ${readiness.expected}.`}
        </p>
        {!lockLambda && (
        <Link href={readiness.bobotValid ? '/admin/penilaian' : '/admin/kriteria'} className="btn-primary inline-block text-sm px-4 py-2 mt-2">
          Perbaiki data
        </Link>
        )}
      </div>
    );
  }

  // Backend integration point: Replace with Supabase calculation_results query
  // Recalculate dynamically when lambda or data changes
  const sawResults = calculateSAW(mockAlternatives, mockCriteria, mockAssessments);
  const waspasResults = calculateWASPAS(mockAlternatives, mockCriteria, mockAssessments, lambda);
  const comparison = generateComparison(sawResults, waspasResults);

  const bestSAW = sawResults?.find((r) => r?.ranking === 1);
  const bestWASPAS = waspasResults?.find((r) => r?.ranking === 1);
  const isSameWinner = bestSAW?.alternativeId === bestWASPAS?.alternativeId;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Lambda Control */}
      <LambdaControl lambda={lambda} onChange={setLambda} />

      {/* Tabs */}
      <RankingTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-slide-up">
          {/* Conclusion */}
          <RankingConclusion
            bestSAW={bestSAW}
            bestWASPAS={bestWASPAS}
            isSameWinner={isSameWinner}
          />

          {/* Comparison Chart */}
          <RankingComparisonChart
            sawResults={sawResults}
            waspasResults={waspasResults}
          />

          {/* Comparison Table */}
          <RankingComparison comparison={comparison} />
        </div>
      )}

      {/* SAW Tab */}
      {activeTab === 'saw' && (
        <div className="animate-slide-up">
          <RankingTableSAW results={sawResults} criteria={mockCriteria} />
        </div>
      )}

      {/* WASPAS Tab */}
      {activeTab === 'waspas' && (
        <div className="animate-slide-up">
          <RankingTableWASPAS results={waspasResults} criteria={mockCriteria} lambda={lambda} />
        </div>
      )}

      {/* Detail Tab */}
      {activeTab === 'detail' && (
        <div className="animate-slide-up">
          <RankingDetailAccordion
            alternatives={mockAlternatives}
            criteria={mockCriteria}
            assessments={mockAssessments}
            sawResults={sawResults}
            waspasResults={waspasResults}
            lambda={lambda}
          />
        </div>
      )}
    </div>
  );
}