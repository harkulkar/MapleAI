import React, { useState, useMemo } from 'react';
import type { Claim } from '../../types/claims';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FilePlus,
  ShieldCheck,
  MapPin,
  ChevronDown,
  Search,
  User,
  Phone,
  Mail,
  Building2,
  X,
  Check,
} from 'lucide-react';
import type { ScreenId } from '../layout/Sidebar';

interface IncidentReportingScreenProps {
  onClaimCreated?: (newClaim: Claim) => void;
  setActiveScreen: (screen: ScreenId) => void;
}

// ─── Master Policy List ───────────────────────────────────────────────────────
const POLICIES = [
  { id: 'POL-01', company: 'Maple Highways', type: 'Bharat Laghu Udyam Suraksha (BLUS)', exposure: 'New / Open Exposure', number: '260200112510000332' },
  { id: 'POL-02', company: 'Maple Highways', type: 'Burglary & Theft Insurance', exposure: 'New / Open Exposure', number: '260200592510000200' },
  { id: 'POL-03', company: 'Maple Highways', type: 'Cyber Liability', exposure: 'New / Open Exposure', number: '260200492510000371' },
  { id: 'POL-04', company: 'Maple Highways', type: 'Electronic Equipment Insurance (EEI)', exposure: 'New / Open Exposure', number: '260200442510000129' },
  { id: 'POL-05', company: 'Maple Highways', type: 'Fidelity Guarantee Insurance', exposure: 'New / Open Exposure', number: '260200592510000204' },
  { id: 'POL-06', company: 'Maple Highways', type: 'Fidelity Guarantee Insurance', exposure: 'New / Open Exposure', number: '' },
  { id: 'POL-07', company: 'Maple Highways', type: 'Fire Loss of Profit (FLOP)', exposure: 'New / Open Exposure', number: '540000/48/2026/1102' },
  { id: 'POL-08', company: 'Maple Highways', type: 'Industrial All Risk (IAR)', exposure: 'New / Open Exposure', number: '260200112510000331' },
  { id: 'POL-09', company: 'Maple Highways', type: 'Industrial All Risk (IAR)', exposure: 'New / Open Exposure', number: '540000/11/2026/178' },
  { id: 'POL-10', company: 'Maple Highways', type: 'Loss Of Revenue', exposure: 'New / Open Exposure', number: '260200592510000233' },
];

const CAUSE_OF_LOSS_OPTIONS = [
  'Accidental Damage', 'AOG / Storm / Cyclone', 'Burglary / Theft', 'Cyber Incident',
  'Earthquake', 'Electrical Short Circuit', 'Fire / Explosion', 'Flood / Heavy Rainfall',
  'Human Error', 'Mechanical Breakdown', 'Subsidence', 'Vehicle Impact / Collision', 'Other',
];

const TYPE_OF_LOSS_OPTIONS = [
  'Property Damage', 'Theft / Burglary', 'Business Interruption', 'Third Party Liability',
  'Electronic Equipment Failure', 'Loss of Revenue', 'Fire Damage', 'Accidental Damage', 'Other',
];

const CLAIM_TYPE_OPTIONS = ['Non EB internal claim', 'EB Claim', 'External Claim', 'Liability Claim'];

const CLAIM_SECTIONS_OPTIONS = ['All', 'Section A - Property', 'Section B - Machinery', 'Section C - BI/Revenue', 'Section D - Liability'];

const ZONE_OPTIONS = ['Centralized Zone', 'East', 'North', 'South', 'West'];

const INPUT_CLS = 'w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors';
const LABEL_CLS = 'block text-xs font-semibold text-slate-400 mb-1.5';
const REQ = <span className="text-red-400 ml-0.5">*</span>;
const SECTION_CLS = 'bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5';
const SECTION_TITLE = 'text-base font-bold text-white border-b border-slate-800 pb-3 mb-5 flex items-center gap-2';

