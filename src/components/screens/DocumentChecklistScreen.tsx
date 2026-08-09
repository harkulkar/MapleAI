import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Flame, 
  CloudRain, 
  Mountain, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  Sparkles 
} from 'lucide-react';
import type { ScreenId } from '../layout/Sidebar';

interface DocumentChecklistScreenProps {
  setActiveScreen: (screen: ScreenId) => void;
}

type PerilType = 'flood' | 'fire' | 'landslide' | 'collision';

const CHECKLIST_TEMPLATES: Record<PerilType, { label: string; icon: any; items: Array<{ name: string; status: 'Available' | 'Pending' | 'Missing' | 'Uploaded'; required: boolean }> }> = {
  flood: {
    label: 'Flood & Heavy Rainfall Claim',
    icon: CloudRain,
    items: [
      { name: 'Industrial All Risk Policy Document', status: 'Available', required: true },
      { name: 'Field Engineer Incident Report & Photos', status: 'Available', required: true },
      { name: 'IMD Station Certified Weather & Rainfall Logs', status: 'Missing', required: true },
      { name: 'Pre-monsoon Maintenance Register', status: 'Missing', required: true },
      { name: 'Pre-Loss Inspection Photographs (Q1 Archive)', status: 'Pending', required: false },
      { name: 'Site Measurement Book (MB Entry)', status: 'Missing', required: true },
      { name: 'Restoration Contractor Estimate & Invoices', status: 'Uploaded', required: true },
      { name: 'Independent Surveyor Deputation Notice', status: 'Available', required: true }
    ]
  },
  fire: {
    label: 'Fire & Explosion Claim',
    icon: Flame,
    items: [
      { name: 'Property & Fire Policy Document', status: 'Available', required: true },
      { name: 'Official Claim Form Executed', status: 'Available', required: true },
      { name: 'Loss Estimate & BOQ Schedule', status: 'Available', required: true },
      { name: 'High-Res Loss Scene Photographs', status: 'Uploaded', required: true },
      { name: 'Fire Brigade Official Inspection Report', status: 'Missing', required: true },
      { name: 'Electrical Safety Inspector Audit', status: 'Pending', required: true },
      { name: 'Fixed Asset Register (FAR Extract)', status: 'Available', required: true },
      { name: 'Original Purchase Invoice & Equipment Vouchers', status: 'Pending', required: false },
      { name: 'Stock Register & Inventory Valuation Sheet', status: 'Missing', required: true },
      { name: 'Surveyor Appointment Intimation', status: 'Available', required: true }
    ]
  },
  landslide: {
    label: 'Hill Slope Landslide & Rockfall',
    icon: Mountain,
    items: [
      { name: 'Hill Slope Concession Policy', status: 'Available', required: true },
      { name: 'Geo-technical Slope Failure Survey', status: 'Missing', required: true },
      { name: 'Catch Netting & Rock Bolt Invoices', status: 'Uploaded', required: true },
      { name: 'Routine Patrol Inspection Register', status: 'Available', required: true },
      { name: 'Contractor Emergency Clearing Estimate', status: 'Pending', required: true }
    ]
  },
  collision: {
    label: 'Vehicle Collision & Toll Impact',
    icon: Car,
    items: [
      { name: 'Toll Barrier Property Policy', status: 'Available', required: true },
      { name: 'Police FIR Copy (Third Party Collison)', status: 'Missing', required: true },
      { name: 'CCTV Video Footage of Barrier Impact', status: 'Uploaded', required: true },
      { name: 'WIM & Toll Sensor Repair Estimate', status: 'Available', required: true }
    ]
  }
};

export const DocumentChecklistScreen: React.FC<DocumentChecklistScreenProps> = ({ setActiveScreen }) => {
  const [selectedPeril, setSelectedPeril] = useState<PerilType>('flood');

  const activeChecklist = CHECKLIST_TEMPLATES[selectedPeril];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Screen Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ClipboardCheck className="w-4 h-4" />
            <span>MODULE 5 • AUTOMATED DOCUMENT CHECKLIST ENGINE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI DOCUMENT CHECKLIST GENERATOR</h1>
          <p className="text-sm text-slate-400">Dynamic peril-based evidence compliance matrix for fast survey admission.</p>
        </div>

        <button
          onClick={() => setActiveScreen('ai-advisor')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Launch AI Claim Advisor</span>
        </button>
      </div>

      {/* Peril Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(CHECKLIST_TEMPLATES) as PerilType[]).map((perilKey) => {
          const peril = CHECKLIST_TEMPLATES[perilKey];
          const Icon = peril.icon;
          const isSelected = selectedPeril === perilKey;
          return (
            <button
              key={perilKey}
              onClick={() => setSelectedPeril(perilKey)}
              className={`p-4 rounded-xl border transition-all text-left flex items-center gap-3 ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-6 h-6 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-bold uppercase">{perilKey} Peril</div>
                <div className="text-[10px] text-slate-400">{peril.items.length} Required Docs</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Checklist Table Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {activeChecklist.label} Evidence Checklist
          </h2>
          <span className="text-xs text-amber-400 font-semibold">AI Automated Peril Parsing</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Required Document Title</th>
                <th className="px-5 py-3.5">Survey Requirement</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Upload / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {activeChecklist.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-white flex items-center gap-2">
                    <span className="text-slate-500 font-mono">{idx + 1}.</span>
                    <span>{item.name}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {item.required ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      item.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      item.status === 'Uploaded' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      item.status === 'Pending' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.status === 'Available' && <CheckCircle2 className="w-3 h-3" />}
                      {item.status === 'Uploaded' && <Upload className="w-3 h-3" />}
                      {item.status === 'Pending' && <Clock className="w-3 h-3" />}
                      {item.status === 'Missing' && <AlertTriangle className="w-3 h-3" />}
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-semibold text-slate-300">
                      Upload Document
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
