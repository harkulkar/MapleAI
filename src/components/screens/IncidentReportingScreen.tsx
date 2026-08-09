import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FilePlus, 
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Clock,
  MapPin,
  Video,
  FileSearch,
  Award
} from 'lucide-react';
import type { Claim, AIAssessment } from '../../types/claims';
import { runAIIncidentAnalysis, AI_ANALYSIS_STEPS } from '../../services/aiService';
import type { ScreenId } from '../layout/Sidebar';

interface IncidentReportingScreenProps {
  onClaimCreated: (newClaim: Claim) => void;
  setActiveScreen: (screen: ScreenId) => void;
}

export const IncidentReportingScreen: React.FC<IncidentReportingScreenProps> = ({ 
  onClaimCreated, 
  setActiveScreen 
}) => {
  // Pre-populated demo fields
  const [incidentDate, setIncidentDate] = useState('2026-06-08');
  const [incidentTime, setIncidentTime] = useState('14:30');
  const [highway, setHighway] = useState('Eastern Peripheral Expressway');
  const [roadName, setRoadName] = useState('NE-II / KMP Bypass Expressway');
  const [chainage, setChainage] = useState('42+600');
  const [direction, setDirection] = useState('Both Carriage Ways');
  const [concessionaire, setConcessionaire] = useState('Maple Highways Infrastructure Pvt Ltd');
  const [location, setLocation] = useState('Baghpat Toll Section, Km 42+600');
  const [weather, setWeather] = useState('Heavy Rainfall');
  const [incidentType, setIncidentType] = useState('Flood / Heavy Rainfall');
  const [severity, setSeverity] = useState('Medium');
  const [gpsCoords, setGpsCoords] = useState('28.8924° N, 77.2090° E');
  const [hasVideo, setHasVideo] = useState(true);
  const [description, setDescription] = useState(
    'Heavy rainfall caused water accumulation and damage to the road shoulder, median and crash barrier.'
  );

  // Photos state (12 Photos for Module 1 example)
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; url: string; name: string }>>([
    { id: '1', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', name: 'Road_Shoulder_Erosion_Ch42.jpg' },
    { id: '2', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80', name: 'Crash_Barrier_Damage.jpg' },
    { id: '3', url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80', name: 'Median_Slope_Washout.jpg' },
    { id: '4', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', name: 'Subgrade_Saturation_04.jpg' },
    { id: '5', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80', name: 'Bituminous_Crack_05.jpg' },
    { id: '6', url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80', name: 'Culvert_Wingwall_06.jpg' },
    { id: '7', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', name: 'Drainage_Choke_07.jpg' },
    { id: '8', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80', name: 'Barrier_Deformation_08.jpg' },
    { id: '9', url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80', name: 'Signage_Damage_09.jpg' },
    { id: '10', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', name: 'Pavement_Sinking_10.jpg' },
    { id: '11', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80', name: 'Slope_Slide_11.jpg' },
    { id: '12', url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80', name: 'Toll_Link_Overview_12.jpg' },
  ]);

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [aiAssessmentResult, setAiAssessmentResult] = useState<AIAssessment | null>(null);
  const [claimCreatedSuccess, setClaimCreatedSuccess] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file, idx) => ({
        id: Date.now().toString() + idx,
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setUploadedPhotos(prev => [...prev, ...newFiles]);
    }
  };

  const removePhoto = (id: string) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleAnalyzeWithAI = async () => {
    setIsAnalyzing(true);
    setAnalysisStepIndex(0);

    for (let i = 0; i < AI_ANALYSIS_STEPS.length; i++) {
      setAnalysisStepIndex(i);
      await new Promise(resolve => setTimeout(resolve, 450));
    }

    const result = await runAIIncidentAnalysis({
      incidentDate,
      incidentTime,
      highway,
      roadName,
      chainage,
      direction,
      concessionaire,
      location,
      weather,
      incidentType,
      severity,
      description,
      photos: [],
      gpsCoordinates: gpsCoords
    });

    setAiAssessmentResult(result);
    setIsAnalyzing(false);
  };

  const handleCreateClaim = () => {
    const newClaim: Claim = {
      id: 'CLM-2026-00124',
      highway,
      code: 'EPE',
      chainage,
      direction,
      concessionaire,
      location,
      incidentDate: '08 Jun 2026',
      incidentTime: `${incidentTime} IST`,
      incidentType,
      weather,
      description,
      photosUploadedCount: uploadedPhotos.length,
      photoUrls: uploadedPhotos.map(p => p.url),
      gpsCoordinates: gpsCoords,
      videoUrl: 'site_drone_patrol_ch42.mp4',
      reserveAmountLakhs: 22.4,
      insurer: 'United India Insurance Co.',
      status: 'Survey Pending',
      severity: severity as any,
      ageDays: 12,
      createdAt: new Date().toISOString(),
      aiAssessment: aiAssessmentResult || {
        possibleDamage: ['Road Shoulder', 'Crash Barrier', 'Pavement', 'Median'],
        likelyCause: 'Heavy Rainfall / Flooding',
        likelyPolicy: 'Industrial All Risk',
        estimatedSeverity: 'Medium',
        initialReserve: 22.4,
        aiConfidence: 92,
        admissionProbability: 93,
        likelyDeductible: 25.0,
        missingEvidence: [
          'Rainfall Report',
          'Maintenance Register',
          'Pre-loss Photographs',
          'Measurement Book'
        ],
        recommendation: 'Notify the insurer and appoint a surveyor. Obtain rainfall confirmation and maintenance records before the survey assessment.',
        potentialObjections: [
          'Maintenance records may be requested.',
          'Rainfall confirmation may be required.',
          'Pre-loss photographs may be requested.'
        ]
      },
      documents: [
        { id: 'DOC-01', name: 'Incident Photographs (12 Files)', category: 'Photographs', status: 'Available', requiredForSurvey: true, uploadedAt: '08 Jun 2026', size: '48 MB' },
        { id: 'DOC-02', name: 'Field Engineer Report & GPS Log', category: 'Reports', status: 'Available', requiredForSurvey: true, uploadedAt: '08 Jun 2026', size: '3.2 MB' },
        { id: 'DOC-03', name: 'Rainfall Report', category: 'Reports', status: 'Missing', requiredForSurvey: true },
        { id: 'DOC-04', name: 'Maintenance Register', category: 'Registers', status: 'Missing', requiredForSurvey: true },
      ],
      timeline: [
        { id: 'TL-1', title: 'Incident Reported', description: 'Field engineer logged incident & 12 photos.', date: '08 Jun 2026, 14:30', status: 'completed' },
        { id: 'TL-2', title: 'AI Assessment Completed', description: 'MAPLE AI identified 4 damage vectors & ₹22.4L reserve.', date: '08 Jun 2026, 14:35', status: 'completed' },
        { id: 'TL-3', title: 'Claim Created', description: 'CLM-2026-00124 generated.', date: '08 Jun 2026, 14:40', status: 'completed' },
        { id: 'TL-4', title: 'Surveyor Appointment', description: 'Intimated to United India Insurance.', date: 'Pending', status: 'current' },
      ]
    };

    onClaimCreated(newClaim);
    setClaimCreatedSuccess(true);

    setTimeout(() => {
      setActiveScreen('claim-details');
    }, 1200);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>MODULE 1 • FIELD ENGINEER INCIDENT INTAKE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">FIELD ENGINEER INCIDENT INTAKE</h1>
          <p className="text-sm text-slate-400">Capture loss photos, video, GPS & execute instant automated AI OCR/Geo-tagging analysis.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-bold">
          <MapPin className="w-3.5 h-3.5" />
          <span>GPS Auto-Locked: {gpsCoords}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Incident Metadata & Media Upload</span>
              </span>
              <span className="text-xs text-amber-400 font-semibold">{uploadedPhotos.length} Photos Captured</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Incident Date</label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={e => setIncidentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Incident Time</label>
                <input
                  type="time"
                  value={incidentTime}
                  onChange={e => setIncidentTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Highway / Expressway</label>
                <input
                  type="text"
                  value={highway}
                  onChange={e => setHighway(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Chainage Location</label>
                <input
                  type="text"
                  value={chainage}
                  onChange={e => setChainage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">GPS Coordinates (Auto-Locked)</label>
                <input
                  type="text"
                  value={gpsCoords}
                  onChange={e => setGpsCoords(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Weather Condition</label>
                <input
                  type="text"
                  value={weather}
                  onChange={e => setWeather(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Incident Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-blue-500"
              />
            </div>

            {/* Photo & Video Upload Grid */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-300">
                  Field Media Upload ({uploadedPhotos.length} Photos + 1 Drone Video)
                </span>
                <span className="text-emerald-400 font-bold">12 Photos Selected</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950 h-20">
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>{isAnalyzing ? 'RUNNING MAPLE AI OCR & GEOTAG ENGINE...' : 'ANALYZE INCIDENT WITH AI'}</span>
            </button>
          </div>
        </div>

        {/* AI Output Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {isAnalyzing && (
            <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-6 shadow-2xl space-y-4 animate-pulse">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">MAPLE AI Processing Pipeline</h3>
              </div>

              <div className="space-y-3">
                {AI_ANALYSIS_STEPS.map((step, idx) => {
                  const isDone = idx < analysisStepIndex;
                  const isCurrent = idx === analysisStepIndex;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700" />
                      )}
                      <span className={isCurrent ? 'text-amber-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-600'}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {aiAssessmentResult && !isAnalyzing && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6 border-t-4 border-t-amber-500">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    AI OCR & GEOTAG ASSESSMENT
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-1">AI INCIDENT ASSESSMENT</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">{aiAssessmentResult.admissionProbability}%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Admission Prob.</div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Possible Damage Identified (12 Photos Analyzed)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {aiAssessmentResult.possibleDamage.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs text-white">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Likely Cause</span>
                  <span className="font-semibold text-white">{aiAssessmentResult.likelyCause}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Likely Policy</span>
                  <span className="font-semibold text-blue-400">{aiAssessmentResult.likelyPolicy}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Estimated Severity</span>
                  <span className="font-extrabold text-amber-400 uppercase">{aiAssessmentResult.estimatedSeverity}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Initial Reserve Suggested</span>
                  <span className="font-black text-amber-400 text-sm">₹{aiAssessmentResult.initialReserve} Lakhs</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateClaim}
                disabled={claimCreatedSuccess}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <FilePlus className="w-4 h-4" />
                <span>{claimCreatedSuccess ? 'CLAIM CREATED! REDIRECTING...' : 'CREATE CLAIM CLM-2026-00124'}</span>
              </button>
            </div>
          )}

          {!aiAssessmentResult && !isAnalyzing && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-8 text-center text-slate-500 space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto" />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Awaiting AI Execution</h3>
              <p className="text-xs max-w-xs mx-auto text-slate-500">
                Click "ANALYZE INCIDENT WITH AI" to initiate damage recognition, coverage matching, and initial reserve recommendation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
