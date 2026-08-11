import type { Claim, PortfolioMetrics } from '../types/claims';
import { REAL_MASTER_CLAIMS } from './masterClaimsData';

export { REAL_MASTER_CLAIMS };

export const MOCK_CLAIMS: Claim[] = REAL_MASTER_CLAIMS;

// Dynamically calculated initial metrics from 581 real claims
const totalClaimsCount = REAL_MASTER_CLAIMS.length;
const openClaimsList = REAL_MASTER_CLAIMS.filter(c => c.openFlag === 'Open' || (c.statusCategory && c.statusCategory.startsWith('Open')));
const settledClaimsList = REAL_MASTER_CLAIMS.filter(c => c.statusCategory === 'Settled');

const totalReserveVal = openClaimsList.reduce((acc, c) => acc + (c.claimAmount || (c.reserveAmountLakhs * 100000) || 0), 0);
const settledVal = settledClaimsList.reduce((acc, c) => acc + (c.netSettled || (c.settlementAmountLakhs ? c.settlementAmountLakhs * 100000 : 0) || 0), 0);

const tatList = REAL_MASTER_CLAIMS.filter(c => c.settlementTATDays && c.settlementTATDays > 0).map(c => c.settlementTATDays as number);
const avgTat = tatList.length > 0 ? Math.round(tatList.reduce((a, b) => a + b, 0) / tatList.length) : 135;

export const INITIAL_METRICS: PortfolioMetrics = {
  openClaims: openClaimsList.length,
  totalReserveCr: parseFloat((totalReserveVal / 10000000).toFixed(2)),
  pendingAction: openClaimsList.filter(c => c.statusCategory === 'Open - Documents Pending' || c.statusCategory === 'Open - Assessment Pending').length,
  settledThisYearCr: parseFloat((settledVal / 10000000).toFixed(2)),
  avgSettlementDays: avgTat,
  claimRatioPercent: Math.round((settledClaimsList.length / totalClaimsCount) * 100),
};

