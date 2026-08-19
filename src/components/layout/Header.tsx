import React, { useState } from 'react';
import { Search, Bell, Sparkles, Building2, UserCheck } from 'lucide-react';
import type { ScreenId } from './Sidebar';
import type { UserRole } from '../../types/portal';

interface HeaderProps {
  setActiveScreen: (screen: ScreenId) => void;
  onSearchQuery?: (query: string) => void;
  role: UserRole;
}

export const Header: React.FC<HeaderProps> = ({ setActiveScreen, onSearchQuery, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isSurveyor = role === 'surveyor';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery && searchTerm.trim()) {
      onSearchQuery(searchTerm);
      setActiveScreen('claims');
    }
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Global Search */}
      <form onSubmit={handleSearch} className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search claims by ID, highway, or incident type..."
          className="w-full bg-slate-900/90 text-sm text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </form>

      {/* Right Header Actions */}
      <div className="flex items-center gap-4">
        {!isSurveyor && (
          <>
            <button
              onClick={() => setActiveScreen('incident-reporting')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Report Incident</span>
            </button>

            <button
              onClick={() => setActiveScreen('copilot')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/80 flex items-center gap-2 transition-all"
            >
              <span>Ask AI Copilot</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-800 mx-1" />
          </>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">Maple Highways</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-white">
                {isSurveyor ? 'Surveyor' : 'Claims Manager'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
