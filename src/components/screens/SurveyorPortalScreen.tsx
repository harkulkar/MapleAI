import React, { useState } from 'react';
import { 
  UserCheck, 
  Download, 
  Search, 
  FileText, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  Building, 
  FolderArchive,
  ShieldCheck
} from 'lucide-react';
import type { ScreenId } from '../layout/Sidebar';

interface SurveyorPortalScreenProps {
  setActiveScreen: (screen: ScreenId) => void;
}

const SURVEYOR_PACKAGES = [
  { title: 'Full Policy & Endorsement Package', category: 'Insurance', size: '28 MB', itemsCount: 6 },
  { title: 'Fixed Asset Register & Bill of Quantities', category: 'Financials', size: '42 MB', itemsCount: 4 },
  { title: 'Monsoon Restoration Contractor Invoices', category: 'Invoices', size: '18 MB', itemsCount: 8 },
  { title: 'High-Res Incident Photos & Drone Footage (120FPS)', category: 'Media', size: '640 MB', itemsCount: 16 },
  { title: 'IMD Station Certified Weather & Rainfall Logs', category: 'Weather', size: '8.4 MB', itemsCount: 3 },
  { title: 'Pre-monsoon Maintenance Register & Inspection Logs', category: 'Operations', size: '24 MB', itemsCount: 5 },
  { title: 'Historical Flood Claims & Survey Reports (FY22-FY26)', category: 'Past Claims', size: '110 MB', size2: '12 Files' },
];

export const SurveyorPortalScreen: React.FC<SurveyorPortalScreenProps> = ({ setActiveScreen }) => {
  const [surveyorQuery, setSurveyorQuery] = useState('Show previous claims involving this bridge.');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleAskSurveyorAI = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryResult(
      'MAPLE AI identified 2 historical claims involving this structure (Sonipat Elevated Bridge / Pier P3):\n\n1. CLM-2026-00112 (NH-44 Bridge Scour, 5.72 Cr) - Survey Underway\n2. CLM-2023-00419 (NH-44 Abutment Protection, 1.45 Cr) - Settled FY24\n\nAll hydrological bathymetry logs and previous surveyor interim reports are indexed and ready for download below.'
    );
  };

  const handleSimulateDownload = (title: string) => {
    setDownloadSuccess(title);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>MODULE 4 • SURVEYOR ENGAGEMENT PORTAL</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">INDEPENDENT SURVEYOR PORTAL</h1>
          <p className="text-sm text-slate-400">"Instead of sending 100 emails — everything indexed and ready."</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-lg text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Surveyor Session: Apex Loss Assessors Ltd</span>
        </div>
      </div>

      {/* Surveyor AI Query Tool Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Bot className="w-4 h-4" />
          <span>Ask AI Assistant for Instant Site Query</span>
        </div>

        <form onSubmit={handleAskSurveyorAI} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={surveyorQuery}
              onChange={e => setSurveyorQuery(e.target.value)}
              placeholder="Ask AI: 'Show previous claims involving this bridge', 'Show rainfall logs', etc..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Search AI Index</span>
          </button>
        </form>

        {queryResult && (
          <div className="p-4 bg-slate-950 rounded-xl border border-blue-500/30 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
            <span className="font-bold text-amber-400 block mb-1">MAPLE AI SURVEYOR RESPONSE:</span>
            {queryResult}
          </div>
        )}
      </div>

      {/* Surveyor Download Packages List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Complete Loss Verification Package (Claim CLM-2026-00124 & CLM-2026-00112)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Zero Email Delays</span>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {SURVEYOR_PACKAGES.map((pkg, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-800/40 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{pkg.title}</div>
                  <div className="text-[10px] text-slate-400">{pkg.category} • File Size: {pkg.size}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Ready for Download
                </span>
                <button
                  onClick={() => handleSimulateDownload(pkg.title)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Zip</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 justify-center">
          <CheckCircle2 className="w-4 h-4" />
          <span>Downloaded package: "{downloadSuccess}"!</span>
        </div>
      )}
    </div>
  );
};
