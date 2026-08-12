import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Mail, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  Copy, 
  Check, 
  Send, 
  ShieldAlert,
  FileCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import type { Claim } from '../../types/claims';
import { generateSurveyorEmail, generateInsurerEmail } from '../../services/aiService';
import type { ScreenId } from '../layout/Sidebar';

interface AIClaimAdvisorScreenProps {
  claim: Claim;
  setActiveScreen: (screen: ScreenId) => void;
}

const AI_CHECK_ITEMS = [
  'Industrial All Risk Policy Wording',
  'Monsoon Peril Endorsements (Addendum 04)',
  'Policy Deductible Schedule (25L Threshold)',
  'Exclusions Clause 18 (Pre-existing Wear)',
  'Historical Database of 124 Road Claims',
  'NHAI Concession Agreement (Clause 14.2)',
  'Independent Surveyor Interim Reports',
  'IMD Weather & Rainfall Station Logs',
  'Field Engineer Site Incident Captures'
];

const EXTENDED_OBJECTIONS = [
  'Need IMD Rainfall Station Data Confirmation',
  'Need Pre-monsoon Drainage Maintenance Logs',
  'Need Pre-loss Photographs Before Repair Start',
  'Need Police FIR Copy (if third-party impact)',
  'Need IMD Certified Weather Intensity Report',
  'Need Contractor Work & Material Invoice',
  'Need Site Daily Progress Report (DPR)',
  'Need Site Measurement Book (MB Entry)'
];

export const AIClaimAdvisorScreen: React.FC<AIClaimAdvisorScreenProps> = ({ claim, setActiveScreen }) => {
  const [emailModalType, setEmailModalType] = useState<'surveyor' | 'insurer' | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const handleOpenEmailModal = (type: 'surveyor' | 'insurer') => {
    setEmailModalType(type);
    setCopied(false);
    setSentSuccess(false);

    if (type === 'surveyor') {
      const draft = generateSurveyorEmail(claim);
      setEmailSubject(draft.subject);
      setEmailBody(draft.body);
    } else {
      const draft = generateInsurerEmail(claim);
      setEmailSubject(draft.subject);
      setEmailBody(draft.body);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    setSentSuccess(true);
    setTimeout(() => {
      setEmailModalType(null);
      setSentSuccess(false);
    }, 1500);
  };

  const handleReanalyze = () => {
    setIsReanalyzing(true);
    setTimeout(() => {
      setIsReanalyzing(false);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Screen Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>MODULE 2 • THE BRAIN</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI CLAIM ADVISOR</h1>
          <p className="text-sm text-slate-400">Automated legal, policy, deductible & evidence parsing engine for {claim.id}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isReanalyzing ? 'Reanalyzing...' : 'REANALYZE CLAIM'}</span>
          </button>
          <button
            onClick={() => setActiveScreen('copilot')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-900/30 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask Copilot about this Claim</span>
          </button>
        </div>
      </div>

      {/* AI Cross-Checking Matrix Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>AI Automated Verification Matrix ("Instead of humans remembering policy clauses")</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">9 Sources Parsed</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-[10px]">
          {AI_CHECK_ITEMS.map((item, idx) => (
            <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 truncate text-center font-medium">
              ✓ {item}
            </div>
          ))}
        </div>
      </div>

      {/* Primary Strategic Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-1 border-l-4 border-l-emerald-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PROBABILITY OF CLAIM ADMISSION</span>
          <div className="text-3xl font-black text-emerald-400">93%</div>
          <span className="text-[11px] text-slate-500">High admission confidence score</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-1 border-l-4 border-l-blue-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">LIKELY COVERAGE</span>
          <div className="text-sm font-bold text-white leading-tight">Material damage arising from flood/rainfall event</div>
          <span className="text-[11px] text-blue-400">Industrial All Risk Policy</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-1 border-l-4 border-l-amber-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">LIKELY DEDUCTIBLE</span>
          <div className="text-3xl font-black text-amber-400">25 Lakhs</div>
          <span className="text-[11px] text-slate-500">Policy excess threshold</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-1 border-l-4 border-l-purple-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">COVERAGE CONFIDENCE</span>
          <div className="text-3xl font-black text-purple-400">92%</div>
          <span className="text-[11px] text-slate-500">Based on loss vector parsing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Extended Objections & Missing Evidence (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>POSSIBLE INSURER OBJECTIONS & DOCUMENT AUDIT (8 CHECKS)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {EXTENDED_OBJECTIONS.map((obj, idx) => (
                <div key={idx} className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-2 text-amber-200 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>⚠ {obj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Actionable Recommendation & Email triggers (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 border-t-4 border-t-blue-500">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>AI STRATEGIC RECOMMENDATION</span>
            </h3>

            <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-xl text-sm text-blue-100 font-medium leading-relaxed">
              "Submit rainfall evidence and maintenance records before the surveyor's assessment to eliminate potential objections and secure initial reserve admission."
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleOpenEmailModal('surveyor')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Mail className="w-4 h-4 text-amber-300" />
                <span>GENERATE EMAIL TO SURVEYOR</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEmailModal('insurer')}
                className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-800 flex items-center justify-center gap-2 transition-all"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>GENERATE EMAIL TO INSURER</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Correspondence Generator Modal */}
      {emailModalType && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm uppercase tracking-wider">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>AI Generated Email to {emailModalType === 'surveyor' ? 'Deputed Surveyor' : 'Insurer'}</span>
              </div>
              <button
                onClick={() => setEmailModalType(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-semibold focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Correspondence Body</label>
                <textarea
                  rows={12}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs leading-relaxed focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
              <button
                onClick={handleCopyEmail}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Email Text'}</span>
              </button>

              <button
                onClick={handleSendEmail}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{sentSuccess ? 'Correspondence Sent!' : 'Send Email Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
