import {
  DXB_SG_PENTHOUSE_CANONICAL_ID,
  DXB_SG_PENTHOUSE_PUBLIC_ID,
  encodeDecisionMemoIdForPath,
  resolveCanonicalDecisionMemoId,
  resolveDecisionMemoDisplayReference,
  resolvePublicDecisionMemoId,
  resolvePublicDecisionMemoPath,
} from '@/lib/decision-memo/memo-id-aliases';

describe('decision memo id aliases', () => {
  it('maps the DXB-SG public id to the canonical backend id', () => {
    expect(resolveCanonicalDecisionMemoId(DXB_SG_PENTHOUSE_PUBLIC_ID)).toBe(
      DXB_SG_PENTHOUSE_CANONICAL_ID,
    );
    expect(resolvePublicDecisionMemoId(DXB_SG_PENTHOUSE_CANONICAL_ID)).toBe(
      DXB_SG_PENTHOUSE_PUBLIC_ID,
    );
  });

  it('uses stable report references for canonical and legacy memo ids', () => {
    expect(resolveDecisionMemoDisplayReference(DXB_SG_PENTHOUSE_CANONICAL_ID)).toBe(
      DXB_SG_PENTHOUSE_PUBLIC_ID,
    );
    expect(resolveDecisionMemoDisplayReference('fo_audit_ANda3ViU7-QF')).toBe('NDA3VIU7-QF');
  });

  it('redirects canonical audit and print URLs to public ids', () => {
    expect(resolvePublicDecisionMemoPath(`/decision-memo/audit/${DXB_SG_PENTHOUSE_CANONICAL_ID}`)).toBe(
      `/decision-memo/audit/${DXB_SG_PENTHOUSE_PUBLIC_ID}`,
    );
    expect(resolvePublicDecisionMemoPath(`/decision-memo-print/${DXB_SG_PENTHOUSE_CANONICAL_ID}`)).toBe(
      `/decision-memo-print/${DXB_SG_PENTHOUSE_PUBLIC_ID}`,
    );
    expect(resolvePublicDecisionMemoPath(`/decision-memo/audit/${DXB_SG_PENTHOUSE_PUBLIC_ID}`)).toBeNull();
  });

  it('encodes ids before placing them in path segments', () => {
    expect(encodeDecisionMemoIdForPath('demo id/with slash')).toBe('demo%20id%2Fwith%20slash');
  });
});
