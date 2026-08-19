import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle2,
  FileWarning,
  FileText,
  X,
  Upload,
} from 'lucide-react';
import {
  REAL_CLAIMS,
  UNIQUE_BROKERS,
  UNIQUE_ENTITIES,
  UNIQUE_ASSET_CATEGORIES,
  UNIQUE_NATURES,
  ALL_STATUSES,
} from '../../data/realClaims';
import type { RealClaim, RealClaimStatus, RealBroker, RealEntity } from '../../data/realClaims';
import type { ScreenId } from '../layout/Sidebar';
import type { UserRole } from '../../types/portal';

interface ClaimsListScreenProps {
  claims: unknown[];
  onSelectClaim: (claimId: string) => void;
  setActiveScreen: (screen: ScreenId) => void;
  initialSearchQuery?: string;
  role?: UserRole;
}

const STATUS_COLORS: Record<string, string> = {
  'Settled': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Open - Documents Pending': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Open - For Settlement': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Open - Consent/Approval Awaited': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Open - Assessment Pending': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Open - With Insured': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Open - With Insurer': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'Open - Other': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  'Open - Payment Process': 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  'Open - Intimated': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'Closed - No Pay': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Closed - Below Excess': 'bg-red-400/15 text-red-300 border-red-400/30',
  'Withdrawn': 'bg-slate-700/40 text-slate-500 border-slate-600/30',
};

const BROKER_COLORS: Record<string, string> = {
  'Marsh': 'text-blue-400',
  'Gallagher': 'text-amber-400',
  'WTW': 'text-purple-400',
  'Alliance': 'text-emerald-400',
};

const fmtInr = (v: number | null) => {
  if (v === null) return '-';
  if (v >= 100000) return `${(v / 100000).toFixed(2)} L`;
  return `${v.toLocaleString('en-IN')}`;
};

const ITEMS_PER_PAGE = 15;

const DEFAULT_PENDING_DOCS: Record<string, string[]> = {
  'Theft / Burglary': [
    'Police FIR / intimation',
    'CCTV footage of the incident',
    'Purchase invoice of stolen / damaged equipment',
    'Claim form duly signed and stamped',
    'Claim bill with repair / replacement invoices',
    'Salvage quotations (minimum 3, if applicable)',
  ],
  'Fire': [
    'Fire brigade inspection report',
    'Incident photographs / videography',
    'Fixed Asset Register extract',
    'Claim form duly signed and stamped',
    'Repair invoices with payment proof',
    'Salvage offer (if any)',
  ],
  'Accidental / Vehicle Hit': [
    'Police FIR / intimation',
    'Incident photographs as on date of loss',
    'Repair quotation and invoices with payment proof',
    'Claim form and claim bill',
    'Reinstatement work photos',
  ],
  'AOG / Storm': [
    'Meteorological / IMD report',
    'Incident photographs / videography',
    'Claim form duly signed and stamped',
    'Repair invoices with payment proof',
    'O&M concession agreement copy',
  ],
};

function parsePendingDocuments(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const text = raw.replace(/\s+/g, ' ').trim();
  if (!text) return [];

  if (/\d+\.\s/.test(text)) {
    return text
      .split(/\s*(?:\d+\.\s+)/)
      .map((item) => item.trim().replace(/[.;]+$/, ''))
      .filter((item) => item.length > 2);
  }

  if (text.includes('•')) {
    return text
      .split('•')
      .map((item) => item.trim().replace(/[.;]+$/, ''))
      .filter((item) => item.length > 2);
  }

  return [text];
}

