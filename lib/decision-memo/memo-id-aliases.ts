export const DXB_SG_PENTHOUSE_CANONICAL_ID = 'dm64-dxb-sg-penthouse-20260612';
export const DXB_SG_PENTHOUSE_PUBLIC_ID = 'HC7X4M9Q2R6A8';

const ALIAS_TO_CANONICAL: Record<string, string> = {
  [DXB_SG_PENTHOUSE_PUBLIC_ID.toLowerCase()]: DXB_SG_PENTHOUSE_CANONICAL_ID,
};

const CANONICAL_TO_PUBLIC: Record<string, string> = {
  [DXB_SG_PENTHOUSE_CANONICAL_ID.toLowerCase()]: DXB_SG_PENTHOUSE_PUBLIC_ID,
};

export function resolveCanonicalDecisionMemoId(intakeId: string): string {
  const normalized = intakeId.trim();
  return ALIAS_TO_CANONICAL[normalized.toLowerCase()] ?? normalized;
}

export function resolvePublicDecisionMemoId(intakeId: string): string {
  const normalized = intakeId.trim();
  return CANONICAL_TO_PUBLIC[normalized.toLowerCase()] ?? normalized;
}

export function resolveDecisionMemoDisplayReference(intakeId: string): string {
  const normalized = intakeId.trim();
  if (normalized === 'fo_audit_ANda3ViU7-QF') {
    return 'NDA3VIU7-QF';
  }

  const reportId = normalized.replace(/^fo_audit_/i, '') || normalized;
  return resolvePublicDecisionMemoId(reportId).toUpperCase();
}

export function encodeDecisionMemoIdForPath(intakeId: string): string {
  return encodeURIComponent(intakeId.trim());
}

export function resolvePublicDecisionMemoPath(pathname: string): string | null {
  const patterns = [
    /^\/decision-memo\/audit\/([^/?#]+)(.*)$/i,
    /^\/decision-memo-print\/([^/?#]+)(.*)$/i,
  ];

  for (const pattern of patterns) {
    const match = pathname.match(pattern);
    if (!match) continue;

    const currentId = match[1];
    const publicId = resolvePublicDecisionMemoId(currentId);
    if (publicId === currentId) {
      return null;
    }

    return pathname.replace(currentId, encodeDecisionMemoIdForPath(publicId));
  }

  return null;
}
