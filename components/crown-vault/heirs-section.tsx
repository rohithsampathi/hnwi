import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, Building, Crown, Users, Shield, Star } from "lucide-react";
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

      {/* Ultra-Premium Heirs Grid */}
      <div className="grid gap-8">
        {heirs.length === 0 ? (
          /* Ultra-Premium Empty State */
          <div className="relative overflow-hidden">
            {/* Multi-layer background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-3xl" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl" />
            
            <Card className="relative border-0 bg-background/60 backdrop-blur-sm shadow-2xl">
              <CardContent className="text-center py-16 px-12">
                {/* Floating crown icon */}
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-full blur-lg opacity-30 animate-pulse" />
                  <div className="relative p-6 bg-gradient-to-br from-background via-background/95 to-background/90 rounded-full border-2 border-accent/30 shadow-2xl">
                    <Crown className="h-16 w-16 text-accent drop-shadow-lg" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-4">
                  Your Legacy Awaits
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                  Begin crafting your dynasty by designating your first heir to carry forward your crown
                </p>
                
                <Button 
                  onClick={() => setIsAddHeirModalOpen(true)} 
                  size="lg" 
                  className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-bold px-8 py-6 rounded-2xl shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-105"
                >
                  <Crown className="h-6 w-6 mr-3" />
                  Crown Your First Heir
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          heirs.map((heir, index) => {
            const heirAssets = getHeirAssets(heir.id);
            const totalValue = heirAssets.reduce((sum, asset) => sum + (asset.asset_data?.value || 0), 0);
            const isDeleting = deletingHeirs.has(heir.id);
            
            const formatValue = (value: number) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return `${value.toLocaleString()}`;
            };
            
            return (
              <motion.div
                key={heir.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* ======= ULTRA-PREMIUM HEIR DYNASTY CARD ======= */}
                
                {/* Multi-Layer Background System - App Theme Edition */}
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-xl blur-md opacity-80 group-hover:opacity-100 transition-all duration-400" />
                
                {/* Crown Heir Card */}
                <Card 
                  className="relative overflow-hidden cursor-pointer
                             bg-gradient-to-br from-background via-background/98 to-background/95
                             dark:from-slate-900/98 dark:via-slate-900/95 dark:to-slate-800/98
                             border-2 border-accent/30 dark:border-accent/40
                             backdrop-blur-xl shadow-2xl
                             hover:shadow-[0_25px_60px_rgba(34,_197,_94,_0.15)]
                             hover:border-accent/50 hover:bg-gradient-to-br hover:from-background hover:to-accent/5
                             transition-all duration-500 ease-out
                             group-hover:scale-[1.02] group-hover:-translate-y-1"
                  onClick={() => {
                    setSelectedHeir(heir);
                    setIsHeirDetailOpen(true);
                  }}
                >
                  {/* Floating Ambient Elements - App Theme */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-secondary/8 via-secondary/4 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/6 via-primary/3 to-transparent rounded-full blur-2xl" />
                  <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-bl from-accent/4 to-transparent rounded-full blur-xl" />
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -top-px overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </div>

                  <CardHeader className="relative pb-6 space-y-0">
                    <div className="flex items-start justify-between">
                      
                      {/* ======= HEIR ROYAL IDENTITY ======= */}
                      <div className="flex items-center gap-6">
                        {/* Premium Avatar System */}
                        <div className="relative group/avatar">
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-primary/30 rounded-2xl blur-lg opacity-60 group-hover/avatar:opacity-90 transition-opacity duration-300" />
                          <div className="relative w-20 h-20 bg-gradient-to-br from-accent/20 via-primary/15 to-secondary/20 
                                         rounded-2xl border-2 border-accent/30 shadow-2xl
                                         group-hover/avatar:shadow-3xl group-hover/avatar:scale-105 group-hover/avatar:border-accent/50
                                         transition-all duration-300 flex items-center justify-center">
                            {/* Crown or Initial */}
                            {heir.name ? (
                              <div className="text-3xl font-black bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent">
                                {heir.name.charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <Crown className="h-10 w-10 text-accent drop-shadow-lg" />
                            )}
                          </div>
                          {/* Status indicator */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-background shadow-lg flex items-center justify-center">
                            <Star className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        
                        {/* Heir Details */}
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-foreground leading-tight tracking-tight">
                              {heir.name}
                            </CardTitle>
                            <Badge 
                              className="bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 
                                        border-2 border-accent/30 dark:border-accent/50 
                                        text-accent dark:text-accent font-bold text-sm px-4 py-1 rounded-xl
                                        hover:from-accent/20 hover:to-primary/20 dark:hover:from-accent/30 dark:hover:to-primary/30
                                        transition-all duration-300"
                            >
                              {heir.relationship}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* ======= HEIR MANAGEMENT CONTROLS ======= */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startHeirEditing(heir)}
                          className="h-10 w-10 p-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/50
                                   border border-blue-200/50 dark:border-blue-800/50 rounded-xl
                                   hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/50 dark:hover:to-blue-800/70
                                   hover:border-blue-300 dark:hover:border-blue-600 hover:scale-105
                                   transition-all duration-300"
                        >
                          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteHeir(heir.id, heir.name)}
                          disabled={isDeleting}
                          className="h-10 w-10 p-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/50
                                   border border-red-200/50 dark:border-red-800/50 rounded-xl
                                   hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/50 dark:hover:to-red-800/70
                                   hover:border-red-300 dark:hover:border-red-600 hover:scale-105
                                   transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative p-8 space-y-8">
                    
                    {/* ======= PREMIUM HEIR HEADER - Matching Assets Cards ======= */}
                    <div className="flex items-center justify-between mb-6">
                      {/* Premium Heir Icon */}
                      <div className="relative group/icon">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/20 rounded-2xl blur-lg opacity-60 group-hover/icon:opacity-90 transition-opacity duration-300" />
                        <div className="relative p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl border-2 border-accent/30 shadow-xl
                                       group-hover/icon:shadow-2xl group-hover/icon:scale-105 group-hover/icon:border-accent/50
                                       transition-all duration-300">
                          <Crown className="h-8 w-8 text-accent drop-shadow-lg" />
                        </div>
                      </div>
                      
                      {/* Heir Status Indicators */}
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                        <div className="w-1 h-1 bg-emerald-400/70 rounded-full animate-ping" />
                      </div>
                    </div>
                    
                    {/* Heir Classification Badge */}
                    <div className="mb-6">
                      <Badge variant="outline" 
                             className="text-xs font-bold border-2 border-accent/30 
                                        bg-gradient-to-r from-accent/10 to-accent/5
                                        text-accent shadow-lg px-4 py-2 rounded-xl
                                        hover:border-accent/50 hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10
                                        transition-all duration-300">
                        {heir.relationship}
                      </Badge>
                    </div>

                    {/* ======= PREMIUM HEIR VALUE DISPLAY - Matching Assets Cards ======= */}
                    <div className="space-y-6">
                      {/* Heir Name - Premium Typography */}
                      <div className="space-y-3">
                        <p className="text-sm text-foreground font-bold tracking-wide uppercase opacity-90">Heir Name</p>
                        <h3 className="text-2xl font-black text-foreground leading-tight tracking-tight line-clamp-2 
                                      hover:text-accent transition-colors duration-300">
                          {heir.name}
                        </h3>
                        <div className="w-full h-px bg-gradient-to-r from-accent/50 via-accent/20 to-transparent" />
                      </div>
                      
                      {/* Inherited Value - Ultra Premium Display Matching Assets Cards */}
                      <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl blur-sm" />
                        <div className="relative p-6 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5 rounded-2xl border-2 border-primary/20
                                       hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                              <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider text-primary/80 font-bold">Inherited Value</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="relative">
                              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded blur-lg" />
                              <span className="relative text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                                ${formatValue(totalValue)}
                              </span>
                              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-px bg-primary/60" />
                              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                                USD Secured
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Asset Count - Premium Display */}
                      <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent rounded-2xl blur-sm" />
                        <div className="relative p-6 bg-gradient-to-br from-secondary/5 to-secondary/3 rounded-2xl border-2 border-secondary/20
                                       hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl">
                              <Building className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider text-secondary/80 font-bold">Crown Assets</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="relative">
                              <div className="absolute -inset-1 bg-gradient-to-r from-secondary/30 to-secondary/20 rounded blur-lg" />
                              <span className="relative text-4xl font-black bg-gradient-to-r from-secondary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                                {heirAssets.length}
                              </span>
                              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-secondary/50 via-secondary/20 to-transparent" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-px bg-secondary/60" />
                              <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                                {heirAssets.length === 1 ? 'Asset' : 'Assets'} Assigned
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    
                      {/* Contact - Premium Display (if exists) */}
                      {heir.email && (
                        <div className="relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-2xl blur-sm" />
                          <div className="relative p-6 bg-gradient-to-br from-accent/5 to-accent/3 rounded-2xl border-2 border-accent/20
                                         hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl">
                                <Users className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wider text-accent/80 font-bold">Contact</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-accent/20 rounded blur-lg" />
                                <span className="relative text-lg font-black text-accent">
                                  {heir.email}
                                </span>
                                <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-accent/50 via-accent/20 to-transparent" />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-px bg-accent/60" />
                                <span className="text-xs font-bold text-accent tracking-widest uppercase">
                                  Verified Contact
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Legacy Notes - Premium Display (if exists) */}
                      {heir.notes && (
                        <div className="relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent rounded-2xl blur-sm" />
                          <div className="relative p-6 bg-gradient-to-br from-secondary/5 to-secondary/3 rounded-2xl border-2 border-secondary/20
                                         hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl">
                                <Crown className="h-6 w-6 text-secondary" />
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wider text-secondary/80 font-bold">Legacy Notes</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="relative">
                                <p className="text-lg font-bold text-foreground leading-relaxed italic">
                                  "{heir.notes}"
                                </p>
                                <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-secondary/50 via-secondary/20 to-transparent" />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-px bg-secondary/60" />
                                <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                                  Dynasty Wisdom
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    
                    {/* ======= HEIR STATUS FOOTER - Matching Summary Cards ======= */}
                    <div className="flex items-center justify-center pt-6 border-t-2 border-accent/20 dark:border-accent/40">
                      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-50 to-green-50 
                                     dark:from-emerald-950/30 dark:to-green-950/20 border-2 border-emerald-200/50 
                                     dark:border-emerald-700/30 rounded-full shadow-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-widest uppercase">
                          Active Heir
                        </span>
                      </div>
                    </div>
                    </div>
                    
                    {/* Bottom accent bar - Matching Summary Cards */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-b-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}