import type { Claim, AIAssessment, CopilotMessage, MLPrediction, KnowledgeDoc } from '../types/claims';

export interface IncidentInput {
  incidentDate: string;
  incidentTime: string;
  highway: string;
  roadName: string;
  chainage: string;
  direction: string;
  concessionaire: string;
  location: string;
  weather: string;
  incidentType: string;
  severity: string;
  description: string;
  photos: File[];
  gpsCoordinates?: string;
}

export const AI_ANALYSIS_STEPS = [
  'Extracting OCR text & metadata...',
  'Analyzing photographs & damage vectors...',
  'Processing GPS coordinates & GIS alignment...',
  'Checking weather logs & IMD station data...',
  'Parsing policy clauses, endorsements & deductibles...',
  'Cross-referencing Concession Agreement terms...',
  'Benchmarking 124 historical road loss claims...',
  'Calculating preliminary reserve & admission probability...'
];

export async function runAIIncidentAnalysis(input: IncidentInput): Promise<AIAssessment> {
  return {
    possibleDamage: ['Road Shoulder', 'Crash Barrier', 'Pavement Erosion', 'Median Slope Washout'],
    likelyCause: 'Heavy Rainfall / Flooding',
    likelyPolicy: 'Industrial All Risk (IAR) Policy',
    estimatedSeverity: 'Medium',
    initialReserve: 22.4, // ₹22.4 Lakhs
    aiConfidence: 92,
    admissionProbability: 93,
    likelyDeductible: 25.0, // ₹25 Lakhs
    missingEvidence: [
      'IMD Station Rainfall Confirmation Report',
      'Pre-monsoon Maintenance Register & Desilting Logs',
      'Pre-loss Photographs (Q1 Inspection Archive)',
      'Site Measurement Book (MB Entry)',
      'Contractor Work Invoice',
      'Daily Progress Report (DPR)',
      'FIR Copy (if third-party impact)'
    ],
    recommendation: 'Notify the insurer and appoint a surveyor immediately. Collate rainfall confirmation and maintenance registers before surveyor site assessment.',
    potentialObjections: [
      'Insurer may request pre-monsoon maintenance registers to verify slope stability routine upkeep.',
      'Rainfall intensity certification from IMD required to establish unseasonal flash flooding event.',
      'Pre-loss photographic evidence required to differentiate historical wear from immediate storm washout.',
      'Contractor invoice and MB entries needed before final loss adjustment approval.'
    ]
  };
}

export function getMLPredictionForClaim(claimId: string): MLPrediction {
  return {
    claimId,
    benchmarkClaimsCount: 124,
    expectedSettlementPercent: 87, // 87% expected settlement
    expectedDurationDays: 142, // 142 days expected duration
    probabilityOfRepudiationPercent: 4,
    expectedSurveyQueries: [
      'Official IMD Certified Rainfall Data for Baghpat station',
      'Pre-monsoon Drainage Desilting & Maintenance Register (May 2026)',
      'As-Built Drawings for Highway Shoulder Retaining Walls',
      'Drone Aerial Survey Footage of Flooded Stretch',
      'Contractor Rate Approval & Measurement Book Entries'
    ],
    idealNegotiationStrategy: 'Submit pre-monsoon maintenance logs alongside IMD rainfall intensity records during interim survey. Pre-emptively calculate sub-grade erosion quantities to prevent 15% wear-and-tear depreciation deduction by surveyor.'
  };
}

