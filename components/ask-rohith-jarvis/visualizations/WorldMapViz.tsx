// components/ask-rohith-jarvis/visualizations/WorldMapViz.tsx
// Interactive world map showing opportunities, assets, and HNWI migration patterns

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { CornerBrackets } from '@/components/decision-memo/personal/HolographicEffects';
import { getCurrentUserId } from '@/lib/secure-api';
import type { City, MigrationFlow } from '@/components/interactive-world-map';

// Dynamically import InteractiveWorldMap to avoid SSR issues with Leaflet
const InteractiveWorldMap = dynamic(
  () => import('@/components/interactive-world-map').then(mod => mod.InteractiveWorldMap),
  { ssr: false }
);

interface WorldMapVizProps {
  data: {
    cities?: City[];
    fetch_endpoint?: string;
    user_id?: string;
    title?: string;
    show_crown_assets?: boolean;
    show_prive_opportunities?: boolean;
    show_hnwi_patterns?: boolean;
    auto_fetch_opportunities?: boolean; // NEW: Auto-fetch command centre data
  };
  onClose?: () => void;
  onExpand?: () => void;
  interactive?: boolean;
}

export default function WorldMapViz({
  data,
  onClose,
  onExpand,
  interactive = true
}: WorldMapVizProps) {
  const [cities, setCities] = useState<City[]>(data.cities || []);
  const [migrationFlows, setMigrationFlows] = useState<MigrationFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        // If cities already provided, use them
        if (data.cities && data.cities.length > 0) {
          setCities(data.cities);
          setLoading(false);
          return;
        }

        // Get current user ID
        const userId = data.user_id || getCurrentUserId();
        const allCities: City[] = [];

        // Auto-fetch command centre opportunities (default behavior)
        if (data.auto_fetch_opportunities !== false) {
          try {
            if (process.env.NODE_ENV === 'development') {
              console.log('[WorldMapViz] Auto-fetching command centre opportunities...');
            }

            const oppResponse = await fetch(
              `/api/command-centre/opportunities?include_crown_vault=true&view=all&timeframe=LIVE`,
              { credentials: 'include' }
            );

            if (oppResponse.ok) {
              const oppData = await oppResponse.json();

              if (process.env.NODE_ENV === 'development') {
                console.log('[WorldMapViz] Fetched opportunities:', {
                  prive: oppData.prive_opportunities?.length || 0,
                  crown: oppData.crown_vault_opportunities?.length || 0
                });
              }

              // Process Privé opportunities
              if (oppData.prive_opportunities) {
                oppData.prive_opportunities.forEach((opp: any) => {
                  // Extract location from opportunity data
                  const location = extractLocation(opp);
                  if (location.latitude && location.longitude) {
                    allCities.push({
                      name: location.city,
                      country: location.country,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      title: opp.title || opp.opportunity_title,
                      tier: opp.tier,
                      value: opp.investment_size || opp.value,
                      risk: opp.risk_level,
                      category: opp.category || 'opportunity',
                      industry: opp.industry,
                      is_new: opp.is_new,
                      victor_score: opp.victor_score,
                      analysis: opp.elite_pulse_analysis || opp.analysis
                    });
                  }
                });
              }

              // Process Crown Vault assets
              if (oppData.crown_vault_opportunities) {
                oppData.crown_vault_opportunities.forEach((asset: any) => {
                  const location = extractLocation(asset);
                  if (location.latitude && location.longitude) {
                    allCities.push({
                      name: location.city,
                      country: location.country,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      title: asset.asset_name || asset.name,
                      value: `$${asset.estimated_value?.toLocaleString() || asset.current_price?.toLocaleString()}`,
                      category: asset.asset_type || 'crown_vault',
                      current_price: asset.current_price,
                      entry_price: asset.entry_price,
                      appreciation: asset.appreciation
                    });
                  }
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch opportunities:', err);
          }
        }

        // Fetch from custom endpoint if provided
        if (data.fetch_endpoint) {
          try {
            const url = userId
              ? `${data.fetch_endpoint}?user_id=${userId}`
              : data.fetch_endpoint;

            const response = await fetch(url, { credentials: 'include' });
            if (response.ok) {
              const result = await response.json();
              const fetchedCities = result.cities || result.opportunities || [];
              allCities.push(...fetchedCities);
            }
          } catch (err) {
            console.error('Failed to fetch from custom endpoint:', err);
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('[WorldMapViz] Total cities before migration hubs:', allCities.length);
        }

        // Add migration data with bubbles if HNWI patterns enabled
        if (data.show_hnwi_patterns !== false) {
          // Add major migration hubs with current numbers
          const migrationHubs = getMigrationHubs();
          allCities.push(...migrationHubs);

          if (process.env.NODE_ENV === 'development') {
            console.log('[WorldMapViz] Added migration hubs:', migrationHubs.length);
            console.log('[WorldMapViz] Migration hub cities:', migrationHubs.map(h => h.name));
          }
        }

        // Generate migration flows if HNWI patterns enabled
        if (data.show_hnwi_patterns !== false) {
          const flows = generateMigrationFlows(allCities);
          setMigrationFlows(flows);

          if (process.env.NODE_ENV === 'development') {
            console.log('[WorldMapViz] Migration flows generated:', flows.length);
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('[WorldMapViz] Final cities count:', allCities.length);
        }

        setCities(allCities);
      } catch (err) {
        console.error('Failed to fetch map data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [data.fetch_endpoint, data.user_id, data.cities, data.auto_fetch_opportunities, data.show_hnwi_patterns]);

  // Don't render if no data after loading
  if (!loading && (cities.length === 0 || error)) {
    return null;
  }

  return (
    <div className="relative bg-surface/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <CornerBrackets size={12} thickness={2} color="#D4A843" />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          {data.title || 'Geographic Intelligence'}
        </h3>
        {interactive && (
          <div className="flex items-center gap-2">
            {onExpand && (
              <button onClick={onExpand} className="p-1 hover:bg-surface-hover rounded">
                <Maximize2 className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative" style={{ height: '500px' }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="inline-block w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <InteractiveWorldMap
              cities={cities}
              migrationFlows={migrationFlows}
              showControls={true}
              showCrownAssets={data.show_crown_assets !== false}
              showPriveOpportunities={data.show_prive_opportunities !== false}
              showHNWIPatterns={data.show_hnwi_patterns !== false}
              showCrisisOverlay={true}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * Generate migration flows from city data
 */
function generateMigrationFlows(cities: City[]): MigrationFlow[] {
  const flows: MigrationFlow[] = [];

  if (process.env.NODE_ENV === 'development') {
    console.log('[WorldMapViz] Generating migration flows from cities:', cities.length);
    console.log('[WorldMapViz] City names:', cities.map(c => c.name));
  }

  // Define major migration corridors with volumes
  const corridors = [
    // Dubai inflows
    { source: 'Mumbai', destination: 'Dubai', volume: 2200, type: 'inflow' as const },
    { source: 'London', destination: 'Dubai', volume: 1800, type: 'inflow' as const },
    { source: 'Hong Kong', destination: 'Dubai', volume: 1200, type: 'inflow' as const },

    // Singapore inflows
    { source: 'Hong Kong', destination: 'Singapore', volume: 1500, type: 'inflow' as const },
    { source: 'Mumbai', destination: 'Singapore', volume: 1000, type: 'inflow' as const },

    // London outflows
    { source: 'London', destination: 'Monaco', volume: 500, type: 'outflow' as const },
    { source: 'London', destination: 'Dubai', volume: 1800, type: 'outflow' as const },

    // Hong Kong outflows
    { source: 'Hong Kong', destination: 'Singapore', volume: 1500, type: 'outflow' as const },
    { source: 'Hong Kong', destination: 'London', volume: 800, type: 'outflow' as const },

    // New York internal migration (showing as balanced)
    { source: 'New York', destination: 'Dubai', volume: 400, type: 'outflow' as const }
  ];

  // Create flows by matching corridor cities with actual city data
  corridors.forEach(corridor => {
    const sourceCity = cities.find(city => {
      const cityName = city.name.toLowerCase();
      const corridorSource = corridor.source.toLowerCase();
      return cityName === corridorSource || cityName.includes(corridorSource) || corridorSource.includes(cityName);
    });

    const destCity = cities.find(city => {
      const cityName = city.name.toLowerCase();
      const corridorDest = corridor.destination.toLowerCase();
      return cityName === corridorDest || cityName.includes(corridorDest) || corridorDest.includes(cityName);
    });

    if (sourceCity && destCity) {
      flows.push({
        source: sourceCity,
        destination: destCity,
        volume: corridor.volume,
        type: corridor.type,
        label: `${corridor.type === 'inflow' ? '+' : '-'}${corridor.volume.toLocaleString()} HNWIs`
      });
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`[WorldMapViz] Could not find cities for corridor: ${corridor.source} → ${corridor.destination}`, {
        sourceFound: !!sourceCity,
        destFound: !!destCity
      });
    }
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[WorldMapViz] Generated migration flows:', flows.length);
  }

  return flows;
}

/**
 * Extract location data from opportunity/asset object
 */
function extractLocation(item: any): {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
} {
  // Direct location fields
  if (item.latitude && item.longitude) {
    return {
      city: item.city || item.name || item.jurisdiction || 'Unknown',
      country: item.country || item.jurisdiction || '',
      latitude: item.latitude,
      longitude: item.longitude
    };
  }

  // Jurisdiction-based lookup
  const jurisdiction = item.jurisdiction || item.location || '';
  const coords = getJurisdictionCoordinates(jurisdiction);

  return {
    city: item.city || jurisdiction || 'Unknown',
    country: item.country || jurisdiction || '',
    latitude: coords?.latitude,
    longitude: coords?.longitude
  };
}

/**
 * Get coordinates for major jurisdictions
 */
function getJurisdictionCoordinates(jurisdiction: string): { latitude: number; longitude: number } | null {
  const coords: Record<string, { latitude: number; longitude: number }> = {
    // Major HNWI hubs
    'Dubai': { latitude: 25.2048, longitude: 55.2708 },
    'UAE': { latitude: 25.2048, longitude: 55.2708 },
    'Singapore': { latitude: 1.3521, longitude: 103.8198 },
    'London': { latitude: 51.5074, longitude: -0.1278 },
    'UK': { latitude: 51.5074, longitude: -0.1278 },
    'New York': { latitude: 40.7128, longitude: -74.0060 },
    'NYC': { latitude: 40.7128, longitude: -74.0060 },
    'USA': { latitude: 40.7128, longitude: -74.0060 },
    'Hong Kong': { latitude: 22.3193, longitude: 114.1694 },
    'Monaco': { latitude: 43.7384, longitude: 7.4246 },
    'Zurich': { latitude: 47.3769, longitude: 8.5417 },
    'Switzerland': { latitude: 47.3769, longitude: 8.5417 },
    'Cayman Islands': { latitude: 19.3133, longitude: -81.2546 },
    'Luxembourg': { latitude: 49.6116, longitude: 6.1319 },
    'Paris': { latitude: 48.8566, longitude: 2.3522 },
    'France': { latitude: 48.8566, longitude: 2.3522 },
    'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'India': { latitude: 19.0760, longitude: 72.8777 },
    'Sydney': { latitude: -33.8688, longitude: 151.2093 },
    'Australia': { latitude: -33.8688, longitude: 151.2093 },
    'Toronto': { latitude: 43.6532, longitude: -79.3832 },
    'Canada': { latitude: 43.6532, longitude: -79.3832 }
  };

  return coords[jurisdiction] || null;
}

/**
 * Get major HNWI migration hubs with current numbers
 */
function getMigrationHubs(): City[] {
  return [
    {
      name: 'Dubai',
      country: 'UAE',
      latitude: 25.2048,
      longitude: 55.2708,
      title: 'HNWI Migration Hub',
      category: 'migration',
      population: '72,500 HNWIs (2025)',
      analysis: 'Net inflow: +6,700 HNWIs. Top sources: India, UK, Russia. Drivers: 0% income tax, golden visa, lifestyle.'
    },
    {
      name: 'Singapore',
      country: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      title: 'HNWI Migration Hub',
      category: 'migration',
      population: '244,800 HNWIs (2025)',
      analysis: 'Net inflow: +3,400 HNWIs. Top sources: China, Hong Kong, India. Drivers: Stability, low tax, business hub.'
    },
    {
      name: 'London',
      country: 'UK',
      latitude: 51.5074,
      longitude: -0.1278,
      title: 'HNWI Migration Hub',
      category: 'migration',
      population: '258,000 HNWIs (2025)',
      analysis: 'Net outflow: -1,500 HNWIs. Destinations: Dubai, Monaco, Switzerland. Drivers: Non-dom changes, tax increases.'
    },
    {
      name: 'New York',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060,
      title: 'HNWI Migration Hub',
      category: 'migration',
      population: '349,500 HNWIs (2025)',
      analysis: 'Stable population. Minor outflow to Florida, Texas. Drivers: High state taxes, lifestyle preferences.'
    },
    {
      name: 'Hong Kong',
      country: 'Hong Kong',
      latitude: 22.3193,
      longitude: 114.1694,
      title: 'HNWI Migration Hub',
      category: 'migration',
      population: '125,100 HNWIs (2025)',
      analysis: 'Net outflow: -2,800 HNWIs. Destinations: Singapore, UK, Canada. Drivers: Political uncertainty, COVID policies.'
    },
    {
      name: 'Monaco',
      country: 'Monaco',
      latitude: 43.7384,
      longitude: 7.4246,
      title: 'HNWI Migration Hub',
      category: 'migration',
      population: '12,400 HNWIs (2025)',
      analysis: 'Net inflow: +300 HNWIs. Top sources: UK, France, Russia. Drivers: 0% income tax, security, luxury lifestyle.'
    }
  ];
}
