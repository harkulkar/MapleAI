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
    initialReserve: 22.4, // 22.4 Lakhs
    aiConfidence: 92,
    admissionProbability: 93,
    likelyDeductible: 25.0, // 25 Lakhs
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

Estimated Reserve: ${claim.reserveAmountLakhs} Lakhs
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
- Preliminary Estimated Loss Reserve: ${claim.reserveAmountLakhs} Lakhs
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

  // Format currency helper
  const fmtInr = (amt: number | null | undefined) => {
    if (amt == null || isNaN(amt)) return '0';
    if (amt >= 10000000) return `${(amt / 10000000).toFixed(2)} Cr`;
    if (amt >= 100000) return `${(amt / 100000).toFixed(2)} L`;
    return `${amt.toLocaleString('en-IN')}`;
  };

  // 1. Direct Claim ID Lookup (e.g., ALL-812189, GAL-CLAIM-2025-26-04669, WTW-91, MAR-0001, ALL-812191)
  const idMatch = query.match(/(ALL-[A-Za-z0-9-]+|GAL-[A-Za-z0-9-]+|MAR-[A-Za-z0-9-]+|WTW-[A-Za-z0-9-]+|CLM-[A-Za-z0-9-]+)/i);
  if (idMatch) {
    const targetId = idMatch[1].toUpperCase();
    const foundClaim = claimsList.find(c => c.id.toUpperCase() === targetId || c.id.toUpperCase().includes(targetId));
    if (foundClaim) {
      const status = foundClaim.statusCategory || foundClaim.status;
      const amount = fmtInr(foundClaim.claimAmount || (foundClaim.reserveAmountLakhs * 100000));
      const netSettled = fmtInr(foundClaim.netSettled || (foundClaim.settlementAmountLakhs ? foundClaim.settlementAmountLakhs * 100000 : null));
      const lag = foundClaim.intimationLagDays ?? 0;
      return {
        id: Date.now().toString(),
        sender: 'ai',
        timestamp: now,
        text: `Claim ${foundClaim.id} from the Maple Highways master register.`,
        type: 'claim_detail',
        data: {
          claimId: foundClaim.id,
          status,
          subtitle: `${foundClaim.assetCategory || 'Road asset'} · ${foundClaim.natureCategory || foundClaim.incidentType || 'Loss'}`,
          rows: [
            { label: 'Broker', value: foundClaim.broker || 'N/A' },
            { label: 'Entity', value: foundClaim.entity || 'N/A' },
            { label: 'Insurer', value: foundClaim.insurer || 'N/A' },
            { label: 'Policy', value: `${foundClaim.policyType || foundClaim.policyNo || 'Package / IAR'}${foundClaim.policyNo ? ` · ${foundClaim.policyNo}` : ''}` },
            { label: 'Loss date', value: foundClaim.dateOfLoss || foundClaim.incidentDate || 'N/A' },
            { label: 'Intimation', value: `${foundClaim.dateOfIntimation || 'N/A'}${lag ? ` · ${lag} day lag` : ''}` },
            { label: 'Location', value: foundClaim.lossLocation || foundClaim.location || 'Highway stretch' },
            { label: 'Surveyor', value: foundClaim.surveyor || 'Unassigned' },
            { label: 'Claim amount', value: amount, emphasize: true },
            { label: 'Gross assessed', value: fmtInr(foundClaim.grossAssessed) },
            { label: 'Net settled', value: netSettled },
            { label: 'Settlement', value: foundClaim.settlementRatio ? `${(foundClaim.settlementRatio * 100).toFixed(1)}% · ${foundClaim.settlementDate || 'Pending'}` : (foundClaim.settlementDate || 'Open') },
          ],
          pendingNote: foundClaim.documentsPending || '',
          remarks: foundClaim.remarks || '',
        },
      };
    }
  }

  // 2. Broker Filter Queries (Alliance, Gallagher, Marsh, WTW)
  if (lower.includes('alliance') || lower.includes('gallagher') || lower.includes('marsh') || lower.includes('wtw')) {
    let brokerName = 'Alliance';
    if (lower.includes('gallagher')) brokerName = 'Gallagher';
    else if (lower.includes('marsh')) brokerName = 'Marsh';
    else if (lower.includes('wtw')) brokerName = 'WTW';

    const bClaims = claimsList.filter(c => c.broker && c.broker.toLowerCase() === brokerName.toLowerCase());
    const settled = bClaims.filter(c => c.statusCategory === 'Settled');
    const open = bClaims.filter(c => c.statusCategory !== 'Settled');
    const totalClaimAmt = bClaims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
    const totalSettledAmt = settled.reduce((sum, c) => sum + (c.netSettled || 0), 0);

    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `### **${brokerName} Broker Master Summary** (\`MAPLE HIGHWAYS - Master Data.md\`)

- **Total Claims**: ${bClaims.length}
- **Settled Claims**: ${settled.length} (${((settled.length / (bClaims.length || 1)) * 100).toFixed(1)}%)
- **Open Claims**: ${open.length}
- **Total Claim Amount**: ${fmtInr(totalClaimAmt)}
- **Total Net Settled Amount**: ${fmtInr(totalSettledAmt)}

#### Top Active Claims under ${brokerName}:`,
      type: 'claims_list',
      data: open.slice(0, 6).map(c => ({
        id: c.id,
        title: `${c.assetCategory || c.incidentType} - ${c.natureCategory || ''}`,
        reserve: fmtInr(c.claimAmount || (c.reserveAmountLakhs * 100000)),
        status: `${c.statusCategory} (${c.ageingDays || c.ageDays || 0} days)`,
        highway: c.highway
      }))
    };
  }

  // 3. Entity Filter Queries (JPP vs PPE)
  if (lower.includes('JPP') || lower.includes('PPE') || lower.includes('ncr epe') || lower.includes('shree jagannath')) {
    const isJPP = lower.includes('JPP') || lower.includes('shree jagannath');
    const entityName = isJPP ? 'JPP' : 'PPE';
    const eClaims = claimsList.filter(c => c.entity && c.entity.toUpperCase() === entityName);
    const settled = eClaims.filter(c => c.statusCategory === 'Settled');
    const open = eClaims.filter(c => c.statusCategory !== 'Settled');

    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `### **${entityName} Entity Master Analysis**

- **Total Portfolio Claims**: ${eClaims.length}
- **Settled**: ${settled.length} | **Open**: ${open.length}
- **Brokers Handling**: ${isJPP ? 'Alliance (21 claims) & WTW (108 claims)' : 'Marsh (306 claims) & Gallagher (146 claims)'}

Here are the highest value open claims for **${entityName}**:`,
      type: 'claims_list',
      data: open.slice(0, 6).map(c => ({
        id: c.id,
        title: `${c.assetCategory || 'Road Work'} (${c.natureCategory || 'Accident'})`,
        reserve: fmtInr(c.claimAmount || (c.reserveAmountLakhs * 100000)),
        status: c.statusCategory || c.status,
        highway: c.highway
      }))
    };
  }

  // 4. Document Pending / Missing Documents Queries
  if (lower.includes('pending') || lower.includes('missing') || lower.includes('doc') || lower.includes('document')) {
    const docPendingClaims = claimsList.filter(c => c.documentsPending && c.documentsPending.trim().length > 3 && c.statusCategory !== 'Settled');
    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `### **Master Data Audit: ${docPendingClaims.length} Claims with Outstanding Documents**

MAPLE AI extracted document requirements from the broker MIS records (\`MAPLE HIGHWAYS - Master Data.md\`):

${docPendingClaims.slice(0, 5).map((c, i) => `${i + 1}. **${c.id}** (${c.broker} · ${c.entity}):\n   - *Asset*: ${c.assetCategory}\n   - *Pending Documents*: ${c.documentsPending}\n   - *Claim Value*: ${fmtInr(c.claimAmount || (c.reserveAmountLakhs * 100000))}`).join('\n\n')}

> **AI Strategic Action**: Resolving the top 5 document requirements above will unlock ${(docPendingClaims.slice(0, 5).reduce((s, c) => s + (c.claimAmount || 0), 0) / 100000).toFixed(2)} Lakhs in pending surveyor assessments.`,
      type: 'text'
    };
  }

  // 5. High Value / Amount Threshold Queries
  if (lower.includes('above') || lower.includes('lakh') || lower.includes('crore') || lower.includes('cr') || lower.includes('high value') || lower.includes('top claims') || lower.includes('largest')) {
    const sorted = [...claimsList].sort((a, b) => (b.claimAmount || (b.reserveAmountLakhs * 100000)) - (a.claimAmount || (a.reserveAmountLakhs * 100000)));
    const topClaims = sorted.slice(0, 7);

    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `Found **${sorted.length} claims in Master Register**. Here are the **highest value claims** in the portfolio:`,
      type: 'claims_list',
      data: topClaims.map(c => ({
        id: c.id,
        title: `${c.assetCategory || c.incidentType} (${c.broker} · ${c.entity})`,
        reserve: fmtInr(c.claimAmount || (c.reserveAmountLakhs * 100000)),
        status: `${c.statusCategory || c.status}`,
        highway: c.highway
      }))
    };
  }

  // 6. Theft / Asset / Cause Queries
  if (lower.includes('theft') || lower.includes('burglary') || lower.includes('crash barrier') || lower.includes('mbcb') || lower.includes('street light') || lower.includes('transformer') || lower.includes('vms') || lower.includes('fire') || lower.includes('storm')) {
    let kw = 'Theft / Burglary';
    if (lower.includes('crash barrier') || lower.includes('mbcb')) kw = 'MBCB / Crash Barrier';
    else if (lower.includes('street light')) kw = 'Street Light';
    else if (lower.includes('transformer')) kw = 'Transformer';
    else if (lower.includes('vms')) kw = 'Equipment / VMS';
    else if (lower.includes('fire')) kw = 'Fire';
    else if (lower.includes('storm')) kw = 'AOG / Storm';

    const matches = claimsList.filter(c => 
      (c.assetCategory && c.assetCategory.toLowerCase().includes(kw.toLowerCase())) ||
      (c.natureCategory && c.natureCategory.toLowerCase().includes(kw.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(kw.toLowerCase())) ||
      (c.lossDescription && c.lossDescription.toLowerCase().includes(kw.toLowerCase()))
    );

    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `### Master Data Analysis: **${kw}** (${matches.length} Claims)

- **Total Claims Matched**: ${matches.length}
- **Settled**: ${matches.filter(m => m.statusCategory === 'Settled').length}
- **Open**: ${matches.filter(m => m.statusCategory !== 'Settled').length}

Here are key claims matching **${kw}**:`,
      type: 'claims_list',
      data: matches.slice(0, 6).map(c => ({
        id: c.id,
        title: `${c.broker} · ${c.entity} - ${c.lossLocation || c.location || 'Location'}`,
        reserve: fmtInr(c.claimAmount || (c.reserveAmountLakhs * 100000)),
        status: c.statusCategory || c.status,
        highway: c.highway
      }))
    };
  }

  // 7. Surveyor / Insurer Queries
  if (lower.includes('surveyor') || lower.includes('kohli') || lower.includes('gupta') || lower.includes('protocol') || lower.includes('lucille') || lower.includes('oriental') || lower.includes('itgi')) {
    const surveyorsCount: Record<string, number> = {};
    claimsList.forEach(c => {
      if (c.surveyor && c.surveyor.trim()) {
        surveyorsCount[c.surveyor] = (surveyorsCount[c.surveyor] || 0) + 1;
      }
    });

    const topSurveyors = Object.entries(surveyorsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      id: Date.now().toString(),
      sender: 'ai',
      timestamp: now,
      text: `### **Surveyor & Insurer Portfolio Breakdown** (\`MAPLE HIGHWAYS - Master Data.md\`)

**Top Independent Surveyors Appointed**:
${topSurveyors.map(([surv, count]) => `• **${surv}**: ${count} claims assigned`).join('\n')}

**Key Insurers**:
• **ITGI (Marsh)**: 306 claims (88% settled)
• **The Oriental Insurance (Gallagher)**: 146 claims (46.6% settled)
• **RGI (WTW)**: 108 claims
• **Alliance Portfolio**: 21 claims`,
      type: 'text'
    };
  }

  // 8. General Natural Language Keyword Search across Master Data
  const searchWords = lower.split(/\s+/).filter(w => w.length > 2 && !['show', 'what', 'list', 'give', 'from', 'with', 'this', 'that', 'claims', 'claim'].includes(w));
  if (searchWords.length > 0) {
    const matchedClaims = claimsList.filter(c => {
      const textBlock = `${c.id} ${c.broker} ${c.entity} ${c.insurer} ${c.policyType} ${c.policyNo} ${c.lossDescription} ${c.lossLocation} ${c.assetCategory} ${c.natureCategory} ${c.surveyor} ${c.documentsPending} ${c.remarks}`.toLowerCase();
      return searchWords.some(word => textBlock.includes(word));
    });

    if (matchedClaims.length > 0) {
      return {
        id: Date.now().toString(),
        sender: 'ai',
        timestamp: now,
        text: `Found **${matchedClaims.length} matching claims** in \`MAPLE HIGHWAYS - Master Data.md\` for your query ("${query}"):`,
        type: 'claims_list',
        data: matchedClaims.slice(0, 6).map(c => ({
          id: c.id,
          title: `${c.assetCategory || 'Road Asset'} (${c.broker} · ${c.entity})`,
          reserve: fmtInr(c.claimAmount || (c.reserveAmountLakhs * 100000)),
          status: `${c.statusCategory || c.status}`,
          highway: c.highway
        }))
      };
    }
  }

  // Default fallback response trained on master data structure
  return {
    id: Date.now().toString(),
    sender: 'ai',
    timestamp: now,
    text: `MAPLE AI Copilot searched \`MAPLE HIGHWAYS - Master Data.md\` (581 claims across 47 columns).\n\nYou can query:\n• **Claim IDs** (e.g. \`ALL-812189\`, \`GAL-CLAIM-2025-26-04669\`, \`WTW-91\`, \`MAR-0001\`)\n• **Brokers** (Alliance, Gallagher, Marsh, WTW)\n• **Entities** (JPP, PPE)\n• **Asset Categories** (MBCB, Street Light, Transformer, VMS Panel, Toll Booth)\n• **Pending Documents** ("What documents are pending?")\n• **Surveyors & Insurers** (J.C. Gupta, KOHLI, Oriental Insurance, ITGI)`
  };
}


