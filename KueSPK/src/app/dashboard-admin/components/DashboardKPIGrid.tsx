'use client';

import {
  Cookie,
  Sliders,
  ClipboardList,
  Trophy,
  Award,
  Percent,
} from 'lucide-react';
import { useDSS, getReadiness } from '@/lib/dss-store';
import {
  calculateSAW,
  calculateWASPAS,
  formatNumber,
} from '@/lib/dss-data';
import Icon from '@/components/ui/AppIcon';


export default function DashboardKPIGrid() {
  const { alternatives: mockAlternatives, criteria: mockCriteria, assessments: mockAssessments, lambda } = useDSS();
  const readiness = getReadiness(mockAlternatives, mockCriteria, mockAssessments);
  const sawResults = readiness.ready ? calculateSAW(mockAlternatives, mockCriteria, mockAssessments) : [];
  const waspasResults = readiness.ready ? calculateWASPAS(mockAlternatives, mockCriteria, mockAssessments, lambda) : [];

  const bestSAW = sawResults?.find((r) => r?.ranking === 1);
  const bestWASPAS = waspasResults?.find((r) => r?.ranking === 1);
  const totalBobot = readiness.totalBobot;
  const bobotValid = readiness.bobotValid;

  const kpiCards = [
    {
      id: 'kpi-varian',
      label: 'Total Varian',
      value: mockAlternatives?.length?.toString(),
      sub: 'Alternatif kue balok',
      icon: Cookie,
      color: 'var(--primary)',
      bgColor: 'var(--muted)',
      trend: null,
    },
    {
      id: 'kpi-kriteria',
      label: 'Total Kriteria',
      value: mockCriteria?.length?.toString(),
      sub: `${mockCriteria?.filter(c=>c?.jenis==='BENEFIT')?.length} Benefit · ${mockCriteria?.filter(c=>c?.jenis==='COST')?.length} Cost`,
      icon: Sliders,
      color: 'var(--info)',
      bgColor: 'var(--info-bg)',
      trend: null,
    },
    {
      id: 'kpi-penilaian',
      label: 'Total Penilaian',
      value: mockAssessments?.length?.toString(),
      sub: `${mockAlternatives?.length} varian × ${mockCriteria?.length} kriteria`,
      icon: ClipboardList,
      color: 'var(--success)',
      bgColor: 'var(--success-bg)',
      trend: null,
    },
    {
      id: 'kpi-best-saw',
      label: 'Varian Terbaik SAW',
      value: bestSAW ? bestSAW?.nama : '—',
      sub: bestSAW ? `Nilai SAW: ${formatNumber(bestSAW?.nilaiSAW)}` : 'Belum dihitung',
      icon: Trophy,
      color: '#B7791F',
      bgColor: 'var(--warning-bg)',
      trend: null,
    },
    {
      id: 'kpi-best-waspas',
      label: 'Varian Terbaik WASPAS',
      value: bestWASPAS ? bestWASPAS?.nama : '—',
      sub: bestWASPAS ? `Nilai Q: ${formatNumber(bestWASPAS?.nilaiQ)}` : 'Belum dihitung',
      icon: Award,
      color: 'var(--accent)',
      bgColor: 'var(--peach-100)',
      trend: null,
    },
    {
      id: 'kpi-bobot',
      label: 'Status Bobot',
      value: `${totalBobot}%`,
      sub: bobotValid ? 'Bobot valid ✓' : 'Bobot belum valid ✗',
      icon: Percent,
      color: bobotValid ? 'var(--success)' : 'var(--error)',
      bgColor: bobotValid ? 'var(--success-bg)' : 'var(--error-bg)',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      {kpiCards?.map((card) => {
        const Icon = card?.icon;
        return (
          <div
            key={card?.id}
            className="card-warm card-warm-hover p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p
                className="text-xs font-semibold tracking-wide"
                style={{ color: 'var(--muted-foreground)', letterSpacing: '0.06em' }}
              >
                {card?.label?.toUpperCase()}
              </p>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card?.bgColor }}
              >
                <Icon size={16} style={{ color: card?.color }} />
              </div>
            </div>
            <div>
              <p
                className="text-2xl font-bold font-tabular leading-tight truncate"
                style={{ color: 'var(--foreground)' }}
              >
                {card?.value}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {card?.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}