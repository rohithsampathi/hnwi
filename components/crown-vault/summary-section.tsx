"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, DollarSign, Vault, Users, Shield, Clock, Activity, Plus } from "lucide-react";
import { SecurePieChart } from "@/components/ui/secure-pie-chart";
import { CrownVaultStats, CrownVaultAsset } from "@/lib/api";
import { processAssetCategories } from "@/lib/category-utils";

interface SummarySectionProps {
  stats: CrownVaultStats | null;
  assets: CrownVaultAsset[];
  onAddAssets: () => void;
  onNavigateToTab: (tab: string) => void;
}

const COLORS = [
  'hsl(var(--primary))',     // Forest green
  'hsl(var(--secondary))',   // Warm gold
  '#2D5A4F',                 // Deep forest green
  '#D4AF37',                 // Antique gold
  '#8B4513',                 // Saddle brown (luxury leather)
  '#4682B4',                 // Steel blue (premium metal)
  '#800020',                 // Burgundy (wine/luxury)
  '#556B2F',                 // Dark olive green
  '#B8860B',                 // Dark golden rod
  '#2F4F4F',                 // Dark slate gray
  '#8B7355',                 // Dark khaki (earth tones)
  '#A0522D',                 // Sienna (warm brown)
  '#708090',                 // Slate gray (platinum)
  '#6B8E23',                 // Olive drab
  '#BC8F8F',                 // Rosy brown
  '#8FBC8F',                 // Dark sea green
  '#DEB887',                 // Burlywood
  '#5F8A5F',                 // Dark sea green variant
  '#CD853F',                 // Peru (warm earth)
  '#696969'                  // Dim gray (charcoal)
];

const formatValue = (value: number, currency: string = "USD") => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return `${value.toLocaleString()}`;
};

const getTotalValue = (stats: CrownVaultStats | null, assets: CrownVaultAsset[]) => {
  return stats?.total_value || assets.reduce((total, asset) => {
    return total + (asset?.asset_data?.value || 0);
  }, 0);
};

