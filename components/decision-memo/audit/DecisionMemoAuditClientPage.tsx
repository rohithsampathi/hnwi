// =============================================================================
// SFO PATTERN AUDIT - SHAREABLE PREVIEW PAGE
// For SFO internal approval before payment
// Route client: /decision-memo/audit/[intakeId]
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock,
  Lock,
  CheckCircle,
  Share2,
  Download,
  ArrowRight,
  ArrowLeft,
  Shield,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  FileText,
  LayoutGrid,
  Route
} from 'lucide-react';
import { CrownLoader } from '@/components/ui/crown-loader';
import { PreviewArtifactDisplay } from '@/components/decision-memo/pattern-audit/PreviewArtifactDisplay';
import { PatternAuditWaitingInteractive } from '@/components/decision-memo/PatternAuditWaitingInteractive';
import { usePatternAudit, ReportAuthRequiredError } from '@/lib/hooks/usePatternAudit';
import { useDecisionMemoSSE } from '@/lib/hooks/useDecisionMemoSSE';
import { useCastleBriefCount } from '@/lib/hooks/useCastleBriefCount';
import { ReportAuthPopup } from '@/components/report-auth-popup';
import { getCurrentUser } from '@/lib/auth-manager';
import {
  AuditSession,
  PreviewArtifact,
  ICArtifact
} from '@/lib/decision-memo/pattern-audit-types';
import Link from 'next/link';

import HouseDecisionMemoLinearReport from '@/components/decision-memo/memo/DecisionMemoLinearReport';
import CanonicalDecisionMemoLinearReport from '@/components/decision-memo/memo/legacy/DecisionMemoLinearReport.classic-legacy';
import RouteIntelligenceV2Report from '@/components/decision-memo/v2/RouteIntelligenceV2Report';
import { useCitationManager } from '@/hooks/use-citation-manager';
import { EliteCitationPanel } from '@/components/elite/elite-citation-panel';
import type { Citation } from '@/lib/parse-dev-citations';
import { extractDevIds } from '@/lib/parse-dev-citations';
import {
  buildCitationSourceDevelopment,
  type CitationSourceDevelopment,
} from '@/lib/development-citation';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/theme-context';
import type { ResolvedDecisionMemoSurfaceData } from '@/lib/decision-memo/resolve-decision-memo-surface-data';
import {
  resolveDecisionMemoDisplayReference,
  resolvePublicDecisionMemoId,
} from '@/lib/decision-memo/memo-id-aliases';
import {
  buildRouteIntelligenceV2,
  buildRouteScopedDecisionMemoSurface,
} from '@/lib/decision-memo/route-intelligence-v2';
// Personal mode - UHNWI-standard navigation interface
import { PersonalShell } from '@/components/decision-memo/personal';

// Window augmentation for Razorpay payment integration
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BackendAuditResponse {
  success?: boolean;
  preview_data: Record<string, unknown>;
  memo_data?: Record<string, unknown>;
  resolvedDevelopmentsCount?: number;
  castleBriefsCount?: number;
  generated_at?: string;
  risk_assessment?: Record<string, unknown>;
  mitigationTimeline?: Record<string, unknown>;
  all_mistakes?: Array<{ dev_id?: string; [key: string]: unknown }>;
  full_artifact?: Record<string, unknown>;
  full_memo_url?: string;
  transparency_regime_impact?: unknown;
  transparency_data?: unknown;
  crisis_resilience_stress_test?: unknown;
  crisis_data?: unknown;
  peer_intelligence_analysis?: unknown;
  peer_intelligence_data?: unknown;
  market_dynamics_analysis?: unknown;
  market_dynamics_data?: unknown;
  implementation_roadmap_data?: unknown;
  due_diligence_data?: unknown;
  heir_management_data?: unknown;
  heir_management_analysis?: unknown;
  wealth_projection_data?: unknown;
  wealth_projection_analysis?: unknown;
  scenario_tree_data?: unknown;
  scenario_tree_analysis?: unknown;
  destination_drivers?: unknown;
  hnwi_trends_analysis?: unknown;
  [key: string]: unknown;
}

type AuditTier = 'single' | 'annual';
type MemoViewMode = 'linear' | 'house' | 'route';

const TIER_CONFIG = {
  single: {
    name: 'Single Audit',
    price: 5000,
    priceDisplay: '$5,000',
    description: 'One-time decision posture audit',
    features: [
      'Full IC-ready artifact',
      'PDF export',
      'Pattern matching against live developments',
      '48-hour SLA'
    ]
  },
  annual: {
    name: 'Annual Architect',
    price: 25000,
    priceDisplay: '$25,000',
    description: '10 audits + HNWI Chronicles Architect Tier',
    features: [
      '10 Decision Posture Audits',
      'HNWI Chronicles Architect Tier access',
      'Priority 12-hour SLA',
      'Dedicated intelligence analyst',
      'Quarterly strategy calls'
    ],
    savings: 'Save $12,500 vs single audits + Architect access'
  }
};

// Helper to format countdown
function formatCountdown(ms: number): { hours: number; minutes: number; seconds: number } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

function normalizeResolvedSurfaceData(data: ResolvedDecisionMemoSurfaceData): ResolvedDecisionMemoSurfaceData {
  const resolvedFullArtifact =
    data.fullArtifact ??
    (data.memoData as any)?.full_artifact ??
    (data.memoData as any)?.artifact ??
    data.backendData?.full_artifact ??
    data.backendData?.fullArtifact ??
    data.backendData?.artifact ??
    null;

  return {
    ...data,
    fullArtifact: (resolvedFullArtifact ?? null) as Record<string, unknown> | null,
  };
}