type ClaimUpload = {
  id: string;
  name: string;
  size: number;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getPendingDocuments(claim: RealClaim): string[] {
  const parsed = parsePendingDocuments(claim.documentsPending);
  if (parsed.length > 0) return parsed;
  return DEFAULT_PENDING_DOCS[claim.natureOfLoss] ?? [
    'Claim form duly filled and signed',
    'Claim bill on insured letterhead',
    'Repair / reinstatement invoices with payment proof',
    'Incident photographs',
    'KYC documents (PAN, GST, cancelled cheque)',
  ];
}

export const ClaimsListScreen: React.FC<ClaimsListScreenProps> = ({
  setActiveScreen,
  initialSearchQuery = '',
  role = 'claims-manager',
}) => {
  const [search, setSearch] = useState(initialSearchQuery);
  const [brokerFilter, setBrokerFilter] = useState<string>('All');
  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [assetFilter, setAssetFilter] = useState<string>('All');
  const [natureFilter, setNatureFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'id' | 'claimAmt' | 'netSettled' | 'tat' | 'status'>('id');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDocsClaimId, setOpenDocsClaimId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [uploadsByClaim, setUploadsByClaim] = useState<Record<string, ClaimUpload[]>>({});
  const [openUploadClaimId, setOpenUploadClaimId] = useState<string | null>(null);
  const [uploadPos, setUploadPos] = useState<{ top: number; left: number } | null>(null);
  const uploadPanelRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTargetClaimId = useRef<string | null>(null);

  const filtered = useMemo(() => {
    return REAL_CLAIMS.filter((c: RealClaim) => {
      const q = search.toLowerCase();
      const matchSearch =
        q === '' ||
        c.id.toLowerCase().includes(q) ||
        c.assetCategory.toLowerCase().includes(q) ||
        c.natureOfLoss.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.surveyor?.toLowerCase().includes(q) ||
        c.insurer.toLowerCase().includes(q);
      const matchBroker = brokerFilter === 'All' || c.broker === brokerFilter;
      const matchEntity = entityFilter === 'All' || c.entity === entityFilter;
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchAsset = assetFilter === 'All' || c.assetCategory === assetFilter;
      const matchNature = natureFilter === 'All' || c.natureOfLoss === natureFilter;
      return matchSearch && matchBroker && matchEntity && matchStatus && matchAsset && matchNature;
    }).sort((a, b) => {
      if (sortBy === 'claimAmt') return (b.claimAmtInr ?? 0) - (a.claimAmtInr ?? 0);
      if (sortBy === 'netSettled') return (b.netSettledInr ?? 0) - (a.netSettledInr ?? 0);
      if (sortBy === 'tat') return (b.settlementTATDays ?? 9999) - (a.settlementTATDays ?? 9999);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return b.id.localeCompare(a.id);
    });
  }, [search, brokerFilter, entityFilter, statusFilter, assetFilter, natureFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Summary stats for filtered set
  const stats = useMemo(() => {
    const settled = filtered.filter(c => c.status === 'Settled');
    const totalClaimed = filtered.reduce((s, c) => s + (c.claimAmtInr ?? 0), 0);
    const totalSettled = settled.reduce((s, c) => s + (c.netSettledInr ?? 0), 0);
    const avgTAT = settled.length
      ? Math.round(settled.reduce((s, c) => s + (c.settlementTATDays ?? 0), 0) / settled.length)
      : 0;
    return { total: filtered.length, settled: settled.length, totalClaimed, totalSettled, avgTAT };
  }, [filtered]);

  const hasActiveFilters = brokerFilter !== 'All' || entityFilter !== 'All' || statusFilter !== 'All' || assetFilter !== 'All' || natureFilter !== 'All' || search !== '';

  useEffect(() => {
    setOpenDocsClaimId(null);
    setDropdownPos(null);
    setOpenUploadClaimId(null);
    setUploadPos(null);
  }, [currentPage, search, brokerFilter, entityFilter, statusFilter, assetFilter, natureFilter, sortBy]);

  useEffect(() => {
    if (!openDocsClaimId && !openUploadClaimId) return;

    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      if (uploadPanelRef.current && uploadPanelRef.current.contains(target)) return;
      setOpenDocsClaimId(null);
      setDropdownPos(null);
      setOpenUploadClaimId(null);
      setUploadPos(null);
    };
    const closeOnScroll = () => {
      setOpenDocsClaimId(null);
      setDropdownPos(null);
      setOpenUploadClaimId(null);
      setUploadPos(null);
    };

    document.addEventListener('click', close);
    window.addEventListener('scroll', closeOnScroll, true);
    return () => {
      document.removeEventListener('click', close);
      window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [openDocsClaimId, openUploadClaimId]);

  const clearFilters = () => {
    setBrokerFilter('All');
    setEntityFilter('All');
    setStatusFilter('All');
    setAssetFilter('All');
    setNatureFilter('All');
    setSearch('');
    setCurrentPage(1);
  };

  const openUploadPanel = (claimId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpenDocsClaimId(null);
    setDropdownPos(null);
    if (openUploadClaimId === claimId) {
      setOpenUploadClaimId(null);
      setUploadPos(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const width = 340;
    const left = Math.min(rect.left, window.innerWidth - width - 16);
    setUploadPos({ top: rect.bottom + 8, left: Math.max(12, left) });
    setOpenUploadClaimId(claimId);
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const claimId = uploadTargetClaimId.current;
    const files = event.target.files;
    if (!claimId || !files?.length) return;

    const nextFiles: ClaimUpload[] = Array.from(files).map((file) => ({
      id: `${claimId}-${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
    }));

    setUploadsByClaim((prev) => {
      const existing = prev[claimId] ?? [];
      const merged = [...existing];
      for (const file of nextFiles) {
        if (!merged.some((item) => item.name === file.name && item.size === file.size)) {
          merged.push(file);
        }
      }
      return { ...prev, [claimId]: merged };
    });
    event.target.value = '';
  };

  const removeUploadedFile = (claimId: string, fileId: string) => {
    setUploadsByClaim((prev) => ({
      ...prev,
      [claimId]: (prev[claimId] ?? []).filter((file) => file.id !== fileId),
    }));
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            MODULE 9 · CLAIMS PORTFOLIO REGISTRY
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Claims Portfolio Registry</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            581 claims · Alliance / Gallagher / Marsh / WTW · NCR-EPE & SJEPL
          </p>
        </div>
        {role !== 'surveyor' && (
          <button
            onClick={() => setActiveScreen('incident-reporting')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Report New Incident
          </button>
        )}
      </div>

      {/* Live Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle2, label: 'Showing', value: stats.total, sub: `${stats.settled} settled`, color: 'text-white', iconColor: 'text-blue-400' },
          { icon: IndianRupee, label: 'Total Claimed', value: fmtInr(stats.totalClaimed), sub: 'reported amounts', color: 'text-amber-400', iconColor: 'text-amber-400' },
          { icon: TrendingUp, label: 'Net Settled', value: fmtInr(stats.totalSettled), sub: `${stats.settled} claims paid`, color: 'text-green-400', iconColor: 'text-green-400' },
          { icon: Clock, label: 'Avg TAT', value: stats.avgTAT ? `${stats.avgTAT}d` : '-', sub: 'settled claims only', color: 'text-purple-400', iconColor: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, sub, color, iconColor }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
            <div>
              <p className="text-slate-400 text-xs">{label}</p>
              <p className={`text-lg font-black ${color}`}>{value}</p>
              <p className="text-slate-600 text-xs">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        {/* Search + clear */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by Claim ID, Asset, Nature of Loss, Location, Surveyor…"
              className="w-full bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: 'Broker', value: brokerFilter, setter: setBrokerFilter, options: ['All', ...UNIQUE_BROKERS] },
            { label: 'Entity', value: entityFilter, setter: setEntityFilter, options: ['All', ...UNIQUE_ENTITIES] },
            { label: 'Status', value: statusFilter, setter: setStatusFilter, options: ['All', ...ALL_STATUSES] },
            { label: 'Asset', value: assetFilter, setter: setAssetFilter, options: ['All', ...UNIQUE_ASSET_CATEGORIES] },
            { label: 'Nature', value: natureFilter, setter: setNatureFilter, options: ['All', ...UNIQUE_NATURES] },
          ].map(({ label, value, setter, options }) => (
            <select
              key={label}
              value={value}
              onChange={(e) => { setter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-2 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="All">{label}: All</option>
              {options.filter(o => o !== 'All').map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ))}
        </div>

        {/* Sort row */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-2">
          <span>
            <span className="text-white font-bold">{stats.total}</span> claims match ·{' '}
            <span className="text-green-400 font-bold">{stats.settled}</span> settled
            {hasActiveFilters && <span className="text-amber-400 ml-2">· Filtered</span>}
          </span>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-2 py-1 rounded"
            >
              <option value="id">Claim ID</option>
              <option value="claimAmt">Claim Amount ↓</option>
              <option value="netSettled">Net Settled ↓</option>
              <option value="tat">Settlement TAT ↓</option>
              <option value="status">Status A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Claim ID</th>
                <th className="px-4 py-3">Broker / Entity</th>
                <th className="px-4 py-3">Asset Category</th>
                <th className="px-4 py-3">Nature of Loss</th>
                <th className="px-4 py-3">Insurer</th>
                <th className="px-4 py-3 text-right">Claim Amt</th>
                <th className="px-4 py-3 text-right">Net Settled</th>
                <th className="px-4 py-3 text-center">TAT</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Upload Document</th>
                <th className="px-4 py-3">Surveyor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center">
                    <FileWarning className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No claims match your filters. Try adjusting the search.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((claim) => (
                  <tr
                    key={claim.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-default"
                  >
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold text-xs ${BROKER_COLORS[claim.broker]}`}>
                        {claim.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-xs font-bold ${BROKER_COLORS[claim.broker]}`}>{claim.broker}</div>
                      <div className="text-[11px] text-slate-500">{claim.entity}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-200 font-medium">{claim.assetCategory}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{claim.location ?? '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{claim.natureOfLoss}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{claim.insurer}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-bold text-amber-400">{fmtInr(claim.claimAmtInr)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-bold ${claim.netSettledInr ? 'text-green-400' : 'text-slate-600'}`}>
                        {fmtInr(claim.netSettledInr)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {claim.settlementTATDays ? (
                        <span className={`text-xs font-semibold ${claim.settlementTATDays > 200 ? 'text-amber-400' : 'text-slate-300'}`}>
                          {claim.settlementTATDays}d
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {claim.status === 'Open - Documents Pending' ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (openDocsClaimId === claim.id) {
                              setOpenDocsClaimId(null);
                              setDropdownPos(null);
                              return;
                            }
                            const rect = event.currentTarget.getBoundingClientRect();
                            const width = 340;
                            const left = Math.min(rect.left, window.innerWidth - width - 16);
                            setDropdownPos({ top: rect.bottom + 8, left: Math.max(12, left) });
                            setOpenDocsClaimId(claim.id);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer hover:ring-2 hover:ring-amber-400/40 transition-all ${STATUS_COLORS[claim.status]}`}
                        >
                          {claim.status.replace('Open - ', '')}
                          <ChevronDown className={`w-3 h-3 transition-transform ${openDocsClaimId === claim.id ? 'rotate-180' : ''}`} />
                        </button>
                      ) : (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[claim.status] ?? 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                          {claim.status.replace('Open - ', '').replace('Closed - ', 'Closed·')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const count = uploadsByClaim[claim.id]?.length ?? 0;
                        return (
                          <button
                            type="button"
                            onClick={(event) => openUploadPanel(claim.id, event)}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              count > 0
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/50'
                                : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-blue-500/50 hover:text-white'
                            }`}
                          >
                            <Upload className={`w-3.5 h-3.5 ${count > 0 ? 'text-emerald-400' : 'text-blue-400'}`} />
                            {count > 0 ? `${count} file${count === 1 ? '' : 's'}` : 'Upload'}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">{claim.surveyor ?? '-'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page <span className="font-bold text-white">{currentPage}</span> of{' '}
            <span className="font-bold text-white">{totalPages}</span>
            {' '}· {ITEMS_PER_PAGE} per page · {stats.total} total
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-800 text-xs"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              const page = start + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 border-blue-600 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-800 text-xs"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_COLORS).slice(0, 8).map(([status, cls]) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status as RealClaimStatus); setCurrentPage(1); }}
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all hover:opacity-80 ${cls} ${statusFilter === status ? 'ring-2 ring-white/20' : ''}`}
          >
            {status.replace('Open - ', '').replace('Closed - ', 'Closed·')}
          </button>
        ))}
        <button
          onClick={() => setStatusFilter('All')}
          className="px-2 py-0.5 rounded-full text-[11px] font-semibold border border-slate-700 text-slate-400 hover:bg-slate-800"
        >
          Show All
        </button>
      </div>

      {openDocsClaimId && dropdownPos && (() => {
        const openClaim = paginated.find((c) => c.id === openDocsClaimId);
        if (!openClaim) return null;
        const docs = getPendingDocuments(openClaim);
        return (
          <div
            ref={dropdownRef}
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            className="fixed z-50 w-[340px] max-h-80 overflow-y-auto rounded-xl border border-amber-500/30 bg-slate-900 shadow-2xl shadow-black/50"
          >
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-800 bg-slate-900 px-3 py-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending documents</p>
                <p className="text-xs font-semibold text-white">{openClaim.id}</p>
                <p className="text-[11px] text-slate-500">{docs.length} item{docs.length === 1 ? '' : 's'} outstanding</p>
              </div>
              <button
                type="button"
                onClick={() => { setOpenDocsClaimId(null); setDropdownPos(null); }}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close pending documents"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <ul className="divide-y divide-slate-800/70 p-1">
              {docs.map((doc, index) => (
                <li key={`${openClaim.id}-doc-${index}`} className="flex items-start gap-2 px-2.5 py-2">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span className="text-[11px] leading-relaxed text-slate-200">{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {openUploadClaimId && uploadPos && (() => {
        const openClaim = paginated.find((c) => c.id === openUploadClaimId);
        if (!openClaim) return null;
        const files = uploadsByClaim[openClaim.id] ?? [];
        return (
          <div
            ref={uploadPanelRef}
            style={{ top: uploadPos.top, left: uploadPos.left }}
            className="fixed z-50 w-[340px] max-h-80 overflow-y-auto rounded-xl border border-blue-500/30 bg-slate-900 shadow-2xl shadow-black/50"
          >
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-800 bg-slate-900 px-3 py-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Upload document</p>
                <p className="text-xs font-semibold text-white">{openClaim.id}</p>
                <p className="text-[11px] text-slate-500">
                  {files.length} file{files.length === 1 ? '' : 's'} attached
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setOpenUploadClaimId(null); setUploadPos(null); }}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close upload documents"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3 space-y-3">
              <button
                type="button"
                onClick={() => {
                  uploadTargetClaimId.current = openClaim.id;
                  fileInputRef.current?.click();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                Choose files
              </button>
              {files.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-2">No documents uploaded yet.</p>
              ) : (
                <ul className="divide-y divide-slate-800/70 rounded-lg border border-slate-800 overflow-hidden">
                  {files.map((file) => (
                    <li key={file.id} className="flex items-start gap-2 px-2.5 py-2 bg-slate-950/60">
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] leading-relaxed text-slate-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUploadedFile(openClaim.id, file.id)}
                        className="rounded p-0.5 text-slate-500 hover:text-red-300 hover:bg-slate-800"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })()}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.csv"
        onChange={handleFilesSelected}
      />
    </div>
  );
};

export default ClaimsListScreen;
