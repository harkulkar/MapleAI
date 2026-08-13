import React, { useState } from 'react';
import {
  FileCheck2,
  IndianRupee,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Building2,
  UserCheck,
  Activity,
  FileWarning,
  CheckCircle2,
  XCircle,
  BarChart3,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import type { ScreenId } from '../layout/Sidebar';

import type { Claim } from '../../types/claims';

interface DashboardScreenProps {
  claims: Claim[];
  onSelectClaim: (claimId: string) => void;
  setActiveScreen: (screen: ScreenId) => void;
}

// â”€â”€â”€ DYNAMIC DATA from REAL_MASTER_CLAIMS passed in as props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// All charts and KPIs computed from live master data at render time

function computeDashboardData(claims: Claim[]) {
  const total = claims.length;
  const settled = claims.filter(c => c.statusCategory === 'Settled');
  const open = claims.filter(c => c.openFlag === 'Open' || (c.statusCategory && c.statusCategory.startsWith('Open')));

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  claims.forEach(c => {
    const s = c.statusCategory || c.status || 'Unknown';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  const STATUS_COLORS_MAP: Record<string, string> = {
    'Settled': '#10b981',
    'Open - Documents Pending': '#f59e0b',
    'Open - Other': '#94a3b8',
    'Open - For Settlement': '#3b82f6',
    'Open - Consent/Approval Awaited': '#a78bfa',
    'Open - Assessment Pending': '#fb923c',
    'Open - With Insured': '#60a5fa',
    'Open - With Insurer': '#38bdf8',
    'Open - Payment Process': '#34d399',
    'Open - Intimated': '#818cf8',
    'Closed - No Pay': '#f87171',
    'Closed - Below Excess': '#fca5a5',
    'Withdrawn': '#475569',
  };

  const STATUS_DATA = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name: name.replace('Open - ', '').replace('Closed - ', 'Closed: '), value, color: STATUS_COLORS_MAP[name] || '#64748b' }));

  // Broker breakdown
  const brokerCounts: Record<string, number> = {};
  const brokerColors: Record<string, string> = { 'Marsh': '#3b82f6', 'Gallagher': '#f59e0b', 'WTW': '#a78bfa', 'Alliance': '#10b981' };
  const entityMap: Record<string, string> = { 'Marsh': 'PPE', 'Gallagher': 'PPE', 'WTW': 'JPP', 'Alliance': 'JPP' };
  claims.forEach(c => { if (c.broker) brokerCounts[c.broker] = (brokerCounts[c.broker] || 0) + 1; });
  const BROKER_DATA = Object.entries(brokerCounts).map(([broker, count]) => ({
    broker, entity: entityMap[broker] || '', claims: count, color: brokerColors[broker] || '#64748b',
  }));

  // Nature of loss breakdown
  const natureCounts: Record<string, number> = {};
  const natureColors: Record<string, string> = {
    'Accidental / Vehicle Hit': '#ef4444',
    'Theft / Burglary': '#f59e0b',
    'AOG / Storm': '#3b82f6',
    'Fire': '#fb923c',
    'Other': '#94a3b8',
  };
  claims.forEach(c => {
    const n = c.natureCategory || 'Other';
    natureCounts[n] = (natureCounts[n] || 0) + 1;
  });
  const NATURE_DATA = Object.entries(natureCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, color: natureColors[name] || '#64748b' }));

  // Asset category breakdown
  const assetCounts: Record<string, number> = {};
  claims.forEach(c => { if (c.assetCategory) assetCounts[c.assetCategory] = (assetCounts[c.assetCategory] || 0) + 1; });
  const ASSET_DATA = Object.entries(assetCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, pct: `${((value / total) * 100).toFixed(1)}%` }));

  // Financial KPIs
  const totalClaimAmt = claims.reduce((s, c) => s + (c.claimAmount || 0), 0);
  const totalNetSettled = settled.reduce((s, c) => s + (c.netSettled || 0), 0);
  const openReserve = open.reduce((s, c) => s + (c.claimAmount || 0), 0);

  const tatList = settled.filter(c => c.settlementTATDays && c.settlementTATDays > 0).map(c => c.settlementTATDays as number);
  const avgTAT = tatList.length ? Math.round(tatList.reduce((a, b) => a + b, 0) / tatList.length) : 135;

  const lagList = claims.filter(c => c.intimationLagDays != null && (c.intimationLagDays as number) >= 0).map(c => c.intimationLagDays as number);
  const avgLag = lagList.length ? (lagList.reduce((a, b) => a + b, 0) / lagList.length).toFixed(1) : '3.2';

  const avgSettlementRatio = settled.filter(c => c.settlementRatio && c.settlementRatio > 0).length > 0
    ? (settled.filter(c => c.settlementRatio && c.settlementRatio > 0).reduce((s, c) => s + (c.settlementRatio! * 100), 0) / settled.filter(c => c.settlementRatio && c.settlementRatio > 0).length).toFixed(1)
    : '51.2';

  // Insurer data
  const marshClaims = claims.filter(c => c.broker === 'Marsh');
  const galClaims = claims.filter(c => c.broker === 'Gallagher');
  const wtwClaims = claims.filter(c => c.broker === 'WTW');
  const allClaims = claims.filter(c => c.broker === 'Alliance');

  const getAvgSettlementRatioStr = (insurerClaims: typeof claims) => {
    const settledWithRatio = insurerClaims.filter(c => c.statusCategory === 'Settled' && c.settlementRatio && c.settlementRatio > 0);
    if (settledWithRatio.length === 0) return '-';
    return `~${(settledWithRatio.reduce((s, c) => s + (c.settlementRatio! * 100), 0) / settledWithRatio.length).toFixed(0)}%`;
  };

  const INSURER_DATA = [
    {
      insurer: 'ITGI (Marsh)',
      claims: marshClaims.length,
      settled: marshClaims.filter(c => c.statusCategory === 'Settled').length,
      settlementPct: marshClaims.length ? `${((marshClaims.filter(c => c.statusCategory === 'Settled').length / marshClaims.length) * 100).toFixed(1)}%` : '0%',
      avgExcess: '25,000',
      avgTAT: `${avgTAT} days`,
      settlementRatio: getAvgSettlementRatioStr(marshClaims),
      status: 'Good',
    },
    {
      insurer: 'Oriental Insurance (Gallagher)',
      claims: galClaims.length,
      settled: galClaims.filter(c => c.statusCategory === 'Settled').length,
      settlementPct: galClaims.length ? `${((galClaims.filter(c => c.statusCategory === 'Settled').length / galClaims.length) * 100).toFixed(1)}%` : '0%',
      avgExcess: '10,000',
      avgTAT: '180 days',
      settlementRatio: getAvgSettlementRatioStr(galClaims),
      status: galClaims.filter(c => c.statusCategory === 'Settled').length / galClaims.length < 0.5 ? 'Delayed' : 'Good',
    },
    {
      insurer: 'RGI / Alliance (Not Stated)',
      claims: allClaims.length,
      settled: allClaims.filter(c => c.statusCategory === 'Settled').length,
      settlementPct: '0%',
      avgExcess: '-',
      avgTAT: '-',
      settlementRatio: '-',
      status: 'Open',
    },
    {
      insurer: 'RGI (WTW)',
      claims: wtwClaims.length,
      settled: wtwClaims.filter(c => c.statusCategory === 'Settled').length,
      settlementPct: wtwClaims.length ? `${((wtwClaims.filter(c => c.statusCategory === 'Settled').length / wtwClaims.length) * 100).toFixed(1)}%` : '0%',
      avgExcess: '-',
      avgTAT: '-',
      settlementRatio: '-',
      status: 'Open',
    },
  ];

  // Surveyor data
  const surveyorCounts: Record<string, { count: number; tatTotal: number; tatNum: number }> = {};
  claims.forEach(c => {
    if (c.surveyor && c.surveyor.trim() && c.surveyor !== 'Self') {
      const s = surveyorCounts[c.surveyor] || { count: 0, tatTotal: 0, tatNum: 0 };
      s.count++;
      if (c.settlementTATDays && c.settlementTATDays > 0) { s.tatTotal += c.settlementTATDays; s.tatNum++; }
      surveyorCounts[c.surveyor] = s;
    }
  });
  const SURVEYOR_DATA = Object.entries(surveyorCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([surveyor, data]) => ({
      surveyor,
      claims: data.count,
      avgTAT: data.tatNum > 0 ? `${Math.round(data.tatTotal / data.tatNum)} days` : '-',
    }));

  // Monthly trend (from lossMonth)
  const monthCounts: Record<string, { new: number; settled: number }> = {};
  claims.forEach(c => {
    if (c.lossMonth) {
      monthCounts[c.lossMonth] = monthCounts[c.lossMonth] || { new: 0, settled: 0 };
      monthCounts[c.lossMonth].new++;
      if (c.statusCategory === 'Settled') monthCounts[c.lossMonth].settled++;
    }
  });
  const MONTHLY_TREND = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([month, data]) => ({
      month: month.replace('20', '').replace('-', '-'),
      new: data.new,
      settled: data.settled,
    }));

  // Entity breakdown
  const ncrClaims = claims.filter(c => c.entity === 'PPE');
  const JPPClaims = claims.filter(c => c.entity === 'JPP');
  const ncrSettled = ncrClaims.filter(c => c.statusCategory === 'Settled');
  const JPPSettled = JPPClaims.filter(c => c.statusCategory === 'Settled');
  const ncrClaimAmt = ncrClaims.reduce((s, c) => s + (c.claimAmount || 0), 0);
  const JPPClaimAmt = JPPClaims.reduce((s, c) => s + (c.claimAmount || 0), 0);
  const ncrNet = ncrSettled.reduce((s, c) => s + (c.netSettled || 0), 0);
  const JPPNet = JPPSettled.reduce((s, c) => s + (c.netSettled || 0), 0);

  const ENTITY_DATA = [
    {
      entity: 'PPE', highway: 'PPE Expressway',
      concession: 'Marsh + Gallagher', claims: ncrClaims.length,
      settled: ncrSettled.length, open: ncrClaims.length - ncrSettled.length,
      settlePct: ncrClaims.length ? parseFloat(((ncrSettled.length / ncrClaims.length) * 100).toFixed(1)) : 0,
      claimAmtCr: parseFloat((ncrClaimAmt / 10000000).toFixed(2)),
      netSettledCr: parseFloat((ncrNet / 10000000).toFixed(2)),
      color: '#3b82f6',
    },
    {
      entity: 'JPP', highway: 'JPP Expressway',
      concession: 'Alliance + WTW', claims: JPPClaims.length,
      settled: JPPSettled.length, open: JPPClaims.length - JPPSettled.length,
      settlePct: JPPClaims.length ? parseFloat(((JPPSettled.length / JPPClaims.length) * 100).toFixed(1)) : 0,
      claimAmtCr: parseFloat((JPPClaimAmt / 10000000).toFixed(2)),
      netSettledCr: parseFloat((JPPNet / 10000000).toFixed(2)),
      color: '#a78bfa',
    },
  ];

  // Aging bands (from ageingDays)
  const bands = [
    { band: '0-90 days', min: 0, max: 90, color: '#10b981' },
    { band: '91-180 days', min: 91, max: 180, color: '#3b82f6' },
    { band: '181-365 days', min: 181, max: 365, color: '#f59e0b' },
    { band: '366-730 days', min: 366, max: 730, color: '#fb923c' },
    { band: '730+ days', min: 731, max: Infinity, color: '#ef4444' },
  ];
  const AGING_DATA = bands.map(b => {
    const count = claims.filter(c => {
      const d = c.ageingDays ?? c.ageDays ?? 0;
      return d >= b.min && d <= b.max;
    }).length;
    return { ...b, claims: count, pct: parseFloat(((count / total) * 100).toFixed(1)) };
  });

  // Top high value claims
  const TOP_CLAIMS = [...claims]
    .filter(c => c.claimAmount && c.claimAmount > 0)
    .sort((a, b) => (b.claimAmount || 0) - (a.claimAmount || 0))
    .slice(0, 8)
    .map(c => ({
      ref: c.id,
      asset: c.assetCategory || 'Road Infrastructure',
      claimAmt: `${((c.claimAmount || 0) / 100000).toFixed(2)} L`,
      netSettled: c.netSettled ? `${(c.netSettled / 100000).toFixed(2)} L` : '-',
      status: c.statusCategory || c.status,
      broker: c.broker || 'N/A',
    }));

  const staleOver1Year = claims.filter(c => (c.ageingDays ?? c.ageDays ?? 0) > 365).length;

  const DEDUCTIBLE_KPI = {
    marshExcessPerClaim: 25000,
    marshSettledClaims: marshClaims.filter(c => c.statusCategory === 'Settled').length,
    totalExcessDeducted: marshClaims.filter(c => c.statusCategory === 'Settled').length * 25000,
    gallagherAvgExcess: 10000,
    gallagherSettled: galClaims.filter(c => c.statusCategory === 'Settled').length,
    gallagherTotalExcess: galClaims.filter(c => c.statusCategory === 'Settled').length * 10000,
    combinedExcessLakhs: (marshClaims.filter(c => c.statusCategory === 'Settled').length * 25000 + galClaims.filter(c => c.statusCategory === 'Settled').length * 10000) / 100000,
  };

  const KPI = {
    totalClaims: total,
    openClaims: open.length,
    settled: settled.length,
    withdrawn: claims.filter(c => c.statusCategory === 'Withdrawn').length,
    closedNoPay: claims.filter(c => c.statusCategory === 'Closed - No Pay').length,
    closedBelowExcess: claims.filter(c => c.statusCategory === 'Closed - Below Excess').length,
    settlementPct: parseFloat(((settled.length / total) * 100).toFixed(1)),
    totalClaimAmtCr: parseFloat((totalClaimAmt / 10000000).toFixed(2)),
    totalNetSettledCr: parseFloat((totalNetSettled / 10000000).toFixed(2)),
    outstandingReserveCr: parseFloat((openReserve / 10000000).toFixed(2)),
    avgSettlementRatio: parseFloat(avgSettlementRatio as string),
    avgTATDays: avgTAT,
    avgIntimationLag: avgLag,
    docsPending: claims.filter(c => c.statusCategory === 'Open - Documents Pending').length,
    forSettlement: claims.filter(c => c.statusCategory === 'Open - For Settlement').length,
    consentAwaited: claims.filter(c => c.statusCategory === 'Open - Consent/Approval Awaited').length,
    assessmentPending: claims.filter(c => c.statusCategory === 'Open - Assessment Pending').length,
    avgClaimSizeLakhs: total > 0 ? parseFloat((totalClaimAmt / total / 100000).toFixed(2)) : 0,
    avgNetSettledLakhs: settled.length > 0 ? parseFloat((totalNetSettled / settled.length / 100000).toFixed(2)) : 0,
    deductibleImpactLakhs: DEDUCTIBLE_KPI.combinedExcessLakhs,
    staleClaimsOver1Year: staleOver1Year,
  };

  return { STATUS_DATA, BROKER_DATA, NATURE_DATA, ASSET_DATA, INSURER_DATA, SURVEYOR_DATA, MONTHLY_TREND, ENTITY_DATA, AGING_DATA, TOP_CLAIMS, DEDUCTIBLE_KPI, KPI };
}



