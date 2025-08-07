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
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--accent))',
  '#22c55e', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4'  // cyan-500
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
                  <p className="text-3xl font-bold text-primary mb-1">{formatValue(totalValue)}</p>
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
                  <p className="text-xs text-blue-600 font-semibold">Across {assetCategories.length} {assetCategories.length === 1 ? 'category' : 'categories'}</p>
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
                  <p className="text-3xl font-bold text-accent mb-1">{stats?.total_heirs || 0}</p>
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