export function generateSurveyorEmail(claim: Claim): { subject: string; body: string } {
  return {
    subject: `URGENT: Appointment of Independent Surveyor for Claim ${claim.id} - ${claim.highway} (Ch ${claim.chainage})`,
    body: `Dear Sir / Madam,

RE: INTIMATION OF MONSOON DAMAGE & SURVEYOR DEPUTATION
Claim Reference: ${claim.id}
Concessionaire: ${claim.concessionaire || 'Maple Highways Infrastructure Ltd'}
Location: ${claim.highway}, Chainage ${claim.chainage} (${claim.location})
Policy No: IAR-2025/MAPLE-088 (Industrial All Risk Policy)
Date of Incident: ${claim.incidentDate} at ${claim.incidentTime}

We hereby intimate a material flood/heavy rainfall loss event occurring on ${claim.incidentDate} at Chainage ${claim.chainage} along the ${claim.highway}. 

Preliminary AI Assessment indicates erosion damage to:
- Road Shoulder Structure
- W-Beam Crash Barriers
- Bituminous Pavement Surfacing
- Central Median Earthworks & Slope

Estimated Reserve: ₹${claim.reserveAmountLakhs} Lakhs
Likely Event Cause: Heavy Rainfall / Water Inundation

We request you to kindly depute an independent surveyor immediately to conduct joint site inspection. Preliminary photos, field report, and incident details are attached.

Rainfall confirmation from IMD and pre-event maintenance registers are being collated for survey verification.

Yours faithfully,

Claims Department
Maple Highways Infrastructure Ltd
Contact: claims@maplehighways.in | +91 11 4988 2000`
  };
}

export function generateInsurerEmail(claim: Claim): { subject: string; body: string } {
  return {
    subject: `CLAIM INTIMATION NOTICE: ${claim.id} | ${claim.highway} | Heavy Rainfall Loss`,
    body: `To,
The Head of Claims
United India Insurance Co. Ltd.
Corporate Division - Large Risks

Dear Sirs,

SUBJECT: FORMAL CLAIM INTIMATION - ${claim.id}
POLICY: INDUSTRIAL ALL RISK (POLICY NO: IAR-2025/MAPLE-088)

We formally register claim ${claim.id} for storm/flood damages incurred at ${claim.highway}, Chainage ${claim.chainage}.

INCIDENT SUMMARY:
- Date & Time: ${claim.incidentDate}, ${claim.incidentTime}
- Location: ${claim.highway} (Km ${claim.chainage})
- Cause: Unseasonal torrential rainfall & water accumulation
- Preliminary Estimated Loss Reserve: ₹${claim.reserveAmountLakhs} Lakhs
- Claim Admission Probability: ${claim.aiAssessment?.admissionProbability || 93}%

We request early issuance of claim registration number and formal surveyor deputation details.

Attached: Initial Damage Assessment Sheet & Site Photographs.

Warm regards,

Claims Manager
Maple Highways Infrastructure Ltd`
  };
}

