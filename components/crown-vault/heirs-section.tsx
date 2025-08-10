import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User, Mail, Phone, FileText, ChevronRight, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import type { CrownVaultHeir, CrownVaultAsset } from "@/lib/api";

interface HeirsSectionProps {
  heirs: CrownVaultHeir[];
  assets: CrownVaultAsset[];
  setIsAddHeirModalOpen: (open: boolean) => void;
  setSelectedHeir: (heir: CrownVaultHeir | null) => void;
  setIsHeirDetailOpen: (open: boolean) => void;
  startHeirEditing: (heir: CrownVaultHeir) => void;
  handleDeleteHeir: (heirId: string, heirName: string) => void;
  getHeirAssets: (heirId: string) => CrownVaultAsset[];
  deletingHeirs: Set<string>;
}

export function HeirsSection({ 
  heirs, 
  assets,
  setIsAddHeirModalOpen,
  setSelectedHeir,
  setIsHeirDetailOpen,
  startHeirEditing,
  handleDeleteHeir,
  getHeirAssets,
  deletingHeirs
}: HeirsSectionProps) {
  
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Clean Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Heirs</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your beneficiaries and their inheritance</p>
        </div>
        <Button 
          onClick={() => setIsAddHeirModalOpen(true)} 
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Heir
        </Button>
      </div>

      {/* Heirs Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {heirs.length === 0 ? (
          /* Clean Empty State */
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Heirs Added</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Start by adding your first heir to manage your asset distribution
                </p>
                <Button 
                  onClick={() => setIsAddHeirModalOpen(true)} 
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Heir
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          heirs.map((heir, index) => {
            const heirAssets = getHeirAssets(heir.id);
            const totalValue = heirAssets.reduce((sum, asset) => sum + (asset.asset_data?.value || 0), 0);
            const isDeleting = deletingHeirs.has(heir.id);
            
            return (
              <motion.div
                key={heir.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className="relative hover:shadow-md transition-shadow duration-200 cursor-pointer w-full min-w-0"
                  onClick={() => {
                    setSelectedHeir(heir);
                    setIsHeirDetailOpen(true);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Clean Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {heir.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base font-semibold truncate">
                            {heir.name}
                          </CardTitle>
                          <Badge 
                            variant="secondary" 
                            className="mt-1 text-xs font-normal"
                          >
                            {heir.relationship}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startHeirEditing(heir)}
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteHeir(heir.id, heir.name)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Inheritance Value */}
                    <div className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Value</span>
                      <span className="text-sm font-semibold">{formatValue(totalValue)}</span>
                    </div>
                    
                    {/* Assets Count */}
                    <div className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Assets</span>
                      <span className="text-sm font-semibold">{heirAssets.length}</span>
                    </div>
                    
                    {/* Contact Info */}
                    {heir.email && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{heir.email}</span>
                        </div>
                      </div>
                    )}
                    
                    {heir.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{heir.phone}</span>
                      </div>
                    )}
                    
                    {/* Notes Preview */}
                    {heir.notes && (
                      <div className="pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                          <p className="text-xs text-muted-foreground truncate">
                            {heir.notes}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* View Details Link */}
                    <div className="pt-3 flex items-center justify-end">
                      <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
                        View Details
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
      
      {/* NYC Standard Summary Stats */}
      {heirs.length > 0 && (
        <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-slate-200/60 dark:border-slate-700/60">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="mb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {heirs.length}
                  </p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Total Heirs
                  </p>
                </div>
              </div>
              
              <div className="text-center group border-l border-r border-slate-200 dark:border-slate-700">
                <div className="mb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors">
                    <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {assets.length}
                  </p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Total Assets
                  </p>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="mb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-3 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors">
                    <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {formatValue(assets.reduce((sum, asset) => sum + (asset.asset_data?.value || 0), 0))}
                  </p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Total Value
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Inheritance Planning Overview
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}