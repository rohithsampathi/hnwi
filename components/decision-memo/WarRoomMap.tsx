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
  status: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface WarRoomMapProps {
  audits: Audit[];
  onAuditClick: (intakeId: string) => void;
}

// Country coordinates (simplified - you can expand this)
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  'India': { lat: 20.5937, lng: 78.9629 },
  'Portugal': { lat: 39.3999, lng: -8.2245 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'United Arab Emirates': { lat: 23.4241, lng: 53.8478 },
  'UAE': { lat: 23.4241, lng: 53.8478 },
  'United States': { lat: 37.0902, lng: -95.7129 },
  'USA': { lat: 37.0902, lng: -95.7129 },
  'United Kingdom': { lat: 55.3781, lng: -3.4360 },
  'UK': { lat: 55.3781, lng: -3.4360 },
  'Switzerland': { lat: 46.8182, lng: 8.2275 },
  'Spain': { lat: 40.4637, lng: -3.7492 },
  'France': { lat: 46.2276, lng: 2.2137 },
  'Germany': { lat: 51.1657, lng: 10.4515 },
  'Italy': { lat: 41.8719, lng: 12.5674 },
  'Netherlands': { lat: 52.1326, lng: 5.2913 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Japan': { lat: 36.2048, lng: 138.2529 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'Canada': { lat: 56.1304, lng: -106.3468 },
  'Mexico': { lat: 23.6345, lng: -102.5528 },
};

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
  const [globeInstance, setGlobeInstance] = useState<GlobeMethods>();
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

  // Convert audits to arc data (routes between countries)
  const arcsData = useMemo(() => {
    return audits.map(audit => {
      const sourceCoords = COUNTRY_COORDS[audit.source_country] || COUNTRY_COORDS[audit.source_jurisdiction];
      const destCoords = COUNTRY_COORDS[audit.destination_country] || COUNTRY_COORDS[audit.destination_jurisdiction];

      if (!sourceCoords || !destCoords) {
        console.warn(`Missing coordinates for ${audit.source_jurisdiction} or ${audit.destination_jurisdiction}`);
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
    }).filter(Boolean);
  }, [audits]);

  // Labels data for audit cards (positioned at midpoint of route)
  const labelsData = useMemo(() => {
    return arcsData.map(arc => {
      if (!arc) return null;

      // Calculate midpoint
      const midLat = (arc.startLat + arc.endLat) / 2;
      const midLng = (arc.startLng + arc.endLng) / 2;

      return {
        lat: midLat,
        lng: midLng,
        audit: arc.audit,
        color: arc.color,
      };
    }).filter(Boolean);
  }, [arcsData]);

  return (
    <div className="relative w-full h-full">
      <Globe
        ref={setGlobeInstance}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

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
                    Total Savings
                  </div>
                  <div className="text-sm font-semibold text-gold">
                    {selectedAudit.total_savings}
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
        <span className="font-semibold text-gold">{audit.total_savings}</span>
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