export function processCopilotQuery(query: string, claimsList: Claim[]): CopilotMessage {
  const lower = query.toLowerCase().trim();
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Show claims pending over 90 days
  if (lower.includes('90 days') || lower.includes('pending over 90') || lower.includes('delayed claims')) {
    const delayed = claimsList.filter(c => c.ageDays > 90 && c.status !== 'Settled');
    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `I identified **${delayed.length} active claims pending over 90 days** in the portfolio:`,
      type: 'claims_list',
      data: delayed.map(c => ({
        id: c.id,
        title: `${c.code} ${c.incidentType}`,
        reserve: c.reserveAmountLakhs >= 100 ? `₹${(c.reserveAmountLakhs / 100).toFixed(2)} Cr` : `₹${c.reserveAmountLakhs} L`,
        status: `${c.status} (${c.ageDays} days old)`,
        highway: c.highway
      }))
    };
  }

  // 2. What documents are pending from us?
  if (lower.includes('pending from us') || lower.includes('what documents are pending') || lower.includes('missing docs from us')) {
    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `MAPLE AI audited all active claims. Here are the **top priority document submissions pending from Maple Highways**:`,
      type: 'missing_docs',
      data: {
        claimId: 'CLM-2026-00124 & CLM-2026-00112',
        items: [
          'IMD Certified Rainfall Confirmation (CLM-2026-00124)',
          'Pre-monsoon Highway Maintenance Register (CLM-2026-00124)',
          'Hydrological Bathymetry Survey (CLM-2026-00112)',
          'Contractor Site Measurement Book MB-2026/04 (CLM-2026-00124)'
        ],
        keyAction: 'Submitting IMD rainfall records and maintenance registers before survey assessment increases claim admission speed by 35%.'
      }
    };
  }

  // 3. Claims above 5 Crores
  if (lower.includes('5 cr') || lower.includes('5 crore') || lower.includes('above 5') || lower.includes('above ₹5')) {
    const highValue = claimsList.filter(c => c.reserveAmountLakhs >= 500);
    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `I found ${highValue.length} high-value claims above ₹5 Crores in your portfolio:`,
      type: 'claims_list',
      data: highValue.map(c => ({
        id: c.id,
        title: `${c.code} ${c.incidentType}`,
        reserve: `₹${(c.reserveAmountLakhs / 100).toFixed(2)} Cr`,
        status: c.status,
        highway: c.highway
      }))
    };
  }

  // 4. Flood claims above 1 Crore
  if (lower.includes('flood claims above') || lower.includes('previous flood claims') || lower.includes('1 crore')) {
    const floodHigh = claimsList.filter(c => 
      c.reserveAmountLakhs >= 100 &&
      (c.incidentType.toLowerCase().includes('flood') || 
       c.incidentType.toLowerCase().includes('rainfall') ||
       c.weather.toLowerCase().includes('rain'))
    );
    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `Found **${floodHigh.length} previous flood & monsoon claims above ₹1 Crore**:`,
      type: 'claims_list',
      data: floodHigh.map(c => ({
        id: c.id,
        title: `${c.code} - ${c.incidentType}`,
        reserve: `₹${(c.reserveAmountLakhs / 100).toFixed(2)} Cr`,
        status: c.status,
        highway: c.highway
      }))
    };
  }

  // 5. Missing documents for CLM-2026-00124
  if (lower.includes('clm-2026-00124') && lower.includes('missing')) {
    const claim = claimsList.find(c => c.id === 'CLM-2026-00124') || claimsList[0];
    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `For claim **${claim.id}** (${claim.highway} Heavy Rainfall Damage), MAPLE AI identified **4 outstanding evidence items**:`,
      type: 'missing_docs',
      data: {
        claimId: claim.id,
        items: claim.aiAssessment.missingEvidence.slice(0, 4),
        keyAction: 'The most critical immediate action is to obtain official rainfall confirmation from IMD before the surveyor site assessment.'
      }
    };
  }

  // 6. Likely deductible
  if (lower.includes('deductible') || lower.includes('policy excess')) {
    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `Based on Policy terms under Industrial All Risk (IAR-2025/MAPLE-088):\n\n• **Likely Policy Deductible**: ₹25 Lakhs (or 5% of claim value for flood perils).\n• **Initial Claim Reserve**: ₹22.4 Lakhs.\n\n*Strategic AI Advice*: Because initial loss estimate (₹22.4L) is close to the ₹25L deductible, collate sub-surface asphalt damage and slope earthwork costs to ensure full reserve realization above deductible.`
    };
  }

  // 7. Draft email to surveyor
  if (lower.includes('email') || lower.includes('surveyor') || lower.includes('draft email')) {
    const claim = claimsList.find(c => c.id === 'CLM-2026-00124') || claimsList[0];
    const emailDraft = generateSurveyorEmail(claim);
    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `I have drafted an email for deputing the independent surveyor for **${claim.id}**:`,
      type: 'email_preview',
      data: emailDraft
    };
  }

  // Default fallback answer
  return {
    id: Date.now().toString(),
    sender: 'ai',
    timestamp: now,
    text: `MAPLE AI Copilot analyzed your query ("${query}").\n\nI indexed 47 active claims, 124 benchmark historical claims, and all corporate/legal contracts. Try selecting one of the suggested query chips above.`
  };
}