function buildPaidAuditSession(intakeId: string): AuditSession {
  return {
    intakeId,
    principalId: 'sfo_audit',
    status: 'PAID',
    isUnlocked: true,
    previewUrl: `/release-readiness/review/${intakeId}`,
    submittedAt: '',
    previewReadyAt: '',
    expiresAt: '',
    price: 2500,
  } as AuditSession;
}

interface DecisionMemoAuditClientPageProps {
  initialIntakeId: string;
  initialSearchParamsString?: string;
  initialSurfaceData?: ResolvedDecisionMemoSurfaceData | null;
  initialSurfaceError?: string | null;
}

type MemoSourceRecord = {
  id: string;
  payload: Record<string, unknown>;
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter(isPlainRecord) : [];
}

function firstText(record: Record<string, unknown>, fields: string[], fallback = ''): string {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (isPlainRecord(value) && typeof value.$date === 'string' && value.$date.trim()) {
      return value.$date.trim();
    }
  }
  return fallback;
}

function normalizeSourceDate(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (isPlainRecord(value) && typeof value.$date === 'string' && value.$date.trim()) {
    return value.$date.trim();
  }
  return undefined;
}

function normalizedIdPart(value: unknown, fallback: string): string {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : fallback;
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || fallback;
}

function sourceRecordId(record: Record<string, unknown>, fallback: string): string {
  return firstText(record, ['id', '_id', 'brief_id', 'dev_id', 'devid', 'source_development_id'], fallback);
}

function memoSourcePayload(record: Record<string, unknown>, fallbackId: string): Record<string, unknown> {
  const id = sourceRecordId(record, fallbackId);
  const date = normalizeSourceDate(record.date ?? record.source_date ?? record.source_article_date ?? record.published_at);
  const url = firstText(record, ['url', 'source_url']);
  const summary =
    firstText(record, ['full_castle_brief', 'full_analysis', 'analysis', 'summary', 'reference', 'claim_supported', 'why_it_matters']) ||
    firstText(record, ['description', 'brief_source_text', 'public_mirror_excerpt']);

  return {
    ...record,
    id,
    title: firstText(record, ['title', 'brief_title', 'source_title', 'name'], 'Source record'),
    summary,
    description: firstText(record, ['description', 'short_summary', 'claim_supported', 'reference'], summary),
    industry: firstText(record, ['industry', 'category'], 'Route Evidence'),
    url,
    source_url: url,
    date,
    source_date: date,
  };
}

function addMemoSourceRecord(records: MemoSourceRecord[], seen: Set<string>, record: Record<string, unknown>, fallbackId: string) {
  const payload = memoSourcePayload(record, fallbackId);
  const id = String(payload.id || fallbackId).trim();
  const normalized = id.toLowerCase();
  if (!id || seen.has(normalized)) return;
  seen.add(normalized);
  records.push({ id, payload });
}

function collectMemoSourceRecords(previewData: unknown): MemoSourceRecord[] {
  const preview = isPlainRecord(previewData) ? previewData : {};
  const legalReferences = isPlainRecord(preview.legal_references) ? preview.legal_references : {};
  const records: MemoSourceRecord[] = [];
  const seen = new Set<string>();

  const addList = (value: unknown, fallbackPrefix: string) => {
    asRecordArray(value).forEach((record, index) => {
      addMemoSourceRecord(records, seen, record, `${fallbackPrefix}_${index + 1}`);
    });
  };

  addList(preview.source_register, 'source_register');
  addList(preview.governing_source_register, 'governing_source');
  addList(legalReferences.sources, 'legal_source');
  addList(legalReferences.pattern_evidence_records, 'route_pattern_source');
  addList(legalReferences.pattern_witnesses, 'route_pattern_witness');
  addList(preview.pattern_evidence_records, 'pattern_evidence');
  addList(preview.sources, 'memo_source');

  const routeIntelligence = isPlainRecord(preview.route_intelligence_v2) ? preview.route_intelligence_v2 : {};
  const routeDriverRegister =
    isPlainRecord(preview.route_driver_register)
      ? preview.route_driver_register
      : isPlainRecord(routeIntelligence.routeDriverRegister)
        ? routeIntelligence.routeDriverRegister
        : isPlainRecord(routeIntelligence.route_driver_register)
          ? routeIntelligence.route_driver_register
          : {};

  asRecordArray(routeDriverRegister.items).forEach((driver, driverIndex) => {
    const driverId = normalizedIdPart(driver.id ?? driver.title, `driver_${driverIndex + 1}`);
    asRecordArray(driver.sources).forEach((source, sourceIndex) => {
      const sourceId = firstText(
        source,
        ['id', 'source_development_id', 'dev_id', 'devid'],
        `route_driver_${driverId}_${sourceIndex + 1}`,
      );
      addMemoSourceRecord(
        records,
        seen,
        {
          ...source,
          id: sourceId,
          title: firstText(source, ['title', 'source_title', 'name'], firstText(driver, ['title'], `Route driver ${driverIndex + 1}`)),
          claim_supported: firstText(driver, ['driver', 'release_read', 'evidence_basis']),
          route_relevance: firstText(driver, ['release_read']),
          source_signal: firstText(driver, ['evidence_basis']),
        },
        sourceId,
      );
    });
  });

  return records;
}

