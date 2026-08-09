import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Building2, 
  FileText,
  Sparkles
} from 'lucide-react';
import type { ReminderItem } from '../../types/claims';
import type { ScreenId } from '../layout/Sidebar';

interface ReminderEngineScreenProps {
  setActiveScreen: (screen: ScreenId) => void;
}

const MOCK_REMINDERS: ReminderItem[] = [
  {
    id: 'REM-01',
    claimId: 'CLM-2026-00124',
    targetRole: 'Surveyor',
    triggerReason: 'Survey report pending 12 days (M/s Apex Loss Assessors)',
    daysPending: 12,
    lastSentDate: '08 Jun 2026, 09:00 IST',
    status: 'Urgent'
  },
  {
    id: 'REM-02',
    claimId: 'CLM-2026-00112',
    targetRole: 'Insurer',
    triggerReason: 'Insurer ICICI Lombard not responding for 15 days on interim offer',
    daysPending: 15,
    lastSentDate: '01 Jun 2026, 11:30 IST',
    status: 'Urgent'
  },
  {
    id: 'REM-03',
    claimId: 'CLM-2026-00124',
    targetRole: 'Regional Office',
    triggerReason: 'IMD Weather report & station record missing from regional site office',
    daysPending: 8,
    lastSentDate: '05 Jun 2026, 14:00 IST',
    status: 'Pending'
  },
  {
    id: 'REM-04',
    claimId: 'CLM-2025-00981',
    targetRole: 'Contractor',
    triggerReason: 'Contractor slope restoration invoice & measurement book entry pending',
    daysPending: 18,
    lastSentDate: '28 May 2026, 10:15 IST',
    status: 'Urgent'
  },
  {
    id: 'REM-05',
    claimId: 'CLM-2026-00088',
    targetRole: 'Finance Team',
    triggerReason: 'Toll revenue interruption ledger extract review pending',
    daysPending: 6,
    lastSentDate: '03 Jun 2026, 16:45 IST',
    status: 'Pending'
  }
];

export const ReminderEngineScreen: React.FC<ReminderEngineScreenProps> = ({ setActiveScreen }) => {
  const [reminders, setReminders] = useState<ReminderItem[]>(MOCK_REMINDERS);
  const [sentAlertId, setSentAlertId] = useState<string | null>(null);

  const handleSendReminder = (id: string) => {
    setSentAlertId(id);
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'Sent', lastSentDate: 'Just now' } : r));
    setTimeout(() => setSentAlertId(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BellRing className="w-4 h-4" />
            <span>MODULE 6 • AUTOMATED AI REMINDER ENGINE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI REMINDER & FOLLOW-UP ENGINE</h1>
          <p className="text-sm text-slate-400">"Instead of humans following up — AI automatically dispatches targeted reminders."</p>
        </div>

        <button
          onClick={() => setReminders(prev => prev.map(r => ({ ...r, status: 'Sent', lastSentDate: 'Just now' })))}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs rounded-lg shadow-md flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Dispatch All Pending AI Reminders</span>
        </button>
      </div>

      {/* Target Role Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {['Surveyor', 'Insurer', 'Finance Team', 'Regional Office', 'Contractor', 'Claims Team'].map((role, idx) => (
          <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1 text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Role</span>
            <div className="font-bold text-white text-sm truncate">{role}</div>
            <span className="text-[10px] text-amber-400 font-semibold">Active Monitoring</span>
          </div>
        ))}
      </div>

      {/* Reminders Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Active Follow-up SLA Triggers ({reminders.length})
          </h2>
          <span className="text-xs text-emerald-400 font-semibold">Automated Email & WhatsApp Dispatch</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Claim ID</th>
                <th className="px-5 py-3.5">Target Stakeholder</th>
                <th className="px-5 py-3.5">Trigger Delay Reason</th>
                <th className="px-5 py-3.5">Days Pending</th>
                <th className="px-5 py-3.5">Last Dispatch</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {reminders.map((rem) => (
                <tr key={rem.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-white">{rem.claimId}</td>
                  <td className="px-5 py-4 font-semibold text-blue-400">{rem.targetRole}</td>
                  <td className="px-5 py-4 text-slate-200 max-w-xs">{rem.triggerReason}</td>
                  <td className="px-5 py-4 font-bold text-amber-400">{rem.daysPending} Days</td>
                  <td className="px-5 py-4 text-slate-400">{rem.lastSentDate}</td>
                  <td className="px-5 py-4 text-right">
                    {rem.status === 'Sent' ? (
                      <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reminder Sent</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendReminder(rem.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Now</span>
                      </button>
                    )}
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
