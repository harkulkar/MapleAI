import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bot, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Clock, 
  Sparkles,
  Building,
  ShieldCheck,
  Send,
  Calendar,
  IndianRupee,
  MapPin,
  Share2
} from 'lucide-react';
import type { Claim } from '../../types/claims';
import type { ScreenId } from '../layout/Sidebar';
import type { UserRole } from '../../types/portal';

interface ClaimDetailsScreenProps {
  claim: Claim;
  onBack: () => void;
  setActiveScreen: (screen: ScreenId) => void;
  role?: UserRole;
}

export const ClaimDetailsScreen: React.FC<ClaimDetailsScreenProps> = ({ 
  claim, 
  onBack, 
  setActiveScreen,
  role = 'claims-manager',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-assessment' | 'documents' | 'timeline'>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState(claim.documents);

  const handleSimulateUpload = () => {
    setShowUploadModal(false);
    // Mark one missing document as uploaded
    setUploadedDocs(prev => prev.map(doc => 
      doc.status === 'Missing' 
        ? { ...doc, status: 'Available', uploadedAt: 'Today', size: '3.1 MB' } 
        : doc
    ));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb Nav & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{claim.id}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                claim.status === 'Survey Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                claim.status === 'Admitted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {claim.status}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium mt-0.5">{claim.highway} • {claim.incidentType}</p>
          </div>
        </div>

        {role !== 'surveyor' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveScreen('ai-advisor')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-900/30 flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Open AI Claim Advisor</span>
            </button>

            <button
              onClick={() => setActiveScreen('copilot')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-all"
            >
              Ask Copilot
            </button>
          </div>
        )}
      </div>

      {/* Highlights Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Incident Date</span>
          <span className="font-semibold text-white">{claim.incidentDate}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Highway</span>
          <span className="font-semibold text-slate-200 truncate block">{claim.code}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Chainage</span>
          <span className="font-mono font-semibold text-slate-200">{claim.chainage}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Policy</span>
          <span className="font-semibold text-blue-400 truncate block">{claim.aiAssessment.likelyPolicy}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Insurer</span>
          <span className="font-semibold text-slate-300 truncate block">{claim.insurer}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Initial Reserve</span>
          <span className="font-black text-amber-400">{claim.reserveAmountLakhs} Lakhs</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Severity</span>
          <span className="font-bold text-amber-400 uppercase">{claim.severity}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Admission Prob.</span>
          <span className="font-black text-emerald-400">{claim.aiAssessment.admissionProbability}%</span>
        </div>
      </div>

      {/* Tabs Control Header */}
      <div className="border-b border-slate-800 flex items-center gap-6 text-sm font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'overview' ? 'border-blue-500 text-white font-bold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('ai-assessment')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'ai-assessment' ? 'border-amber-500 text-amber-400 font-bold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Assessment</span>
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === 'documents' ? 'border-blue-500 text-white font-bold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          <span>Documents</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400">
            {uploadedDocs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'timeline' ? 'border-blue-500 text-white font-bold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          Claim Timeline
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Incident Details & Loss Summary</h3>
              <p className="text-sm text-slate-200 leading-relaxed">{claim.description}</p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Concessionaire</span>
                  <span className="text-slate-200 font-medium">{claim.concessionaire}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Specific Location</span>
                  <span className="text-slate-200 font-medium">{claim.location}</span>
                </div>
              </div>
            </div>

            {/* Photos Preview */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Uploaded Evidence Photographs ({claim.photosUploadedCount})
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {claim.photoUrls?.map((url, i) => (
                  <div key={i} className="h-32 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={url} alt={`Evidence ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span>AI Recommendation Summary</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950 p-3 rounded-lg border border-slate-800">
                "{claim.aiAssessment.recommendation}"
              </p>
              {role !== 'surveyor' && (
                <button
                  onClick={() => setActiveScreen('ai-advisor')}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Launch AI Claim Advisor</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI ASSESSMENT */}
      {activeTab === 'ai-assessment' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-white">MAPLE AI Coverage & Loss Breakdown</h2>
              <p className="text-xs text-slate-400">Automated machine-vision analysis & policy text parsing</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">AI Confidence: </span>
              <span className="text-sm font-extrabold text-emerald-400">{claim.aiAssessment.aiConfidence}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Damages Detected</h3>
              <div className="space-y-2">
                {claim.aiAssessment.possibleDamage.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="font-semibold text-white">{d}</span>
                    <span className="text-emerald-400 text-[10px] uppercase font-bold">Verified</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Policy & Deductible Specs</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Policy Document</span>
                  <span className="font-semibold text-blue-400">{claim.aiAssessment.likelyPolicy}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Likely Cause</span>
                  <span className="font-semibold text-white">{claim.aiAssessment.likelyCause}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Estimated Deductible</span>
                  <span className="font-bold text-amber-400">{claim.aiAssessment.likelyDeductible} Lakhs</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Claim Admission Probability</span>
                  <span className="font-extrabold text-emerald-400">{claim.aiAssessment.admissionProbability}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Claim Document Repository</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
              {role !== 'surveyor' && (
                <button
                  onClick={() => setActiveScreen('ai-advisor')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold rounded-lg"
                >
                  Request Document
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Documents */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Available Evidence (3)</span>
              </div>

              <div className="space-y-2">
                {uploadedDocs.filter(d => d.status === 'Available').map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{doc.name}</div>
                      <div className="text-[10px] text-slate-500">{doc.category} • Uploaded {doc.uploadedAt} • {doc.size}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">AVAILABLE</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Documents */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Missing Evidence (4)</span>
              </div>

              <div className="space-y-2">
                {uploadedDocs.filter(d => d.status === 'Missing').map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-950 rounded-lg border border-amber-500/20 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-amber-200">{doc.name}</div>
                      <div className="text-[10px] text-amber-400/80">Required for survey assessment</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">MISSING</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Visual Claim Timeline</h2>
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {claim.timeline.map((step) => (
              <div key={step.id} className="relative flex items-start gap-4 text-xs">
                <div className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-emerald-600 border-emerald-400 text-white' :
                  step.status === 'current' ? 'bg-amber-500 border-amber-300 text-slate-950 animate-pulse' :
                  'bg-slate-950 border-slate-700 text-slate-600'
                }`}>
                  {step.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                  {step.status === 'current' && <Clock className="w-3 h-3" />}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{step.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{step.date}</span>
                  </div>
                  <p className="text-slate-400">{step.description}</p>
                  {step.actor && <p className="text-[10px] text-blue-400 font-medium">Actor: {step.actor}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Upload Missing Evidence Document</h3>
            <p className="text-xs text-slate-400">Select file to attach to claim CLM-2026-00124</p>
            <input type="file" className="w-full text-xs text-slate-400" />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateUpload}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
