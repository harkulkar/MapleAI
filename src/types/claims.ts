export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ClaimStatus = 'Draft' | 'Survey Pending' | 'Survey Underway' | 'Under Review' | 'Admitted' | 'Settled' | 'Repudiated';

export interface DocumentItem {
  id: string;
  name: string;
  category: 'Photographs' | 'Reports' | 'Registers' | 'Measurement' | 'Policy' | 'Correspondence';
  status: 'Available' | 'Missing' | 'Requested';
  requiredForSurvey: boolean;
  uploadedAt?: string;
  size?: string;
}

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
  actor?: string;
}

export interface AIAssessment {
  possibleDamage: string[];
  likelyCause: string;
  likelyPolicy: string;
  estimatedSeverity: SeverityLevel;
  initialReserve: number; // in INR Lakhs
  aiConfidence: number; // percentage e.g. 92
  admissionProbability: number; // percentage e.g. 93
  likelyDeductible: number; // in INR Lakhs
  missingEvidence: string[];
  recommendation: string;
  potentialObjections: string[];
}

export interface Claim {
  id: string; // e.g. CLM-2026-00124
  highway: string; // e.g. Eastern Peripheral Expressway
  code: string; // e.g. EPE
  chainage: string; // e.g. 42+600
  direction?: string; // e.g. Both Carriage Ways
  concessionaire?: string; // e.g. Maple Infrastructure Concessionaires Ltd
  location?: string; // e.g. Kundli - Palwal Stretch, Section 4
  incidentDate: string; // e.g. 08 Jun 2026
  incidentTime?: string; // e.g. 14:30 IST
  incidentType: string; // e.g. Heavy Rainfall Damage / Flood
  weather: string; // e.g. Heavy Rainfall
  description: string;
  photosUploadedCount: number;
  photoUrls?: string[];
  videoUrl?: string;
  gpsCoordinates?: string;
  reserveAmountLakhs: number;
  settlementAmountLakhs?: number;
  insurer: string;
  status: ClaimStatus;
  severity: SeverityLevel;
  ageDays: number;
  aiAssessment: AIAssessment;
  documents: DocumentItem[];
  timeline: TimelineStep[];
  createdAt: string;

  // Master Data 47 Columns
  broker?: string;
  entity?: string;
  sourceFile?: string;
  asOnDate?: string;
  brokerRefNo?: string;
  insurerClaimNo?: string;
  policyNo?: string;
  policyType?: string;
  policyPeriod?: string;
  dateOfLoss?: string;
  dateOfIntimation?: string;
  intimationLagDays?: number | null;
  lossFY?: string;
  lossMonth?: string;
  lossQuarter?: string;
  lossDescription?: string;
  lossLocation?: string;
  kmRaw?: string;
  km?: number | null;
  kmBand?: string;
  assetCategory?: string;
  natureCategory?: string;
  firLodged?: string;
  firNo?: string;
  surveyor?: string;
  statusRaw?: string;
  statusCategory?: string;
  openFlag?: string;
  pendingWith?: string;
  documentsPending?: string;
  claimAmount?: number | null;
  grossAssessed?: number | null;
  deductions?: number | null;
  salvage?: number | null;
  excess?: number | null;
  riDeduction?: number | null;
  otherAdditions?: number | null;
  netSettled?: number | null;
  settlementRatio?: number | null;
  settlementDate?: string;
  settlementTATDays?: number | null;
  ageingDays?: number | null;
  utr?: string;
  remarks?: string;
}

export interface PortfolioMetrics {
  openClaims: number;
  totalReserveCr: number;
  pendingAction: number;
  settledThisYearCr: number;
  avgSettlementDays: number;
  claimRatioPercent: number;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'ai';
  timestamp: string;
  text: string;
  type?: 'text' | 'claims_list' | 'missing_docs' | 'email_preview' | 'knowledge_list' | 'claim_detail';
  data?: any;
}

// Module 3: Knowledge Repository Types
export interface KnowledgeDoc {
  id: string;
  name: string;
  category: 'Corporate' | 'Legal' | 'Insurance' | 'Finance' | 'Technical' | 'Operations';
  subCategory: string;
  fileSize: string;
  uploadedDate: string;
  indexedStatus: 'Indexed' | 'Processing';
  accessLevel: 'Enterprise' | 'Confidential';
}

// Module 6: Reminder Item Types
export interface ReminderItem {
  id: string;
  claimId: string;
  targetRole: 'Surveyor' | 'Insurer' | 'Finance Team' | 'Regional Office' | 'Contractor' | 'Claims Team';
  triggerReason: string; // e.g. "Survey report pending 12 days"
  daysPending: number;
  lastSentDate: string;
  status: 'Urgent' | 'Pending' | 'Sent';
}

// Module 8: Intelligent ML Assessment Types
export interface MLPrediction {
  claimId: string;
  benchmarkClaimsCount: number; // e.g. 124
  expectedSettlementPercent: number; // e.g. 87%
  expectedDurationDays: number; // e.g. 142
  probabilityOfRepudiationPercent: number; // e.g. 4%
  expectedSurveyQueries: string[];
  idealNegotiationStrategy: string;
}

