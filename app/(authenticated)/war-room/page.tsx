// War Room - Full-viewport Command Centre Map (mirrors Home Dashboard)
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { CrownLoader } from "@/components/ui/crown-loader";
import { getCurrentUser } from "@/lib/auth-manager";
import { useOpportunities } from "@/lib/hooks/useOpportunities";
import { usePersonalMode } from "@/lib/hooks/usePersonalMode";
import { useCitationManager } from "@/hooks/use-citation-manager";
import { usePageTitle } from "@/hooks/use-page-title";
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel";
import { AnimatePresence } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { getAuditMarkerIcon } from "@/lib/map-markers";
import type { City, MigrationFlow } from "@/components/interactive-world-map";
import type { Citation } from "@/lib/parse-dev-citations";

// City + country coordinates for audit route arcs (city-level precision)
const GEO_COORDS: Record<string, { lat: number; lng: number }> = {
  // Cities — India
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Yavatmal': { lat: 20.3899, lng: 78.1307 },
  'Sadashivpet': { lat: 17.6164, lng: 78.0766 },
  // Cities — Europe
  'Lisbon': { lat: 38.7223, lng: -9.1393 },
  'Porto': { lat: 41.1579, lng: -8.6291 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'Zurich': { lat: 47.3769, lng: 8.5417 },
  'Geneva': { lat: 46.2044, lng: 6.1432 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Frankfurt': { lat: 50.1109, lng: 8.6821 },
  'Munich': { lat: 48.1351, lng: 11.5820 },
  'Milan': { lat: 45.4642, lng: 9.1900 },
  'Rome': { lat: 41.9028, lng: 12.4964 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041 },
  'Madrid': { lat: 40.4168, lng: -3.7038 },
  'Barcelona': { lat: 41.3874, lng: 2.1686 },
  'Dublin': { lat: 53.3498, lng: -6.2603 },
  'Athens': { lat: 37.9838, lng: 23.7275 },
  'Vienna': { lat: 48.2082, lng: 16.3738 },
  'Monaco': { lat: 43.7384, lng: 7.4246 },
  'Luxembourg': { lat: 49.6117, lng: 6.1300 },
  'Valletta': { lat: 35.8989, lng: 14.5146 },
  'Nicosia': { lat: 35.1856, lng: 33.3823 },
  // Cities — Middle East
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
  'Riyadh': { lat: 24.7136, lng: 46.6753 },
  'Doha': { lat: 25.2854, lng: 51.5310 },
  'Bahrain': { lat: 26.0667, lng: 50.5577 },
  // Cities — Asia-Pacific
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Melbourne': { lat: -37.8136, lng: 144.9631 },
  'Auckland': { lat: -36.8485, lng: 174.7633 },
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
  'Shanghai': { lat: 31.2304, lng: 121.4737 },
  'Beijing': { lat: 39.9042, lng: 116.4074 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  'Taipei': { lat: 25.0330, lng: 121.5654 },
  // Cities — Americas
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Toronto': { lat: 43.6532, lng: -79.3832 },
  'Vancouver': { lat: 49.2827, lng: -123.1207 },
  'Panama City': { lat: 8.9824, lng: -79.5199 },
  'Nassau': { lat: 25.0480, lng: -77.3554 },
  'George Town': { lat: 19.2866, lng: -81.3744 },
  'Sao Paulo': { lat: -23.5505, lng: -46.6333 },
  // Cities — Africa
  'Port Louis': { lat: -20.1609, lng: 57.5012 },
  'Cape Town': { lat: -33.9249, lng: 18.4241 },
  'Johannesburg': { lat: -26.2041, lng: 28.0473 },
  // US States (map to major financial city in each state)
  'California': { lat: 37.7749, lng: -122.4194 },   // San Francisco
  'Texas': { lat: 29.7604, lng: -95.3698 },          // Houston
  'Florida': { lat: 25.7617, lng: -80.1918 },        // Miami
  'New Jersey': { lat: 40.7357, lng: -74.1724 },     // Newark
  'Delaware': { lat: 39.7391, lng: -75.5398 },       // Wilmington
  'Illinois': { lat: 41.8781, lng: -87.6298 },       // Chicago
  'Massachusetts': { lat: 42.3601, lng: -71.0589 },  // Boston
  'Connecticut': { lat: 41.1635, lng: -73.2018 },    // Bridgeport
  'Nevada': { lat: 36.1699, lng: -115.1398 },        // Las Vegas
  'Washington': { lat: 47.6062, lng: -122.3321 },    // Seattle
  'Colorado': { lat: 39.7392, lng: -104.9903 },      // Denver
  'Georgia': { lat: 33.7490, lng: -84.3880 },        // Atlanta
  'Pennsylvania': { lat: 39.9526, lng: -75.1652 },   // Philadelphia
  // Indian States (map to state capital / major city)
  'Telangana': { lat: 17.3850, lng: 78.4867 },       // Hyderabad
  'Maharashtra': { lat: 19.0760, lng: 72.8777 },     // Mumbai
  'Karnataka': { lat: 12.9716, lng: 77.5946 },       // Bangalore
  'Tamil Nadu': { lat: 13.0827, lng: 80.2707 },      // Chennai
  'West Bengal': { lat: 22.5726, lng: 88.3639 },     // Kolkata
  'Gujarat': { lat: 23.0225, lng: 72.5714 },         // Ahmedabad
  'Andhra Pradesh': { lat: 17.3850, lng: 78.4867 },  // Hyderabad (shared capital)
  'Kerala': { lat: 8.5241, lng: 76.9366 },           // Trivandrum
  'Rajasthan': { lat: 26.9124, lng: 75.7873 },       // Jaipur
  'Goa': { lat: 15.2993, lng: 74.1240 },             // Panaji
  // Country fallbacks
  'US': { lat: 40.7128, lng: -74.0060 },             // alias for USA
  'India': { lat: 20.5937, lng: 78.9629 },
  'Portugal': { lat: 38.7223, lng: -9.1393 },
  'United Arab Emirates': { lat: 25.2048, lng: 55.2708 },
  'UAE': { lat: 25.2048, lng: 55.2708 },
  'United States': { lat: 40.7128, lng: -74.0060 },
  'USA': { lat: 40.7128, lng: -74.0060 },
  'United Kingdom': { lat: 51.5074, lng: -0.1278 },
  'UK': { lat: 51.5074, lng: -0.1278 },
  'Switzerland': { lat: 47.3769, lng: 8.5417 },
  'Spain': { lat: 40.4168, lng: -3.7038 },
  'France': { lat: 48.8566, lng: 2.3522 },
  'Germany': { lat: 52.5200, lng: 13.4050 },
  'Italy': { lat: 41.9028, lng: 12.4964 },
  'Netherlands': { lat: 52.3676, lng: 4.9041 },
  'Japan': { lat: 35.6762, lng: 139.6503 },
  'Australia': { lat: -33.8688, lng: 151.2093 },
  'Canada': { lat: 43.6532, lng: -79.3832 },
  'Mexico': { lat: 19.4326, lng: -99.1332 },
  'Thailand': { lat: 13.7563, lng: 100.5018 },
  'Malaysia': { lat: 3.1390, lng: 101.6869 },
  'Greece': { lat: 37.9838, lng: 23.7275 },
  'Malta': { lat: 35.8989, lng: 14.5146 },
  'Cyprus': { lat: 35.1856, lng: 33.3823 },
  'Mauritius': { lat: -20.1609, lng: 57.5012 },
  'New Zealand': { lat: -36.8485, lng: 174.7633 },
  'Ireland': { lat: 53.3498, lng: -6.2603 },
  'Bahamas': { lat: 25.0480, lng: -77.3554 },
  'Cayman Islands': { lat: 19.2866, lng: -81.3744 },
  'Panama': { lat: 8.9824, lng: -79.5199 },
  'South Korea': { lat: 37.5665, lng: 126.9780 },
  'China': { lat: 31.2304, lng: 121.4737 },
  'Brazil': { lat: -23.5505, lng: -46.6333 },
  'South Africa': { lat: -33.9249, lng: 18.4241 },
};

// Case-insensitive coord lookup (handles backend typos like "NEw York")
const GEO_KEYS = Object.keys(GEO_COORDS);
function findCoords(name: string | undefined): { lat: number; lng: number } | undefined {
  if (!name) return undefined;
  const exact = GEO_COORDS[name];
  if (exact) return exact;
  const lower = name.toLowerCase();
  const match = GEO_KEYS.find(k => k.toLowerCase() === lower);
  return match ? GEO_COORDS[match] : undefined;
}

// Normalize jurisdiction name to canonical GEO_COORDS key (handles case typos)
function normalizeName(name: string): string {
  if (!name) return name;
  if (GEO_COORDS[name]) return name; // exact match
  const lower = name.toLowerCase();
  const match = GEO_KEYS.find(k => k.toLowerCase() === lower);
  return match || name; // return canonical key or original if no match
}

interface Audit {
  intake_id: string;
  source_jurisdiction: string;
  destination_jurisdiction: string;
  source_country: string;
  destination_country: string;
  created_at: string;
  type: string;
  value: string;
  summary: string;
  status: string;
  is_paid: boolean;
  // Rich preview fields from completed audits
  verdict: string;
  risk_level: string;
  total_exposure: string;
  total_savings: string;
  exposure_class: string;
  annual_value: string;
  transaction_value: string;
  // Access control
  has_access: boolean;
}

function getStatusColor(_status: string): string {
  // Uniform gold for all midpoint dots — no traffic-light colors
  return '#D4A843';
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'Completed';
    case 'preview_ready': return 'Preview Ready';
    case 'in_progress': return 'In Progress';
    case 'pending': return 'Pending';
    default: return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}

// Dynamic import — no SSR for Leaflet
const InteractiveWorldMap = dynamic(
  () => import("@/components/interactive-world-map").then(mod => mod.InteractiveWorldMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-surface animate-pulse" /> }
);

export default function WarRoomPage() {
  const router = useRouter();
  usePageTitle('War Room', 'Strategic intelligence command centre — audit corridors visualised on a global map.');

  // Auth
  const [user, setUser] = useState<any>(null);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  // Personal Mode state (shared across Home Dashboard and War Room)
  const { isPersonalMode, togglePersonalMode } = usePersonalMode(hasCompletedAssessment);

  // Audit data
  const [audits, setAudits] = useState<Audit[]>([]);

  // Filters — mirrors home dashboard
  const [timeframe, setTimeframe] = useState('live');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCrownAssets, setShowCrownAssets] = useState(true);
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);
  // UI
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');
  const [showGreeting, setShowGreeting] = useState(true);

  // Citation manager
  const {
    citations,
    citationMap,
    setCitations,
    selectedCitationId: activeCitationId,
    openCitation,
    closePanel,
    isPanelOpen,
  } = useCitationManager();

  // Get current user
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  // Check assessment status
  useEffect(() => {
    const checkAssessment = async () => {
      if (!user?.id && !user?.user_id) return;

      try {
        const userId = user.id || user.user_id;
        const response = await fetch(`/api/assessment/history/${userId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const assessments = data?.assessments || data || [];
          setHasCompletedAssessment(assessments.length > 0);
        }
      } catch (error) {
        console.error('Failed to check assessment:', error);
      }
    };

    checkAssessment();
  }, [user]);

  // Fetch audits from existing endpoint
  useEffect(() => {
    if (!user) return;

    const fetchAudits = async () => {
      try {
        const res = await fetch('/api/decision-memo/user-audits', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setAudits(data.audits || []);
        }
      } catch (error) {
        console.error('Failed to fetch audits:', error);
      }
    };

    fetchAudits();
  }, [user]);

  // Group audits by corridor (source-destination pair) for navigation
  const corridorGroups = useMemo(() => {
    const groups: Record<string, typeof audits> = {};
    const SKIP_VALUES = ['', 'not specified', 'n/a', 'unknown', 'none'];
    audits.forEach(audit => {
      // Skip audits with empty / unspecified jurisdictions (both src AND dst must be usable)
      const srcRaw = (audit.source_jurisdiction || audit.source_country || '').trim();
      const dstRaw = (audit.destination_jurisdiction || audit.destination_country || '').trim();
      if (SKIP_VALUES.includes(srcRaw.toLowerCase()) || SKIP_VALUES.includes(dstRaw.toLowerCase())) {
        return; // silently skip — no coords possible
      }
      const corridorKey = `${normalizeName(audit.source_jurisdiction)}→${normalizeName(audit.destination_jurisdiction)}`;
      if (!groups[corridorKey]) {
        groups[corridorKey] = [];
      }
      groups[corridorKey].push(audit);
    });
    return groups;
  }, [audits]);

  // Navigation state: track current audit index for each corridor
  const [corridorIndices, setCorridorIndices] = useState<Record<string, number>>({});

  // Convert audits to MigrationFlow[] for curved air-route arcs (grouped by corridor)
  const auditFlows: MigrationFlow[] = useMemo(() => {
    const flows: MigrationFlow[] = [];

    // Process each corridor group
    Object.entries(corridorGroups).forEach(([corridorKey, corridorAudits]) => {
      if (corridorAudits.length === 0) return;

      // Get current index for this corridor (default to 0)
      const currentIdx = corridorIndices[corridorKey] || 0;
      const audit = corridorAudits[currentIdx] || corridorAudits[0];

      // City-first lookup: jurisdiction (city) > country fallback (case-insensitive)
      const srcCoords = findCoords(audit.source_jurisdiction) || findCoords(audit.source_country);
      const dstCoords = findCoords(audit.destination_jurisdiction) || findCoords(audit.destination_country);

      if (!srcCoords || !dstCoords) {
        return;
      }

      const srcName = audit.source_jurisdiction || audit.source_country;
      const dstName = audit.destination_jurisdiction || audit.destination_country;

      // Build label from available fields
      const label = audit.type
        ? `${srcName} → ${dstName} — ${audit.type.replace(/_/g, ' ')}`
        : `${srcName} → ${dstName}`;

      const statusColor = getStatusColor(audit.status);
      const typeLabel = audit.type ? audit.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Decision Memo';

      // Get value for subtitle display
      const displayValue = audit.transaction_value || audit.value || audit.annual_value;
      const subtitle = displayValue ? `${typeLabel} • ${displayValue}` : typeLabel;

      // Access-based color: bright neon for accessible, darker for restricted
      const corridorColor = audit.has_access
        ? '#67E8F9'  // Bright cyan neon (full access)
        : '#3B7A94'; // Darker cyan (restricted access)

      flows.push({
        source: {
          name: srcName,
          country: audit.source_country,
          latitude: srcCoords.lat,
          longitude: srcCoords.lng,
        } as City,
        destination: {
          name: dstName,
          country: audit.destination_country,
          latitude: dstCoords.lat,
          longitude: dstCoords.lng,
        } as City,
        volume: 3000,
        type: 'outflow' as const,
        label,
        color: corridorColor,
        midpoint: {
          iconSvg: getAuditMarkerIcon(audit.type),
          title: `${srcName} → ${dstName}`,
          subtitle: subtitle, // Combines type and value
          status: getStatusLabel(audit.status),
          statusColor,
          details: {
            // Don't duplicate Source/Destination/Type/Value (already in title/subtitle)
            ...(audit.verdict ? { 'Verdict': audit.verdict } : {}),
            ...(audit.risk_level ? { 'Risk': audit.risk_level } : {}),
            ...(audit.total_savings ? { 'Annual Savings': audit.total_savings } : {}),
            ...(audit.total_exposure ? { 'Exposure': audit.total_exposure } : {}),
            ...(audit.summary ? { 'Summary': audit.summary } : {}),
          },
          // Access control — if user has access, link to audit in personal mode; otherwise link to intake
          exploreUrl: audit.has_access
            ? `/decision-memo/audit/${audit.intake_id}?personal=true`
            : `/decision-memo/intake`,
          hasAccess: audit.has_access,
          // Corridor navigation data
          corridorKey,
          currentIndex: currentIdx,
          totalAudits: corridorAudits.length,
        },
      });
    });

    // Sort flows so restricted corridors render first (bottom layer), accessible ones last (top layer)
    return flows.sort((a, b) => {
      const aHasAccess = a.midpoint?.hasAccess ?? true;
      const bHasAccess = b.midpoint?.hasAccess ?? true;
      // false (no access) comes before true (has access) → restricted renders first, accessible on top
      return aHasAccess === bHasAccess ? 0 : aHasAccess ? 1 : -1;
    });
  }, [audits, corridorGroups, corridorIndices]);

  // Handler for corridor navigation (left/right arrows)
  const handleCorridorNavigate = useCallback((corridorKey: string, direction: 'prev' | 'next') => {
    const corridorAudits = corridorGroups[corridorKey];
    if (!corridorAudits || corridorAudits.length <= 1) return;

    const currentIdx = corridorIndices[corridorKey] || 0;
    let newIdx: number;

    if (direction === 'next') {
      newIdx = (currentIdx + 1) % corridorAudits.length;
    } else {
      newIdx = currentIdx === 0 ? corridorAudits.length - 1 : currentIdx - 1;
    }

    setCorridorIndices(prev => ({
      ...prev,
      [corridorKey]: newIdx
    }));
  }, [corridorGroups, corridorIndices]);

  // Handler for popup close - reset audit index to 0 so reopening shows first audit
  const handlePopupClose = useCallback((corridorKey: string) => {
    setCorridorIndices(prev => ({
      ...prev,
      [corridorKey]: 0
    }));
  }, []);

  // Fetch opportunities using centralized hook (dashboard mode with personal mode support)
  const {
    cities,
    loading,
    availableCategories,
  } = useOpportunities({
    isPublic: false,
    timeframe,
    isPersonalMode,
    hasCompletedAssessment,
    includeCrownVault: isPersonalMode && hasCompletedAssessment,
    cleanCategories: true
  });

  // Track initial load separately
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!loading && initialLoad) {
      setInitialLoad(false);
    }
  }, [loading, initialLoad]);

  // Initialize selected categories when available
  useEffect(() => {
    if (availableCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(availableCategories);
    }
  }, [availableCategories]);

  // Extract citations from cities
  useEffect(() => {
    const allCitations: Citation[] = [];
    const seenIds = new Set<string>();
    let citationNumber = 1;

    cities.forEach(city => {
      if (city.devIds && city.devIds.length > 0) {
        city.devIds.forEach(devId => {
          if (!seenIds.has(devId)) {
            seenIds.add(devId);
            allCitations.push({
              id: devId,
              number: citationNumber++,
              originalText: `[Dev ID: ${devId}]`
            });
          }
        });
      }
    });

    setCitations(allCitations);
  }, [cities, setCitations]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.timeframe-dropdown')) {
        setIsDropdownOpen(false);
      }
      if (isCategoryDropdownOpen && !target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, isCategoryDropdownOpen]);

  // Screen size detection
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

  // Auto-hide greeting after 10s on mobile
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (screenSize === 'mobile') {
      timer = setTimeout(() => setShowGreeting(false), 10000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [screenSize]);

  // Handle citation click
  const handleCitationClick = useCallback((citationId: string) => {
    openCitation(citationId);
  }, [openCitation]);

  // Full-screen loader on initial load
  if (initialLoad && loading) {
    return (
      <div className="w-full h-screen bg-background">
        <div className="flex items-center justify-center h-full">
          <CrownLoader size="lg" text="Loading War Room" />
        </div>
      </div>
    );
  }

  // Filter cities (same logic as home dashboard)
  const filteredCities = cities.filter(city => {
    if (selectedCategories.length > 0 && city.category) {
      if (!selectedCategories.includes(city.category)) return false;
    }
    const isCrownAsset = city.source?.toLowerCase().includes('crown vault') ||
      city.source?.toLowerCase() === 'crown vault';
    if (isCrownAsset) return showCrownAssets;

    const isPriveOpportunity = !!city.victor_score ||
      city.source?.toLowerCase().includes('privé') ||
      city.source?.toLowerCase().includes('prive');
    if (isPriveOpportunity) return showPriveOpportunities;

    return showHNWIPatterns;
  });

  const handleNavigate = (route: string) => {
    router.push(`/${route}`);
  };

  return (
    <>
      <div className="fixed inset-0 overflow-hidden">
        <InteractiveWorldMap
          width="100%"
          height="100%"
          showControls={true}
          cities={filteredCities}
          migrationFlows={auditFlows}
          onCitationClick={handleCitationClick}
          citationMap={citationMap}
          onNavigate={handleNavigate}
          onCorridorNavigate={handleCorridorNavigate}
          onPopupClose={handlePopupClose}
          showCrownAssets={showCrownAssets}
          showPriveOpportunities={showPriveOpportunities}
          showHNWIPatterns={showHNWIPatterns}
          onToggleCrownAssets={() => setShowCrownAssets(!showCrownAssets)}
          onTogglePriveOpportunities={() => setShowPriveOpportunities(!showPriveOpportunities)}
          onToggleHNWIPatterns={() => setShowHNWIPatterns(!showHNWIPatterns)}
          showCrisisOverlay={true}
        />

        {/* Page Header Overlay — matches Home Dashboard pattern */}
        <div className="absolute top-20 md:top-24 left-4 md:left-[80px] z-[400] px-0 sm:px-2 lg:px-4 pointer-events-none">
          {/* Back button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 mb-3 px-3 py-1.5 text-xs font-medium rounded bg-secondary border border-border text-foreground hover:bg-primary hover:text-white transition-colors pointer-events-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          {/* Title + Icon — hidden after 10s on mobile, always visible on desktop */}
          {(showGreeting || screenSize === 'desktop') && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 md:h-5 w-4 md:w-5 text-primary" />
                <h1 className="text-base md:text-xl lg:text-2xl font-bold text-foreground">
                  War Room
                </h1>
                {audits.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {audits.length} wealth movement{audits.length !== 1 ? 's' : ''} stress tested
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs md:text-sm ml-6 md:ml-7 mb-2 md:mb-3">
                Audit corridors visualised on your Command Centre
              </p>
            </>
          )}

          {/* Filter Controls — always visible, below title */}
          <div className={`flex gap-2 items-center flex-wrap ${(showGreeting || screenSize === 'desktop') ? 'ml-6 md:ml-7' : 'ml-0'}`}>
            {/* Timeframe Dropdown */}
            <div className="relative inline-block pointer-events-auto timeframe-dropdown">
              <button
                onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsCategoryDropdownOpen(false); }}
                className={`relative py-1.5 text-xs bg-secondary text-foreground rounded hover:bg-primary hover:text-white transition-colors cursor-pointer border border-border flex items-center ${timeframe === 'live' ? 'pl-3 pr-8 font-bold' : 'pl-3 pr-8'}`}
              >
                {timeframe === 'live' && (
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                )}
                <span>{timeframe === 'live' ? 'Live Data' : timeframe === '24h' ? '24 Hours' : timeframe === '7d' ? '7 Days' : timeframe === '30d' ? '30 Days' : 'All Time'}</span>
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2">&#9660;</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 bg-background border border-border rounded shadow-lg z-[501] min-w-[120px]">
                  {[
                    { value: 'live', label: 'Live Data', bold: true },
                    { value: '24h', label: '24 Hours' },
                    { value: '7d', label: '7 Days' },
                    { value: '30d', label: '30 Days' },
                    { value: 'all', label: 'All Time' },
                  ].map(tf => (
                    <button
                      key={tf.value}
                      onClick={() => { setTimeframe(tf.value); setIsDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-xs text-left hover:bg-surface-hover transition-colors ${timeframe === tf.value ? 'text-primary font-semibold' : 'text-foreground'}`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            {availableCategories.length > 0 && (
              <div className="relative inline-block pointer-events-auto category-dropdown">
                <button
                  onClick={() => { setIsCategoryDropdownOpen(!isCategoryDropdownOpen); setIsDropdownOpen(false); }}
                  className="py-1.5 px-3 text-xs bg-secondary text-foreground rounded hover:bg-primary hover:text-white transition-colors cursor-pointer border border-border"
                >
                  Categories ({selectedCategories.length})
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-background border border-border rounded shadow-lg z-[501] overflow-hidden max-h-64 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategories(
                        selectedCategories.length === availableCategories.length ? [] : [...availableCategories]
                      )}
                      className="w-full px-3 py-2 text-xs text-left hover:bg-surface-hover transition-colors text-primary font-semibold border-b border-border"
                    >
                      {selectedCategories.length === availableCategories.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {availableCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategories(prev =>
                          prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                        )}
                        className={`w-full px-3 py-2 text-xs text-left hover:bg-surface-hover transition-colors flex items-center gap-2 ${selectedCategories.includes(cat) ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        <span className={`w-3 h-3 rounded border ${selectedCategories.includes(cat) ? 'bg-primary border-primary' : 'border-border'}`} />
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Citation Panel */}
      {isPanelOpen && (
        <AnimatePresence>
          <EliteCitationPanel
            citations={citations}
            selectedCitationId={activeCitationId}
            onClose={closePanel}
            onCitationSelect={(id) => openCitation(id)}
            citationMap={citationMap}
          />
        </AnimatePresence>
      )}
    </>
  );
}
