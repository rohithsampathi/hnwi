import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User, Mail, Phone, FileText, ChevronRight } from "lucide-react";
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  className="relative hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedHeir(heir);
                    setIsHeirDetailOpen(true);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Clean Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {heir.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <CardTitle className="text-base font-semibold">
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
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
                          <p className="text-xs text-muted-foreground line-clamp-2">
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
      
      {/* Summary Stats */}
      {heirs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-semibold">{heirs.length}</p>
            <p className="text-xs text-muted-foreground">Total Heirs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{assets.length}</p>
            <p className="text-xs text-muted-foreground">Total Assets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">
              {formatValue(assets.reduce((sum, asset) => sum + (asset.asset_data?.value || 0), 0))}
            </p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </div>
        </div>
      )}
    </div>
  );
}