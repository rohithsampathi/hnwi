"use client";

import { useState, useEffect } from 'react';
import { useCrownVaultMutations } from '@/hooks/use-crown-vault-mutations';
import {
  getCrownVaultAssets,
  getCrownVaultHeirs,
  getCrownVaultStats,
  type CrownVaultAsset,
  type CrownVaultHeir,
  type CrownVaultStats
} from '@/lib/api';

/**
 * Example component showing how to use optimized Crown Vault mutations
 * with automatic cache refresh and instant UI updates
 */
export function OptimizedCrownVaultExample() {
  const [assets, setAssets] = useState<CrownVaultAsset[]>([]);
  const [heirs, setHeirs] = useState<CrownVaultHeir[]>([]);
  const [stats, setStats] = useState<CrownVaultStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the mutations hook with data refresh callback
  const mutations = useCrownVaultMutations({
    onDataRefresh: (freshData) => {
      // Instantly update UI with fresh data after mutations
      setAssets(freshData.assets || []);
      setHeirs(freshData.heirs || []);
      setStats(freshData.stats);
    }
  });

  // Initial data load (benefits from caching)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // These calls will use cache if available, load from API if not
        const [assetsData, heirsData, statsData] = await Promise.all([
          getCrownVaultAssets().catch(() => []),
          getCrownVaultHeirs().catch(() => []),
          getCrownVaultStats().catch(() => null)
        ]);
        
        setAssets(assetsData);
        setHeirs(heirsData);
        setStats(statsData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Example mutation handlers
  const handleAddHeir = async () => {
    await mutations.createHeir({
      name: "John Doe",
      relationship: "Son",
      email: "john@example.com"
    });
    // UI automatically updates via onDataRefresh callback
  };

  const handleDeleteHeir = async (heirId: string) => {
    await mutations.deleteHeir(heirId);
    // UI automatically updates via onDataRefresh callback
  };

  const handleBatchAssets = async (rawText: string) => {
    await mutations.processBatchAssets(rawText, "Estate planning documents");
    // UI automatically updates via onDataRefresh callback
  };

  if (loading) {
    return <div>Loading Crown Vault data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Crown Vault Dashboard</h2>
        
        {/* Stats display */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-semibold">Total Assets</h3>
              <p className="text-2xl">{stats.total_assets}</p>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-semibold">Total Value</h3>
              <p className="text-2xl">${stats.total_value.toLocaleString()}</p>
            </div>
            <div className="bg-card p-4 rounded-lg">
              <h3 className="font-semibold">Total Heirs</h3>
              <p className="text-2xl">{stats.total_heirs}</p>
            </div>
          </div>
        )}

        {/* Heirs list with mutation buttons */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Heirs ({heirs.length})</h3>
            <button 
              onClick={handleAddHeir}
              disabled={mutations.isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {mutations.isLoading ? 'Adding...' : 'Add Test Heir'}
            </button>
          </div>
          
          <div className="space-y-2">
            {heirs.map((heir) => (
              <div key={heir.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{heir.name}</p>
                  <p className="text-sm text-muted-foreground">{heir.relationship}</p>
                </div>
                <button
                  onClick={() => handleDeleteHeir(heir.id)}
                  disabled={mutations.isLoading}
                  className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assets list */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Assets ({assets.length})</h3>
          <div className="space-y-2">
            {assets.map((asset) => (
              <div key={asset.asset_id} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{asset.asset_data.name}</p>
                    <p className="text-sm text-muted-foreground">{asset.asset_data.asset_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${asset.asset_data.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{asset.asset_data.currency}</p>
                  </div>
                </div>
                {asset.heir_names.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      Assigned to: {asset.heir_names.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}