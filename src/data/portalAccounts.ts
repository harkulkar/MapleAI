import type { UserRole } from '../types/portal';

export type PortalAccount = {
  role: UserRole;
  email: string;
  password: string;
  label: string;
};

export const PORTAL_ACCOUNTS: PortalAccount[] = [
  {
    role: 'claims-manager',
    email: 'manager@maplehighways.in',
    password: 'MapleManager@26',
    label: 'Claims Manager',
  },
  {
    role: 'surveyor',
    email: 'surveyor@maplehighways.in',
    password: 'MapleSurveyor@26',
    label: 'Surveyor',
  },
];

export function authenticatePortal(email: string, password: string, expectedRole: UserRole) {
  const normalisedEmail = email.trim().toLowerCase();
  const account = PORTAL_ACCOUNTS.find(
    (item) => item.email.toLowerCase() === normalisedEmail && item.password === password
  );

  if (!account) {
    return { ok: false as const, error: 'Invalid email or password for this portal.' };
  }

  if (account.role !== expectedRole) {
    return {
      ok: false as const,
      error: `These credentials belong to the ${account.label} portal.`,
    };
  }

  return { ok: true as const, role: account.role };
}
