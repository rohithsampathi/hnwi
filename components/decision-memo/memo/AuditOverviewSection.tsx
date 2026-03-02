// components/decision-memo/memo/AuditOverviewSection.tsx
// Audit Overview — Full Page Map with Corridor + Analysis Box Below
// Shows: Intelligence Basis, Decision Under Audit with map visualization

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { fadeInUp } from '@/lib/animations/motion-variants';
import type { City, MigrationFlow } from '@/components/interactive-world-map';

// Dynamic import for InteractiveWorldMap (no SSR for Leaflet)
const InteractiveWorldMap = dynamic(
  () => import("@/components/interactive-world-map").then(mod => mod.InteractiveWorldMap),
  { ssr: false, loading: () => <div className="w-full h-[60vh] bg-surface animate-pulse rounded-xl" /> }
);


interface AuditOverviewSectionProps {
  // Intelligence metadata
  developmentsCount: number;
  precedentCount: number;
  sourceJurisdiction: string;
  destinationJurisdiction: string;
  sourceCity?: string;
  destinationCity?: string;

  // Decision context
  thesisSummary?: string;
  exposureClass?: string;
  totalSavings?: string;

  // Structure plan
  optimalStructure?: {
    name: string;
    net_benefit?: string;
    net_benefit_formatted?: string;
    description?: string;
  };
  verdict?: 'PROCEED' | 'RESTRUCTURE' | 'ABORT';

  // Optional full thesis from intake
  fullThesis?: string;

  // New intake fields (rails, constraints)
  rails?: any;
  constraints?: any;

  // Display variant
  showMap?: boolean; // true for Personal mode, false for Report mode
}

// Geo coordinates for map (replicated from War Room)
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
  // Indian States
  'Telangana': { lat: 17.3850, lng: 78.4867 },
  'Maharashtra': { lat: 19.0760, lng: 72.8777 },
  'Karnataka': { lat: 12.9716, lng: 77.5946 },
  'Tamil Nadu': { lat: 13.0827, lng: 80.2707 },
  'West Bengal': { lat: 22.5726, lng: 88.3639 },
  'Gujarat': { lat: 23.0225, lng: 72.5714 },
  'Andhra Pradesh': { lat: 17.3850, lng: 78.4867 },
  'Kerala': { lat: 8.5241, lng: 76.9366 },
  'Rajasthan': { lat: 26.9124, lng: 75.7873 },
  'Goa': { lat: 15.2993, lng: 74.1240 },
  // Country fallbacks
  'US': { lat: 40.7128, lng: -74.0060 },
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

// Case-insensitive coord lookup (handles backend typos) — from War Room
const GEO_KEYS = Object.keys(GEO_COORDS);
function findCoords(name: string | undefined): { lat: number; lng: number } | undefined {
  if (!name) return undefined;
  const exact = GEO_COORDS[name];
  if (exact) return exact;
  const lower = name.toLowerCase();
  const match = GEO_KEYS.find(k => k.toLowerCase() === lower);
  return match ? GEO_COORDS[match] : undefined;
}

