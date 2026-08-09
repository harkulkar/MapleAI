import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Folder, 
  FileText, 
  CheckCircle2, 
  Download, 
  Eye, 
  Sparkles, 
  Building, 
  FileCheck, 
  ShieldCheck, 
  Layers, 
  Wrench, 
  Activity,
  HardDrive
} from 'lucide-react';
import type { ScreenId } from '../layout/Sidebar';

interface KnowledgeRepositoryScreenProps {
  setActiveScreen: (screen: ScreenId) => void;
}

interface CategoryFolder {
  id: string;
  name: string;
  icon: any;
  docCount: number;
  color: string;
  items: Array<{
    title: string;
    sub: string;
    size: string;
    date: string;
    indexed: boolean;
  }>;
}

const KNOWLEDGE_CATEGORIES: CategoryFolder[] = [
  {
    id: 'corporate',
    name: 'Corporate',
    icon: Building,
    docCount: 14,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    items: [
      { title: 'Three Years Audited Financial Statements (FY23-FY25)', sub: 'Financial Records', size: '24.2 MB', date: '15 Jan 2026', indexed: true },
      { title: 'Board Resolution for Insurance Authorized Signatory', sub: 'Governance', size: '1.4 MB', date: '02 Feb 2026', indexed: true },
      { title: 'PAN, GSTIN & CIN Incorporation Certificates', sub: 'Taxation & Identity', size: '3.8 MB', date: '10 Nov 2025', indexed: true },
      { title: 'Maple Highways Organization Structure & Claims Matrix', sub: 'Corporate HR', size: '2.1 MB', date: '01 Mar 2026', indexed: true },
      { title: 'Authorized Signatory Specimen Sheet for Insurers', sub: 'Governance', size: '890 KB', date: '12 Jan 2026', indexed: true },
    ]
  },
  {
    id: 'legal',
    name: 'Legal & Concession',
    icon: FileCheck,
    docCount: 28,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    items: [
      { title: 'Concession Agreement - EPE Expressway (NHAI)', sub: 'Primary Agreement', size: '48.5 MB', date: '12 Aug 2020', indexed: true },
      { title: 'NHAI State Tri-partite & Escrow Agreement', sub: 'Concession Legal', size: '18.2 MB', date: '15 Sep 2020', indexed: true },
      { title: 'HAM & OMT Hybrid Annuity Operation Contracts', sub: 'Operation Contracts', size: '12.4 MB', date: '04 Oct 2021', indexed: true },
      { title: 'Independent Engineer (IE) Quarterly Inspection Audit', sub: 'Engineer Reports', size: '9.6 MB', date: '18 Apr 2026', indexed: true },
      { title: 'Commercial Operation Date (COD) Completion Certificate', sub: 'NHAI Approvals', size: '4.2 MB', date: '01 Nov 2021', indexed: true },
    ]
  },
  {
    id: 'insurance',
    name: 'Insurance & Policies',
    icon: ShieldCheck,
    docCount: 42,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    items: [
      { title: 'Industrial All Risk Policy (IAR-2025/MAPLE-088)', sub: 'Active Policy', size: '14.8 MB', date: '12 Jan 2026', indexed: true },
      { title: 'Policy Endorsements & Monsoon Peril Addendum', sub: 'Endorsements', size: '2.4 MB', date: '15 Feb 2026', indexed: true },
      { title: 'Proposal Form & Declared Asset Value Schedules', sub: 'Proposal Archive', size: '8.7 MB', date: '10 Jan 2026', indexed: true },
      { title: 'Historical Claims Settlement Register (FY21 - FY26)', sub: 'Claims History', size: '32.1 MB', date: '30 May 2026', indexed: true },
      { title: 'Independent Surveyor Reports Database (124 Survey Files)', sub: 'Survey Reports', size: '142 MB', date: '08 Jun 2026', indexed: true },
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Invoices',
    icon: HardDrive,
    docCount: 65,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    items: [
      { title: 'Fixed Asset Register (FAR) - Highway Civil Structures', sub: 'Asset Valuation', size: '38.4 MB', date: '31 Mar 2026', indexed: true },
      { title: 'Depreciation Register & CAPEX Expenditure Ledger', sub: 'Financial Records', size: '19.2 MB', date: '31 Mar 2026', indexed: true },
      { title: 'Contractor Purchase Orders & Restoration Invoices', sub: 'Procurement', size: '22.0 MB', date: '04 Jun 2026', indexed: true },
      { title: 'General Ledger Extract for Monsoon Maintenance', sub: 'Ledger Audit', size: '11.5 MB', date: '01 Jun 2026', indexed: true },
    ]
  },
  {
    id: 'technical',
    name: 'Technical & GIS',
    icon: Layers,
    docCount: 38,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    items: [
      { title: 'Road & Bridge Inventory Register (Ch 00+000 to 135+000)', sub: 'Asset Inventory', size: '54.0 MB', date: '10 Jan 2026', indexed: true },
      { title: 'As-Built CAD Structural Drawings & Culvert Layouts', sub: 'Engineering Design', size: '180 MB', date: '14 Mar 2022', indexed: true },
      { title: 'High-Resolution GIS Spatial Maps & LiDAR Survey Data', sub: 'GIS Topography', size: '420 MB', date: '11 Apr 2026', indexed: true },
      { title: 'Drone Aerial Survey Inspection Reports (Monsoon 2026)', sub: 'Drone Patrol', size: '210 MB', date: '07 Jun 2026', indexed: true },
    ]
  },
  {
    id: 'operations',
    name: 'Operations & Maintenance',
    icon: Wrench,
    docCount: 51,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    items: [
      { title: 'Pre-Monsoon Drainage Desilting & Maintenance Register', sub: 'Routine Maintenance', size: '16.4 MB', date: '28 May 2026', indexed: true },
      { title: 'Highway Highway Highway Highway Highway Patrol Logs', sub: 'Operations', size: '8.2 MB', date: '08 Jun 2026', indexed: true },
      { title: 'IMD Station Certified Weather & Rainfall Logs', sub: 'Weather Archive', size: '5.1 MB', date: '08 Jun 2026', indexed: true },
      { title: 'Daily Progress Reports (DPR) & Site Logs', sub: 'Daily Log', size: '14.0 MB', date: '08 Jun 2026', indexed: true },
    ]
  }
];

export const KnowledgeRepositoryScreen: React.FC<KnowledgeRepositoryScreenProps> = ({ setActiveScreen }) => {
  const [activeCategory, setActiveCategory] = useState<string>('corporate');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const selectedCategory = KNOWLEDGE_CATEGORIES.find(c => c.id === activeCategory) || KNOWLEDGE_CATEGORIES[0];

  const filteredDocs = selectedCategory.items.filter(item => 
    searchQuery === '' || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sub.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Screen Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>MODULE 3 • THE BIGGEST DIFFERENTIATOR</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI KNOWLEDGE REPOSITORY</h1>
          <p className="text-sm text-slate-400">"Upload once. Use forever." Centralized enterprise AI indexed document vault.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveScreen('copilot')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-900/30 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Query Repository via AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Global AI Semantic Search Input Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all Corporate, Legal, Insurance, Financial, Technical & Operational contracts..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400">238 Enterprise Documents AI-Indexed & Vectorized</span>
          </div>
          <span>Semantic OCR + Text Parsing Active</span>
        </div>
      </div>

      {/* 6 Category Folders Grid Header */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {KNOWLEDGE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-xl border transition-all text-left space-y-2 ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-bold border border-slate-800 text-slate-300">
                  {cat.docCount}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 truncate">{cat.name}</div>
                <div className="text-[10px] text-slate-500">Vault Category</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Document Tree Listing Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              {selectedCategory.name} Vault ({filteredDocs.length} Indexed Documents)
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AI Ready for Instant Retrieval</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Document Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">File Size</th>
                <th className="px-5 py-3.5">Indexed Date</th>
                <th className="px-5 py-3.5">AI Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.map((doc, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-white flex items-center gap-3 text-xs">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-slate-100 font-semibold">{doc.title}</div>
                      <div className="text-[10px] text-slate-500">{doc.sub}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{selectedCategory.name}</td>
                  <td className="px-5 py-4 text-slate-400 text-xs font-mono">{doc.size}</td>
                  <td className="px-5 py-4 text-slate-400 text-xs">{doc.date}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Vector Indexed</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Document AI Index View</span>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="font-bold text-white text-base">{previewDoc.title}</div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-slate-300 font-mono text-[11px]">
                <p>✓ OCR text extraction complete (100% confidence)</p>
                <p>✓ Entity extraction: Maple Highways Ltd, NHAI Clause 14.2, Industrial All Risk Policy</p>
                <p>✓ Embeddings generated in Knowledge Vector Store</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
