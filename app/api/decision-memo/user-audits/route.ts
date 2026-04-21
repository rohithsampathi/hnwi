// API route to fetch user's decision memo audits — proxies to backend /my-memos
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';
import { getAnyReportAuthTokenFromRequest } from '@/lib/security/report-auth';

type FrontendAudit = {
  intake_id: string;
  source_jurisdiction: string;
  destination_jurisdiction: string;
  source_country: string;
  destination_country: string;
  source_coordinates: any;
  destination_coordinates: any;
  created_at: string;
  updated_at?: string;
  type: string;
  value: string;
  summary: string;
  status: string;
  is_paid: boolean;
  verdict: string;
  risk_level: string;
  total_exposure: string;
  total_savings: string;
  annual_value: string;
  exposure_class: string;
  transaction_value: string;
  has_access: boolean;
};

function auditRichnessScore(audit: FrontendAudit): number {
  const weightedFields = [
    audit.summary,
    audit.verdict,
    audit.risk_level,
    audit.total_exposure,
    audit.total_savings,
    audit.annual_value,
    audit.transaction_value,
    audit.value,
  ];
  return weightedFields.reduce((score, field) => score + (field ? 1 : 0), 0) + (audit.has_access ? 4 : 0);
}

function corridorKey(audit: FrontendAudit): string {
  const source = String(audit.source_jurisdiction || audit.source_country || '').trim().toLowerCase();
  const destination = String(audit.destination_jurisdiction || audit.destination_country || '').trim().toLowerCase();
  return [source, destination].join('::');
}

function normalizedAuditText(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function auditVariantKey(audit: FrontendAudit): string {
  const corridor = corridorKey(audit);
  const type = normalizedAuditText(audit.type);
  const anchorValue = normalizedAuditText(
    audit.transaction_value || audit.value || audit.total_exposure || audit.annual_value,
  );
  const summaryFallback = normalizedAuditText(audit.summary).slice(0, 80);
  return [corridor, type, anchorValue || summaryFallback].join('::');
}

function freshnessTimestamp(audit: FrontendAudit): number {
  const updatedAt = Date.parse(audit.updated_at || '');
  if (Number.isFinite(updatedAt)) {
    return updatedAt;
  }

  const createdAt = Date.parse(audit.created_at || '');
  return Number.isFinite(createdAt) ? createdAt : Number.NEGATIVE_INFINITY;
}

function shouldReplaceAudit(existing: FrontendAudit, next: FrontendAudit): boolean {
  const existingFreshness = freshnessTimestamp(existing);
  const nextFreshness = freshnessTimestamp(next);

  if (nextFreshness !== existingFreshness) {
    return nextFreshness > existingFreshness;
  }

  const existingScore = auditRichnessScore(existing);
  const nextScore = auditRichnessScore(next);
  if (nextScore !== existingScore) {
    return nextScore > existingScore;
  }

  return String(next.intake_id || '').trim() > String(existing.intake_id || '').trim();
}

function applyCorridorAccessPolicy(audits: FrontendAudit[]): FrontendAudit[] {
  const auditsByCorridor = new Map<string, FrontendAudit[]>();

  for (const audit of audits) {
    const key = corridorKey(audit);
    const existing = auditsByCorridor.get(key) || [];
    existing.push(audit);
    auditsByCorridor.set(key, existing);
  }

  return Array.from(auditsByCorridor.values()).flatMap((corridorAudits) => {
    const preferredAccessible = corridorAudits
      .filter((audit) => audit.has_access)
      .sort((a, b) => freshnessTimestamp(b) - freshnessTimestamp(a))[0];

    const preferredAudit = preferredAccessible
      || corridorAudits.sort((a, b) => freshnessTimestamp(b) - freshnessTimestamp(a))[0];

    return corridorAudits.map((audit) => ({
      ...audit,
      has_access: audit.intake_id === preferredAudit?.intake_id ? preferredAudit.has_access : false,
    }));
  });
}

function dedupeAudits(audits: FrontendAudit[]): FrontendAudit[] {
  const byIntakeId = new Map<string, FrontendAudit>();

  for (const audit of audits) {
    const intakeId = String(audit.intake_id || '').trim();
    if (!intakeId) {
      continue;
    }
    const existing = byIntakeId.get(intakeId);
    if (!existing || shouldReplaceAudit(existing, audit)) {
      byIntakeId.set(intakeId, audit);
    }
  }

  const byVariant = new Map<string, FrontendAudit>();

  for (const audit of byIntakeId.values()) {
    const key = auditVariantKey(audit);
    const existing = byVariant.get(key);
    if (!existing || shouldReplaceAudit(existing, audit)) {
      byVariant.set(key, audit);
    }
  }

  return applyCorridorAccessPolicy(Array.from(byVariant.values())).sort((a, b) => {
    const freshnessDelta = freshnessTimestamp(b) - freshnessTimestamp(a);
    if (freshnessDelta !== 0) {
      return freshnessDelta;
    }
    return auditRichnessScore(b) - auditRichnessScore(a);
  });
}

export async function GET(request: NextRequest) {
  try {
    // Forward same-site cookies to backend. Report access is cookie-backed.
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = getAnyReportAuthTokenFromRequest(request) || '';

    const backendUrl = `${API_BASE_URL}/api/decision-memo/my-memos`;
    logger.info('Fetching user memos from backend:', backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.error(`Backend /my-memos failed: ${backendResponse.status} ${errorText}`);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch memos from backend', audits: [] },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Transform backend response to frontend Audit format
    const audits = dedupeAudits((data.memos || [])
      .filter((memo: any) => !memo?.war_room_hidden)
      .map((memo: any) => ({
      intake_id: memo.intake_id,
      source_jurisdiction: memo.source || '',
      destination_jurisdiction: memo.destination || '',
      source_country: memo.source || '',
      destination_country: memo.destination || '',
      source_coordinates: memo.source_coordinates || null,
      destination_coordinates: memo.destination_coordinates || null,
      created_at: memo.created_at || '',
      updated_at: memo.updated_at || '',
      type: memo.type || '',
      value: memo.value || '',
      summary: memo.summary || '',
      status: memo.status || 'pending',
      is_paid: memo.is_paid || false,
      // Rich preview fields from completed audits
      verdict: memo.verdict || '',
      risk_level: memo.risk_level || '',
      total_exposure: memo.total_exposure || '',
      total_savings: memo.total_savings || '',
      annual_value: memo.annual_value || '',
      exposure_class: memo.exposure_class || '',
      transaction_value: memo.transaction_value || '',
      // Access control flag
      has_access: memo.has_access || false,
    })));

    return NextResponse.json({
      success: true,
      audits,
      count: audits.length,
    });
  } catch (error: any) {
    logger.error('Error fetching user audits:', error);
    return safeError(error);
  }
}
