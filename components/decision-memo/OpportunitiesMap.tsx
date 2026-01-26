// components/decision-memo/OpportunitiesMap.tsx
// Interactive 3D Globe Map with Filters for Decision Memo Opportunities

"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Opportunity } from '@/lib/decision-memo/memo-types';
import { Crown, TrendingUp, Gem } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useTheme } from '@/contexts/theme-context';

// Dynamically import globe to avoid SSR issues
// Using forwardRef prop pattern for react-globe.gl with Next.js dynamic imports
const Globe = dynamic(() => import('react-globe.gl').then(mod => {
  const GlobeTmpl = mod.default;
  return ({ forwardRef, ...props }: any) => <GlobeTmpl {...props} ref={forwardRef} />;
}), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-background border border-border rounded-lg">
      <div className="text-primary">Loading opportunities map...</div>
    </div>
  )
});

interface OpportunitiesMapProps {
  opportunities: Opportunity[];
  onOpportunityClick: (opportunity: Opportunity) => void;
}

const MIN_PRICE = 0;
const MAX_PRICE = 2000000; // $2M+ max to match dashboard

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M${value === MAX_PRICE ? '+' : ''}`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function OpportunitiesMap({ opportunities, onOpportunityClick }: OpportunitiesMapProps) {
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const globeRef = useRef<any>(null);

  // Filters
  const [showCrownVault, setShowCrownVault] = useState(true);
  const [showPrive, setShowPrive] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Filter opportunities based on type and price
  const filteredOpportunities = opportunities.filter(opp => {
    // Type filter - check tier field
    const tier = opp.tier?.toLowerCase() || '';
    const isCrown = tier.includes('crown');
    const isPrive = tier.includes('privé') || tier.includes('prive');
    const isHNWI = !isCrown && !isPrive; // Everything else is HNWI Pattern

    // Check if this type is enabled
    let typeMatch = false;
    if (isCrown && showCrownVault) typeMatch = true;
    if (isPrive && showPrive) typeMatch = true;
    if (isHNWI && showHNWIPatterns) typeMatch = true;

    if (!typeMatch) return false;

    // Price filter - only apply if we can extract a price
    const returnStr = opp.expected_return || opp.minimum_investment || '';
    const priceMatch = returnStr.match(/[\d,]+/);
    if (priceMatch) {
      const price = parseInt(priceMatch[0].replace(/,/g, ''));
      // Only filter out if price is outside range
      if (price < priceRange[0] || price > priceRange[1]) return false;
    }
    // If no price found, include the opportunity (don't filter it out)

    return true;
  });

  // Convert opportunities to map points
  const mapPoints = filteredOpportunities
    .filter(opp => {
      const hasCoords = opp.latitude && opp.longitude;
      if (!hasCoords) {
        console.warn('⚠️ Opportunity missing coordinates:', opp.title, opp);
      }
      return hasCoords;
    })
    .map(opp => ({
      lat: opp.latitude!,
      lng: opp.longitude!,
      size: 0.6, // Larger dots for visibility
      color: getDNAColor(opp.dna_match_score || 0),
      opportunity: opp,
      category: opp.category || 'investment'
    }));

  // Comprehensive debug logging
  console.log('🗺️ OpportunitiesMap Debug:', {
    totalOpportunities: opportunities.length,
    filteredCount: filteredOpportunities.length,
    withCoordinates: mapPoints.length,
    filters: { showCrownVault, showPrive, showHNWIPatterns, priceRange },
    sampleOpportunity: opportunities[0],
    sampleMapPoint: mapPoints[0],
    allOpportunityTiers: opportunities.map(o => o.tier),
    mapPointsCoordinates: mapPoints.map(p => ({ lat: p.lat, lng: p.lng, title: p.opportunity.title }))
  });

  // Get color based on DNA match score
  function getDNAColor(score: number): string {
    if (score >= 70) return '#DAA520'; // Gold for high match
    if (score >= 50) return '#FFA500'; // Orange for medium match
    return '#FF6B6B'; // Red for low match
  }

  // Get category icon SVG
  function getCategoryIcon(category: string, color: string): string {
    const cat = category?.toLowerCase() || '';

    // Crown for premium/luxury
    if (cat.includes('premium') || cat.includes('luxury')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2">
        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
        <path d="M5 21h14"/>
      </svg>`;
    }

    // Real estate
    if (cat.includes('real estate') || cat.includes('property')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
        <rect x="3" y="1" width="18" height="22" rx="1"/>
        <rect x="7" y="5" width="3" height="3"/>
        <rect x="14" y="5" width="3" height="3"/>
        <rect x="7" y="11" width="3" height="3"/>
        <rect x="14" y="11" width="3" height="3"/>
      </svg>`;
    }

    // Yacht
    if (cat.includes('yacht') || cat.includes('marine')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2">
        <circle cx="12" cy="5" r="3"/>
        <path d="M12 22V8"/>
        <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
      </svg>`;
    }

    // Default diamond for investment
    return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2">
      <path d="M6 3h12l4 6-10 13L2 9Z"/>
      <path d="M11 3 8 9l4 13 4-13-3-6"/>
    </svg>`;
  }

  // Handle point click
  const handlePointClick = (point: any) => {
    setSelectedOpp(point.opportunity);
    onOpportunityClick(point.opportunity);

    // Zoom to the point for street-level view
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: point.lat,
        lng: point.lng,
        altitude: 0.05
      }, 1000);
    }
  };

  // Custom HTML for point labels (tooltips on hover)
  const pointLabel = (point: any) => {
    const opp = point.opportunity;
    const icon = getCategoryIcon(point.category, point.color);

    return `
      <div style="
        background: ${isDarkMode ? 'rgba(0,0,0,0.98)' : 'rgba(255,255,255,0.98)'};
        padding: 16px;
        border-radius: 12px;
        border: 2px solid ${point.color};
        max-width: 350px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        backdrop-filter: blur(10px);
      ">
        <!-- DNA Match Score Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${icon}
            <div style="color: ${point.color}; font-size: 16px; font-weight: bold;">
              ${opp.dna_match_score || 0}% Match
            </div>
          </div>
          <div style="background: ${point.color}20; padding: 4px 10px; border-radius: 12px;">
            <div style="color: ${point.color}; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              ${opp.tier}
            </div>
          </div>
        </div>

        <!-- Title -->
        <div style="color: ${isDarkMode ? '#fff' : '#000'}; font-size: 14px; font-weight: 600; margin-bottom: 8px; line-height: 1.4;">
          ${opp.title}
        </div>

        <!-- Location & Category -->
        <div style="display: flex; gap: 12px; margin-bottom: 12px; font-size: 11px;">
          <div style="color: ${isDarkMode ? '#999' : '#666'};">
            📍 ${opp.location}
          </div>
          ${opp.category ? `
            <div style="color: ${isDarkMode ? '#999' : '#666'};">
              💼 ${opp.category}
            </div>
          ` : ''}
        </div>

        <!-- Expected Return -->
        <div style="background: ${isDarkMode ? '#1a1a1a' : '#f5f5f5'}; padding: 10px; border-radius: 8px; margin-bottom: 12px;">
          <div style="color: ${isDarkMode ? '#aaa' : '#666'}; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
            Expected Return
          </div>
          <div style="color: ${point.color}; font-size: 14px; font-weight: 700;">
            ${opp.expected_return}
          </div>
        </div>

        <!-- Call to Action -->
        <div style="
          background: ${point.color}15;
          border: 1px solid ${point.color}40;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
        ">
          <div style="color: ${point.color}; font-size: 11px; font-weight: 600; letter-spacing: 0.3px;">
            🔍 CLICK FOR FULL ANALYSIS & CITATION
          </div>
        </div>
      </div>
    `;
  };

  // Reset globe view
  const handleReset = () => {
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: 20,
        lng: 0,
        altitude: 2.5
      }, 1000);
    }
    setSelectedOpp(null);
  };

  const globeContent = (fullscreen: boolean) => (
    <div className="relative w-full h-full">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="bg-card/90 backdrop-blur border border-border rounded-lg p-2 hover:bg-card transition-all shadow-lg"
          title="Reset View"
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="bg-card/90 backdrop-blur border border-border rounded-lg p-2 hover:bg-card transition-all shadow-lg"
          title={fullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {fullscreen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            )}
          </svg>
        </button>
      </div>

      {/* Globe */}
      <div className={`w-full h-full ${isDarkMode ? 'bg-black' : 'bg-slate-100'}`}>
        <Globe
          forwardRef={globeRef}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundImageUrl={isDarkMode ? "https://unpkg.com/three-globe/example/img/night-sky.png" : undefined}
          backgroundColor={isDarkMode ? 'rgba(0,0,0,1)' : 'rgba(226,232,240,1)'}
          pointsData={mapPoints}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude={0.01}
          pointLabel={pointLabel}
          onPointClick={handlePointClick}
          enablePointerInteraction={true}
          pointResolution={12}
          atmosphereAltitude={0.15}
          atmosphereColor={isDarkMode ? '#DAA520' : '#3B82F6'}
          width={fullscreen && typeof window !== 'undefined' ? window.innerWidth : undefined}
          height={fullscreen && typeof window !== 'undefined' ? window.innerHeight : 600}
          animateIn={false}
        />
      </div>

      {/* Professional Filter Controls - Matching Home Dashboard */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-3">
          {/* Price Range Slider */}
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg min-w-[360px] flex flex-col items-center gap-1.5">
            <div className="text-[10px] font-medium text-muted-foreground text-center">
              {formatCurrency(priceRange[0])} — {formatCurrency(priceRange[1])}
            </div>

            <div className="w-[90%]">
              <Slider
                range
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={50000}
                value={priceRange}
                onChange={(val) => {
                  if (Array.isArray(val) && val.length === 2) {
                    setPriceRange([val[0], val[1]]);
                  }
                }}
                styles={{
                  rail: {
                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    height: 3,
                  },
                  track: {
                    backgroundColor: theme === 'dark' ? '#DAA520' : '#000',
                    height: 3,
                  },
                  handle: {
                    width: 14,
                    height: 14,
                    marginTop: -5.5,
                    opacity: 1,
                    backgroundColor: theme === 'dark' ? '#DAA520' : '#000',
                    border: `2px solid ${theme === 'dark' ? '#fff' : '#000'}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  },
                }}
              />
            </div>
          </div>

          {/* Filter Icon Toggles */}
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
            <button
              onClick={() => setShowCrownVault(!showCrownVault)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                showCrownVault
                  ? theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-black text-white font-medium'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              <span>Crown Vault</span>
            </button>

            <button
              onClick={() => setShowPrive(!showPrive)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                showPrive
                  ? theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-black text-white font-medium'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Gem className="h-3.5 w-3.5" />
              <span>Privé</span>
            </button>

            <button
              onClick={() => setShowHNWIPatterns(!showHNWIPatterns)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                showHNWIPatterns
                  ? theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-black text-white font-medium'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>HNWI Patterns</span>
            </button>
          </div>

          {/* Results Counter */}
          <div className="text-[10px] text-muted-foreground">
            Showing {mapPoints.length} of {opportunities.length} opportunities
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Normal View */}
      {!isFullscreen && (
        <div className="relative rounded-lg overflow-hidden border border-border">
          {globeContent(false)}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background">
          {globeContent(true)}
        </div>
      )}
    </>
  );
}
