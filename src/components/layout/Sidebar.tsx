import React from 'react';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  MessageSquare,
  Database,
  UserCheck,
  BellRing,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export type ScreenId =
  | 'login'
  | 'dashboard'
  | 'claims'
  | 'incident-reporting'
  | 'claim-details'
  | 'ai-advisor'
  | 'knowledge-repo'
  | 'surveyor-portal'
  | 'document-checklist'
  | 'reminder-engine'
  | 'ml-predictive'
  | 'copilot';

interface SidebarProps {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, setActiveScreen }) => {
  const coreModules = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'claims', label: 'Claims Portfolio', icon: FileText, badge: '47' },
    { id: 'incident-reporting', label: 'Incident Intake', icon: AlertTriangle, hero: true },
    { id: 'knowledge-repo', label: 'Knowledge Bank', icon: Database, highlight: true },
    { id: 'surveyor-portal', label: 'Surveyor Portal', icon: UserCheck },
    { id: 'document-checklist', label: 'Doc Checklist', icon: ClipboardCheck },
    { id: 'reminder-engine', label: 'AI Reminders', icon: BellRing, badge: '4 Alert' },
    { id: 'copilot', label: 'AI Copilot Chat', icon: MessageSquare, hero: true },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 select-none z-20 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center shadow-lg shadow-blue-900/40 border border-blue-400/30">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold text-sm tracking-tight">CLAIMS INTELLIGENCE</span>
            <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">AI</span>
          </div>
        </div>
      </div>

      {/* Navigation Modules */}
      <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            9 Core Enterprise Modules
          </div>
          <nav className="space-y-1">
            {coreModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id || (activeScreen === 'claim-details' && item.id === 'claims');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id as ScreenId)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${isActive
                    ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-sm shadow-blue-900/30'
                    : item.highlight
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-400' : item.highlight ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.hero && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-subtle" title="Hero Feature" />
                    )}
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.badge.includes('Alert') ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Demo Callout */}
        <div className="mx-1 p-3 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maple Prototype v1.0</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            All 9 core enterprise modules fully interactive & active.
          </p>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
            CM
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">Claims Manager</div>
            <div className="text-[10px] text-slate-400 truncate">Maple Highways</div>
          </div>
        </div>
        <button
          onClick={() => setActiveScreen('login')}
          className="text-slate-400 hover:text-slate-200 text-xs p-1 hover:bg-slate-900 rounded"
          title="Sign Out to Login"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
