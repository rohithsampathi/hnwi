"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { useAuthPopup } from "@/contexts/auth-popup-context";
import { Heading2 } from "@/components/ui/typography";
import { 
  Crown, Shield, Plus, Lock, Brain, Database, User, Mail, Phone, FileText, 
  Edit, X, Save, Building, DollarSign
} from "lucide-react";
import { getVisibleIconColor, getVisibleHeadingColor, getVisibleTextColor } from "@/lib/colors";

// Component imports
import { SummarySection } from "@/components/crown-vault/summary-section";
import { AssetsSection } from "@/components/crown-vault/assets-section";
import { HeirsSection } from "@/components/crown-vault/heirs-section";
import { ActivitySection } from "@/components/crown-vault/activity-section";
import { AddAssetsModal } from "@/components/crown-vault/add-assets-modal";
import { CrownLoader } from "@/components/ui/crown-loader";

// API imports
import {
  getCrownVaultAssets,
  getCrownVaultStats, 
  getCrownVaultHeirs,
  processCrownVaultAssetsBatch,
  createHeir,
  updateHeir,
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
  const { theme } = useTheme();
  const { showAuthPopup } = useAuthPopup();
  
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

  // Helper function to detect authentication errors
  const isAuthenticationError = (error: any): boolean => {
    const errorMessage = error?.message || error?.toString() || '';
    return errorMessage.includes('Authentication required') || 
           errorMessage.includes('please log in') || 
           error?.status === 401;
  };

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
        
        // Check for authentication errors
        const failedResults = [assetsData, statsData, heirsData].filter(result => result.status === 'rejected');
        const hasAuthErrors = failedResults.some(result => isAuthenticationError(result.reason));
        
        if (hasAuthErrors && failedResults.length > 0) {
          // Show auth popup instead of console errors
          showAuthPopup({
            title: "Authentication Required",
            description: "Please sign in to access your Crown Vault data.",
            onSuccess: () => {
              // Retry loading data after successful login
              setTimeout(() => {
                loadInitialData();
              }, 100);
            }
          });
          return;
        }
        
        // Handle successful data loading
        if (assetsData.status === 'fulfilled') {
          setAssets(assetsData.value);
        }
        if (statsData.status === 'fulfilled') {
          setStats(statsData.value);
        }
        if (heirsData.status === 'fulfilled') {
          setHeirs(heirsData.value);
        }

        // Handle non-auth errors (if any)
        const nonAuthErrors = failedResults.filter(result => !isAuthenticationError(result.reason));
        if (nonAuthErrors.length > 0) {
          console.error('Crown Vault non-auth errors:', nonAuthErrors);
          toast({
            title: "Partial Loading Error",
            description: "Some vault data could not be loaded. Please try refreshing.",
            variant: "destructive"
          });
        }

      } catch (error) {
        if (isAuthenticationError(error)) {
          showAuthPopup({
            title: "Authentication Required",
            description: "Please sign in to access your Crown Vault data.",
            onSuccess: () => {
              setTimeout(() => {
                loadInitialData();
              }, 100);
            }
          });
        } else {
          console.error('Crown Vault loading error:', error);
          toast({
            title: "Error Loading Vault",
            description: "Failed to load your Crown Vault data. Please try again.",
            variant: "destructive"
          });
        }
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

  const handleUpdateHeir = async (heirId: string, data: any) => {
    try {
      await updateHeir(heirId, data);
      
      // Update heirs list
      setHeirs(prev => prev.map(heir => 
        heir.id === heirId 
          ? { ...heir, ...data }
          : heir
      ));
      
      // Reset editing state
      setEditingHeir(null);
      setEditingHeirData(null);
      
      toast({
        title: "Success",
        description: "Heir updated successfully",
      });
      
      // Refresh heirs data
      try {
        const updatedHeirs = await getCrownVaultHeirs();
        setHeirs(updatedHeirs);
      } catch (error) {
        console.error('Failed to refresh heirs data:', error);
      }
    } catch (error) {
      console.error('Failed to update heir:', error);
      toast({
        title: "Error", 
        description: "Failed to update heir. Please try again.",
        variant: "destructive",
      });
    }
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


  return (
    <Layout 
      title={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Crown className={`h-6 w-6 ${getVisibleIconColor(theme)}`} />
            <Heading2 className={getVisibleHeadingColor(theme)}>Crown Vault</Heading2>
          </div>
          <PremiumBadge className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            <Shield className="h-3 w-3 mr-1" />
            SECURED
          </PremiumBadge>
        </div>
      }
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {/* Action Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-base leading-tight -mt-2">
              Where dynasties secure their legacy. Reserved for bloodlines that transcend market cycles.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <CrownLoader size="lg" text="Encrypting generational assets..." />
          </div>
        ) : (
          <>
            {/* Tabs Navigation */}
            <div className="py-8">
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 p-1 bg-muted/30 rounded-full max-w-fit mx-auto">
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
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
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

            {/* Heir Detail Modal */}
            <Dialog open={isHeirDetailOpen} onOpenChange={setIsHeirDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Heir Details</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHeirDetailOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            {selectedHeir && (
              <div className="space-y-6">
                {/* Header Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${getVisibleTextColor(theme, 'accent')}`}>
                            {selectedHeir.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">{selectedHeir.name}</h2>
                          <Badge variant="secondary" className="mt-1 badge-primary">
                            {selectedHeir.relationship.charAt(0).toUpperCase() + selectedHeir.relationship.slice(1).toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setIsHeirDetailOpen(false);
                          startHeirEditing(selectedHeir);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedHeir.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedHeir.email}</span>
                      </div>
                    )}
                    {selectedHeir.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedHeir.phone}</span>
                      </div>
                    )}
                    {!selectedHeir.email && !selectedHeir.phone && (
                      <p className="text-muted-foreground text-sm">No contact information provided</p>
                    )}
                  </CardContent>
                </Card>

                {/* Inheritance Summary */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Inheritance Summary
                    </h3>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const heirAssets = getHeirAssets(selectedHeir.id);
                      const totalValue = heirAssets.reduce((sum, asset) => sum + (asset.asset_data?.value || 0), 0);
                      const formatValue = (value: number) => {
                        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                        return `$${value.toLocaleString()}`;
                      };
                      
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                              <p className={`text-2xl font-bold ${getVisibleTextColor(theme, 'accent')}`}>{heirAssets.length}</p>
                              <p className="text-sm text-muted-foreground">Assets</p>
                            </div>
                            <div className="text-center">
                              <p className={`text-2xl font-bold ${getVisibleTextColor(theme, 'accent')}`}>{formatValue(totalValue)}</p>
                              <p className="text-sm text-muted-foreground">Total Value</p>
                            </div>
                          </div>

                          {heirAssets.length > 0 ? (
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground mb-2">Inherited Assets:</h4>
                              {heirAssets.map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div>
                                    <p className="font-medium text-foreground">{asset.asset_data.name}</p>
                                    <p className="text-sm text-muted-foreground">{asset.asset_data.asset_type}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-foreground">{formatValue(asset.asset_data.value || 0)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">No assets assigned yet</p>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedHeir.notes && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Notes
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground whitespace-pre-wrap">{selectedHeir.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  Added on {new Date(selectedHeir.created_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

            {/* Heir Edit Modal */}
            <Dialog open={editingHeir !== null} onOpenChange={() => {
              setEditingHeir(null);
              setEditingHeirData(null);
            }}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Edit Heir
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingHeir(null);
                  setEditingHeirData(null);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            {editingHeirData && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingHeir && editingHeirData) {
                  handleUpdateHeir(editingHeir, editingHeirData);
                }
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={editingHeirData.name}
                    onChange={(e) => setEditingHeirData({...editingHeirData, name: e.target.value})}
                    placeholder="Enter heir's name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select value={editingHeirData.relationship} onValueChange={(value) => setEditingHeirData({...editingHeirData, relationship: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Spouse", "Child", "Parent", "Sibling", "Grandchild", "Grandparent", "Other Family", "Friend", "Business Partner", "Charitable Organization", "Trust", "Other"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingHeirData.email}
                    onChange={(e) => setEditingHeirData({...editingHeirData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editingHeirData.phone}
                    onChange={(e) => setEditingHeirData({...editingHeirData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editingHeirData.notes}
                    onChange={(e) => setEditingHeirData({...editingHeirData, notes: e.target.value})}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingHeir(null);
                      setEditingHeirData(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!editingHeirData.name.trim() || !editingHeirData.relationship}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </Layout>
  );
}

export default CrownVaultPage;