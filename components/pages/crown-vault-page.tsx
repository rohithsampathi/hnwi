"use client";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { 
  Crown, 
  Plus, 
  Shield, 
  Clock, 
  DollarSign, 
  Users, 
  Building, 
  Car, 
  Gem, 
  Palette,
  Search,
  Filter,
  Lock,
  Vault,
  Network,
  Activity,
  Loader2,
  Edit2,
  Trash2,
  X,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SecurePieChart } from "@/components/ui/secure-pie-chart";
import { 
  getCrownVaultAssets, 
  getCrownVaultStats, 
  getCrownVaultHeirs,
  processCrownVaultAssetsBatch,
  updateAssetHeirs,
  createHeir,
  updateHeir,
  deleteHeir,
  CrownVaultAsset,
  CrownVaultHeir,
  CrownVaultStats,
  BatchAssetResponse
} from "@/lib/api";
import { processAssetCategories } from "@/lib/category-utils";
interface CrownVaultPageProps {
  onNavigate?: (route: string) => void;
}
const processingPhases = [
  { id: 0, text: "Analyzing your input...", icon: Activity, duration: 2000 },
  { id: 1, text: "Identifying assets and heirs...", icon: Network, duration: 2000 },
  { id: 2, text: "Encrypting with multi-key security...", icon: Lock, duration: 2000 },
  { id: 3, text: "Securing in your vault...", icon: Vault, duration: 1000 }
];
export function CrownVaultPage({ onNavigate = () => {} }: CrownVaultPageProps) {
  const [assets, setAssets] = useState<CrownVaultAsset[]>([]);
  const [heirs, setHeirs] = useState<CrownVaultHeir[]>([]);
  const [stats, setStats] = useState<CrownVaultStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(0);
  const [rawText, setRawText] = useState("");
  const [context, setContext] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("value-desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [newlyAddedAssets, setNewlyAddedAssets] = useState<Set<string>>(new Set());
  const [heirUpdateLoading, setHeirUpdateLoading] = useState<Set<string>>(new Set());
  const [selectedAsset, setSelectedAsset] = useState<CrownVaultAsset | null>(null);
  const [isAssetDetailOpen, setIsAssetDetailOpen] = useState(false);
  const [selectedHeir, setSelectedHeir] = useState<CrownVaultHeir | null>(null);
  const [isHeirDetailOpen, setIsHeirDetailOpen] = useState(false);
  const [isAddHeirModalOpen, setIsAddHeirModalOpen] = useState(false);
  const [isCreatingHeir, setIsCreatingHeir] = useState(false);
  const [newHeirData, setNewHeirData] = useState({
    name: "",
    relationship: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [customRelationship, setCustomRelationship] = useState("");
  const [editingHeir, setEditingHeir] = useState<string | null>(null);
  const [editingHeirData, setEditingHeirData] = useState<{
    name: string;
    relationship: string;
    email: string;
    phone: string;
    notes: string;
  } | null>(null);
  const [deletingHeirs, setDeletingHeirs] = useState<Set<string>>(new Set());
  const [updatingHeirs, setUpdatingHeirs] = useState<Set<string>>(new Set());
  const [heirValidationErrors, setHeirValidationErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  // Validation functions for heir editing
  const validateHeirData = (data: any) => {
    const errors: Record<string, string> = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!data.relationship?.trim()) {
      errors.relationship = 'Relationship is required';
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (data.phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    return errors;
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
    setHeirValidationErrors({});
  };

  const cancelHeirEditing = () => {
    setEditingHeir(null);
    setEditingHeirData(null);
    setHeirValidationErrors({});
  };

  const updateEditingHeirData = (field: string, value: string) => {
    if (!editingHeirData) return;
    
    const newData = { ...editingHeirData, [field]: value };
    setEditingHeirData(newData);
    
    // Clear validation error for this field
    if (heirValidationErrors[field]) {
      setHeirValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Load initial data on page load with parallel API calls
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Parallel API calls for better performance
        const [assetsData, statsData, heirsData] = await Promise.allSettled([
          getCrownVaultAssets(),
          getCrownVaultStats(),
          getCrownVaultHeirs()
        ]);
        if (assetsData.status === 'fulfilled') {
          setAssets(assetsData.value);
        } else {
          console.error('Failed to load assets:', assetsData.reason);
        }
        if (statsData.status === 'fulfilled') {
          setStats(statsData.value);
        } else {
          console.error('Failed to load stats:', statsData.reason);
        }
        if (heirsData.status === 'fulfilled') {
          setHeirs(heirsData.value);
        } else {
          console.error('Failed to load heirs:', heirsData.reason);
        }
      } catch (error) {
        console.error('Error loading Crown Vault data:', error);
        toast({
          title: "Error Loading Vault",
          description: "Failed to load your Crown Vault data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [toast]);
  const getAssetIcon = (assetType: string) => {
    switch (assetType.toLowerCase()) {
      case "real estate": return Building;
      case "vehicle": case "vehicles": return Car;
      case "jewelry": case "precious metals": return Gem;
      case "art": case "collectibles": return Palette;
      default: return DollarSign;
    }
  };
  const formatValue = (value: number, currency: string = "USD") => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };
  const getTotalValue = () => {
    return stats?.total_value || assets.reduce((total, asset) => {
      return total + (asset?.asset_data?.value || 0);
    }, 0);
  };
  const getAssetsByCategory = () => {
    return processAssetCategories(assets);
  };
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))', 
    'hsl(var(--accent))',
    '#22c55e', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ef4444', // red-500
    '#06b6d4'  // cyan-500
  ];
  const handleAddAssets = async () => {
    if (rawText.length < 50) return;
    
    try {
      setIsProcessing(true);
      setProcessingPhase(0);
      // Execute processing phases with proper timing
      for (let i = 0; i < processingPhases.length; i++) {
        setProcessingPhase(i);
        await new Promise(resolve => setTimeout(resolve, processingPhases[i].duration));
      }
      // Make the actual API call
      const result: BatchAssetResponse = await processCrownVaultAssetsBatch(rawText, context);
      
      
      // Check if result has assets
      if (!result || !result.assets || result.assets.length === 0) {
        toast({
          title: "No Assets Detected",
          description: "Could not extract any assets from your input. Please provide more details.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Update state with new assets
      const updatedAssets = [...assets, ...result.assets];
      setAssets(updatedAssets);
      
      // Track newly added assets for highlighting
      const newAssetIds = new Set(result.assets.map(a => a.asset_id));
      setNewlyAddedAssets(newAssetIds);
      
      // Update stats and heirs by refetching
      try {
        const [updatedStats, updatedHeirs] = await Promise.allSettled([
          getCrownVaultStats(),
          getCrownVaultHeirs()
        ]);
        
        if (updatedStats.status === 'fulfilled') {
          setStats(updatedStats.value);
        } else {
          console.error('Failed to update stats:', updatedStats.reason);
        }
        
        if (updatedHeirs.status === 'fulfilled') {
          setHeirs(updatedHeirs.value);
        } else {
          console.error('Failed to update heirs:', updatedHeirs.reason);
        }
      } catch (error) {
        console.error('Failed to update stats and heirs:', error);
      }
      
      // Show premium success notification
      toast({
        title: "✓ Assets Added to Your Vault",
        description: `${result.assets.length} premium asset${result.assets.length > 1 ? 's' : ''} secured with enterprise-grade encryption. Welcome to the exclusive HNWI Chronicles Crown Vault experience.`,
        variant: "default"
      });
      
      // Reset form and navigate to assets tab to see new items
      setRawText("");
      setContext("");
      setIsAddModalOpen(false);
      setActiveTab("assets");
      
      // Remove highlighting after 5 seconds
      setTimeout(() => {
        setNewlyAddedAssets(new Set());
      }, 5000);
    } catch (error) {
      console.error('Asset processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process assets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleHeirReassignment = async (assetId: string, newHeirIds: string[]) => {
    try {
      setHeirUpdateLoading(prev => new Set([...prev, assetId]));
      
      const result = await updateAssetHeirs(assetId, newHeirIds);
      
      // Update the asset in state
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.asset_id === assetId 
            ? { ...asset, heir_ids: newHeirIds, heir_names: result.heir_names }
            : asset
        )
      );
      toast({
        title: "Asset Reassigned",
        description: result.message,
        variant: "default"
      });
    } catch (error) {
      console.error('Heir reassignment error:', error);
      toast({
        title: "Reassignment Failed",
        description: "Failed to reassign asset. Please try again.",
        variant: "destructive"
      });
    } finally {
      setHeirUpdateLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    }
  };
  const handleAssetClick = (asset: CrownVaultAsset) => {
    setSelectedAsset(asset);
    setIsAssetDetailOpen(true);
  };
  const handleHeirClick = (heir: CrownVaultHeir) => {
    setSelectedHeir(heir);
    setIsHeirDetailOpen(true);
  };

  const handleCreateHeir = async () => {
    const finalRelationship = newHeirData.relationship === "custom" ? customRelationship : newHeirData.relationship;
    
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

      // Add the new heir to the state
      setHeirs(prevHeirs => [...prevHeirs, newHeir]);

      toast({
        title: "✓ Heir Added Successfully",
        description: `${newHeir.name} has been added as a designated heir.`,
        variant: "default"
      });

      // Reset form and close modal
      setNewHeirData({
        name: "",
        relationship: "",
        email: "",
        phone: "",
        notes: ""
      });
      setCustomRelationship("");
      setIsAddHeirModalOpen(false);

    } catch (error) {
      console.error('Create heir error:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create heir. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingHeir(false);
    }
  };

  const handleUpdateHeir = async (heirId: string, updatedData?: Partial<CrownVaultHeir>) => {
    try {
      // Use editing data if no specific data provided
      const dataToUpdate = updatedData || editingHeirData;
      if (!dataToUpdate) return;

      // Validate the data
      const errors = validateHeirData(dataToUpdate);
      if (Object.keys(errors).length > 0) {
        setHeirValidationErrors(errors);
        return;
      }

      setUpdatingHeirs(prev => new Set([...prev, heirId]));
      
      const updatedHeir = await updateHeir(heirId, dataToUpdate);
      
      // Update the heir in state
      setHeirs(prevHeirs => 
        prevHeirs.map(heir => 
          heir.id === heirId ? updatedHeir : heir
        )
      );

      toast({
        title: "✓ Heir Updated",
        description: `${updatedHeir.name}'s information has been updated.`,
        variant: "default"
      });

      cancelHeirEditing();
    } catch (error) {
      console.error('Update heir error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update heir. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingHeirs(prev => {
        const newSet = new Set(prev);
        newSet.delete(heirId);
        return newSet;
      });
    }
  };

  const handleDeleteHeir = async (heirId: string, heirName: string) => {
    if (!confirm(`Are you sure you want to delete ${heirName}? This will remove them from all assigned assets.`)) {
      return;
    }

    try {
      setDeletingHeirs(prev => new Set([...prev, heirId]));
      
      await deleteHeir(heirId);
      
      // Remove the heir from state
      setHeirs(prevHeirs => prevHeirs.filter(heir => heir.id !== heirId));

      // Refetch assets to update heir assignments
      try {
        const updatedAssets = await getCrownVaultAssets();
        setAssets(updatedAssets);
      } catch (error) {
        console.error('Failed to refresh assets after heir deletion:', error);
      }

      toast({
        title: "✓ Heir Deleted",
        description: `${heirName} has been removed from your legacy plan.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Delete heir error:', error);
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
  const getHeirAssets = (heirId: string) => {
    return assets.filter(asset => asset.heir_ids && asset.heir_ids.includes(heirId));
  };
  const filteredAssets = assets.filter(asset => {
    // Safety check for asset data structure
    if (!asset || !asset.asset_data || !asset.heir_names) {
      return false;
    }
    const matchesSearch = (asset.asset_data.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (asset.asset_data.asset_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (asset.asset_data.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === "all") return matchesSearch;
    if (filterBy.startsWith("heir-")) {
      const heirName = filterBy.replace("heir-", "");
      return matchesSearch && asset.heir_names.some(name => 
        (name || '').toLowerCase().includes(heirName.toLowerCase())
      );
    }
    return matchesSearch && (asset.asset_data.asset_type || '').toLowerCase() === filterBy.toLowerCase();
  });
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    // Safety checks for sorting
    if (!a?.asset_data || !b?.asset_data) return 0;
    switch (sortBy) {
      case "value-desc":
        return (b.asset_data.value || 0) - (a.asset_data.value || 0);
      case "value-asc":
        return (a.asset_data.value || 0) - (b.asset_data.value || 0);
      case "date":
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      case "type":
        return (a.asset_data.asset_type || '').localeCompare(b.asset_data.asset_type || '');
      default:
        return 0;
    }
  });
  // Skeleton loader component
  const SkeletonCard = () => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
  if (loading) {
    return (
      <Layout title="Crown Vault" onNavigate={onNavigate}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-8 w-8 text-primary animate-pulse" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div>
                      <Skeleton className="h-3 w-16 mb-2" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Content Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
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
              <h1 className="text-3xl font-bold">Crown Vault</h1>
              <Badge variant="secondary" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                256-bit AES Encrypted
              </Badge>
            </div>
            <p className="text-muted-foreground">Discreetly organize your legacy with bank-grade encryption</p>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="inline-flex bg-muted/50 p-1.5 rounded-full shadow-sm border border-border/50">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'summary'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'assets'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
              }`}
            >
              Assets
            </button>
            <button
              onClick={() => setActiveTab('heirs')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'heirs'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
              }`}
            >
              Heirs
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                activeTab === 'activity'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
              }`}
            >
              Activity
            </button>
          </div>
        </div>
          <div className="mt-6">
            {activeTab === 'summary' && (
              <div className="space-y-10">
            {/* Premium Summary Overview */}
            <div className="relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5 rounded-3xl" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl" />
              
              <Card className="relative border-0 bg-background/60 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-12">
                  {/* Header Section */}
                  <div className="text-center mb-12">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-30" />
                      <Crown className="relative h-16 w-16 text-primary mx-auto mb-4 drop-shadow-lg" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
                      Legacy Summary
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">Your legacy secured with military-grade encryption</p>
                  </div>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Total Value Card */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300" />
                      <div className="relative bg-background/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-primary/10 rounded-xl">
                            <DollarSign className="h-8 w-8 text-primary" />
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 font-semibold mb-2">Total Portfolio Value</p>
                        <p className="text-3xl font-bold text-primary mb-1">{formatValue(getTotalValue())}</p>
                        <p className="text-xs text-foreground/60 font-semibold">Secured in vault</p>
                      </div>
                    </div>
                    {/* Total Assets Card */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300" />
                      <div className="relative bg-background/80 backdrop-blur-sm border border-secondary/20 rounded-2xl p-6 hover:border-secondary/40 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-secondary/10 rounded-xl">
                            <Vault className="h-8 w-8 text-secondary" />
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 font-semibold mb-2">Total Assets</p>
                        <p className="text-3xl font-bold text-secondary mb-1">{stats?.total_assets || assets.length}</p>
                        <p className="text-xs text-blue-600 font-semibold">Across {getAssetsByCategory().length} {getAssetsByCategory().length === 1 ? 'category' : 'categories'}</p>
                      </div>
                    </div>
                    {/* Heirs Card */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300" />
                      <div className="relative bg-background/80 backdrop-blur-sm border border-accent/20 rounded-2xl p-6 hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-accent/10 rounded-xl">
                            <Users className="h-8 w-8 text-accent" />
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 font-semibold mb-2">Designated Heirs</p>
                        <p className="text-3xl font-bold text-accent mb-1">{stats?.total_heirs || heirs.length}</p>
                        <p className="text-xs text-purple-600 font-semibold">Legacy planning active</p>
                      </div>
                    </div>
                    {/* Security Card */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300" />
                      <div className="relative bg-background/80 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-green-500/10 rounded-xl">
                            <Shield className="h-8 w-8 text-green-500" />
                          </div>
                          <div className="text-right">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 font-semibold mb-2">Security Level</p>
                        <p className="text-2xl font-bold text-green-600 mb-1">256-bit AES</p>
                        <p className="text-xs text-green-600 font-semibold">Military-grade encryption</p>
                      </div>
                    </div>
                  </div>
                  {/* Quick Stats Bar */}
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <div className="flex items-center justify-center gap-8 text-sm text-foreground/70 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-foreground/60" />
                        <span>Last updated: {stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : "2 minutes ago"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span>All systems operational</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Assets by Category - Premium Design */}
            {assets.length > 0 && (
              <Card className="p-8 bg-gradient-to-br from-background to-muted/20 border-2 border-primary/10">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Portfolio Allocation
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    Strategic distribution of your wealth across asset categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
                    {/* AES-256 Secured Pie Chart */}
                    <div className="relative">
                      <SecurePieChart
                        data={getAssetsByCategory()}
                        totalValue={getTotalValue()}
                        centerLabel="Crown Vault"
                        height={500}
                        className="w-full"
                      />
                    </div>
                    {/* Premium Category List */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold mb-6 text-foreground">Asset Breakdown</h3>
                      {getAssetsByCategory().map((category, index) => (
                        <div key={category.name} className="group relative">
                          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div 
                                  className="w-6 h-6 rounded-full shadow-md border-2 border-white/20" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent" />
                              </div>
                              <div>
                                <span className="font-bold text-foreground">{category.displayName || category.name}</span>
                                <p className="text-xs text-foreground/60 font-medium">
                                  {category.count} assets
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-foreground">{formatValue(category.value)}</p>
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${category.percentage}%`,
                                      backgroundColor: COLORS[index % COLORS.length]
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-foreground/70">{category.percentage}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Assets
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("assets")}
                  >
                    <Vault className="h-4 w-4 mr-2" />
                    View All Assets
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab("heirs")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Heirs
                  </Button>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recent_activity.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20">
                          <Activity className="h-4 w-4 mt-1 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{activity.details}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full" 
                        onClick={() => setActiveTab("activity")}
                      >
                        View All Activity
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </div>
              </div>
            )}
            {activeTab === 'assets' && (
              <div className="space-y-4">
            {/* Assets Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets by name, type, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-border/50 bg-background/80 text-foreground placeholder:text-foreground/50 dark:placeholder:text-muted-foreground hover:border-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Assets
                </Button>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40 border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 transition-colors">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border/50 shadow-xl">
                    <SelectItem value="all" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">All Assets</SelectItem>
                    <SelectItem value="real estate" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Real Estate</SelectItem>
                    <SelectItem value="vehicles" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Vehicles</SelectItem>
                    <SelectItem value="jewelry" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Jewelry</SelectItem>
                    <SelectItem value="art" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Art</SelectItem>
                    {heirs.map(heir => (
                      <SelectItem key={heir.id} value={`heir-${heir.name.toLowerCase()}`} className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">
                        {heir.name}'s Assets
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border/50 shadow-xl">
                    <SelectItem value="value-desc" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Value (High to Low)</SelectItem>
                    <SelectItem value="value-asc" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Value (Low to High)</SelectItem>
                    <SelectItem value="date" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Date Added</SelectItem>
                    <SelectItem value="type" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Asset Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Assets Grid */}
            {sortedAssets.length === 0 ? (
              <Card className="p-12 text-center">
                <Vault className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your Crown Vault Awaits</h3>
                <p className="text-muted-foreground mb-4">Start securing your legacy with military-grade encryption</p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Asset
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAssets.map((asset) => {
                  // Safety checks for asset rendering
                  if (!asset || !asset.asset_data || !asset.asset_id) {
                    return null;
                  }
                  const IconComponent = getAssetIcon(asset.asset_data.asset_type || '');
                  const isNewlyAdded = newlyAddedAssets.has(asset.asset_id);
                  const isUpdating = heirUpdateLoading.has(asset.asset_id);
                  
                  return (
                    <motion.div
                      key={asset.asset_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="group relative"
                    >
                      {/* ======= ULTRA-PREMIUM CROWN VAULT ASSET CARD ======= */}
                      
                      {/* Multi-Layer Background System - Like Swiss Watch Faces */}
                      <div className="absolute -inset-2 bg-gradient-to-br from-slate-900/5 via-blue-900/5 to-purple-900/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                      <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/8 via-gold-400/6 to-amber-600/8 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-lg blur-sm opacity-60 group-hover:opacity-100 transition-all duration-400" />
                      
                      {/* New Asset Announcement */}
                      {isNewlyAdded && (
                        <div className="absolute -top-3 -right-3 z-10">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur-md animate-pulse" />
                            <Badge className="relative bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold text-xs px-3 py-1 shadow-xl border border-emerald-400/30">
                              ✦ ACQUIRED
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* The Crown Vault Card Sanctuary */}
                      <Card 
                        className="relative h-full cursor-pointer overflow-hidden
                                   bg-gradient-to-br from-background/95 via-background/98 to-slate-50/30
                                   dark:from-slate-900/95 dark:via-slate-900/98 dark:to-slate-800/30
                                   border-2 border-slate-200/40 dark:border-slate-700/40
                                   backdrop-blur-md shadow-xl
                                   hover:shadow-2xl hover:shadow-primary/10
                                   hover:border-amber-400/30 hover:bg-gradient-to-br hover:from-background hover:to-amber-50/20
                                   dark:hover:to-amber-950/10
                                   transition-all duration-500 ease-out
                                   group-hover:scale-[1.02] group-hover:-translate-y-1"
                        onClick={() => handleAssetClick(asset)}
                      >
                        {/* Floating Ambient Elements - Museum Quality */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-400/6 via-gold-400/4 to-transparent rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-600/4 via-indigo-600/3 to-transparent rounded-full blur-2xl" />
                        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-bl from-purple-500/3 to-transparent rounded-full blur-xl" />
                        
                        <CardContent className="relative p-8 space-y-6">
                          
                          {/* ======= CROWN HEADER: ASSET IDENTITY & SECURITY ======= */}
                          <div className="flex items-start justify-between mb-1">
                            
                            {/* Asset Crown: Icon + Classification */}
                            <div className="flex items-center gap-4">
                              {/* Levitating Asset Icon */}
                              <div className="relative group/icon">
                                <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-primary/30 rounded-xl blur-lg opacity-40 group-hover/icon:opacity-70 transition-opacity duration-300" />
                                <div className="relative p-3 bg-gradient-to-br from-card via-background to-card
                                               border-2 border-secondary/20 rounded-xl shadow-lg
                                               group-hover/icon:shadow-xl group-hover/icon:scale-105 group-hover/icon:border-secondary/40
                                               transition-all duration-300">
                                  <IconComponent className="h-6 w-6 text-secondary drop-shadow-sm" />
                                </div>
                              </div>
                              
                              {/* Asset Classification Badge */}
                              <div className="space-y-1">
                                <Badge variant="outline" 
                                       className="text-xs font-bold border-2 border-border 
                                                  bg-gradient-to-r from-card to-muted
                                                  text-foreground shadow-sm px-3 py-1
                                                  hover:border-secondary/50 hover:bg-gradient-to-r hover:from-secondary/10 hover:to-secondary/5
                                                  transition-all duration-300">
                                  {asset.asset_data.asset_type || 'Premium Asset'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Fort Knox Security Indicator */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20
                                           border border-emerald-200/50 dark:border-emerald-700/30 rounded-full shadow-sm">
                              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
                              <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-wide">VAULT</span>
                            </div>
                          </div>

                          {/* ======= THE VALUE THRONE: HERO ELEMENT ======= */}
                          <div className="space-y-3">
                            {/* Asset Name - Sophisticated Typography */}
                            <h3 className="font-bold text-xl leading-tight text-foreground 
                                          line-clamp-2 tracking-tight hover:text-secondary 
                                          transition-colors duration-300 cursor-pointer">
                              {asset.asset_data.name || 'Unnamed Crown Asset'}
                            </h3>
                            
                            {/* The Value Crown - Absolute Hero */}
                            <div className="relative group/value">
                              <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/15 blur-xl opacity-0 group-hover/value:opacity-100 transition-opacity duration-500" />
                              <div className="relative flex items-baseline gap-3 py-2">
                                <span className="text-4xl font-black bg-gradient-to-br from-secondary via-secondary to-primary 
                                                bg-clip-text text-transparent drop-shadow-lg tracking-tight
                                                group-hover/value:from-secondary/90 group-hover/value:to-primary/90
                                                transition-all duration-300 cursor-pointer">
                                  {formatValue(asset.asset_data.value || 0, asset.asset_data.currency)}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-muted-foreground tracking-wider">
                                    {asset.asset_data.currency || 'USD'}
                                  </span>
                                  <span className="text-xs text-muted-foreground/80 font-medium">VALUATION</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Geographic Provenance */}
                            {asset.asset_data.location && (
                              <div className="flex items-start gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10
                                             border border-blue-200/40 dark:border-blue-800/30 rounded-lg shadow-sm">
                                <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full shadow-sm flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 tracking-wide leading-relaxed">
                                  {asset.asset_data.location}
                                </p>
                              </div>
                            )}

                            {/* ======= CONFIDENTIAL VAULT NOTES ======= */}
                            {asset.asset_data.notes && (
                              <div className="relative group/notes">
                                <div className="absolute inset-0 bg-gradient-to-br from-secondary/8 to-secondary/6 rounded-xl blur-sm 
                                               opacity-60 group-hover/notes:opacity-100 transition-opacity duration-300" />
                                
                                <div className="relative bg-gradient-to-br from-secondary/5 via-secondary/3 to-secondary/8 
                                               border-2 border-secondary/20 rounded-xl p-5 shadow-sm
                                               hover:shadow-md hover:border-secondary/30
                                               transition-all duration-300 backdrop-blur-sm">
                                  
                                  <div className="flex items-start gap-4">
                                    {/* Confidential Seal */}
                                    <div className="w-7 h-7 bg-gradient-to-br from-secondary to-primary rounded-lg 
                                                   flex items-center justify-center flex-shrink-0 shadow-md group-hover/notes:scale-105 
                                                   transition-transform duration-300">
                                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-secondary tracking-widest">
                                          CONFIDENTIAL NOTES
                                        </span>
                                        <div className="w-1 h-1 bg-secondary rounded-full" />
                                      </div>
                                      <p className="text-sm text-foreground/90 leading-relaxed font-medium 
                                                   tracking-wide">
                                        {asset.asset_data.notes}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* ======= HEIR DIPLOMATIC ASSIGNMENT ======= */}
                          <div className="bg-gradient-to-r from-muted/30 to-muted/10 
                                         rounded-2xl p-5 border border-border/30 shadow-sm">
                            
                            <div className="flex items-center justify-between">
                              {/* Left side: Label + Heir Info */}
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-foreground/80 tracking-wide">Heir Designate</span>
                                
                                {/* Heir Details - OUTSIDE dropdown */}
                                {asset.heir_names && asset.heir_names.length > 0 ? (
                                  <div className="space-y-0.5">
                                    <div className="text-base font-bold text-foreground tracking-wide">
                                      {asset.heir_names[0]}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                      {heirs.find(h => h.id === asset.heir_ids?.[0])?.relationship || 'Beneficiary'}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-0.5">
                                    <div className="text-base font-semibold text-muted-foreground italic">
                                      Awaiting Assignment
                                    </div>
                                    <div className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">
                                      Undesignated
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Right side: Avatar Dropdown */}
                              <div onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={(asset.heir_ids && asset.heir_ids[0]) || ""}
                                  onValueChange={(heirId) => handleHeirReassignment(asset.asset_id, [heirId])}
                                  disabled={isUpdating}
                                >
                                  <SelectTrigger className="w-auto h-auto border-0 bg-transparent p-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                                    <div className="group/heir">
                                      {asset.heir_names && asset.heir_names.length > 0 ? (
                                        <div className="relative">
                                          <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-primary/30 rounded-full blur-md opacity-60 group-hover/heir:opacity-90 transition-opacity duration-300" />
                                          <div className="relative w-10 h-10 bg-gradient-to-br from-secondary via-secondary to-primary 
                                                         rounded-full flex items-center justify-center text-secondary-foreground font-black text-sm shadow-lg
                                                         border-2 border-secondary/30 group-hover/heir:scale-105 group-hover/heir:shadow-xl 
                                                         transition-all duration-300 cursor-pointer">
                                            {isUpdating ? (
                                              <Loader2 className="h-4 w-4 animate-spin text-secondary-foreground" />
                                            ) : (
                                              asset.heir_names[0].charAt(0).toUpperCase()
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="w-10 h-10 bg-muted border-2 border-dashed border-border
                                                       rounded-full flex items-center justify-center hover:border-secondary/60 transition-colors duration-300 cursor-pointer">
                                          <Users className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover border-2 border-border 
                                                           shadow-2xl min-w-64 rounded-xl backdrop-blur-md">
                                    {heirs.map((heir) => {
                                      const isSelected = asset.heir_ids?.includes(heir.id);
                                      return (
                                        <SelectItem key={heir.id} value={heir.id} 
                                                    className="py-4 px-4 hover:bg-secondary/10 
                                                             focus:bg-secondary/10 rounded-lg mx-1 my-1
                                                             transition-all duration-200 relative overflow-hidden
                                                             [&_[data-radix-select-item-indicator]]:!hidden
                                                             [&_.lucide-check]:!hidden
                                                             [&_[data-state=checked]]:!hidden
                                                             before:absolute before:inset-0 before:z-10 before:bg-transparent">
                                          <div className="flex items-center gap-4 w-full">
                                            <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full 
                                                           flex items-center justify-center text-secondary-foreground font-bold text-sm shadow-md">
                                              {heir.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 space-y-0.5">
                                              <div className="flex items-center gap-2">
                                                <span className="font-bold text-popover-foreground text-sm">
                                                  {heir.name}
                                                </span>
                                                {isSelected && (
                                                  <div className="w-2 h-2 bg-secondary rounded-full shadow-sm" />
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground font-semibold capitalize">
                                                {heir.relationship}
                                              </div>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* ======= PROVENANCE FOOTER ======= */}
                          <div className="flex items-center justify-center pt-4 border-t-2 border-slate-200/30 dark:border-slate-700/30">
                            
                            {/* Combined Secured Status */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 
                                           dark:from-emerald-950/30 dark:to-green-950/20 border border-emerald-200/50 
                                           dark:border-emerald-700/30 rounded-full shadow-sm">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-widest">
                                SECURED ON {new Date(asset.created_at || Date.now()).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                }).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
              </div>
            )}
            {activeTab === 'heirs' && (
              <div className="space-y-6">
            {/* Heirs Header with Add Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Designated Heirs</h2>
                <p className="text-muted-foreground">Manage your legacy beneficiaries</p>
              </div>
              <Button onClick={() => setIsAddHeirModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Heir
              </Button>
            </div>

            {/* Heirs Grid */}
            {heirs.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Heirs Designated</h3>
                <p className="text-muted-foreground mb-4">Add beneficiaries to secure your legacy distribution</p>
                <Button onClick={() => setIsAddHeirModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Heir
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heirs.map((heir) => {
                const isEditing = editingHeir === heir.id;
                const isDeleting = deletingHeirs.has(heir.id);
                const isUpdating = updatingHeirs.has(heir.id);
                
                return (
                  <Card 
                    key={heir.id}
                    className="hover:shadow-lg transition-shadow relative group"
                  >
                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEditing) {
                            cancelHeirEditing();
                          } else {
                            startHeirEditing(heir);
                          }
                        }}
                        disabled={isDeleting || isUpdating}
                        className="h-8 w-8 p-0 hover:bg-secondary/20"
                      >
                        {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHeir(heir.id, heir.name);
                        }}
                        disabled={isDeleting || isUpdating}
                        className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                      >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>

                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/20 transition-colors rounded-t-lg"
                      onClick={() => !isEditing && handleHeirClick(heir)}
                    >
                      <CardTitle className="flex items-center gap-2 pr-16">
                        <Users className="h-5 w-5" />
                        {heir.name || 'Unknown Heir'}
                      </CardTitle>
                      
                      {isEditing && editingHeirData ? (
                        <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/20">
                          {/* Name Field */}
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Name</label>
                            <Input
                              value={editingHeirData.name}
                              onChange={(e) => updateEditingHeirData('name', e.target.value)}
                              placeholder="Enter heir name"
                              className={`text-sm ${heirValidationErrors.name ? 'border-destructive' : ''}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateHeir(heir.id);
                                }
                                if (e.key === 'Escape') {
                                  cancelHeirEditing();
                                }
                              }}
                            />
                            {heirValidationErrors.name && (
                              <p className="text-xs text-destructive">{heirValidationErrors.name}</p>
                            )}
                          </div>

                          {/* Relationship Field */}
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Relationship</label>
                            <Input
                              value={editingHeirData.relationship}
                              onChange={(e) => updateEditingHeirData('relationship', e.target.value)}
                              placeholder="e.g., Son, Daughter, Spouse"
                              className={`text-sm ${heirValidationErrors.relationship ? 'border-destructive' : ''}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateHeir(heir.id);
                                }
                                if (e.key === 'Escape') {
                                  cancelHeirEditing();
                                }
                              }}
                            />
                            {heirValidationErrors.relationship && (
                              <p className="text-xs text-destructive">{heirValidationErrors.relationship}</p>
                            )}
                          </div>

                          {/* Email Field */}
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Email (Optional)</label>
                            <Input
                              value={editingHeirData.email}
                              onChange={(e) => updateEditingHeirData('email', e.target.value)}
                              placeholder="heir@example.com"
                              type="email"
                              className={`text-sm ${heirValidationErrors.email ? 'border-destructive' : ''}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateHeir(heir.id);
                                }
                                if (e.key === 'Escape') {
                                  cancelHeirEditing();
                                }
                              }}
                            />
                            {heirValidationErrors.email && (
                              <p className="text-xs text-destructive">{heirValidationErrors.email}</p>
                            )}
                          </div>

                          {/* Phone Field */}
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Phone (Optional)</label>
                            <Input
                              value={editingHeirData.phone}
                              onChange={(e) => updateEditingHeirData('phone', e.target.value)}
                              placeholder="+1 (555) 123-4567"
                              type="tel"
                              className={`text-sm ${heirValidationErrors.phone ? 'border-destructive' : ''}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateHeir(heir.id);
                                }
                                if (e.key === 'Escape') {
                                  cancelHeirEditing();
                                }
                              }}
                            />
                            {heirValidationErrors.phone && (
                              <p className="text-xs text-destructive">{heirValidationErrors.phone}</p>
                            )}
                          </div>

                          {/* Notes Field */}
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
                            <Textarea
                              value={editingHeirData.notes}
                              onChange={(e) => updateEditingHeirData('notes', e.target.value)}
                              placeholder="Additional information about this heir..."
                              rows={2}
                              className="text-sm resize-none"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateHeir(heir.id)}
                              disabled={isUpdating}
                              className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelHeirEditing}
                              disabled={isUpdating}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <CardDescription className="text-foreground/70 dark:text-muted-foreground font-medium">
                          {heir.relationship || 'Family Member'}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent 
                      className={`cursor-pointer hover:bg-muted/20 transition-colors rounded-b-lg ${isEditing ? 'pointer-events-none' : ''}`}
                      onClick={() => !isEditing && handleHeirClick(heir)}
                    >
                      <div className="space-y-2">
                        <p className="text-sm text-foreground/80 dark:text-muted-foreground font-medium">
                          {getHeirAssets(heir.id).length} assets assigned
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatValue(getHeirAssets(heir.id).reduce((total, asset) => total + (asset?.asset_data?.value || 0), 0))}
                        </p>
                        {heir.email && (
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground">
                            Email: {heir.email}
                          </p>
                        )}
                        {heir.phone && (
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground">
                            Phone: {heir.phone}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            )}
              </div>
            )}
            {activeTab === 'activity' && (
              <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recent_activity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Activity className="h-4 w-4 mt-1 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.details}</p>
                          <p className="text-xs text-foreground/60 dark:text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/70 dark:text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>
              </div>
            )}
          </div>
        {/* Add Assets Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Assets to Your Vault</DialogTitle>
              <DialogDescription>
                Describe your assets naturally. Include asset details, values, and heir assignments. Our AI will structure everything securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="I have a 5-bedroom villa in Mumbai worth $2M going to my daughter Priya..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-foreground/60 dark:text-muted-foreground font-medium">
                    {rawText.length < 50 ? `${50 - rawText.length} characters needed` : `${rawText.length} characters`}
                  </span>
                </div>
              </div>
              <div>
                <Input
                  placeholder="Context/Notes (e.g., Estate Planning 2025)"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddAssets}
                  disabled={rawText.length < 50}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Process & Secure
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Processing Modal */}
        <Dialog open={isProcessing} onOpenChange={() => {}}>
          <DialogContent className="max-w-md">
            <DialogHeader className="sr-only">
              <DialogTitle>Processing Assets</DialogTitle>
              <DialogDescription>
                Your assets are being processed and secured. Please wait while we complete this operation.
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8">
              <div className="mb-4">
                {processingPhases[processingPhase] && (() => {
                  const IconComponent = processingPhases[processingPhase].icon;
                  return <IconComponent className="h-16 w-16 text-primary mx-auto animate-pulse" />;
                })()}
              </div>
              <h3 className="text-lg font-semibold mb-4">
                {processingPhases[processingPhase]?.text || "Processing..."}
              </h3>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((processingPhase + 1) / processingPhases.length) * 100}%` }}
                />
              </div>
              <p className="text-sm text-foreground/70 dark:text-muted-foreground mt-2">
                Phase {processingPhase + 1} of {processingPhases.length}
              </p>
            </div>
          </DialogContent>
        </Dialog>
        {/* Asset Detail Modal */}
        <Dialog open={isAssetDetailOpen} onOpenChange={setIsAssetDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedAsset && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = getAssetIcon(selectedAsset.asset_data?.asset_type || '');
                      return <IconComponent className="h-6 w-6 text-primary" />;
                    })()}
                    {selectedAsset.asset_data?.name || 'Unnamed Asset'}
                  </DialogTitle>
                  <DialogDescription>
                    Detailed view of your asset information and heir assignments
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Asset Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Asset Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium">Asset Type</p>
                          <Badge variant="secondary" className="mt-1">
                            {selectedAsset.asset_data?.asset_type || 'Unknown'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium">Value</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatValue(selectedAsset.asset_data?.value || 0, selectedAsset.asset_data?.currency)}
                          </p>
                        </div>
                        {selectedAsset.asset_data?.location && (
                          <div>
                            <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium">Location</p>
                            <p className="font-medium">{selectedAsset.asset_data.location}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium">Created</p>
                          <p className="font-medium">
                            {selectedAsset.created_at 
                              ? new Date(selectedAsset.created_at).toLocaleDateString()
                              : 'Recently'
                            }
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Heir Assignment</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium mb-2">Currently Assigned To:</p>
                          {selectedAsset.heir_names && selectedAsset.heir_names.length > 0 ? (
                            <div className="space-y-2">
                              {selectedAsset.heir_names.map((heirName, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{heirName}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-foreground/60 dark:text-muted-foreground italic">No heirs assigned</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-muted-foreground font-medium mb-2">Reassign Asset:</p>
                          <Select
                            value={(selectedAsset.heir_ids && selectedAsset.heir_ids[0]) || ""}
                            onValueChange={(heirId) => {
                              handleHeirReassignment(selectedAsset.asset_id, [heirId]);
                              // Update selected asset in modal
                              const updatedAsset = {...selectedAsset};
                              updatedAsset.heir_ids = [heirId];
                              // Find heir name from heirs list
                              const heir = heirs.find(h => h.id === heirId);
                              if (heir) {
                                updatedAsset.heir_names = [heir.name];
                              }
                              setSelectedAsset(updatedAsset);
                            }}
                            disabled={heirUpdateLoading.has(selectedAsset.asset_id)}
                          >
                            <SelectTrigger className="w-full border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 transition-colors">
                              <SelectValue placeholder="Select heir..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-2 border-border/50 shadow-xl">
                              {heirs.map((heir) => {
                                const isSelected = selectedAsset.heir_ids?.includes(heir.id);
                                return (
                                  <SelectItem key={heir.id} value={heir.id} 
                                              className="text-foreground hover:bg-primary/10 hover:text-primary font-medium relative overflow-hidden
                                                         [&_[data-radix-select-item-indicator]]:!hidden
                                                         [&_.lucide-check]:!hidden
                                                         [&_[data-state=checked]]:!hidden
                                                         before:absolute before:inset-0 before:z-10 before:bg-transparent">
                                    <div className="flex items-center gap-2 w-full">
                                      <span>{heir.name}</span>
                                      {isSelected && (
                                        <div className="w-2 h-2 bg-primary rounded-full shadow-sm" />
                                      )}
                                      <span className="text-xs text-muted-foreground">({heir.relationship})</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Notes Section */}
                  {selectedAsset.asset_data?.notes && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground/80 dark:text-muted-foreground">{selectedAsset.asset_data.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsAssetDetailOpen(false)}>
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Asset Updated",
                          description: "Asset information has been saved.",
                          variant: "default"
                        });
                        setIsAssetDetailOpen(false);
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        {/* Heir Detail Modal */}
        <Dialog open={isHeirDetailOpen} onOpenChange={setIsHeirDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedHeir && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    {selectedHeir.name || 'Unknown Heir'}
                  </DialogTitle>
                  <DialogDescription>
                    Properties and assets assigned to {selectedHeir.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Heir Overview */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Heir Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Name</p>
                          <p className="font-medium">{selectedHeir.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Relationship</p>
                          <p className="font-medium">{selectedHeir.relationship || 'Family Member'}</p>
                        </div>
                        {selectedHeir.email && (
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Email</p>
                            <p className="font-medium">{selectedHeir.email}</p>
                          </div>
                        )}
                        {selectedHeir.phone && (
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Phone</p>
                            <p className="font-medium">{selectedHeir.phone}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Total Assets</p>
                          <p className="text-2xl font-bold text-primary">
                            {getHeirAssets(selectedHeir.id).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Total Value</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatValue(getHeirAssets(selectedHeir.id).reduce((total, asset) => total + (asset?.asset_data?.value || 0), 0))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Assets List */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Assigned Properties & Assets</CardTitle>
                      <CardDescription>
                        All assets currently assigned to {selectedHeir.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getHeirAssets(selectedHeir.id).length > 0 ? (
                        <div className="space-y-4">
                          {getHeirAssets(selectedHeir.id).map((asset) => {
                            if (!asset?.asset_data) return null;
                            
                            const IconComponent = getAssetIcon(asset.asset_data.asset_type || '');
                            
                            return (
                              <div key={asset.asset_id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                  <IconComponent className="h-8 w-8 text-primary" />
                                  <div>
                                    <h4 className="font-medium">{asset.asset_data.name || 'Unnamed Asset'}</h4>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {asset.asset_data.asset_type || 'Unknown'}
                                      </Badge>
                                      {asset.asset_data.location && (
                                        <Badge variant="secondary" className="text-xs">
                                          {asset.asset_data.location}
                                        </Badge>
                                      )}
                                    </div>
                                    {asset.asset_data.notes && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {asset.asset_data.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-primary">
                                    {formatValue(asset.asset_data.value || 0, asset.asset_data.currency)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Added {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'Recently'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Vault className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No assets assigned to {selectedHeir.name} yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-3" 
                            onClick={() => {
                              setIsHeirDetailOpen(false);
                              setActiveTab("assets");
                            }}
                          >
                            View All Assets
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsHeirDetailOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setIsHeirDetailOpen(false);
                      setActiveTab("assets");
                    }}>
                      Manage Assets
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Heir Modal */}
        <Dialog open={isAddHeirModalOpen} onOpenChange={setIsAddHeirModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Add New Heir
              </DialogTitle>
              <DialogDescription>
                Add a beneficiary to your Crown Vault legacy plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Name *</label>
                <Input
                  placeholder="Enter heir's full name"
                  value={newHeirData.name}
                  onChange={(e) => setNewHeirData({ ...newHeirData, name: e.target.value })}
                  className="border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Relationship *</label>
                <Select value={newHeirData.relationship} onValueChange={(value) => {
                  setNewHeirData({ ...newHeirData, relationship: value });
                  if (value !== "custom") {
                    setCustomRelationship("");
                  }
                }}>
                  <SelectTrigger className="border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 transition-colors">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border/50 shadow-xl">
                    <SelectItem value="spouse" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Spouse</SelectItem>
                    <SelectItem value="child" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Child</SelectItem>
                    <SelectItem value="parent" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Parent</SelectItem>
                    <SelectItem value="sibling" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Sibling</SelectItem>
                    <SelectItem value="grandchild" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Grandchild</SelectItem>
                    <SelectItem value="friend" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Friend</SelectItem>
                    <SelectItem value="charity" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Charity</SelectItem>
                    <SelectItem value="custom" className="text-foreground hover:bg-primary/10 hover:text-primary font-medium">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {newHeirData.relationship === "custom" && (
                  <Input
                    placeholder="Enter custom relationship"
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    className="mt-2 border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 focus:border-primary transition-colors"
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder="heir@example.com"
                  value={newHeirData.email}
                  onChange={(e) => setNewHeirData({ ...newHeirData, email: e.target.value })}
                  className="border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={newHeirData.phone}
                  onChange={(e) => setNewHeirData({ ...newHeirData, phone: e.target.value })}
                  className="border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Notes</label>
                <Textarea
                  placeholder="Additional notes about this heir..."
                  value={newHeirData.notes}
                  onChange={(e) => setNewHeirData({ ...newHeirData, notes: e.target.value })}
                  className="min-h-20 resize-none border-2 border-border/50 bg-background/80 text-foreground hover:border-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddHeirModalOpen(false)} disabled={isCreatingHeir}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateHeir}
                  disabled={!newHeirData.name.trim() || (!newHeirData.relationship.trim() || (newHeirData.relationship === "custom" && !customRelationship.trim())) || isCreatingHeir}
                >
                  {isCreatingHeir ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Add Heir
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}