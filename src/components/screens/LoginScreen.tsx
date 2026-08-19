import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, Mail, Building, ClipboardCheck } from 'lucide-react';
import type { UserRole } from '../../types/portal';
import { authenticatePortal } from '../../data/portalAccounts';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('claims-manager');
  const [error, setError] = useState('');

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Enter the email and password for this portal.');
      return;
    }

    const result = authenticatePortal(email, password, role);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    onLogin(result.role);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 border border-blue-400/40 shadow-xl shadow-blue-900/40 mb-2">
            <ShieldCheck className="w-9 h-9 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span>TRINETRA</span>
            </h1>
          </div>
          <p className="text-sm text-slate-300 max-w-xs mx-auto font-medium">
            Intelligent claims management for infrastructure.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Portal
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('claims-manager')}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  role === 'claims-manager'
                    ? 'border-blue-500/60 bg-blue-600/20 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 mb-2 ${role === 'claims-manager' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div className="text-xs font-bold">Claims Manager</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Full claims workspace</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('surveyor')}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  role === 'surveyor'
                    ? 'border-amber-500/60 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <ClipboardCheck className={`w-4 h-4 mb-2 ${role === 'surveyor' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div className="text-xs font-bold">Surveyor</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">Portfolio & knowledge bank</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="name@maplehighways.in"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 group"
            >
              <span>{role === 'surveyor' ? 'Enter Surveyor Portal' : 'Enter Claims Manager Portal'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>

        {/* Executive Footnote */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-600" />
            <span>Maple Infrastructure Concessionaires</span>
          </div>
          <p className="text-[11px] text-slate-600">Enterprise AI Claims Intelligence Prototype v1.0</p>
        </div>
      </div>
    </div>
  );
};
