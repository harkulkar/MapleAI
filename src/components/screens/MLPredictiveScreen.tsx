import React from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Target, 
  FileText,
  BarChart2
} from 'lucide-react';
import type { ScreenId } from '../layout/Sidebar';
import { getMLPredictionForClaim } from '../../services/aiService';

interface MLPredictiveScreenProps {
  setActiveScreen: (screen: ScreenId) => void;
}

export const MLPredictiveScreen: React.FC<MLPredictiveScreenProps> = ({ setActiveScreen }) => {
  const mlData = getMLPredictionForClaim('CLM-2026-00124');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Screen Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>MODULE 8 • INTELLIGENT ML PREDICTIVE ENGINE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">INTELLIGENT CLAIM ASSESSMENT</h1>
          <p className="text-sm text-slate-400">ML model trained on historical survey reports, policy wordings & settlement negotiation archives.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg text-xs text-amber-400 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Trained on {mlData.benchmarkClaimsCount} Benchmark Road Damage Claims</span>
        </div>
      </div>

      {/* Primary ML Outcome Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Expected Settlement */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl space-y-2 border-l-4 border-l-emerald-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EXPECTED SETTLEMENT RATE</span>
          <div className="text-4xl font-black text-emerald-400">{mlData.expectedSettlementPercent}%</div>
          <p className="text-[11px] text-slate-400">Predicted recovery vs reserve</p>
        </div>

        {/* Card 2: Expected Timeline */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl space-y-2 border-l-4 border-l-purple-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EXPECTED SETTLEMENT TIMELINE</span>
          <div className="text-4xl font-black text-purple-400">{mlData.expectedDurationDays} Days</div>
          <p className="text-[11px] text-slate-400">From intake to final payout</p>
        </div>

        {/* Card 3: Probability of Repudiation */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl space-y-2 border-l-4 border-l-blue-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PROBABILITY OF REPUDIATION</span>
          <div className="text-4xl font-black text-blue-400">{mlData.probabilityOfRepudiationPercent}%</div>
          <p className="text-[11px] text-emerald-400 font-medium">Ultra-low repudiation risk</p>
        </div>

        {/* Card 4: Historical Benchmark */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl space-y-2 border-l-4 border-l-amber-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">TRAINING DATASET</span>
          <div className="text-4xl font-black text-amber-400">{mlData.benchmarkClaimsCount}</div>
          <p className="text-[11px] text-slate-400">Similar highway flood claims</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Forecasted Survey Queries (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>FORECASTED SURVEYOR QUERIES (ML PREDICTION)</span>
            </h3>
            <p className="text-xs text-slate-400">Based on past 124 survey reports, the surveyor is 94% likely to request:</p>

            <div className="space-y-2 text-xs">
              {mlData.expectedSurveyQueries.map((query, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3 text-slate-200 font-medium">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span>{query}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ideal Negotiation Strategy (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 border-t-4 border-t-amber-500">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              <span>IDEAL NEGOTIATION STRATEGY</span>
            </h3>

            <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 text-sm text-slate-200 font-medium leading-relaxed">
              "{mlData.idealNegotiationStrategy}"
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pre-empts 15% depreciation cut on asphalt surfacing</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Accelerates loss adjustment approval by ~22 days</span>
              </div>
            </div>

            <button
              onClick={() => setActiveScreen('ai-advisor')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Apply ML Strategy to Claim CLM-2026-00124
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