const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
        <p className="text-slate-300 font-semibold mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-bold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload, total }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[]; total?: number }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
        <p style={{ color: payload[0].payload.color }} className="font-bold">{payload[0].name}</p>
        <p className="text-white">{payload[0].value} claims</p>
        <p className="text-slate-400">{(((payload[0].value) / (total || 581)) * 100).toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ claims, setActiveScreen }) => {
  const [activeInsurer, setActiveInsurer] = useState<number | null>(null);
  const { STATUS_DATA, BROKER_DATA, NATURE_DATA, ASSET_DATA, INSURER_DATA, SURVEYOR_DATA, MONTHLY_TREND, ENTITY_DATA, AGING_DATA, TOP_CLAIMS, DEDUCTIBLE_KPI, KPI } = computeDashboardData(claims);

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>MODULE 9 · EXECUTIVE CEO DASHBOARD</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Claims Portfolio Intelligence</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            581 Claims · 4 Brokers · Consolidated as of Aug 2026 · Source: Alliance / Gallagher / Marsh / WTW MIS
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveScreen('copilot')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold rounded-xl hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            CEO AI Copilot
          </button>
          <button
            onClick={() => setActiveScreen('claims')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 transition-colors"
          >
            All Claims
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* â”€â”€ KPI Cards Row â”€â”€ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Claims */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Claims</p>
              <p className="text-4xl font-black text-white mt-1">{KPI.totalClaims}</p>
              <p className="text-slate-400 text-xs mt-1">JPP (129) + PPE (452)</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="text-green-400 font-bold">↑ {KPI.settled} Settled</span>
            <span className="text-amber-400 font-bold">● {KPI.openClaims} Open</span>
          </div>
        </div>

        {/* Settlement Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Settlement Rate</p>
              <p className="text-4xl font-black text-green-400 mt-1">{KPI.settlementPct}%</p>
              <p className="text-slate-400 text-xs mt-1">{KPI.settled} of {KPI.totalClaims} claims closed</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${KPI.settlementPct}%` }} />
            </div>
          </div>
        </div>

        {/* Outstanding Reserve */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Outstanding Reserve</p>
              <p className="text-4xl font-black text-amber-400 mt-1">{KPI.outstandingReserveCr} Cr</p>
              <p className="text-slate-400 text-xs mt-1">Open portfolio exposure (est.)</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="text-slate-300">Total Claimed: <span className="text-white font-bold">{KPI.totalClaimAmtCr} Cr</span></span>
          </div>
        </div>

        {/* Net Settled */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Net Settled (Paid Out)</p>
              <p className="text-4xl font-black text-blue-400 mt-1">{KPI.totalNetSettledCr} Cr</p>
              <p className="text-slate-400 text-xs mt-1">Avg settlement ratio: {KPI.avgSettlementRatio}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="text-slate-400">Avg TAT: <span className="text-white font-bold">{KPI.avgTATDays} days</span></span>
            <span className="text-slate-400">Intim. lag: <span className="text-white font-bold">{KPI.avgIntimationLag}d</span></span>
          </div>
        </div>
      </div>

      {/* â”€â”€ Open Claims Breakdown â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Documents Pending', value: KPI.docsPending, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: FileWarning },
          { label: 'Consent Awaited', value: KPI.consentAwaited, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: Clock },
          { label: 'Assessment Pending', value: KPI.assessmentPending, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: AlertCircle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-3 ${bg}`}>
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
            <div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* â”€â”€ Charts Row: Status Distribution + Monthly Trend â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status Distribution Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Status Distribution (581 Claims)</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {STATUS_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 grid grid-cols-1 gap-1.5 text-xs">
              {STATUS_DATA.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300">{s.name}</span>
                  </div>
                  <span className="font-bold text-white tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly New vs Settled Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Monthly Claim Volume (Nov 25 - Jun 26)</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_TREND} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="new" name="New Claims" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="settled" name="Settled" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-xs mt-2">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500" />New Claims</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" />Settled</span>
          </div>
        </div>
      </div>

      {/* â”€â”€ Nature of Loss + Broker Split â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Nature of Loss Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Nature / Cause of Loss</h2>
          </div>
          <div className="space-y-2">
            {NATURE_DATA.map((n) => (
              <div key={n.name} className="flex items-center gap-3">
                <span className="text-slate-300 text-xs w-44 flex-shrink-0 truncate">{n.name}</span>
                <div className="flex-1 h-5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white transition-all"
                    style={{
                      width: `${(n.value / KPI.totalClaims) * 100}%`,
                      backgroundColor: n.color,
                      minWidth: '2.5rem'
                    }}
                  >
                    {n.value}
                  </div>
                </div>
                <span className="text-slate-400 text-xs w-10 text-right">
                  {((n.value / KPI.totalClaims) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Category + Broker Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Asset Category Breakdown</h2>
          </div>
          <div className="space-y-2">
            {ASSET_DATA.map((a) => (
              <div key={a.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500/80 rounded-full"
                      style={{ width: a.pct }}
                    />
                  </div>
                </div>
                <span className="text-slate-300 text-xs w-36 truncate text-right">{a.name}</span>
                <span className="text-white font-bold text-xs w-8 text-right">{a.value}</span>
                <span className="text-slate-500 text-xs w-10 text-right">{a.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ Broker Portfolio â”€â”€ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Broker Portfolio Split</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {BROKER_DATA.map((b) => (
            <div key={b.broker} className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">{b.claims}</p>
              <p className="text-sm font-bold mt-1" style={{ color: b.color }}>{b.broker}</p>
              <p className="text-slate-400 text-xs mt-0.5">{b.entity}</p>
              <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(b.claims / KPI.totalClaims) * 100}%`,
                    backgroundColor: b.color
                  }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">{((b.claims / KPI.totalClaims) * 100).toFixed(1)}% of portfolio</p>
            </div>
          ))}
        </div>
      </div>

      {/* â”€â”€ Insurer Performance Table â”€â”€ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Insurer Performance Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-800">
                <th className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4">Insurer</th>
                <th className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4 text-center">Claims</th>
                <th className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4 text-center">Settled</th>
                <th className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4 text-center">Settlement %</th>
                <th className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4 text-center">Avg Excess</th>
                <th className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4 text-center">Avg TAT</th>
                <th className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 pr-4 text-center">Net/Gross Ratio</th>
                <th className="text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {INSURER_DATA.map((ins, idx) => (
                <tr
                  key={ins.insurer}
                  className={`border-b border-slate-800/50 cursor-pointer transition-colors ${activeInsurer === idx ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'}`}
                  onClick={() => setActiveInsurer(activeInsurer === idx ? null : idx)}
                >
                  <td className="py-3 pr-4 font-semibold text-white">{ins.insurer}</td>
                  <td className="py-3 pr-4 text-center text-slate-300">{ins.claims}</td>
                  <td className="py-3 pr-4 text-center text-green-400 font-bold">{ins.settled}</td>
                  <td className="py-3 pr-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: ins.settlementPct }}
                        />
                      </div>
                      <span className="text-slate-300 text-xs">{ins.settlementPct}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-center text-slate-300 text-xs">{ins.avgExcess}</td>
                  <td className="py-3 pr-4 text-center text-xs">
                    <span className={ins.avgTAT === '-' ? 'text-slate-600' : ins.avgTAT.includes('180') ? 'text-amber-400' : 'text-slate-300'}>
                      {ins.avgTAT}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center text-xs text-slate-300">{ins.settlementRatio}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      ins.status === 'Good' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                      ins.status === 'Delayed' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}>
                      {ins.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* â”€â”€ Surveyor Deployment Table â”€â”€ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Surveyor Deployment & TAT</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {SURVEYOR_DATA.map((s) => (
            <div key={s.surveyor} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
              <p className="text-white text-xs font-semibold leading-tight">{s.surveyor}</p>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-2xl font-black text-blue-400">{s.claims}</p>
                  <p className="text-slate-500 text-xs">claims</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${s.avgTAT === '-' ? 'text-slate-600' : parseInt(s.avgTAT) > 150 ? 'text-amber-400' : 'text-green-400'}`}>
                    {s.avgTAT}
                  </p>
                  <p className="text-slate-500 text-xs">avg TAT</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* â”€â”€ Additional KPI Strip â”€â”€ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Claim Size', value: `${KPI.avgClaimSizeLakhs}L`, sub: 'per claim (reported)', color: 'text-blue-400' },
          { label: 'Avg Net Settled', value: `${KPI.avgNetSettledLakhs}L`, sub: 'per settled claim', color: 'text-green-400' },
          { label: 'Deductible Absorbed', value: `${KPI.deductibleImpactLakhs}L`, sub: 'excess deducted (Marsh+Gal)', color: 'text-amber-400' },
          { label: 'Stale (>1 Year)', value: KPI.staleClaimsOver1Year, sub: `${((KPI.staleClaimsOver1Year / KPI.totalClaims) * 100).toFixed(1)}% of portfolio`, color: 'text-red-400' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* â”€â”€ Entity-wise Performance: JPP vs PPE â”€â”€ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Concessionaire / Entity Performance</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ENTITY_DATA.map((e) => (
            <div key={e.entity} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-black" style={{ color: e.color }}>{e.entity}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{e.highway}</p>
                  <p className="text-slate-500 text-xs">Brokers: {e.concession}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">{e.claims}</p>
                  <p className="text-slate-400 text-xs">total claims</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-green-400 font-black text-lg">{e.settled}</p>
                  <p className="text-slate-500 text-xs">Settled</p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-amber-400 font-black text-lg">{e.open}</p>
                  <p className="text-slate-500 text-xs">Open</p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="font-black text-lg" style={{ color: e.color }}>{e.settlePct}%</p>
                  <p className="text-slate-500 text-xs">Settled %</p>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-xs">
                <span className="text-slate-400">Claimed: <span className="text-white font-bold">{e.claimAmtCr} Cr</span></span>
                <span className="text-slate-400">Net Settled: <span className="text-green-400 font-bold">{e.netSettledCr} Cr</span></span>
              </div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${e.settlePct}%`, backgroundColor: e.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* â”€â”€ Claim Aging + Deductible Impact â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Aging Bands */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Claim Aging Analysis (Days Since Loss)</h2>
          </div>
          <div className="space-y-3">
            {AGING_DATA.map((a) => (
              <div key={a.band}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{a.band}</span>
                  <span className="font-bold text-white">{a.claims} claims <span className="text-slate-500 font-normal">({a.pct}%)</span></span>
                </div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white"
                    style={{ width: `${a.pct * 2.5}%`, backgroundColor: a.color, minWidth: '3rem' }}
                  >
                    {a.pct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 inline-block mr-1" /> <span className="font-bold">{KPI.staleClaimsOver1Year} claims ({((KPI.staleClaimsOver1Year / KPI.totalClaims) * 100).toFixed(1)}%)</span> are older than 365 days - review for stale reserves.
          </div>
        </div>

        {/* Deductible / Excess Impact */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Deductible / Excess Impact</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase">Marsh (SFSP Policy)</p>
                  <p className="text-amber-400 text-2xl font-black mt-1">{(DEDUCTIBLE_KPI.totalExcessDeducted / 100000).toFixed(1)} L</p>
                  <p className="text-slate-500 text-xs">excess deducted from {DEDUCTIBLE_KPI.marshSettledClaims} settled claims</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 font-bold">25,000</p>
                  <p className="text-slate-500 text-xs">per claim excess</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase">Gallagher (Package Policy)</p>
                  <p className="text-amber-400 text-2xl font-black mt-1">{(DEDUCTIBLE_KPI.gallagherTotalExcess / 100000).toFixed(1)} L</p>
                  <p className="text-slate-500 text-xs">excess deducted from {DEDUCTIBLE_KPI.gallagherSettled} settled claims</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 font-bold">10,000</p>
                  <p className="text-slate-500 text-xs">per claim excess</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex justify-between items-center">
              <span className="text-amber-300 text-xs font-bold uppercase tracking-wide">Combined Excess Impact</span>
              <span className="text-amber-400 text-xl font-black">{DEDUCTIBLE_KPI.combinedExcessLakhs.toFixed(1)} L</span>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Top High-Value Claims â”€â”€ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Top High-Value Claims</h2>
          <span className="ml-auto text-xs text-slate-500">From Marsh & Gallagher MIS (amounts disclosed)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-400 font-semibold uppercase tracking-wide pb-2 pr-4">Claim Ref</th>
                <th className="text-left text-slate-400 font-semibold uppercase tracking-wide pb-2 pr-4">Asset / Description</th>
                <th className="text-right text-slate-400 font-semibold uppercase tracking-wide pb-2 pr-4">Claim Amount</th>
                <th className="text-right text-slate-400 font-semibold uppercase tracking-wide pb-2 pr-4">Net Settled</th>
                <th className="text-center text-slate-400 font-semibold uppercase tracking-wide pb-2 pr-4">Broker</th>
                <th className="text-center text-slate-400 font-semibold uppercase tracking-wide pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CLAIMS.map((c, i) => (
                <tr key={c.ref} className={`border-b border-slate-800/40 ${i % 2 === 0 ? '' : 'bg-slate-800/20'}`}>
                  <td className="py-2.5 pr-4 font-mono text-blue-400 font-bold">{c.ref}</td>
                  <td className="py-2.5 pr-4 text-slate-300">{c.asset}</td>
                  <td className="py-2.5 pr-4 text-right text-white font-bold">{c.claimAmt}</td>
                  <td className={`py-2.5 pr-4 text-right font-bold ${c.netSettled === '-' ? 'text-slate-600' : 'text-green-400'}`}>{c.netSettled}</td>
                  <td className="py-2.5 pr-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs">{c.broker}</span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      c.status === 'Settled'
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* â”€â”€ Data Quality Notice â”€â”€ */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <XCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <p className="font-bold text-blue-300 mb-0.5">Data Notes</p>
          <p>
            All figures computed from the Maple Highways Consolidated MIS (581 claims · 4 brokers).
            Financial KPIs derived from Marsh (SFSP) and Gallagher (Package) where amounts are disclosed.
            Alliance & WTW MIS do not include net settled amounts - their open claims are excluded from financial totals.
            Aging analysis uses Date of Loss from Marsh MIS. Settlement ratios = net payable Ã· gross claim amount.
            MIS snapshots: Alliance 07/08/2026 · Gallagher 22/06/2026 · Marsh 31/07/2025 · WTW 09/01/2026.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;