export default function DecisionMemoAuditClientPage({
  initialIntakeId,
  initialSearchParamsString = '',
  initialSurfaceData = null,
  initialSurfaceError = null,
}: DecisionMemoAuditClientPageProps) {
  const intakeId = initialIntakeId;
  const router = useRouter();
  const currentPathname = usePathname();
  const publicMemoId = resolvePublicDecisionMemoId(intakeId);
  const canonicalPublicPath = `/release-readiness/review/${encodeURIComponent(publicMemoId)}`;
  const focusedWarRoomPath = `/war-room?memo=${encodeURIComponent(publicMemoId)}`;
  const pathname = currentPathname?.startsWith('/release-readiness/')
    ? currentPathname
    : canonicalPublicPath;
  const searchParams = useMemo(
    () => new URLSearchParams(initialSearchParamsString),
    [initialSearchParamsString],
  );
  const initialResolvedSurfaceData = useMemo(
    () => initialSurfaceData ? normalizeResolvedSurfaceData(initialSurfaceData) : null,
    [initialSurfaceData],
  );

  // Check if user wants Personal mode (UHNWI navigation interface)
  const usePersonalMode = searchParams.get('personal') === 'true';
  const requestedMemoView = searchParams.get('view');
  const memoViewMode: MemoViewMode =
    requestedMemoView === 'house'
      ? 'house'
      : requestedMemoView === 'route' || requestedMemoView === 'v2'
        ? 'route'
        : 'linear';
  const canonicalMemoReference = resolveDecisionMemoDisplayReference(intakeId);

  useEffect(() => {
    const publicId = resolvePublicDecisionMemoId(intakeId);
    if (publicId === intakeId) return;

    const query = searchParams.toString();
    router.replace(
      `/release-readiness/review/${encodeURIComponent(publicId)}${query ? `?${query}` : ''}`,
      { scroll: false }
    );
  }, [intakeId, router, searchParams]);

  const [isLoading, setIsLoading] = useState(!initialResolvedSurfaceData && !initialSurfaceError);
  const [error, setError] = useState<string | null>(initialSurfaceError);
  const [session, setSession] = useState<AuditSession | null>(
    () => initialResolvedSurfaceData ? buildPaidAuditSession(intakeId) : null,
  );
  const [previewArtifact, setPreviewArtifact] = useState<PreviewArtifact | null>(null);
  const [, setFullArtifact] = useState<Record<string, unknown> | ICArtifact | null>(
    () => (initialResolvedSurfaceData?.fullArtifact ?? null) as Record<string, unknown> | ICArtifact | null,
  );
  const [backendData, setBackendData] = useState<BackendAuditResponse | null>(
    () => (initialResolvedSurfaceData?.backendData ?? null) as BackendAuditResponse | null,
  );  // Raw backend response with preview_data
  const [resolvedSurfaceData, setResolvedSurfaceData] = useState<ResolvedDecisionMemoSurfaceData | null>(
    initialResolvedSurfaceData,
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState<AuditTier>('single');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isUnlockReady, setIsUnlockReady] = useState(false);
  const [isWaitingForPreview, setIsWaitingForPreview] = useState(false);
  const isFetchingPreviewRef = useRef(false); // Track if we're already fetching to prevent duplicates
  const shouldSkipInitialClientFetchRef = useRef(Boolean(initialResolvedSurfaceData || initialSurfaceError));

  useEffect(() => {
    document.documentElement.dataset.decisionMemoHydrated = 'true';
  }, []);

  // Client bundles must never carry report bypass tokens. Any local bypass must
  // live behind a server route that still enforces environment and audit rules.
  const isMfaBypassed = false;
  const [showReportAuth, setShowReportAuth] = useState(false);

  const buildPdfExportHeaders = useCallback((): HeadersInit | undefined => {
    return undefined;
  }, []);

  const buildAuditViewHref = useCallback((personalMode: boolean, viewMode: MemoViewMode = 'linear') => {
    const params = new URLSearchParams(searchParams.toString());

    if (personalMode) {
      params.set('personal', 'true');
    } else {
      params.delete('personal');
      params.delete('section');
    }

    if (viewMode === 'house' || viewMode === 'route') {
      params.set('view', viewMode);
    } else {
      params.delete('view');
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useTheme();
  const initialDevelopmentCount =
    resolvedSurfaceData?.developmentsCount
    ?? backendData?.resolvedDevelopmentsCount
    ?? backendData?.castleBriefsCount
    ?? null;
  const developmentCount = useCastleBriefCount({ initialCount: initialDevelopmentCount });
  const developmentCountLabel = developmentCount !== null ? developmentCount.toLocaleString() : null;
  const developmentCountPhrase = developmentCountLabel
    ? `${developmentCountLabel} wealth developments`
    : 'live wealth developments';
  const singleTierFeatures = useMemo(() => [
    TIER_CONFIG.single.features[0],
    TIER_CONFIG.single.features[1],
    developmentCountLabel
      ? `Pattern matching against ${developmentCountLabel} developments`
      : TIER_CONFIG.single.features[2],
    TIER_CONFIG.single.features[3],
  ], [developmentCountLabel]);
  const routeIntelligence = useMemo(() => {
    if (!resolvedSurfaceData || memoViewMode !== 'route') return null;

    try {
      return buildRouteIntelligenceV2(resolvedSurfaceData);
    } catch (caught) {
      console.error('[DecisionMemo] Route intelligence view failed to build', caught);
      return null;
    }
  }, [memoViewMode, resolvedSurfaceData]);

  const {
    getPreviewArtifact,
    initiatePayment,
  } = usePatternAudit();

  // Audit routes are output viewers. They must not trigger the legacy SSE
  // generation flow when a stored memo surface is missing.
  const {
    isConnected: sseConnected,
    previewReady: ssePreviewReady
  } = useDecisionMemoSSE(null);

  // Citation management (matching Home Dashboard / Memo page pattern)
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');
  const {
    citations: managedCitations,
    setCitations: setManagedCitations,
    citationMap: managedCitationMap,
    selectedCitationId,
    setSelectedCitationId,
    isPanelOpen,
    openCitation,
    closePanel
  } = useCitationManager();

  // Screen size detection for citation panel (matching memo page)
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isLandscapeMobile = isTouchDevice && height < 500;
      const isMobile = width < 1024 || isLandscapeMobile;
      setScreenSize(isMobile ? 'mobile' : 'desktop');
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // SYNCHRONOUS citation extraction using useMemo — available on first render
  // This fixes the timing issue where useEffect fires AFTER render, leaving the citationMap empty
  // when Leaflet popups first render (causing all citations to show [1])
  const { computedCitations, computedCitationMap, computedPreloadedSources } = useMemo(() => {
    const previewData = resolvedSurfaceData?.memoData?.preview_data ?? backendData?.preview_data;
    const sourceRecords = collectMemoSourceRecords(previewData);
    const opportunities = Array.isArray(previewData?.all_opportunities)
      ? (previewData.all_opportunities as Array<{
          dev_id?: string;
          hnwi_analysis?: string;
          expected_return?: string;
          opportunity_narrative?: string;
        }>)
      : [];

    const allDevIds: string[] = [];
    const seenNormalized = new Set<string>();
    const preloadedSources = new Map<string, CitationSourceDevelopment>();

    const addDevId = (devId: string) => {
      const trimmed = String(devId).trim();
      const normalized = trimmed.toLowerCase();
      if (normalized && !seenNormalized.has(normalized)) {
        seenNormalized.add(normalized);
        allDevIds.push(trimmed);
      }
    };

    sourceRecords.forEach(({ id, payload }) => {
      addDevId(id);
      const source = buildCitationSourceDevelopment(payload, id);
      if (source) {
        preloadedSources.set(id, source);
      }
    });

    opportunities.forEach((opp) => {
      if (opp.dev_id) {
        addDevId(String(opp.dev_id));
      }
      // Also extract from analysis text — these contain [Dev ID: XXX] references
      const analysisFields = [opp.hnwi_analysis, opp.expected_return, opp.opportunity_narrative];
      analysisFields.forEach((field) => {
        if (typeof field === 'string') {
          extractDevIds(field).forEach(addDevId);
        }
      });
    });

    if (previewData?.all_mistakes) {
      (previewData.all_mistakes as Array<{ dev_id?: string; [key: string]: unknown }>).forEach((mistake: { dev_id?: string; [key: string]: unknown }) => {
        if (mistake.dev_id) {
          addDevId(String(mistake.dev_id));
        }
      });
    }

    const citationList: Citation[] = allDevIds.map((devId, index) => ({
      id: devId,
      number: index + 1,
      originalText: `[DEVID: ${devId}]`
    }));

    const citMap = new Map<string, number>();
    citationList.forEach(c => citMap.set(c.id, c.number));

    return { computedCitations: citationList, computedCitationMap: citMap, computedPreloadedSources: preloadedSources };
  }, [backendData, resolvedSurfaceData]);

  // Sync computed citations with useCitationManager (for EliteCitationPanel)
  useEffect(() => {
    if (computedCitations.length > 0) {
      setManagedCitations(computedCitations);
    }
  }, [computedCitations, setManagedCitations]);

  // Fetch session and artifact data. Browser access stays cookie-backed.
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResolvedSurfaceData(null);

      const applyResolvedSurfaceData = (data: ResolvedDecisionMemoSurfaceData) => {
        const normalizedData = normalizeResolvedSurfaceData(data);

        setResolvedSurfaceData(normalizedData);
        setBackendData(normalizedData.backendData as BackendAuditResponse);
        setFullArtifact((normalizedData.fullArtifact ?? null) as Record<string, unknown> | ICArtifact | null);
      };

      const fetchResolvedMemoSurface = async () => {
        const response = await fetch(`/api/decision-memo/surface/${intakeId}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (response.status === 401) throw new ReportAuthRequiredError();
        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          if (response.status >= 500) {
            throw new Error(errorPayload?.message || 'Decision memo service temporarily unavailable.');
          }
          throw new Error(errorPayload?.message || 'Decision memo output is not available.');
        }

        const data = await response.json() as ResolvedDecisionMemoSurfaceData;
        applyResolvedSurfaceData(data);
        return data;
      };

      try {
        await fetchResolvedMemoSurface();
        setSession(prev => ({
          ...(prev ?? {}),
          ...buildPaidAuditSession(intakeId),
        } as AuditSession));
        setIsWaitingForPreview(false);
        return;
      } catch (surfaceErr) {
        if (surfaceErr instanceof ReportAuthRequiredError) throw surfaceErr;
        console.error('Stored memo surface unavailable:', surfaceErr);
        setIsWaitingForPreview(false);
        setError('Decision memo output is not available.');
        return;
      }

    } catch (err) {
      if (err instanceof ReportAuthRequiredError) {
        // If user is already logged into the platform (this page is under /authenticated),
        // do NOT show the "Encrypted Document" popup — cookies should handle auth.
        // Only show popup for truly unauthenticated access (external advisors).
        const platformUser = getCurrentUser();
        if (platformUser && !isMfaBypassed) {
          // Platform-authenticated user got 401 — likely a cookie forwarding issue.
          // Show a clear error instead of the misleading "Encrypted Document" popup.
          console.error('Platform-authenticated user got 401 on audit. Cookie forwarding may have failed.', { intakeId });
          setError('Unable to verify your access. Please refresh the page or try again.');
          setIsLoading(false);
          return;
        }
        if (!isMfaBypassed) {
          setShowReportAuth(true);
          setIsLoading(false);
          return;
        }
        // For bypassed intakes, continue without auth
      }
      console.error('Error fetching audit data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit');
    } finally {
      setIsLoading(false);
    }
  }, [intakeId, isMfaBypassed]);

  // Initial fetch
  useEffect(() => {
    if (shouldSkipInitialClientFetchRef.current) {
      shouldSkipInitialClientFetchRef.current = false;
      return;
    }

    fetchData();
  }, [fetchData]);

  // Retry pending PDF export after Fast Refresh reload
  // (Dev-mode first-compile of print route triggers full page reload, killing in-flight fetch)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pdf-export-pending');
      if (!raw) return;
      sessionStorage.removeItem('pdf-export-pending');
      const { id, ts } = JSON.parse(raw);
      if (id === intakeId && Date.now() - ts < 60000) {
        // Routes are now compiled — retry will succeed
        const doRetry = async () => {
          try {
            setIsExportingPDF(true);
            const response = await fetch(`/api/decision-memo/pdf/${intakeId}`, {
              headers: buildPdfExportHeaders(),
            });
            if (!response.ok) throw new Error(`PDF generation failed: ${response.status}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `HNWI-Release-Readiness-${(intakeId.slice(10, 22) || intakeId.slice(0, 12)).toUpperCase()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch {
            // Silent — user can click again
          } finally {
            setIsExportingPDF(false);
          }
        };
        doRetry();
      }
    } catch { /* ignore */ }
  }, [buildPdfExportHeaders, intakeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // When SSE signals preview is ready, fetch from backend
  // Always fetch to ensure proper snake_case → camelCase transformation
  // IMPORTANT: Only set isWaitingForPreview(false) AFTER preview is fetched successfully
  useEffect(() => {
    if (ssePreviewReady && isWaitingForPreview && !isFetchingPreviewRef.current) {
      isFetchingPreviewRef.current = true; // Prevent duplicate fetches

      getPreviewArtifact(intakeId)
        .then((preview) => {
          setPreviewArtifact(preview);
          setSession(prev => prev ? { ...prev, status: 'PREVIEW_READY' } : null);
          setIsWaitingForPreview(false); // Only set after successful fetch
        })
        .catch((err) => {
          if (err instanceof ReportAuthRequiredError && !isMfaBypassed) {
            const platformUser = getCurrentUser();
            if (platformUser) {
              console.error('Platform-authenticated user got 401 on preview fetch.');
              setError('Unable to verify your access. Please refresh the page.');
            } else {
              setShowReportAuth(true);
            }
            return;
          }
          console.error('Failed to fetch preview after SSE signal:', err);
          setError('Failed to load preview');
          setIsWaitingForPreview(false); // Also set on error to show error state
        })
        .finally(() => {
          isFetchingPreviewRef.current = false;
        });
    }
  }, [ssePreviewReady, isWaitingForPreview, intakeId, getPreviewArtifact, isMfaBypassed]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Countdown timer for 48-hour SLA
  // Uses backend-provided unlockAt and isUnlocked - no fallbacks
  useEffect(() => {
    // If backend says already unlocked, skip countdown
    if (session?.isUnlocked) {
      setTimeRemaining(0);
      setIsUnlockReady(true);
      return;
    }

    // Must have unlockAt from backend
    if (!session?.unlockAt) {
      return; // No unlock time from backend yet
    }

    const unlockTime = new Date(session.unlockAt).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = unlockTime - now;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsUnlockReady(true);
      } else {
        setTimeRemaining(remaining);
        setIsUnlockReady(false);
      }
    };

    // Initial update
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [session?.unlockAt, session?.isUnlocked]);

  // Handle payment
  const handlePayment = useCallback(async () => {
    setIsProcessingPayment(true);

    try {
      // Pass selected tier to payment initiation
      const data = await initiatePayment(intakeId, {
        tier: selectedTier,
        amount: TIER_CONFIG[selectedTier].price
      }) as any;

      // Handle already paid case - fetch full artifact directly
      if (data.already_paid) {
        try {
          await fetchData();
          setIsProcessingPayment(false);
        } catch (artifactErr) {
          console.error('Failed to refresh paid memo surface:', artifactErr);
          // Fallback to reload
          window.location.reload();
        }
        return;
      }

      const { order_id, amount, currency, key } = data;

      if (!key) {
        throw new Error(`Missing Razorpay key in response. Got: ${JSON.stringify(data)}`);
      }

      const tierName = selectedTier === 'annual' ? 'Annual Architect Package' : 'Single Audit';
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'HNWI Chronicles',
        description: `SFO Pattern Audit - ${tierName}`,
        order_id: order_id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/decision-memo/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intake_id: intakeId,
              product: 'sfo_pattern_audit',
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            // Refresh to show full artifact
            window.location.reload();
          } else {
            alert('Payment verification failed. Please contact support.');
            setIsProcessingPayment(false);
          }
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      const RazorpayConstructor = window.Razorpay;
      if (!RazorpayConstructor) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }
      const razorpay = new RazorpayConstructor(options as Record<string, unknown>);
      razorpay.open();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [Payment] Failed:', errorMessage, error);
      alert(`Payment error: ${errorMessage}`);
      setIsProcessingPayment(false);
    }
  }, [fetchData, intakeId, initiatePayment, selectedTier]);

  // Copy share link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback for browsers/contexts where clipboard API is unavailable
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Export PDF via native @react-pdf/renderer (server-side)
  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);

      // Save intent — if Fast Refresh reloads the page (first-time route compile),
      // the useEffect above will auto-retry after reload
      sessionStorage.setItem('pdf-export-pending', JSON.stringify({ id: intakeId, ts: Date.now() }));

      const response = await fetch(`/api/decision-memo/pdf/${intakeId}`, {
        headers: buildPdfExportHeaders(),
      });
      sessionStorage.removeItem('pdf-export-pending');

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HNWI-Release-Readiness-${(intakeId.slice(10, 22) || intakeId.slice(0, 12)).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // If the page didn't reload (real error), clear the pending flag and alert
      if (sessionStorage.getItem('pdf-export-pending')) {
        sessionStorage.removeItem('pdf-export-pending');
        alert('Failed to export PDF. Please try again.');
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Share
  const handleShare = async () => {
    await handleCopyLink();
  };

  // Memoized callback for preview ready - MUST be before conditional returns (React hooks rule)
  const handlePreviewReady = useCallback(() => {
    // Check if already fetching to prevent duplicates
    if (isFetchingPreviewRef.current) {
      return;
    }

    isFetchingPreviewRef.current = true;

    // Fetch the preview when ready
    getPreviewArtifact(intakeId)
      .then((preview) => {
        setPreviewArtifact(preview);
        setSession(prev => prev ? { ...prev, status: 'PREVIEW_READY' } : null);
        setIsWaitingForPreview(false);
      })
      .catch((err) => {
        console.error('Failed to fetch preview:', err);
        setError('Failed to load preview');
        setIsWaitingForPreview(false);
      })
      .finally(() => {
        isFetchingPreviewRef.current = false;
      });
  }, [intakeId, getPreviewArtifact]);

  // Report authentication popup (encrypted document access)
  const handleReportAuthSuccess = useCallback(() => {
    setShowReportAuth(false);
    fetchData();
  }, [fetchData]);

  // Show auth popup if needed (render before all other states)
  if (showReportAuth && !isLoading) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">Encrypted Document</h1>
            <p className="text-muted-foreground mb-6">This document is protected. Login to continue.</p>
          </div>
        </div>
        <ReportAuthPopup
          isOpen={showReportAuth}
          onClose={() => setShowReportAuth(false)}
          onSuccess={handleReportAuthSuccess}
          intakeId={intakeId}
        />
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader
          size="lg"
          text="Loading Audit"
          subtext="Fetching your decision posture analysis..."
        />
      </div>
    );
  }

  // Waiting for preview - show interactive loader with SSE connection
  if (isWaitingForPreview) {
    return (
      <PatternAuditWaitingInteractive
        intakeId={intakeId}
        onPreviewReady={handlePreviewReady}
        sseConnected={sseConnected}
        ssePreviewReady={ssePreviewReady}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            {error.toLowerCase().includes('temporarily unavailable') ? 'Release Readiness Memo Temporarily Unavailable' : 'Release Readiness Memo Not Available'}
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            href={pathname}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retry
          </Link>
        </div>
      </div>
    );
  }

  // Processing state before preview is ready
  if (session?.status === 'SUBMITTED' || session?.status === 'IN_REVIEW') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-20 z-40 bg-card/95 backdrop-blur-xl border-b border-border mb-6">
          <div className="max-w-4xl mx-auto px-3 sm:px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">HC</span>
                </div>
                <div>
                  <p className="text-foreground font-semibold">Pattern Audit</p>
                  <p className="text-muted-foreground text-xs">In Progress</p>
                </div>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted flex items-center gap-2"
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {linkCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Processing Content */}
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Clock className="absolute inset-0 m-auto w-10 h-10 text-primary" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              Decision Posture Audit in Progress
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Our intelligence systems are analyzing your decision thesis against {developmentCountPhrase} and failure patterns.
            </p>

            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-muted-foreground">Status</p>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    {session.status === 'IN_REVIEW' ? 'Under Expert Review' : 'Processing'}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="text-foreground font-medium">
                    {new Date(session.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground">Expected Completion</p>
                  <p className="text-foreground font-medium">Within 48 hours</p>
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground">Price</p>
                  <p className="text-foreground font-medium">${session.price?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-foreground mb-2">
                <span className="font-semibold">Share this link for internal approval</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Forward to your family office or advisors. They'll see the preview once generated.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Preview Ready state
  if (session?.status === 'PREVIEW_READY' && previewArtifact) {
    return (
      <div className="min-h-screen bg-background">
        {/* Processing Payment Overlay */}
        {isProcessingPayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <CrownLoader
              size="lg"
              text="Processing Payment"
              subtext="Please complete the payment..."
            />
          </div>
        )}

        {/* Header */}
        <div className="sticky top-20 z-40 bg-card/95 backdrop-blur-xl border-b border-border mb-6">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">HC</span>
                </div>
                <div>
                  <p className="text-foreground font-semibold">Pattern Audit</p>
                  <p className="text-muted-foreground text-xs">Preview Ready</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Preview Mode
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted flex items-center gap-2"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Preview Artifact Display */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <PreviewArtifactDisplay preview={previewArtifact} />
            </div>

            {/* Payment CTA with Tier Selection */}
            <div className="mt-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Unlock Full IC Artifact
                </h3>
                <p className="text-muted-foreground">
                  Select your tier to unlock complete sequence details, failure mechanisms, and pattern analysis
                </p>
              </div>

              {/* Tier Selection */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {/* Single Audit Tier */}
                <button
                  onClick={() => setSelectedTier('single')}
                  className={`
                    relative p-5 rounded-xl border-2 text-left transition-all
                    ${selectedTier === 'single'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                    }
                  `}
                >
                  {selectedTier === 'single' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <p className="font-semibold text-foreground mb-1">{TIER_CONFIG.single.name}</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{TIER_CONFIG.single.priceDisplay}</p>
                  <p className="text-xs text-muted-foreground mb-3">{TIER_CONFIG.single.description}</p>
                  <div className="space-y-1.5">
                    {singleTierFeatures.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </button>

                {/* Annual Architect Tier */}
                <button
                  onClick={() => setSelectedTier('annual')}
                  className={`
                    relative p-5 rounded-xl border-2 text-left transition-all
                    ${selectedTier === 'annual'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                    }
                  `}
                >
                  {selectedTier === 'annual' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="absolute -top-2 left-4">
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded">
                      Best Value
                    </span>
                  </div>
                  <p className="font-semibold text-foreground mb-1">{TIER_CONFIG.annual.name}</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{TIER_CONFIG.annual.priceDisplay}</p>
                  <p className="text-xs text-muted-foreground mb-3">{TIER_CONFIG.annual.description}</p>
                  <div className="space-y-1.5">
                    {TIER_CONFIG.annual.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {TIER_CONFIG.annual.savings && (
                    <p className="mt-3 text-[10px] text-primary font-medium">{TIER_CONFIG.annual.savings}</p>
                  )}
                </button>
              </div>

              {/* What's Included */}
              <div className="bg-card/50 rounded-lg p-4 mb-6">
                <p className="text-xs font-medium text-foreground mb-3">Full artifact includes:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    'Executive verdict with rationale',
                    'Execution sequence with owners',
                    'Failure mode mechanisms',
                    'Pattern anchors with confidence',
                    'Concrete next steps (7-21 days)',
                    'Exportable PDF for IC'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Countdown Timer or Unlock Button */}
              {!isUnlockReady ? (
                <div className="text-center">
                  {/* Countdown Display */}
                  <div className="bg-muted/50 rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">Full Artifact Available In</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      {(() => {
                        const { hours, minutes, seconds } = formatCountdown(timeRemaining);
                        return (
                          <>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-foreground tabular-nums">
                                {String(hours).padStart(2, '0')}
                              </div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hours</div>
                            </div>
                            <div className="text-2xl font-bold text-muted-foreground">:</div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-foreground tabular-nums">
                                {String(minutes).padStart(2, '0')}
                              </div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Min</div>
                            </div>
                            <div className="text-2xl font-bold text-muted-foreground">:</div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-foreground tabular-nums">
                                {String(seconds).padStart(2, '0')}
                              </div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sec</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Our intelligence systems are analyzing your decision thesis against {developmentCountPhrase}.
                    </p>
                  </div>

                  {/* Disabled Button */}
                  <button
                    disabled
                    className="w-full py-4 px-6 bg-muted text-muted-foreground
                               font-bold text-lg rounded-xl flex items-center justify-center gap-2
                               cursor-not-allowed"
                  >
                    <Lock className="w-5 h-5" />
                    Unlock Available After Analysis
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground
                               font-bold text-lg rounded-xl flex items-center justify-center gap-2
                               shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                  >
                    Unlock Full Memo • {TIER_CONFIG[selectedTier].priceDisplay}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Secure payment via Razorpay
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Full Artifact state (PAID or FULL_READY) - Uses simulation template UI
  if ((session?.status === 'PAID' || session?.status === 'FULL_READY') && !resolvedSurfaceData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader
          size="lg"
          text="Preparing Memo Surface"
          subtext="Synchronizing the live report and PDF surface..."
        />
      </div>
    );
  }

  // Full Artifact state (PAID or FULL_READY) - Uses simulation template UI
  if ((session?.status === 'PAID' || session?.status === 'FULL_READY') && resolvedSurfaceData) {

    const {
      memoData,
      backendData: resolvedBackendData,
      fullArtifact: resolvedFullArtifact,
      developmentsCount,
    } = resolvedSurfaceData;

    const handleCitationClick = (citationId: string) => {
      openCitation(citationId);
    };
    const isRouteNativeReleaseMemo = Boolean(routeIntelligence);
    const ReportRenderer =
      memoViewMode === 'house' || isRouteNativeReleaseMemo
        ? HouseDecisionMemoLinearReport
        : CanonicalDecisionMemoLinearReport;

    // Personal Mode - UHNWI-standard navigation interface
    if (usePersonalMode) {
      return (
        <>
          {/* PDF Export Loading Overlay */}
          {isExportingPDF && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <CrownLoader
                size="lg"
                text="Generating PDF"
                subtext="Creating institutional-grade document..."
              />
            </div>
          )}

          {/* Personal Shell - Clean navigation interface */}
          <PersonalShell
            memoData={memoData as any}
            backendData={resolvedBackendData}
            intakeId={intakeId}
            onCitationClick={handleCitationClick}
            citationMap={computedCitationMap}
            onExportPDF={handleExportPDF}
            isExportingPDF={isExportingPDF}
            onSwitchToReportView={() => router.push(buildAuditViewHref(false))}
          />
        </>
      );
    }

    // LEGACY VIEW - Original linear scroll layout
    return (
      <>
      <div className="min-h-screen bg-background text-foreground">
        {/* PDF Export Loading Overlay */}
        {isExportingPDF && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <CrownLoader
              size="lg"
              text="Generating PDF"
              subtext="Creating institutional-grade document..."
            />
          </div>
        )}

        {/* Premium Sticky Header - Hidden in PDF export */}
        {/* Back button + Page Title */}
        <div className="bg-background border-b border-border print:hidden">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3">
            <div className="flex items-center gap-3 pl-1">
              <button
                onClick={() => router.push(focusedWarRoomPath)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-secondary border border-border text-foreground hover:bg-primary hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-foreground font-bold text-sm">War Room</span>
              </div>
            </div>
          </div>
        </div>

        {/* HC branding + audit reference + action buttons */}
        <div className="sticky top-20 z-40 bg-card/95 backdrop-blur-xl border-b border-border print:hidden mb-6">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex min-w-0 items-center gap-3 text-left cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 flex-none bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-sm">HC</span>
                </div>
                <div className="min-w-0">
                  <p className="text-foreground font-semibold">Release Readiness Memo</p>
                  <p className="text-muted-foreground text-xs break-all">
                    Ref: {canonicalMemoReference}
                  </p>
                </div>
              </button>
              <div className="w-full min-w-0 xl:w-auto">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 xl:justify-end">
                <button
                  onClick={() => {
                    router.push(buildAuditViewHref(false, 'route'));
                  }}
                  type="button"
                  aria-label="Route View"
                  title="Route View"
                  className={`min-h-[44px] min-w-[44px] px-2 sm:px-3 text-sm border rounded-lg flex items-center justify-center gap-2 transition-colors group ${
                    memoViewMode === 'route'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Route className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Route View</span>
                </button>
                <button
                  onClick={() => {
                    router.push(buildAuditViewHref(false, 'linear'));
                  }}
                  type="button"
                  aria-label="Linear View"
                  title="Linear View"
                  className={`min-h-[44px] min-w-[44px] px-2 sm:px-3 text-sm border rounded-lg flex items-center justify-center gap-2 transition-colors group ${
                    memoViewMode === 'linear'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Linear View</span>
                </button>
                <button
                  onClick={() => {
                    router.push(buildAuditViewHref(false, 'house'));
                  }}
                  type="button"
                  aria-label="House View"
                  title="House View"
                  className={`min-h-[44px] min-w-[44px] px-2 sm:px-3 text-sm border rounded-lg flex items-center justify-center gap-2 transition-colors group ${
                    memoViewMode === 'house'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">House View</span>
                </button>
                <button
                  onClick={() => {
                    router.push(buildAuditViewHref(true));
                  }}
                  type="button"
                  aria-label="War Room Mode"
                  title="War Room Mode"
                  className="min-h-[44px] min-w-[44px] px-2 sm:px-3 text-sm border border-gold bg-gold/5 hover:bg-gold/10 rounded-lg flex items-center justify-center gap-2 transition-colors group"
                >
                  <LayoutGrid className="w-4 h-4 text-gold" />
                  <span className="hidden md:inline text-gold font-medium">War Room Mode</span>
                </button>
                <button
                  onClick={handleShare}
                  aria-label={linkCopied ? 'Link copied' : 'Share'}
                  title={linkCopied ? 'Link copied' : 'Share'}
                  className={`min-h-[44px] min-w-[44px] px-2 sm:px-3 text-sm border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    linkCopied
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span className="hidden md:inline">{linkCopied ? 'Copied!' : 'Share'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  aria-label={isExportingPDF ? 'Exporting PDF' : 'Export PDF'}
                  title={isExportingPDF ? 'Exporting PDF' : 'Export PDF'}
                  className="min-h-[44px] px-2 sm:px-3 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span className="hidden md:inline">{isExportingPDF ? 'Exporting...' : 'Export PDF'}</span>
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="artifact-content" className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 pb-28 sm:pb-12 print:max-w-[210mm] print:px-0 print:py-0">
          {memoViewMode === 'route' ? (
            routeIntelligence ? (
              <RouteIntelligenceV2Report
                intelligence={routeIntelligence}
                publicMemoId={canonicalMemoReference}
                v1Href={buildAuditViewHref(false, 'linear')}
                embedded
                onCitationClick={handleCitationClick}
                citationMap={computedCitationMap}
                zeroTrustMoveIntake={(memoData.preview_data as Record<string, unknown>).zero_trust_move_intake as Record<string, unknown> | undefined}
                fullMemo={(selectedRoute) => {
                  const routeScopedSurface = buildRouteScopedDecisionMemoSurface({
                    memoData: memoData as any,
                    backendData: resolvedBackendData as any,
                    fullArtifact: resolvedFullArtifact as any,
                    route: selectedRoute,
                    routes: routeIntelligence.pressureVariants?.length
                      ? routeIntelligence.pressureVariants
                      : routeIntelligence.routeOptions,
                  });

                  return (
                    <HouseDecisionMemoLinearReport
                      memoData={routeScopedSurface.memoData as any}
                      intakeId={intakeId}
                      backendData={routeScopedSurface.backendData}
                      hnwiWorldCount={developmentsCount ?? undefined}
                      fullArtifact={routeScopedSurface.fullArtifact as any}
                      onCitationClick={handleCitationClick}
                      citationMap={computedCitationMap}
                      onShare={handleShare}
                      linkCopied={linkCopied}
                    />
                  );
                }}
              />
            ) : (
              <div className="rounded-lg border border-red-500/25 bg-red-500/[0.04] p-6 text-foreground">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
                  <div>
                    <h2 className="text-lg font-semibold">Route intelligence unavailable</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      The full memo is available in Linear View, but this memo payload does not contain enough route-pressure data for the route view.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push(buildAuditViewHref(false, 'linear'))}
                      className="mt-5 rounded-md border border-border/40 px-4 py-2 text-sm text-foreground transition hover:border-border"
                    >
                      Open Linear View
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <ReportRenderer
              memoData={memoData as any}
              intakeId={intakeId}
              backendData={resolvedBackendData}
              hnwiWorldCount={developmentsCount ?? undefined}
              fullArtifact={resolvedFullArtifact as any}
              onCitationClick={handleCitationClick}
              citationMap={computedCitationMap}
              onShare={handleShare}
              linkCopied={linkCopied}
            />
          )}
        </div>
      </div>

      {/* Citation Panel - Desktop Only (matching Home Dashboard / Memo page pattern) */}
      {isPanelOpen && screenSize === 'desktop' && (
        <div className="hidden lg:block">
          <EliteCitationPanel
            citations={managedCitations}
            selectedCitationId={selectedCitationId}
            onClose={closePanel}
            onCitationSelect={setSelectedCitationId}
            citationMap={computedCitationMap}
            preloadedSources={computedPreloadedSources}
          />
        </div>
      )}

      {/* Mobile Citation Panel - Full screen with AnimatePresence */}
      {isPanelOpen && screenSize === 'mobile' && (
        <AnimatePresence>
          <EliteCitationPanel
            citations={managedCitations}
            selectedCitationId={selectedCitationId}
            onClose={closePanel}
            onCitationSelect={setSelectedCitationId}
            citationMap={computedCitationMap}
            preloadedSources={computedPreloadedSources}
          />
        </AnimatePresence>
      )}
      </>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <CrownLoader size="lg" text="Loading..." />
    </div>
  );
}
