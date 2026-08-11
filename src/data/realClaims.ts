// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAPLE HIGHWAYS â€“ Real Claims Registry
// Source: Consolidated MIS Â· Alliance / Gallagher / Marsh / WTW
// 581 claims Â· As of Aug 2026 Â· Parsed from MAPLE HIGHWAYS - Master Data.md
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { REAL_MASTER_CLAIMS } from './masterClaimsData';

export type RealClaimStatus =
  | 'Settled'
  | 'Open - Documents Pending'
  | 'Open - For Settlement'
  | 'Open - Consent/Approval Awaited'
  | 'Open - Assessment Pending'
  | 'Open - With Insured'
  | 'Open - With Insurer'
  | 'Open - Payment Process'
  | 'Open - Intimated'
  | 'Open - Other'
  | 'Closed - No Pay'
  | 'Closed - Below Excess'
  | 'Withdrawn';

export type RealBroker = 'Marsh' | 'Gallagher' | 'WTW' | 'Alliance';
export type RealEntity = 'PPE' | 'JPP';

export interface RealClaim {
  id: string;
  broker: RealBroker;
  entity: RealEntity;
  highway: string;
  insurer: string;
  policy: string;
  assetCategory: string;
  natureOfLoss: string;
  claimAmtInr: number | null;
  netSettledInr: number | null;
  deductibleInr: number | null;
  surveyor: string | null;
  status: RealClaimStatus;
  dateOfLoss: string | null;
  dateOfIntimation: string | null;
  intimationLagDays: number | null;
  settlementTATDays: number | null;
  location: string | null;
  remarks: string | null;
}

export const REAL_CLAIMS: RealClaim[] = REAL_MASTER_CLAIMS.map(c => ({
  id: c.id,
  broker: (c.broker as RealBroker) || 'Alliance',
  entity: (c.entity as RealEntity) || 'JPP',
  highway: c.highway,
  insurer: c.insurer || 'Undisclosed',
  policy: c.policyType || c.policyNo || 'Package Policy',
  assetCategory: c.assetCategory || 'Road Infrastructure',
  natureOfLoss: c.natureCategory || 'Accidental / Vehicle Hit',
  claimAmtInr: c.claimAmount ?? null,
  netSettledInr: c.netSettled ?? null,
  deductibleInr: c.excess ?? null,
  surveyor: c.surveyor || null,
  status: (c.statusCategory as RealClaimStatus) || 'Open - Other',
  dateOfLoss: c.dateOfLoss || null,
  dateOfIntimation: c.dateOfIntimation || null,
  intimationLagDays: c.intimationLagDays ?? null,
  settlementTATDays: c.settlementTATDays ?? null,
  location: c.lossLocation || c.location || null,
  remarks: c.remarks || c.documentsPending || null,
}));

export const UNIQUE_BROKERS: RealBroker[] = ['Marsh', 'Gallagher', 'WTW', 'Alliance'];
export const UNIQUE_ENTITIES: RealEntity[] = ['PPE', 'JPP'];
export const UNIQUE_INSURERS = ['ITGI', 'The Oriental Insurance', 'RGI', 'Undisclosed'];
export const UNIQUE_ASSET_CATEGORIES = [
  'MBCB / Crash Barrier', 'Equipment / VMS', 'Street Light', 'Fencing',
  'Solar Plant', 'Toll Booth', 'Transformer', 'Other',
];
export const UNIQUE_NATURES = [
  'Accidental / Vehicle Hit', 'Theft / Burglary', 'AOG / Storm', 'Fire', 'Other',
];
export const ALL_STATUSES: RealClaimStatus[] = [
  'Settled', 'Open - Documents Pending', 'Open - For Settlement',
  'Open - Consent/Approval Awaited', 'Open - Assessment Pending',
  'Open - With Insured', 'Open - With Insurer', 'Open - Payment Process',
  'Open - Intimated', 'Open - Other', 'Closed - No Pay', 'Closed - Below Excess', 'Withdrawn',
];

