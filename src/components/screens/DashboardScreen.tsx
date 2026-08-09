import React from 'react';
import { 
  FileCheck2, 
  IndianRupee, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  PieChart as PieIcon,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Building2,
  UserCheck,
  Activity
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import type { Claim } from '../../types/claims';
import type { ScreenId } from '../layout/Sidebar';

interface DashboardScreenProps {
  claims: Claim[];
  onSelectClaim: (claimId: string) => void;
  setActiveScreen: (screen: ScreenId) => void;
}

const STATUS_PIE_DATA = [
  { name: 'Survey Pending', value: 12, color: '#f59e0b' },
  { name: 'Survey Underway', value: 16, color: '#3b82f6' },
  { name: 'Under Review', value: 9, color: '#8b5cf6' },
  { name: 'Admitted', value: 7, color: '#10b981' },
  { name: 'Settled', value: 3, color: '#64748b' }
];

const INSURER_COMPARISON_DATA = [
  { insurer: 'United India', claims: 14, avgDays: 112, settlementRate: '94%' },
  { insurer: 'ICICI Lombard', claims: 11, avgDays: 128, settlementRate: '91%' },
  { insurer: 'New India', claims: 9, avgDays: 135, settlementRate: '88%' },
  { insurer: 'HDFC ERGO', claims: 7, avgDays: 98, settlementRate: '96%' },
  { insurer: 'Bajaj Allianz', claims: 6, avgDays: 105, settlementRate: '93%' },
];

const SURVEYOR_COMPARISON = [
  { surveyor: 'M/s Apex Loss Assessors', assigned: 18, avgReportDays: 14, satisfaction: '94%' },
  { surveyor: 'M/s National Insurance Surveyors', assigned: 12, avgReportDays: 19, satisfaction: '88%' },
  { surveyor: 'M/s Infrastructure Loss Experts', assigned: 10, avgReportDays: 11, satisfaction: '97%' },
  { surveyor: 'M/s Technical Survey Committee', assigned: 7, avgReportDays: 22, satisfaction: '82%' },
];

const RESERVE_SETTLEMENT_TREND = [
  { month: 'Jan', reserve: 142, settled: 48 },
  { month: 'Feb', reserve: 155, settled: 54 },
  { month: 'Mar', reserve: 168, settled: 61 },
  { month: 'Apr', reserve: 174, settled: 66 },
  { month: 'May', reserve: 180, settled: 70 },
  { month: 'Jun', reserve: 186.4, settled: 72.8 }
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ claims, onSelectClaim, setActiveScreen }) => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>MODULE 9 • EXECUTIVE CEO DASHBOARD</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Claims Portfolio Intelligence</h1>
          <p className="text-sm text-slate-400">Real-time enterprise analytics across all highway concessions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveScreen('incident-reporting')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-900/30 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Report New Incident</span>
          </button>
          <button
            onClick={() => setActiveScreen('copilot')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-all"
          >
            Ask CEO AI Assistant
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (6 Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Open Claims</span>
            <FileCheck2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">47</div>
          <p className="text-[10px] text-emerald-400 font-medium">↑ 3 new this week</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Reserve</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">₹186.4 Cr</div>
          <p className="text-[10px] text-slate-400">Across 6 concessions</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Action</span>
            <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse-subtle" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">19</div>
          <p className="text-[10px] text-amber-300 font-medium">Requires document intake</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Settled (YTD)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">₹72.8 Cr</div>
          <p className="text-[10px] text-emerald-400 font-medium">96% target achievement</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Settlement</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">126 Days</div>
          <p className="text-[10px] text-emerald-400 font-medium">↓ 18 days vs FY25</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Claim Ratio</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">68%</div>
          <p className="text-[10px] text-slate-400">Within policy benchmark</p>
        </div>
      </div>

      {/* Insurance & Surveyor Comparison Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insurer Benchmarking */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Insurer Performance Comparison</h3>
            </div>
            <span className="text-[10px] text-slate-400">Settlement Speed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="pb-2">Insurer</th>
                  <th className="pb-2">Active Claims</th>
                  <th className="pb-2">Avg Settlement Speed</th>
                  <th className="pb-2 text-right">Admission Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {INSURER_COMPARISON_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-white">{row.insurer}</td>
                    <td className="py-2.5 text-slate-300">{row.claims}</td>
                    <td className="py-2.5 text-slate-400">{row.avgDays} Days</td>
                    <td className="py-2.5 text-emerald-400 font-bold text-right">{row.settlementRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Surveyor Benchmarking */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Surveyor Performance Matrix</h3>
            </div>
            <span className="text-[10px] text-slate-400">Turnaround SLA</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="pb-2">Surveyor Firm</th>
                  <th className="pb-2">Assigned</th>
                  <th className="pb-2">Avg Report Time</th>
                  <th className="pb-2 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {SURVEYOR_COMPARISON.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-white">{row.surveyor}</td>
                    <td className="py-2.5 text-slate-300">{row.assigned}</td>
                    <td className="py-2.5 text-slate-400">{row.avgReportDays} Days</td>
                    <td className="py-2.5 text-amber-400 font-bold text-right">{row.satisfaction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Claims Data Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Recent Claims Portfolio</h2>
            <p className="text-xs text-slate-400">Showing top active infrastructure loss claims</p>
          </div>
          <button
            onClick={() => setActiveScreen('claims')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>View All Claims</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Claim ID</th>
                <th className="px-5 py-3.5">Highway</th>
                <th className="px-5 py-3.5">Incident Type</th>
                <th className="px-5 py-3.5">Reserve</th>
                <th className="px-5 py-3.5">Insurer</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Age</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {claims.slice(0, 5).map((claim) => (
                <tr 
                  key={claim.id} 
                  onClick={() => onSelectClaim(claim.id)}
                  className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    claim.id === 'CLM-2026-00124' ? 'bg-blue-950/30 font-medium' : ''
                  }`}
                >
                  <td className="px-5 py-4 font-bold text-white flex items-center gap-2">
                    {claim.id === 'CLM-2026-00124' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="Primary Demo Claim" />
                    )}
                    <span>{claim.id}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-300 text-xs">
                    <span className="font-semibold text-slate-200">{claim.code}</span>
                    <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{claim.highway}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-300 text-xs">{claim.incidentType}</td>
                  <td className="px-5 py-4 font-semibold text-amber-400 text-xs">
                    {claim.reserveAmountLakhs >= 100 
                      ? `₹${(claim.reserveAmountLakhs / 100).toFixed(2)} Cr`
                      : `₹${claim.reserveAmountLakhs} Lakhs`}
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{claim.insurer}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      claim.status === 'Survey Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      claim.status === 'Survey Underway' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      claim.status === 'Admitted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      claim.status === 'Settled' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                      'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{claim.ageDays} Days</td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1">
                      <span>Open</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