export function SummarySection({ stats, assets, onAddAssets, onNavigateToTab }: SummarySectionProps) {
  const assetCategories = processAssetCategories(assets);
  const totalValue = getTotalValue(stats, assets);

  return (
    <div className="space-y-10">
      {/* Premium Summary Overview */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5 rounded-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl" />
        
        <Card className="relative border-0 bg-background/60 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-4 sm:p-8 md:p-12">
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
            
            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Total Value Card - Ultra Premium */}
              <div className="group relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-3xl opacity-60 group-hover:opacity-80 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-tl from-amber-500/20 via-transparent to-primary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-px overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                </div>
                
                <div className="relative bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-2 border-primary/30 rounded-3xl p-8 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-105 transform-gpu">
                  {/* Top section with icon and status */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg animate-pulse" />
                      <div className="relative p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/30">
                        <DollarSign className="h-10 w-10 text-primary drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                      <div className="w-1 h-1 bg-primary/70 rounded-full animate-ping" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <p className="text-sm text-foreground font-bold tracking-wide uppercase opacity-90">Total Portfolio Value</p>
                    <div className="relative">
                      <p className="text-4xl font-black bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                        ${formatValue(totalValue)}
                      </p>
                      <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-px bg-primary/60" />
                      <p className="text-xs text-primary font-bold tracking-widest uppercase">Secured in Vault</p>
                    </div>
                  </div>
                  
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-primary rounded-b-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
              
              {/* Total Assets Card - Ultra Premium */}
              <div className="group relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-secondary/20 to-secondary/10 rounded-3xl opacity-60 group-hover:opacity-80 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-tl from-orange-500/20 via-transparent to-secondary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-px overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out delay-100" />
                </div>
                
                <div className="relative bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-2 border-secondary/30 rounded-3xl p-8 hover:border-secondary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/20 hover:scale-105 transform-gpu">
                  {/* Top section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-secondary/20 rounded-2xl blur-lg animate-pulse" />
                      <div className="relative p-4 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl border border-secondary/30">
                        <Vault className="h-10 w-10 text-secondary drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-lg shadow-secondary/50" />
                      <div className="w-1 h-1 bg-secondary/70 rounded-full animate-ping" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <p className="text-sm text-foreground font-bold tracking-wide uppercase opacity-90">Total Assets</p>
                    <div className="relative">
                      <p className="text-4xl font-black bg-gradient-to-r from-secondary to-orange-600 bg-clip-text text-transparent drop-shadow-sm">
                        {stats?.total_assets || assets.length}
                      </p>
                      <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-secondary/50 via-secondary/20 to-transparent" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-px bg-secondary/60" />
                      <p className="text-xs text-secondary font-bold tracking-widest uppercase">
                        Across {assetCategories.length} {assetCategories.length === 1 ? 'Category' : 'Categories'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-orange-500 to-secondary rounded-b-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
              
              {/* Heirs Card - Ultra Premium */}
              <div className="group relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-purple-500/20 to-purple-500/10 rounded-3xl opacity-60 group-hover:opacity-80 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-tl from-pink-500/20 via-transparent to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-px overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out delay-200" />
                </div>
                
                <div className="relative bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105 transform-gpu">
                  {/* Top section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-lg animate-pulse" />
                      <div className="relative p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl border border-purple-500/30">
                        <Users className="h-10 w-10 text-purple-500 drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
                      <div className="w-1 h-1 bg-purple-500/70 rounded-full animate-ping" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <p className="text-sm text-foreground font-bold tracking-wide uppercase opacity-90">Designated Heirs</p>
                    <div className="relative">
                      <p className="text-4xl font-black bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                        {stats?.total_heirs || 0}
                      </p>
                      <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-purple-500/50 via-purple-500/20 to-transparent" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-px bg-purple-500/60" />
                      <p className="text-xs text-purple-500 font-bold tracking-widest uppercase">Legacy Planning Active</p>
                    </div>
                  </div>
                  
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-b-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
              
              {/* Security Card - Ultra Premium */}
              <div className="group relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-emerald-500/20 to-emerald-500/10 rounded-3xl opacity-60 group-hover:opacity-80 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-tl from-green-400/20 via-transparent to-emerald-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-px overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out delay-300" />
                </div>
                
                <div className="relative bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-2 border-emerald-500/30 rounded-3xl p-8 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-105 transform-gpu">
                  {/* Top section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-lg animate-pulse" />
                      <div className="relative p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-2xl border border-emerald-500/30">
                        <Shield className="h-10 w-10 text-emerald-500 drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                      <div className="w-1 h-1 bg-emerald-500/70 rounded-full animate-ping" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <p className="text-sm text-foreground font-bold tracking-wide uppercase opacity-90">Security Level</p>
                    <div className="relative">
                      <p className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent drop-shadow-sm">
                        256-bit AES
                      </p>
                      <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-emerald-500/50 via-emerald-500/20 to-transparent" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-px bg-emerald-500/60" />
                      <p className="text-xs text-emerald-500 font-bold tracking-widest uppercase">Military-Grade Encryption</p>
                    </div>
                  </div>
                  
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 rounded-b-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
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
          <CardContent className="px-2 sm:px-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-12 items-center">
              {/* AES-256 Secured Pie Chart */}
              <div className="relative">
                <SecurePieChart
                  data={assetCategories}
                  totalValue={totalValue}
                  centerLabel="Crown Vault"
                  height={500}
                  className="w-full"
                />
              </div>
              {/* Premium Category List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-6 text-foreground">Asset Breakdown</h3>
                {assetCategories.map((category, index) => (
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
              onClick={onAddAssets}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Assets
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => onNavigateToTab("assets")}
            >
              <Vault className="h-4 w-4 mr-2" />
              View All Assets
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => onNavigateToTab("heirs")}
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
                  onClick={() => onNavigateToTab("activity")}
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
  );
}