export const IncidentReportingScreen: React.FC<IncidentReportingScreenProps> = ({ onClaimCreated, setActiveScreen }) => {
  // ── Claims Intimation
  const [selectedPolicy, setSelectedPolicy] = useState<typeof POLICIES[0] | null>(null);
  const [policySearch, setPolicySearch] = useState('');
  const [policyOpen, setPolicyOpen] = useState(false);

  const [dateOfLoss, setDateOfLoss] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [causeOfLoss, setCauseOfLoss] = useState('');
  const [priority, setPriority] = useState('High');
  const [typeOfLoss, setTypeOfLoss] = useState('');
  const [claimType, setClaimType] = useState('Non EB internal claim');
  const [lossDescription, setLossDescription] = useState('');
  const [claimSections, setClaimSections] = useState('All');

  // ── Contact Info
  const [onsiteName, setOnsiteName] = useState('');
  const [onsiteEmail, setOnsiteEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // ── Risk/Loss Location
  const [locationName, setLocationName] = useState('');
  const [zone, setZone] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');

  // ── Submission
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredPolicies = useMemo(() =>
    POLICIES.filter(p =>
      policySearch === '' ||
      p.type.toLowerCase().includes(policySearch.toLowerCase()) ||
      p.number.includes(policySearch)
    ), [policySearch]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedPolicy) e.policy = 'Policy is required';
    if (!dateOfLoss) e.dateOfLoss = 'Date of Loss is required';
    if (!claimedAmount) e.claimedAmount = 'Claimed Amount is required';
    if (!causeOfLoss) e.causeOfLoss = 'Cause of Loss is required';
    if (!typeOfLoss) e.typeOfLoss = 'Type of Loss is required';
    if (!lossDescription.trim()) e.lossDescription = 'Loss Description is required';
    if (!onsiteName.trim()) e.onsiteName = 'Onsite Person Name is required';
    if (!onsiteEmail.trim()) e.onsiteEmail = 'Onsite Person Email is required';
    if (!mobileNumber.trim()) e.mobileNumber = 'Mobile Number is required';
    if (!locationName.trim()) e.locationName = 'Risk/Loss Location Name is required';
    if (!pinCode.trim()) e.pinCode = 'Pin Code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    const claimId = `CLM-${Date.now().toString().slice(-8)}`;
    const payload = {
      claimId,
      submittedAt: new Date().toISOString(),
      policy: selectedPolicy,
      dateOfLoss,
      claimedAmount,
      causeOfLoss,
      priority,
      typeOfLoss,
      claimType,
      lossDescription,
      claimSections,
      contact: { onsiteName, onsiteEmail, mobileNumber },
      location: { locationName, zone, pinCode, city, state, country },
    } as unknown as Claim; // casting to Claim for compatibility

    try {
      const response = await fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSubmitError(data.error || 'Failed to save claim to database. Please try again.');
        return;
      }

      const existing = JSON.parse(localStorage.getItem('maple_submitted_claims') || '[]');
      existing.push(payload);
      localStorage.setItem('maple_submitted_claims', JSON.stringify(existing));

      onClaimCreated?.(payload);
      setSubmittedId(claimId);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to save claim:', error);
      setSubmitError('Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen
  if (submitted) {
    return (
      <div className="p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Claim Submitted Successfully!</h2>
          <p className="text-slate-400 text-sm mt-2">Your claim has been saved and registered.</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl px-8 py-5 space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Claim Reference ID</p>
          <p className="text-3xl font-black text-amber-400">{submittedId}</p>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => setActiveScreen('claims')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors"
          >
            View All Claims
          </button>
          <button
            onClick={() => { setSubmitted(false); setSelectedPolicy(null); setDateOfLoss(''); setClaimedAmount(''); setCauseOfLoss(''); setPriority('High'); setTypeOfLoss(''); setClaimType('Non EB internal claim'); setLossDescription(''); setClaimSections('All'); setOnsiteName(''); setOnsiteEmail(''); setMobileNumber(''); setLocationName(''); setZone(''); setPinCode(''); setCity(''); setState(''); setCountry('India'); }}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>MODULE 1 • INCIDENT INTAKE</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Claims Intimation Form</h1>
        <p className="text-sm text-slate-400 mt-1">Register a new insurance claim — all <span className="text-red-400">*</span> fields are required.</p>
      </div>

      {/* ── SECTION 1: Risk/Loss Location Details ────────────────────────────── */}
      <div className={SECTION_CLS}>
        <h2 className={SECTION_TITLE}>
          <MapPin className="w-5 h-5 text-emerald-400" />
          Risk / Loss Location Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>{REQ} Risk / Loss Location Name</label>
            <input
              type="text"
              placeholder="e.g. Toll Plaza - KM 42+600"
              value={locationName}
              onChange={e => { setLocationName(e.target.value); setErrors(v => ({ ...v, locationName: '' })); }}
              className={`${INPUT_CLS} ${errors.locationName ? 'border-red-500' : ''}`}
            />
            {errors.locationName && <p className="text-red-400 text-xs mt-1">{errors.locationName}</p>}
          </div>
          <div>
            <label className={LABEL_CLS}>Zone</label>
            <select value={zone} onChange={e => setZone(e.target.value)} className={INPUT_CLS}>
              <option value="">Select an Option</option>
              {ZONE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>{REQ} Risk / Loss Location Pin Code</label>
            <input
              type="text"
              placeholder="e.g. 110001"
              maxLength={6}
              value={pinCode}
              onChange={e => { setPinCode(e.target.value); setErrors(v => ({ ...v, pinCode: '' })); }}
              className={`${INPUT_CLS} ${errors.pinCode ? 'border-red-500' : ''}`}
            />
            {errors.pinCode && <p className="text-red-400 text-xs mt-1">{errors.pinCode}</p>}
          </div>
          <div>
            <label className={LABEL_CLS}>City</label>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={e => setCity(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>State</label>
            <input
              type="text"
              placeholder="State"
              value={state}
              onChange={e => setState(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Country</label>
            <input
              type="text"
              placeholder="Country"
              value={country}
              onChange={e => setCountry(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Contact Information ───────────────────────────────────── */}
      <div className={SECTION_CLS}>
        <h2 className={SECTION_TITLE}>
          <User className="w-5 h-5 text-purple-400" />
          Contact Information (Claim / On Site Coordinator)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>{REQ} Onsite Person Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={onsiteName}
              onChange={e => { setOnsiteName(e.target.value); setErrors(v => ({ ...v, onsiteName: '' })); }}
              className={`${INPUT_CLS} ${errors.onsiteName ? 'border-red-500' : ''}`}
            />
            {errors.onsiteName && <p className="text-red-400 text-xs mt-1">{errors.onsiteName}</p>}
          </div>
          <div>
            <label className={LABEL_CLS}>{REQ} Onsite Person Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="email@mapelhighways.com"
                value={onsiteEmail}
                onChange={e => { setOnsiteEmail(e.target.value); setErrors(v => ({ ...v, onsiteEmail: '' })); }}
                className={`${INPUT_CLS} pl-9 ${errors.onsiteEmail ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.onsiteEmail && <p className="text-red-400 text-xs mt-1">{errors.onsiteEmail}</p>}
          </div>
        </div>

        <div className="md:max-w-sm">
          <label className={LABEL_CLS}>{REQ} Mobile Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={mobileNumber}
              onChange={e => { setMobileNumber(e.target.value); setErrors(v => ({ ...v, mobileNumber: '' })); }}
              className={`${INPUT_CLS} pl-9 ${errors.mobileNumber ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.mobileNumber && <p className="text-red-400 text-xs mt-1">{errors.mobileNumber}</p>}
        </div>
      </div>

      {/* ── SECTION 3: Claims Intimation Details ──────────────────────────── */}
      <div className={SECTION_CLS}>
        <h2 className={SECTION_TITLE}>
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          Claims Intimation Details
        </h2>

        {/* Policy Search */}
        <div className="relative">
          <label className={LABEL_CLS}>{REQ} Policy</label>
          <button
            type="button"
            onClick={() => { setPolicyOpen(v => !v); setPolicySearch(''); }}
            className={`${INPUT_CLS} flex items-center justify-between text-left ${errors.policy ? 'border-red-500' : ''}`}
          >
            {selectedPolicy ? (
              <span className="truncate">
                <span className="text-white font-medium">{selectedPolicy.type}</span>
                {selectedPolicy.number && <span className="text-slate-400 ml-2 text-xs">· {selectedPolicy.number}</span>}
              </span>
            ) : (
              <span className="text-slate-500">Search Policy...</span>
            )}
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </button>
          {errors.policy && <p className="text-red-400 text-xs mt-1">{errors.policy}</p>}

          {policyOpen && (
            <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by type or policy number..."
                  value={policySearch}
                  onChange={e => setPolicySearch(e.target.value)}
                  className="bg-transparent text-sm text-white w-full focus:outline-none placeholder-slate-500"
                />
                {policySearch && (
                  <button onClick={() => setPolicySearch('')}><X className="w-4 h-4 text-slate-400" /></button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredPolicies.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedPolicy(p); setPolicyOpen(false); setErrors(e => ({ ...e, policy: '' })); }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-blue-400">{p.company}</p>
                        <p className="text-xs text-slate-300 mt-0.5">{p.type}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.exposure}{p.number ? ` · Policy Number - ${p.number}` : ''}</p>
                      </div>
                      {selectedPolicy?.id === p.id && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  </button>
                ))}
                {filteredPolicies.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-6">No policies found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date of Loss + Claimed Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>{REQ} Date Of Loss / Occurrence</label>
            <input
              type="date"
              value={dateOfLoss}
              onChange={e => { setDateOfLoss(e.target.value); setErrors(v => ({ ...v, dateOfLoss: '' })); }}
              className={`${INPUT_CLS} ${errors.dateOfLoss ? 'border-red-500' : ''}`}
            />
            {errors.dateOfLoss && <p className="text-red-400 text-xs mt-1">{errors.dateOfLoss}</p>}
          </div>
          <div>
            <label className={LABEL_CLS}>{REQ} Claimed Amount ()</label>
            <input
              type="number"
              placeholder="e.g. 250000"
              value={claimedAmount}
              onChange={e => { setClaimedAmount(e.target.value); setErrors(v => ({ ...v, claimedAmount: '' })); }}
              className={`${INPUT_CLS} ${errors.claimedAmount ? 'border-red-500' : ''}`}
            />
            {errors.claimedAmount && <p className="text-red-400 text-xs mt-1">{errors.claimedAmount}</p>}
          </div>
        </div>

        {/* Cause of Loss + Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>{REQ} Cause Of Loss</label>
            <select
              value={causeOfLoss}
              onChange={e => { setCauseOfLoss(e.target.value); setErrors(v => ({ ...v, causeOfLoss: '' })); }}
              className={`${INPUT_CLS} ${errors.causeOfLoss ? 'border-red-500' : ''}`}
            >
              <option value="">Select Cause Of Loss</option>
              {CAUSE_OF_LOSS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors.causeOfLoss && <p className="text-red-400 text-xs mt-1">{errors.causeOfLoss}</p>}
          </div>
          <div>
            <label className={LABEL_CLS}>{REQ} Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className={INPUT_CLS}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Type of Loss + Claim Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>{REQ} Type Of Loss</label>
            <select
              value={typeOfLoss}
              onChange={e => { setTypeOfLoss(e.target.value); setErrors(v => ({ ...v, typeOfLoss: '' })); }}
              className={`${INPUT_CLS} ${errors.typeOfLoss ? 'border-red-500' : ''}`}
            >
              <option value="">Select Type Of Loss</option>
              {TYPE_OF_LOSS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors.typeOfLoss && <p className="text-red-400 text-xs mt-1">{errors.typeOfLoss}</p>}
          </div>
          <div>
            <label className={LABEL_CLS}>{REQ} Claim Type</label>
            <select value={claimType} onChange={e => setClaimType(e.target.value)} className={INPUT_CLS}>
              {CLAIM_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Loss Description */}
        <div>
          <label className={LABEL_CLS}>{REQ} Loss Description</label>
          <textarea
            rows={4}
            placeholder="Describe the loss / damage in detail..."
            value={lossDescription}
            onChange={e => { setLossDescription(e.target.value); setErrors(v => ({ ...v, lossDescription: '' })); }}
            className={`${INPUT_CLS} resize-none ${errors.lossDescription ? 'border-red-500' : ''}`}
          />
          {errors.lossDescription && <p className="text-red-400 text-xs mt-1">{errors.lossDescription}</p>}
        </div>

        {/* Claim Sections */}
        <div>
          <label className={LABEL_CLS}>{REQ} Claim Sections</label>
          <select value={claimSections} onChange={e => setClaimSections(e.target.value)} className={INPUT_CLS}>
            {CLAIM_SECTIONS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* ── Validation Error Banner ───────────────────────────────────────────── */}
      {Object.keys(errors).filter(k => errors[k]).length > 0 && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>Please fill in all required fields before submitting.</span>
        </div>
      )}

      {submitError && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* ── Submit Button ─────────────────────────────────────────────────────── */}
      <div className="flex justify-center pb-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-xl shadow-blue-900/30 flex items-center gap-3 transition-all active:scale-95"
        >
          <FilePlus className="w-5 h-5" />
          {submitting ? 'Saving Claim...' : 'Submit Claim'}
        </button>
      </div>
    </div>
  );
};