export function AuditOverviewSection({
  developmentsCount,
  precedentCount,
  sourceJurisdiction,
  destinationJurisdiction,
  sourceCity,
  destinationCity,
  thesisSummary,
  exposureClass,
  totalSavings,
  optimalStructure,
  verdict,
  fullThesis,
  rails,
  constraints,
  showMap = true // Default to showing map (Personal mode)
}: AuditOverviewSectionProps) {

  // Crisis intel from centralised context

  // Detect mobile vs desktop for map interaction settings
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Mobile breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cleanJurisdiction = (jurisdiction: string) => {
    return jurisdiction
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Extract text from thesis object if backend sends object instead of string
  const getThesisText = (thesis: any): string | undefined => {
    if (!thesis) return undefined;
    if (typeof thesis === 'string') return thesis;
    // If it's an object, try to extract the move_description field
    if (typeof thesis === 'object' && thesis.move_description) {
      return thesis.move_description;
    }
    return undefined;
  };

  const getVerdictColor = (v?: string) => {
    if (!v) return '#67E8F9'; // Default cyan like War Room
    switch (v) {
      case 'PROCEED': return '#22C55E';
      case 'RESTRUCTURE': return '#D4A843';
      case 'ABORT': return '#EF4444';
      default: return '#67E8F9';
    }
  };

  // Format field labels: remove underscores, convert to Capital Case
  const formatLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')              // underscores to spaces
      .replace(/([A-Z])/g, ' $1')      // add space before capitals
      .trim()                          // remove leading/trailing spaces
      .split(' ')                      // split into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // capitalize each word
      .join(' ');
  };

  // Format values: convert to Title Case (capitalize first letter of each word)
  const formatValue = (value: string): string => {
    if (!value) return value;
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Only build map data if showMap is true
  let auditFlow: MigrationFlow | null = null;

  if (showMap) {
    // City-first lookup: jurisdiction (city) > fallback (replicated from War Room)
    const srcCoords = findCoords(sourceCity || sourceJurisdiction);
    const dstCoords = findCoords(destinationCity || destinationJurisdiction);

    // Skip map if no coords found, but still show analysis box
    if (srcCoords && dstCoords) {
      const srcName = sourceCity || sourceJurisdiction;
      const dstName = destinationCity || destinationJurisdiction;

      // Build City objects with correct field names (latitude/longitude, NOT lat/lng)
      const sourceCity_obj: City = {
        name: cleanJurisdiction(srcName),
        country: sourceJurisdiction,
        latitude: srcCoords.lat,
        longitude: srcCoords.lng,
      };

      const destCity_obj: City = {
        name: cleanJurisdiction(dstName),
        country: destinationJurisdiction,
        latitude: dstCoords.lat,
        longitude: dstCoords.lng,
      };

      // Build label from available fields (War Room pattern)
      const label = `${cleanJurisdiction(sourceJurisdiction)} → ${cleanJurisdiction(destinationJurisdiction)}`;

      auditFlow = {
        source: sourceCity_obj,
        destination: destCity_obj,
        volume: 3000, // Match War Room volume
        type: 'outflow' as const, // Match War Room type
        label,
        color: getVerdictColor(verdict),
        // NO midpoint - removes clickable dot
      };
    } else {
      console.warn('[AuditOverview] No coordinates found for:', {
        src: sourceCity || sourceJurisdiction,
        dst: destinationCity || destinationJurisdiction,
      });
    }
  }

  return (
    <motion.div
      className="mb-10 sm:mb-16"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      {/* Full Page Map with Corridor (Personal Mode Only) */}
      {/* Mobile: 1/3 height, Desktop: 60vh */}
      {/* Desktop: Allow zoom in/pan (no zoom out), Mobile: Full interaction */}
      {showMap && auditFlow && (
        <div className="w-full h-[33vh] sm:h-[60vh] rounded-xl overflow-hidden border border-border mb-6">
          <InteractiveWorldMap
            width="100%"
            height="100%"
            showControls={true}
            cities={[]}
            migrationFlows={[auditFlow]}
            onCorridorNavigate={() => {}}
            onPopupClose={() => {}}
            showCrisisOverlay={true}
            useAbsolutePositioning={true}
          />
        </div>
      )}

      {/* Analysis Box (Always Shown) */}
      <div className="space-y-6">
        {/* User Input / Original Thesis - Featured Card */}
        {/* Report mode (linear scroll): Show descriptive fullThesis */}
        {/* Personal mode (sidebar): Show structured thesisSummary, fallback to fullThesis */}
        {(() => {
          const displayText = showMap
            ? (getThesisText(thesisSummary) || getThesisText(fullThesis))
            : getThesisText(fullThesis);

          return displayText && (
            <div className="p-6 sm:p-8 rounded-xl border-2 border-gold/20 bg-gradient-to-br from-gold/5 via-surface to-surface">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wide text-gold font-bold mb-1">Decision Thesis</h3>
                  <p className="text-xs text-muted-foreground">Strategic mandate for this evaluation</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed pl-13">
                {displayText}
              </p>
            </div>
          );
        })()}

        {/* Constraints & Rails - Side by side grid on desktop (Personal mode only) */}
        {showMap && ((constraints && typeof constraints === 'object' && Object.keys(constraints).length > 0) ||
          (rails && typeof rails === 'object' && Object.keys(rails).length > 0)) && (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Constraints */}
            {constraints && typeof constraints === 'object' && Object.keys(constraints).length > 0 && (
              <div className="p-6 rounded-xl border border-border bg-surface hover:border-gold/20 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Constraints</h3>
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  {Object.entries(constraints).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;

                    const label = formatLabel(key);
                    let displayValue: string;
                    if (Array.isArray(value)) {
                      displayValue = value.map(v => formatValue(String(v))).join(', ');
                    } else if (typeof value === 'object') {
                      displayValue = JSON.stringify(value);
                    } else {
                      displayValue = formatValue(String(value));
                    }

                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:gap-2">
                        <span className="font-bold text-foreground">{label}:</span>
                        <span className="text-foreground/70 font-medium">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rails */}
            {rails && typeof rails === 'object' && Object.keys(rails).length > 0 && (
              <div className="p-6 rounded-xl border border-border bg-surface hover:border-gold/20 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Decision Rails</h3>
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  {Object.entries(rails).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;

                    const label = formatLabel(key);
                    let displayValue: string;
                    if (Array.isArray(value)) {
                      displayValue = value.map(item => {
                        if (typeof item === 'object' && item !== null) {
                          const extracted = item.name || item.label || item.value || Object.values(item).find(v => typeof v === 'string') || JSON.stringify(item);
                          return formatValue(String(extracted));
                        }
                        return formatValue(String(item));
                      }).join(', ');
                    } else if (typeof value === 'object') {
                      displayValue = JSON.stringify(value);
                    } else {
                      displayValue = formatValue(String(value));
                    }

                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:gap-2">
                        <span className="font-bold text-foreground">{label}:</span>
                        <span className="text-foreground/70 font-medium">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Intelligence Basis - Full width banner */}
        <div className="p-6 sm:p-8 rounded-xl border border-border bg-gradient-to-r from-surface via-surface/50 to-surface">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xs uppercase tracking-wide text-emerald-500 font-bold mb-3">Intelligence Basis</h3>
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                This audit draws on{' '}
                <span className="font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded">
                  {developmentsCount.toLocaleString()}
                </span>{' '}
                validated developments from 3 years of HNWI wealth pattern tracking,
                cross-referenced against{' '}
                <span className="font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded">
                  {precedentCount.toLocaleString()}
                </span>{' '}
                corridor signals specific to the{' '}
                <span className="font-medium text-foreground">
                  {cleanJurisdiction(sourceJurisdiction)}→{cleanJurisdiction(destinationJurisdiction)}
                </span>{' '}
                corridor. All findings are citation-backed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
