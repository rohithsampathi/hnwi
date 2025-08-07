import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, Building, Crown } from "lucide-react";
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
  return (
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
      <div className="grid gap-6">
        {heirs.length === 0 ? (
          <div className="text-center py-12">
            <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Heirs Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your legacy by designating your first heir
            </p>
            <Button onClick={() => setIsAddHeirModalOpen(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Heir
            </Button>
          </div>
        ) : (
          heirs.map((heir) => {
            const heirAssets = getHeirAssets(heir.id);
            const totalValue = heirAssets.reduce((sum, asset) => sum + (asset.asset_data?.value || 0), 0);
            const isDeleting = deletingHeirs.has(heir.id);
            
            return (
              <Card 
                key={heir.id} 
                className="transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/30 hover:border-l-primary cursor-pointer"
                onClick={() => {
                  setSelectedHeir(heir);
                  setIsHeirDetailOpen(true);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Crown className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{heir.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {heir.relationship}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => startHeirEditing(heir)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteHeir(heir.id, heir.name)}
                        disabled={isDeleting}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Net Worth</p>
                        <p className="font-semibold">
                          ${totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Assets</p>
                        <p className="font-semibold">
                          {heirAssets.length} {heirAssets.length === 1 ? 'Asset' : 'Assets'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {heir.email && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">Contact: {heir.email}</p>
                    </div>
                  )}
                  
                  {heir.notes && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">"{heir.notes}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}