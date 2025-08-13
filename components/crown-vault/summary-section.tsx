"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, DollarSign, Vault, Users, Shield, Clock, Activity, Plus } from "lucide-react";
import { SecurePieChart } from "@/components/ui/secure-pie-chart";
import { CrownVaultStats, CrownVaultAsset } from "@/lib/api";
import { processAssetCategories } from "@/lib/category-utils";
import { useTheme } from "@/contexts/theme-context";
import { getVisibleIconColor, getVisibleTextColor, getMetallicCardStyle, getVisibleSubtextColor } from "@/lib/colors";
import { LUXURY_COLOR_PALETTE } from "@/lib/chart-colors";

interface SummarySectionProps {
  stats: CrownVaultStats | null;
  assets: CrownVaultAsset[];
  onAddAssets: () => void;
  onNavigateToTab: (tab: string) => void;
}


const formatValue = (value: number, currency: string = "USD") => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return `${value.toLocaleString()}`;
};

const getDynamicTextSize = (text: string, baseSize: string = "text-3xl lg:text-4xl xl:text-5xl") => {
  const length = text.length;
  if (length > 12) return "text-2xl lg:text-3xl xl:text-4xl";
  if (length > 8) return "text-2xl lg:text-4xl xl:text-5xl";
  return baseSize;
};

const getTotalValue = (stats: CrownVaultStats | null, assets: CrownVaultAsset[]) => {
  return stats?.total_value || assets.reduce((total, asset) => {
    return total + (asset?.asset_data?.value || 0);
  }, 0);
};

export function SummarySection({ stats, assets, onAddAssets, onNavigateToTab }: SummarySectionProps) {
  const { theme } = useTheme();
  const assetCategories = processAssetCategories(assets);
  const totalValue = getTotalValue(stats, assets);

  return (
    <div className="space-y-10">
      {/* Premium Summary Overview */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-secondary/3 to-secondary/5 rounded-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-secondary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl" />
        
        <Card className="relative border-0 bg-background/60 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-4 sm:p-8 md:p-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg opacity-30" />
                <Crown className={`relative h-16 w-16 ${getVisibleIconColor(theme)} mx-auto mb-4 drop-shadow-lg`} />
              </div>
              <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Legacy Summary
              </h1>
              <p className="text-xl text-muted-foreground font-medium">Your legacy secured with military-grade encryption</p>
            </div>
            
            {/* Flagship Legacy Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Total Portfolio Value - Primary Flagship Card */}
              <div className={`${getMetallicCardStyle(theme).className} p-8 hover:shadow-xl transition-all duration-300 text-center`} style={getMetallicCardStyle(theme).style}>
                <div className="flex justify-center mb-6">
                  <div className={`${getMetallicCardStyle(theme).className} p-4`} style={getMetallicCardStyle(theme).style}>
                    <DollarSign className={`h-10 w-10 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  </div>
                </div>
                <p className={`text-sm font-medium mb-3 uppercase tracking-wide ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Total Portfolio Value</p>
                <p className={`${getDynamicTextSize(`$${formatValue(totalValue)}`)} font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>${formatValue(totalValue)}</p>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>Secured in Crown Vault</p>
              </div>
              
              {/* Total Assets - Secondary Card */}
              <div className={`${getMetallicCardStyle(theme).className} p-8 hover:shadow-xl transition-all duration-300 text-center`} style={getMetallicCardStyle(theme).style}>
                <div className="flex justify-center mb-6">
                  <div className={`${getMetallicCardStyle(theme).className} p-4`} style={getMetallicCardStyle(theme).style}>
                    <Vault className={`h-10 w-10 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  </div>
                </div>
                <p className={`text-sm font-medium mb-3 uppercase tracking-wide ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Total Assets</p>
                <p className={`text-3xl lg:text-4xl xl:text-5xl font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>{stats?.total_assets || assets.length}</p>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                  {assetCategories.length} {assetCategories.length === 1 ? 'Category' : 'Categories'}
                </p>
              </div>
              
              {/* Designated Heirs - Tertiary Card */}
              <div className={`${getMetallicCardStyle(theme).className} p-8 hover:shadow-xl transition-all duration-300 text-center`} style={getMetallicCardStyle(theme).style}>
                <div className="flex justify-center mb-6">
                  <div className={`${getMetallicCardStyle(theme).className} p-4`} style={getMetallicCardStyle(theme).style}>
                    <Users className={`h-10 w-10 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  </div>
                </div>
                <p className={`text-sm font-medium mb-3 uppercase tracking-wide ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Designated Heirs</p>
                <p className={`text-3xl lg:text-4xl xl:text-5xl font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>{stats?.total_heirs || 0}</p>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>Legacy Planning Active</p>
              </div>
              
              {/* Security Level - Quaternary Card */}
              <div className={`${getMetallicCardStyle(theme).className} p-8 hover:shadow-xl transition-all duration-300 text-center`} style={getMetallicCardStyle(theme).style}>
                <div className="flex justify-center mb-6">
                  <div className={`${getMetallicCardStyle(theme).className} p-4`} style={getMetallicCardStyle(theme).style}>
                    <Shield className={`h-10 w-10 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  </div>
                </div>
                <p className={`text-sm font-medium mb-3 uppercase tracking-wide ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Security Level</p>
                <p className={`text-3xl font-black mb-4 tracking-tight ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>256-bit AES</p>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>Military-Grade Encryption</p>
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
      
      {/* Portfolio Allocation - No Container */}
      {assets.length > 0 && (
        <div className="space-y-6">
          <div className="text-center pb-6">
            <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              Portfolio Allocation
            </h2>
            <p className="text-lg text-muted-foreground">
              Strategic distribution of your wealth across asset categories
            </p>
          </div>
          <div className="px-2 sm:px-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-12 items-center">
              {/* AES-256 Secured Pie Chart */}
              <div className="relative">
                <SecurePieChart
                  data={assetCategories}
                  totalValue={totalValue}
                  centerLabel="Crown Vault"
                  colors={LUXURY_COLOR_PALETTE}
                  height={500}
                  className="w-full"
                />
              </div>
              {/* Premium Category List */}
              <div className="space-y-4">
                <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Asset Breakdown</h3>
                {assetCategories.map((category, index) => (
                  <div key={category.name} className="group relative">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div 
                            className="w-6 h-6 rounded-full shadow-md border-2 border-white/20" 
                            style={{ backgroundColor: LUXURY_COLOR_PALETTE[index % LUXURY_COLOR_PALETTE.length] }}
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
                        <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{formatValue(category.value)}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${category.percentage}%`,
                                backgroundColor: LUXURY_COLOR_PALETTE[index % LUXURY_COLOR_PALETTE.length]
                              }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>{category.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
          <CardContent className="space-y-3">
            {stats?.recent_activity && stats.recent_activity.length > 0 ? (
              <>
                {stats.recent_activity.slice(0, 3).map((activity, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 hover:bg-muted/50"
                    onClick={() => onNavigateToTab("activity")}
                  >
                    <div className="flex items-start gap-3 w-full min-w-0">
                      <Activity className={`h-4 w-4 mt-1 flex-shrink-0 ${getVisibleIconColor(theme)}`} />
                      <div className="text-left flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium truncate">{activity.details}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => onNavigateToTab("activity")}
                >
                  View All Activity
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                disabled
              >
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No recent activity</span>
                </div>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}