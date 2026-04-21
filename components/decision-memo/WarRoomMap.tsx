'use client';

import { useEffect, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as d3 from 'd3';
import { FileText, TrendingUp, AlertTriangle, CheckCircle, Building2, Briefcase, Home, Package, Landmark, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Audit {
  intake_id: string;
  source_jurisdiction: string;
  destination_jurisdiction: string;
  source_country: string;
  destination_country: string;
  created_at: string;
  verdict: 'PROCEED' | 'RESTRUCTURE' | 'ABORT';
  exposure_class: string;
  total_savings: string;
  annual_value: string;
  status: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface WarRoomMapProps {
  audits: Audit[];
  onAuditClick: (intakeId: string) => void;
}

// City + country coordinates (expanded to match War Room)
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
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
  // Cities — Middle East
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
  'Riyadh': { lat: 24.7136, lng: 46.6753 },
  'Doha': { lat: 25.2854, lng: 51.5310 },
  // Cities — Asia-Pacific
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Melbourne': { lat: -37.8136, lng: 144.9631 },
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
  'Shanghai': { lat: 31.2304, lng: 121.4737 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  // Cities — Americas
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Toronto': { lat: 43.6532, lng: -79.3832 },
  'Sao Paulo': { lat: -23.5505, lng: -46.6333 },
  'Mexico City': { lat: 19.4326, lng: -99.1332 },
  // Cities — Africa
  'Port Louis': { lat: -20.1609, lng: 57.5012 },
  'Cape Town': { lat: -33.9249, lng: 18.4241 },
  'Johannesburg': { lat: -26.2041, lng: 28.0473 },
  // Country fallbacks (map to financial hub)
  'India': { lat: 19.0760, lng: 72.8777 },       // Mumbai
  'Portugal': { lat: 38.7223, lng: -9.1393 },     // Lisbon
  'United Arab Emirates': { lat: 25.2048, lng: 55.2708 }, // Dubai
  'UAE': { lat: 25.2048, lng: 55.2708 },
  'United States': { lat: 40.7128, lng: -74.0060 }, // New York
  'USA': { lat: 40.7128, lng: -74.0060 },
  'US': { lat: 40.7128, lng: -74.0060 },
  'United Kingdom': { lat: 51.5074, lng: -0.1278 }, // London
  'UK': { lat: 51.5074, lng: -0.1278 },
  'Switzerland': { lat: 47.3769, lng: 8.5417 },   // Zurich
  'Spain': { lat: 40.4168, lng: -3.7038 },        // Madrid
  'France': { lat: 48.8566, lng: 2.3522 },        // Paris
  'Germany': { lat: 52.5200, lng: 13.4050 },      // Berlin
  'Italy': { lat: 41.9028, lng: 12.4964 },        // Rome
  'Netherlands': { lat: 52.3676, lng: 4.9041 },   // Amsterdam
  'Japan': { lat: 35.6762, lng: 139.6503 },       // Tokyo
  'Australia': { lat: -33.8688, lng: 151.2093 },   // Sydney
  'Canada': { lat: 43.6532, lng: -79.3832 },      // Toronto
  'Mexico': { lat: 19.4326, lng: -99.1332 },      // Mexico City
  'Thailand': { lat: 13.7563, lng: 100.5018 },    // Bangkok
  'Malaysia': { lat: 3.1390, lng: 101.6869 },     // Kuala Lumpur
  'Greece': { lat: 37.9838, lng: 23.7275 },       // Athens
  'Ireland': { lat: 53.3498, lng: -6.2603 },      // Dublin
  'South Africa': { lat: -26.2041, lng: 28.0473 }, // Johannesburg
  'Mauritius': { lat: -20.1609, lng: 57.5012 },   // Port Louis
  'Brazil': { lat: -23.5505, lng: -46.6333 },     // Sao Paulo
  'South Korea': { lat: 37.5665, lng: 126.9780 }, // Seoul
  'China': { lat: 31.2304, lng: 121.4737 },       // Shanghai
  // Indian States
  'Telangana': { lat: 17.3850, lng: 78.4867 },
  'Maharashtra': { lat: 19.0760, lng: 72.8777 },
  'Karnataka': { lat: 12.9716, lng: 77.5946 },
  'Tamil Nadu': { lat: 13.0827, lng: 80.2707 },
  'Gujarat': { lat: 23.0225, lng: 72.5714 },
};

// Case-insensitive coord lookup with comma-split fallback
const COORD_KEYS = Object.keys(COUNTRY_COORDS);
const COORD_LOWER_MAP = new Map(COORD_KEYS.map(k => [k.toLowerCase(), k]));

function findCoords(name: string | undefined): { lat: number; lng: number } | undefined {
  if (!name) return undefined;
  const exact = COUNTRY_COORDS[name];
  if (exact) return exact;
  const lower = name.trim().toLowerCase();
  const ciMatch = COORD_LOWER_MAP.get(lower);
  if (ciMatch) return COUNTRY_COORDS[ciMatch];
  // Split on common delimiters and try each part
  const parts = name.split(/[,\/→>-]+/).map(p => p.trim()).filter(Boolean);
  for (const part of parts) {
    const partExact = COUNTRY_COORDS[part];
    if (partExact) return partExact;
    const partMatch = COORD_LOWER_MAP.get(part.toLowerCase());
    if (partMatch) return COUNTRY_COORDS[partMatch];
  }
  return undefined;
}

function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'PROCEED': return '#22C55E';
    case 'RESTRUCTURE': return '#D4A843';
    case 'ABORT': return '#EF4444';
    default: return '#D4A843';
  }
}

function getVerdictIcon(verdict: string) {
  switch (verdict) {
    case 'PROCEED': return CheckCircle;
    case 'RESTRUCTURE': return TrendingUp;
    case 'ABORT': return AlertTriangle;
    default: return FileText;
  }
}

function getTransactionTypeIcon(exposureClass: string) {
  const type = exposureClass.toLowerCase();
  if (type.includes('real estate') || type.includes('property')) return Home;
  if (type.includes('business') || type.includes('company')) return Building2;
  if (type.includes('portfolio') || type.includes('investment')) return Briefcase;
  if (type.includes('asset') || type.includes('trust')) return Landmark;
  return Package; // Default for other types
}

export default function WarRoomMap({
  audits,
  onAuditClick
}: WarRoomMapProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredAudit, setHoveredAudit] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 64 // Account for header
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  type ArcDatum = {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string;
    audit: Audit;
  };

  type LabelDatum = {
    lat: number;
    lng: number;
    audit: Audit;
    color: string;
  };

  // Convert audits to arc data (routes between countries)
  const arcsData = useMemo<ArcDatum[]>(() => {
    return audits.map(audit => {
      const sourceCoords = findCoords(audit.source_country) || findCoords(audit.source_jurisdiction);
      const destCoords = findCoords(audit.destination_country) || findCoords(audit.destination_jurisdiction);

      if (!sourceCoords || !destCoords) {
        return null;
      }

      return {
        startLat: sourceCoords.lat,
        startLng: sourceCoords.lng,
        endLat: destCoords.lat,
        endLng: destCoords.lng,
        color: getVerdictColor(audit.verdict),
        audit,
      };
    }).filter((arc): arc is ArcDatum => arc !== null);
  }, [audits]);

  // Labels data for audit cards (positioned at midpoint of route)
  const labelsData = useMemo<LabelDatum[]>(() => {
    return arcsData.map(arc => {
      // Calculate midpoint
      const midLat = (arc.startLat + arc.endLat) / 2;
      const midLng = (arc.startLng + arc.endLng) / 2;

      return {
        lat: midLat,
        lng: midLng,
        audit: arc.audit,
        color: arc.color,
      };
    });
  }, [arcsData]);

  return (
    <div className="relative w-full h-full">
      <Globe
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="/assets/globe/earth-night.jpg"
        backgroundImageUrl="/assets/globe/night-sky.png"

        // Arcs (routes)
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        arcStroke={0.5}

        // Labels (transaction type dots)
        labelsData={labelsData}
        labelLat="lat"
        labelLng="lng"
        labelText={(d: any) => ''}
        labelSize={2}
        labelDotRadius={0.6}
        labelColor={(d: any) => d.color}
        labelResolution={2}

        // Interactions
        onLabelClick={(label: any) => {
          if (label.audit) {
            setSelectedAudit(label.audit);
          }
        }}
        onLabelHover={(label: any) => {
          setHoveredAudit(label?.audit?.intake_id || null);
        }}

        // Styling
        atmosphereColor="#D4A843"
        atmosphereAltitude={0.15}
      />

      {/* Hover tooltip */}
      {hoveredAudit && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          {labelsData.find(l => l?.audit?.intake_id === hoveredAudit)?.audit && (
            <AuditCard
              audit={labelsData.find(l => l?.audit?.intake_id === hoveredAudit)!.audit}
              isHovered
            />
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-6 right-6 bg-surface/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl">
        <div className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
          Verdict Legend
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22C55E' }} />
            <span className="text-xs text-muted-foreground">Proceed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#D4A843' }} />
            <span className="text-xs text-muted-foreground">Restructure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
            <span className="text-xs text-muted-foreground">Abort</span>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      {selectedAudit && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const TransactionIcon = getTransactionTypeIcon(selectedAudit.exposure_class);
                  const VerdictIcon = getVerdictIcon(selectedAudit.verdict);
                  const color = getVerdictColor(selectedAudit.verdict);
                  return (
                    <>
                      <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                        <TransactionIcon className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <VerdictIcon className="w-4 h-4" style={{ color }} />
                          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color }}>
                            {selectedAudit.verdict}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          ID: {selectedAudit.intake_id.slice(-12)}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Route */}
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Migration Route</div>
                <div className="text-lg font-semibold text-foreground">
                  {selectedAudit.source_jurisdiction} → {selectedAudit.destination_jurisdiction}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Transaction Type
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {selectedAudit.exposure_class}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Annual Savings
                  </div>
                  <div className="text-sm font-semibold text-gold">
                    {selectedAudit.annual_value || selectedAudit.total_savings}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Risk Level
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {selectedAudit.risk_level}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Date Created
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {new Date(selectedAudit.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-border">
                <Button
                  onClick={() => onAuditClick(selectedAudit.intake_id)}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                >
                  View Full Audit Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditCard({ audit, isHovered }: { audit: Audit; isHovered?: boolean }) {
  const Icon = getVerdictIcon(audit.verdict);
  const color = getVerdictColor(audit.verdict);

  return (
    <div
      className={`
        bg-surface border rounded-lg p-3 min-w-[280px] shadow-2xl
        transition-all duration-200
        ${isHovered ? 'scale-105 border-gold' : 'border-border'}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            {audit.verdict}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {audit.intake_id.slice(-8)}
        </span>
      </div>

      <div className="text-sm font-medium text-foreground mb-1">
        {audit.source_jurisdiction} → {audit.destination_jurisdiction}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{audit.exposure_class}</span>
        <span className="font-semibold text-gold">{audit.annual_value || audit.total_savings}</span>
      </div>

      <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
        {new Date(audit.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
    </div>
  );
}
