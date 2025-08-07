"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Crown, Shield, Plus, Lock, Brain, Database
} from "lucide-react";

// Component imports
import { SummarySection } from "@/components/crown-vault/summary-section";
import { AssetsSection } from "@/components/crown-vault/assets-section";
import { HeirsSection } from "@/components/crown-vault/heirs-section";
import { ActivitySection } from "@/components/crown-vault/activity-section";
import { AddAssetsModal } from "@/components/crown-vault/add-assets-modal";

// API imports
import {
  getCrownVaultAssets,
  getCrownVaultStats, 
  getCrownVaultHeirs,
  processCrownVaultAssetsBatch,
  createHeir,
  deleteHeir,
  type CrownVaultAsset,
  type CrownVaultHeir,
  type CrownVaultStats
} from "@/lib/api";

interface CrownVaultPageProps {
  onNavigate?: (page: string) => void;
}

// Skeleton component for loading states
const SkeletonCard = () => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

export function CrownVaultPage({ onNavigate = () => {} }: CrownVaultPageProps) {
  // Core state
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<CrownVaultAsset[]>([]);
  const [heirs, setHeirs] = useState<CrownVaultHeir[]>([]);
  const [stats, setStats] = useState<CrownVaultStats | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "assets" | "heirs" | "activity">("summary");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssetDetailOpen, setIsAssetDetailOpen] = useState(false);
  const [isHeirDetailOpen, setIsHeirDetailOpen] = useState(false);
  const [isAddHeirModalOpen, setIsAddHeirModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CrownVaultAsset | null>(null);
  const [selectedHeir, setSelectedHeir] = useState<CrownVaultHeir | null>(null);

  // Form states
  const [rawText, setRawText] = useState("");
  const [context, setContext] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(0);

  // Heir form states
  const [newHeirData, setNewHeirData] = useState({
    name: "",
    relationship: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [editingHeir, setEditingHeir] = useState<string | null>(null);
  const [editingHeirData, setEditingHeirData] = useState<any>(null);
  const [deletingHeirs, setDeletingHeirs] = useState<Set<string>>(new Set());
  const [isCreatingHeir, setIsCreatingHeir] = useState(false);

  const { toast } = useToast();

  // Processing phases for asset upload
  const processingPhases = [
    { icon: Brain, text: "AI analyzing your asset description..." },
    { icon: Database, text: "Structuring asset data securely..." },
    { icon: Lock, text: "Encrypting sensitive information..." },
    { icon: Shield, text: "Finalizing vault security protocols..." }
  ];

  // Load initial data
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        
        const [assetsData, statsData, heirsData] = await Promise.allSettled([
          getCrownVaultAssets(),
          getCrownVaultStats(), 
          getCrownVaultHeirs()
        ]);

        
        if (!isMounted) return;
        
        if (assetsData.status === 'fulfilled') {
          setAssets(assetsData.value);
        } else {
        }
        if (statsData.status === 'fulfilled') {
          setStats(statsData.value);
        } else {
        }
        if (heirsData.status === 'fulfilled') {
          setHeirs(heirsData.value);
        } else {
        }

      } catch (error) {
        toast({
          title: "Error Loading Vault",
          description: "Failed to load your Crown Vault data. Please try again.",
          variant: "destructive"
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Asset processing handler
  const handleAddAssets = async () => {
    if (rawText.length < 50) return;

    setIsProcessing(true);
    setProcessingPhase(0);

    const phases = [0, 1, 2, 3];
    for (const phase of phases) {
      setProcessingPhase(phase);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const result = await processCrownVaultAssetsBatch(rawText, context);
      
      if (!result || !result.assets || result.assets.length === 0) {
        toast({
          title: "No Assets Detected",
          description: "Could not extract any assets from your input. Please provide more details.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      setAssets(prevAssets => [...prevAssets, ...result.assets]);
      
      // Update stats
      const newTotalValue = result.assets.reduce((sum, asset) => sum + (asset.asset_data?.value || 0), 0);
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total_assets: prev.total_assets + result.assets.length,
          total_value: prev.total_value + newTotalValue,
        } : prev);
      }
      
      toast({
        title: "✓ Assets Added to Your Vault",
        description: `${result.assets.length} premium asset${result.assets.length > 1 ? 's' : ''} secured with enterprise-grade encryption.`,
        variant: "default"
      });
      
      setRawText("");
      setContext("");
      setIsAddModalOpen(false);
      setActiveTab('assets');

    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process assets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Heir management handlers
  const handleCreateHeir = async () => {
    const finalRelationship = newHeirData.relationship === "custom" ? "" : newHeirData.relationship;
    
    if (!newHeirData.name.trim() || !finalRelationship.trim()) {
      toast({
        title: "Missing Information",
        description: "Name and relationship are required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingHeir(true);
      
      const newHeir = await createHeir({
        name: newHeirData.name.trim(),
        relationship: finalRelationship.trim(),
        email: newHeirData.email.trim() || undefined,
        phone: newHeirData.phone.trim() || undefined,
        notes: newHeirData.notes.trim() || undefined
      });

      setHeirs(prevHeirs => [...prevHeirs, newHeir]);

      toast({
        title: "✓ Heir Added Successfully",
        description: `${newHeir.name} has been added as a designated heir.`,
        variant: "default"
      });

      setNewHeirData({
        name: "",
        relationship: "",
        email: "",
        phone: "",
        notes: ""
      });
      setIsAddHeirModalOpen(false);

    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create heir. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingHeir(false);
    }
  };

  const handleDeleteHeir = async (heirId: string, heirName: string) => {
    if (!confirm(`Are you sure you want to delete ${heirName}? This will remove them from all assigned assets.`)) {
      return;
    }

    setDeletingHeirs(prev => new Set([...prev, heirId]));

    try {
      await deleteHeir(heirId);
      
      setHeirs(prevHeirs => prevHeirs.filter(heir => heir.id !== heirId));
      setAssets(prevAssets => prevAssets.map(asset => ({
        ...asset,
        heir_ids: asset.heir_ids?.filter(id => id !== heirId) || [],
        heir_names: asset.heir_names?.filter((_, index) => asset.heir_ids?.[index] !== heirId) || []
      })));

      toast({
        title: "✓ Heir Deleted",
        description: `${heirName} has been removed from your legacy plan.`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete heir. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingHeirs(prev => {
        const newSet = new Set(prev);
        newSet.delete(heirId);
        return newSet;
      });
    }
  };

  // Utility functions
  const getHeirAssets = (heirId: string) => {
    return assets.filter(asset => asset.heir_ids && asset.heir_ids.includes(heirId));
  };

  const startHeirEditing = (heir: CrownVaultHeir) => {
    setEditingHeir(heir.id);
    setEditingHeirData({
      name: heir.name || '',
      relationship: heir.relationship || '',
      email: heir.email || '',
      phone: heir.phone || '',
      notes: heir.notes || ''
    });
  };

  // Tab content renderer
  const renderTabContent = () => {
    if (activeTab === 'summary') {
      return (
        <SummarySection
          stats={stats}
          assets={assets}
          onAddAssets={() => setIsAddModalOpen(true)}
          onNavigateToTab={(tab: string) => setActiveTab(tab as "summary" | "assets" | "heirs" | "activity")}
        />
      );
    }
    if (activeTab === 'assets') {
      return (
        <AssetsSection
          assets={assets}
          heirs={heirs}
          onAddAssets={() => setIsAddModalOpen(true)}
          onAssetClick={(asset) => {
            setSelectedAsset(asset);
            setIsAssetDetailOpen(true);
          }}
          setAssets={setAssets}
        />
      );
    }
    if (activeTab === 'heirs') {
      return (
        <HeirsSection
          heirs={heirs}
          assets={assets}
          setIsAddHeirModalOpen={setIsAddHeirModalOpen}
          setSelectedHeir={setSelectedHeir}
          setIsHeirDetailOpen={setIsHeirDetailOpen}
          startHeirEditing={startHeirEditing}
          handleDeleteHeir={handleDeleteHeir}
          getHeirAssets={getHeirAssets}
          deletingHeirs={deletingHeirs}
        />
      );
    }
    if (activeTab === 'activity') {
      return (
        <ActivitySection stats={stats} />
      );
    }
    return null;
  };


  // Loading state
  if (loading) {
    return (
      <Layout title="Crown Vault" onNavigate={onNavigate}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-2 p-1 bg-muted/30 rounded-full max-w-fit">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Crown Vault" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-8 w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold">Crown Vault</h1>
              <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                <Shield className="h-3 w-3 mr-1" />
                SECURED
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Your premium asset vault with enterprise-grade security and AI-powered management
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 p-1 bg-muted/30 rounded-full max-w-fit mx-auto sm:mx-0">
          {[
            { id: 'summary' as const, label: 'Summary' },
            { id: 'assets' as const, label: 'Assets' },
            { id: 'heirs' as const, label: 'Heirs' },
            { id: 'activity' as const, label: 'Activity' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`flex-1 sm:flex-initial px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Modals */}
        <AddAssetsModal
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
          rawText={rawText}
          setRawText={setRawText}
          context={context}
          setContext={setContext}
          handleAddAssets={handleAddAssets}
          isProcessing={isProcessing}
          processingPhase={processingPhase}
        />

        {/* TODO: Add other modal components */}
        {/* <AssetDetailModal /> */}
        {/* <HeirDetailModal /> */}
        {/* <AddHeirModal /> */}
      </div>
    </Layout>
  );
}

export default CrownVaultPage;