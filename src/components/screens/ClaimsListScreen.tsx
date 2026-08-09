import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, ChevronRight, ChevronLeft, ArrowUpDown } from 'lucide-react';
import type { Claim, ClaimStatus, SeverityLevel } from '../../types/claims';
import type { ScreenId } from '../layout/Sidebar';

interface ClaimsListScreenProps {
  claims: Claim[];
  onSelectClaim: (claimId: string) => void;
  setActiveScreen: (screen: ScreenId) => void;
  initialSearchQuery?: string;
}

export const ClaimsListScreen: React.FC<ClaimsListScreenProps> = ({ 
  claims, 
  onSelectClaim, 
  setActiveScreen,
  initialSearchQuery = '' 
}) => {
  const [search, setSearch] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [insurerFilter, setInsurerFilter] = useState<string>('All');
  const [highwayFilter, setHighwayFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'id' | 'reserve' | 'age' | 'status'>('id');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique filters
  const insurers = useMemo(() => ['All', ...Array.from(new Set(claims.map(c => c.insurer)))], [claims]);
  const highways = useMemo(() => ['All', ...Array.from(new Set(claims.map(c => c.highway)))], [claims]);
  const statuses = ['All', 'Survey Pending', 'Survey Underway', 'Under Review', 'Admitted', 'Settled'];
  const severities = ['All', 'Low', 'Medium', 'High', 'Critical'];

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchSearch = search === '' || 
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.highway.toLowerCase().includes(search.toLowerCase()) ||
        c.incidentType.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchInsurer = insurerFilter === 'All' || c.insurer === insurerFilter;
      const matchHighway = highwayFilter === 'All' || c.highway === highwayFilter;
      const matchSeverity = severityFilter === 'All' || c.severity === severityFilter;

      return matchSearch && matchStatus && matchInsurer && matchHighway && matchSeverity;
    }).sort((a, b) => {
      if (sortBy === 'reserve') return b.reserveAmountLakhs - a.reserveAmountLakhs;
      if (sortBy === 'age') return a.ageDays - b.ageDays;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return b.id.localeCompare(a.id);
    });
  }, [claims, search, statusFilter, insurerFilter, highwayFilter, severityFilter, sortBy]);

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage) || 1;
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClaims.slice(start, start + itemsPerPage);
  }, [filteredClaims, currentPage]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Claims Portfolio Registry</h1>
          <p className="text-sm text-slate-400">Search and filter active infrastructure loss claims</p>
        </div>

        <button
          onClick={() => setActiveScreen('incident-reporting')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-900/30 flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search Claim ID, Highway, Cause..."
              className="w-full bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="All">Status: All</option>
              {statuses.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Insurer Filter */}
          <div>
            <select
              value={insurerFilter}
              onChange={(e) => { setInsurerFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="All">Insurer: All</option>
              {insurers.filter(i => i !== 'All').map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Highway Filter */}
          <div>
            <select
              value={highwayFilter}
              onChange={(e) => { setHighwayFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300 px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="All">Highway: All</option>
              {highways.filter(h => h !== 'All').map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter & Sort */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-300">Showing {filteredClaims.length} Claims</span>
            <div className="flex items-center gap-2">
              <span>Severity:</span>
              <div className="flex gap-1">
                {severities.map(sev => (
                  <button
                    key={sev}
                    onClick={() => { setSeverityFilter(sev); setCurrentPage(1); }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      severityFilter === sev 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-2 py-1 rounded"
            >
              <option value="id">Claim ID</option>
              <option value="reserve">Reserve Value</option>
              <option value="age">Age (Days)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims Data Grid Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Claim ID</th>
                <th className="px-5 py-3.5">Highway</th>
                <th className="px-5 py-3.5">Incident Type</th>
                <th className="px-5 py-3.5">Initial Reserve</th>
                <th className="px-5 py-3.5">Insurer</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Age</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-sm">
                    No claims match your search criteria. Try adjusting the filters.
                  </td>
                </tr>
              ) : (
                paginatedClaims.map((claim) => (
                  <tr 
                    key={claim.id}
                    onClick={() => onSelectClaim(claim.id)}
                    className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      claim.id === 'CLM-2026-00124' ? 'bg-amber-950/20 border-l-4 border-l-amber-400' : ''
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-white flex items-center gap-2">
                      {claim.id === 'CLM-2026-00124' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          Demo Focus
                        </span>
                      )}
                      <span>{claim.id}</span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="font-semibold text-slate-200">{claim.code}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[170px]">{claim.highway}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-300 text-xs">
                      <div className="font-medium text-slate-200">{claim.incidentType}</div>
                      <div className="text-[11px] text-slate-500">Ch {claim.chainage}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-amber-400 text-xs">
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
                        <span>View Claim</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="font-semibold text-white">{currentPage}</span> of <span className="font-semibold text-white">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
