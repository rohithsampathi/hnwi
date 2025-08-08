import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Shield, Clock, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { CrownVaultStats } from "@/lib/api";

interface ActivitySectionProps {
  stats: CrownVaultStats | null;
}

export function ActivitySection({ stats }: ActivitySectionProps) {
  
  const getActivityIcon = (details: string) => {
    if (details.toLowerCase().includes('asset')) return CheckCircle;
    if (details.toLowerCase().includes('heir')) return Shield;
    if (details.toLowerCase().includes('update')) return Zap;
    if (details.toLowerCase().includes('security')) return Shield;
    return Activity;
  };
  
  const getActivityColor = (details: string) => {
    if (details.toLowerCase().includes('asset')) return 'primary';
    if (details.toLowerCase().includes('heir')) return 'accent';
    if (details.toLowerCase().includes('update')) return 'secondary';
    if (details.toLowerCase().includes('security')) return 'emerald';
    return 'primary';
  };

  return (
    <div className="space-y-6">
      
      {/* Activity Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
          <p className="text-muted-foreground">Monitor your Crown Vault activity</p>
        </div>
        
        {/* Real-time Status Indicator */}
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 
                       border-2 border-emerald-200/50 dark:border-emerald-700/30 rounded-2xl shadow-lg">
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
            <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">
            Live
          </span>
        </div>
      </div>

      {/* Ultra-Premium Activity Grid */}
      <div className="grid gap-8">
        {stats?.recent_activity && stats.recent_activity.length > 0 ? (
          stats.recent_activity.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.details);
            const colorTheme = getActivityColor(activity.details);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Multi-Layer Background System - App Theme Edition */}
                <div className={`absolute -inset-3 bg-gradient-to-br ${
                  colorTheme === 'primary' ? 'from-primary/15 via-secondary/10 to-accent/15' :
                  colorTheme === 'accent' ? 'from-accent/15 via-primary/10 to-secondary/15' :
                  colorTheme === 'secondary' ? 'from-secondary/15 via-accent/10 to-primary/15' :
                  colorTheme === 'emerald' ? 'from-emerald-500/15 via-green-500/10 to-emerald-400/15' :
                  'from-primary/15 via-secondary/10 to-accent/15'
                } rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />
                <div className={`absolute -inset-2 bg-gradient-to-br ${
                  colorTheme === 'primary' ? 'from-primary/20 via-secondary/15 to-accent/20' :
                  colorTheme === 'accent' ? 'from-accent/20 via-primary/15 to-secondary/20' :
                  colorTheme === 'secondary' ? 'from-secondary/20 via-accent/15 to-primary/20' :
                  colorTheme === 'emerald' ? 'from-emerald-500/20 via-green-500/15 to-emerald-400/20' :
                  'from-primary/20 via-secondary/15 to-accent/20'
                } rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500`} />
                <div className={`absolute -inset-1 bg-gradient-to-br ${
                  colorTheme === 'primary' ? 'from-primary/10 via-secondary/5 to-accent/10' :
                  colorTheme === 'accent' ? 'from-accent/10 via-primary/5 to-secondary/10' :
                  colorTheme === 'secondary' ? 'from-secondary/10 via-accent/5 to-primary/10' :
                  colorTheme === 'emerald' ? 'from-emerald-500/10 via-green-500/5 to-emerald-400/10' :
                  'from-primary/10 via-secondary/5 to-accent/10'
                } rounded-xl blur-md opacity-80 group-hover:opacity-100 transition-all duration-400`} />
                
                {/* Activity Card */}
                <Card 
                  className={`relative overflow-hidden cursor-pointer
                             bg-gradient-to-br from-background via-background/98 to-background/95
                             dark:from-slate-900/98 dark:via-slate-900/95 dark:to-slate-800/98
                             ${colorTheme === 'primary' ? 'border-2 border-primary/30 dark:border-primary/40 hover:border-primary/50' :
                               colorTheme === 'accent' ? 'border-2 border-accent/30 dark:border-accent/40 hover:border-accent/50' :
                               colorTheme === 'secondary' ? 'border-2 border-secondary/30 dark:border-secondary/40 hover:border-secondary/50' :
                               colorTheme === 'emerald' ? 'border-2 border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500/50' :
                               'border-2 border-primary/30 dark:border-primary/40 hover:border-primary/50'}
                             backdrop-blur-xl shadow-2xl hover:shadow-[0_25px_60px_rgba(34,_197,_94,_0.15)]
                             ${colorTheme === 'primary' ? 'hover:bg-gradient-to-br hover:from-background hover:to-primary/5' :
                               colorTheme === 'accent' ? 'hover:bg-gradient-to-br hover:from-background hover:to-accent/5' :
                               colorTheme === 'secondary' ? 'hover:bg-gradient-to-br hover:from-background hover:to-secondary/5' :
                               colorTheme === 'emerald' ? 'hover:bg-gradient-to-br hover:from-background hover:to-emerald-500/5' :
                               'hover:bg-gradient-to-br hover:from-background hover:to-primary/5'}
                             transition-all duration-500 ease-out
                             group-hover:scale-[1.02] group-hover:-translate-y-1`}
                >
                  {/* Floating Ambient Elements - App Theme */}
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${
                    colorTheme === 'primary' ? 'from-secondary/8 via-secondary/4 to-transparent' :
                    colorTheme === 'accent' ? 'from-primary/8 via-primary/4 to-transparent' :
                    colorTheme === 'secondary' ? 'from-accent/8 via-accent/4 to-transparent' :
                    colorTheme === 'emerald' ? 'from-green-500/8 via-green-400/4 to-transparent' :
                    'from-secondary/8 via-secondary/4 to-transparent'
                  } rounded-full blur-3xl`} />
                  <div className={`absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr ${
                    colorTheme === 'primary' ? 'from-primary/6 via-primary/3 to-transparent' :
                    colorTheme === 'accent' ? 'from-accent/6 via-accent/3 to-transparent' :
                    colorTheme === 'secondary' ? 'from-secondary/6 via-secondary/3 to-transparent' :
                    colorTheme === 'emerald' ? 'from-emerald-500/6 via-emerald-400/3 to-transparent' :
                    'from-primary/6 via-primary/3 to-transparent'
                  } rounded-full blur-2xl`} />
                  <div className={`absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-bl ${
                    colorTheme === 'primary' ? 'from-accent/4 to-transparent' :
                    colorTheme === 'accent' ? 'from-secondary/4 to-transparent' :
                    colorTheme === 'secondary' ? 'from-primary/4 to-transparent' :
                    colorTheme === 'emerald' ? 'from-emerald-400/4 to-transparent' :
                    'from-accent/4 to-transparent'
                  } rounded-full blur-xl`} />
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -top-px overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </div>

                  <CardContent className="relative p-8 space-y-8">
                    
                    {/* ======= PREMIUM ACTIVITY HEADER - Matching Assets Cards ======= */}
                    <div className="flex items-center justify-between mb-6">
                      {/* Premium Activity Icon */}
                      <div className="relative group/icon">
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                          colorTheme === 'primary' ? 'from-primary/30 to-secondary/20' :
                          colorTheme === 'accent' ? 'from-accent/30 to-primary/20' :
                          colorTheme === 'secondary' ? 'from-secondary/30 to-accent/20' :
                          colorTheme === 'emerald' ? 'from-emerald-500/30 to-green-500/20' :
                          'from-primary/30 to-secondary/20'
                        } rounded-2xl blur-lg opacity-60 group-hover/icon:opacity-90 transition-opacity duration-300`} />
                        <div className={`relative p-4 bg-gradient-to-br ${
                          colorTheme === 'primary' ? 'from-primary/20 to-primary/10' :
                          colorTheme === 'accent' ? 'from-accent/20 to-accent/10' :
                          colorTheme === 'secondary' ? 'from-secondary/20 to-secondary/10' :
                          colorTheme === 'emerald' ? 'from-emerald-500/20 to-emerald-500/10' :
                          'from-primary/20 to-primary/10'
                        } rounded-2xl border-2 ${
                          colorTheme === 'primary' ? 'border-primary/30' :
                          colorTheme === 'accent' ? 'border-accent/30' :
                          colorTheme === 'secondary' ? 'border-secondary/30' :
                          colorTheme === 'emerald' ? 'border-emerald-500/30' :
                          'border-primary/30'
                        } shadow-xl
                                         group-hover/icon:shadow-2xl group-hover/icon:scale-105 ${
                                           colorTheme === 'primary' ? 'group-hover/icon:border-primary/50' :
                                           colorTheme === 'accent' ? 'group-hover/icon:border-accent/50' :
                                           colorTheme === 'secondary' ? 'group-hover/icon:border-secondary/50' :
                                           colorTheme === 'emerald' ? 'group-hover/icon:border-emerald-500/50' :
                                           'group-hover/icon:border-primary/50'
                                         }
                                         transition-all duration-300`}>
                          <IconComponent className={`h-8 w-8 ${
                            colorTheme === 'primary' ? 'text-primary' :
                            colorTheme === 'accent' ? 'text-accent' :
                            colorTheme === 'secondary' ? 'text-secondary' :
                            colorTheme === 'emerald' ? 'text-emerald-500' :
                            'text-primary'
                          } drop-shadow-lg`} />
                        </div>
                      </div>
                      
                      {/* Activity Status Indicators */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${
                          colorTheme === 'primary' ? 'bg-primary' :
                          colorTheme === 'accent' ? 'bg-accent' :
                          colorTheme === 'secondary' ? 'bg-secondary' :
                          colorTheme === 'emerald' ? 'bg-emerald-500' :
                          'bg-primary'
                        } rounded-full animate-pulse shadow-lg ${
                          colorTheme === 'primary' ? 'shadow-primary/50' :
                          colorTheme === 'accent' ? 'shadow-accent/50' :
                          colorTheme === 'secondary' ? 'shadow-secondary/50' :
                          colorTheme === 'emerald' ? 'shadow-emerald-500/50' :
                          'shadow-primary/50'
                        }`} />
                        <div className={`w-1 h-1 ${
                          colorTheme === 'primary' ? 'bg-primary/70' :
                          colorTheme === 'accent' ? 'bg-accent/70' :
                          colorTheme === 'secondary' ? 'bg-secondary/70' :
                          colorTheme === 'emerald' ? 'bg-emerald-400/70' :
                          'bg-primary/70'
                        } rounded-full animate-ping`} />
                      </div>
                    </div>
                    
                    {/* Activity Classification Badge */}
                    <div className="mb-6">
                      <Badge variant="outline" 
                             className={`text-xs font-bold border-2 ${
                               colorTheme === 'primary' ? 'border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 text-primary' :
                               colorTheme === 'accent' ? 'border-accent/30 bg-gradient-to-r from-accent/10 to-accent/5 text-accent' :
                               colorTheme === 'secondary' ? 'border-secondary/30 bg-gradient-to-r from-secondary/10 to-secondary/5 text-secondary' :
                               colorTheme === 'emerald' ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-500' :
                               'border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 text-primary'
                             } shadow-lg px-4 py-2 rounded-xl
                             ${colorTheme === 'primary' ? 'hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10' :
                               colorTheme === 'accent' ? 'hover:border-accent/50 hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10' :
                               colorTheme === 'secondary' ? 'hover:border-secondary/50 hover:bg-gradient-to-r hover:from-secondary/20 hover:to-secondary/10' :
                               colorTheme === 'emerald' ? 'hover:border-emerald-500/50 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-emerald-500/10' :
                               'hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10'}
                             transition-all duration-300`}>
                        Activity Log
                      </Badge>
                    </div>

                    {/* ======= PREMIUM ACTIVITY VALUE DISPLAY - Matching Assets Cards ======= */}
                    <div className="space-y-6">
                      {/* Activity Description - Premium Typography */}
                      <div className="space-y-3">
                        <p className="text-sm text-foreground font-bold tracking-wide uppercase opacity-90">Activity Details</p>
                        <h3 className={`text-2xl font-black text-foreground leading-tight tracking-tight line-clamp-2 
                                      ${colorTheme === 'primary' ? 'hover:text-primary' :
                                        colorTheme === 'accent' ? 'hover:text-accent' :
                                        colorTheme === 'secondary' ? 'hover:text-secondary' :
                                        colorTheme === 'emerald' ? 'hover:text-emerald-500' :
                                        'hover:text-primary'} transition-colors duration-300`}>
                          {activity.details}
                        </h3>
                        <div className={`w-full h-px bg-gradient-to-r ${
                          colorTheme === 'primary' ? 'from-primary/50 via-primary/20 to-transparent' :
                          colorTheme === 'accent' ? 'from-accent/50 via-accent/20 to-transparent' :
                          colorTheme === 'secondary' ? 'from-secondary/50 via-secondary/20 to-transparent' :
                          colorTheme === 'emerald' ? 'from-emerald-500/50 via-emerald-500/20 to-transparent' :
                          'from-primary/50 via-primary/20 to-transparent'
                        }`} />
                      </div>
                      
                      {/* Timestamp - Ultra Premium Display Matching Assets Cards */}
                      <div className="relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                          colorTheme === 'primary' ? 'from-primary/10 via-secondary/5 to-accent/10' :
                          colorTheme === 'accent' ? 'from-accent/10 via-primary/5 to-secondary/10' :
                          colorTheme === 'secondary' ? 'from-secondary/10 via-accent/5 to-primary/10' :
                          colorTheme === 'emerald' ? 'from-emerald-500/10 via-green-500/5 to-emerald-400/10' :
                          'from-primary/10 via-secondary/5 to-accent/10'
                        } rounded-2xl blur-sm`} />
                        <div className={`relative p-6 bg-gradient-to-br ${
                          colorTheme === 'primary' ? 'from-primary/5 via-secondary/3 to-accent/5' :
                          colorTheme === 'accent' ? 'from-accent/5 via-primary/3 to-secondary/5' :
                          colorTheme === 'secondary' ? 'from-secondary/5 via-accent/3 to-primary/5' :
                          colorTheme === 'emerald' ? 'from-emerald-500/5 via-green-500/3 to-emerald-400/5' :
                          'from-primary/5 via-secondary/3 to-accent/5'
                        } rounded-2xl border-2 ${
                          colorTheme === 'primary' ? 'border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10' :
                          colorTheme === 'accent' ? 'border-accent/20 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10' :
                          colorTheme === 'secondary' ? 'border-secondary/20 hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/10' :
                          colorTheme === 'emerald' ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10' :
                          'border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10'
                        } transition-all duration-300`}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 bg-gradient-to-br ${
                              colorTheme === 'primary' ? 'from-primary/20 to-primary/10' :
                              colorTheme === 'accent' ? 'from-accent/20 to-accent/10' :
                              colorTheme === 'secondary' ? 'from-secondary/20 to-secondary/10' :
                              colorTheme === 'emerald' ? 'from-emerald-500/20 to-emerald-500/10' :
                              'from-primary/20 to-primary/10'
                            } rounded-xl`}>
                              <Clock className={`h-6 w-6 ${
                                colorTheme === 'primary' ? 'text-primary' :
                                colorTheme === 'accent' ? 'text-accent' :
                                colorTheme === 'secondary' ? 'text-secondary' :
                                colorTheme === 'emerald' ? 'text-emerald-500' :
                                'text-primary'
                              }`} />
                            </div>
                            <div>
                              <p className={`text-xs uppercase tracking-wider ${
                                colorTheme === 'primary' ? 'text-primary/80' :
                                colorTheme === 'accent' ? 'text-accent/80' :
                                colorTheme === 'secondary' ? 'text-secondary/80' :
                                colorTheme === 'emerald' ? 'text-emerald-500/80' :
                                'text-primary/80'
                              } font-bold`}>Timestamp</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="relative">
                              <div className={`absolute -inset-1 bg-gradient-to-r ${
                                colorTheme === 'primary' ? 'from-primary/30 to-secondary/30' :
                                colorTheme === 'accent' ? 'from-accent/30 to-primary/30' :
                                colorTheme === 'secondary' ? 'from-secondary/30 to-accent/30' :
                                colorTheme === 'emerald' ? 'from-emerald-500/30 to-green-500/30' :
                                'from-primary/30 to-secondary/30'
                              } rounded blur-lg`} />
                              <span className={`relative text-2xl font-black bg-gradient-to-r ${
                                colorTheme === 'primary' ? 'from-primary to-secondary' :
                                colorTheme === 'accent' ? 'from-accent to-primary' :
                                colorTheme === 'secondary' ? 'from-secondary to-accent' :
                                colorTheme === 'emerald' ? 'from-emerald-500 to-green-500' :
                                'from-primary to-secondary'
                              } bg-clip-text text-transparent drop-shadow-sm`}>
                                {new Date(activity.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric'
                                })}
                              </span>
                              <div className={`absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r ${
                                colorTheme === 'primary' ? 'from-primary/50 via-primary/20 to-transparent' :
                                colorTheme === 'accent' ? 'from-accent/50 via-accent/20 to-transparent' :
                                colorTheme === 'secondary' ? 'from-secondary/50 via-secondary/20 to-transparent' :
                                colorTheme === 'emerald' ? 'from-emerald-500/50 via-emerald-500/20 to-transparent' :
                                'from-primary/50 via-primary/20 to-transparent'
                              }`} />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-px ${
                                colorTheme === 'primary' ? 'bg-primary/60' :
                                colorTheme === 'accent' ? 'bg-accent/60' :
                                colorTheme === 'secondary' ? 'bg-secondary/60' :
                                colorTheme === 'emerald' ? 'bg-emerald-500/60' :
                                'bg-primary/60'
                              }`} />
                              <span className={`text-xs font-bold ${
                                colorTheme === 'primary' ? 'text-primary' :
                                colorTheme === 'accent' ? 'text-accent' :
                                colorTheme === 'secondary' ? 'text-secondary' :
                                colorTheme === 'emerald' ? 'text-emerald-500' :
                                'text-primary'
                              } tracking-widest uppercase`}>
                                Logged & Secured
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ======= PREMIUM FOOTER - Matching Assets Cards ======= */}
                    <div className={`flex items-center justify-center pt-6 border-t-2 ${
                      colorTheme === 'primary' ? 'border-primary/20' :
                      colorTheme === 'accent' ? 'border-accent/20' :
                      colorTheme === 'secondary' ? 'border-secondary/20' :
                      colorTheme === 'emerald' ? 'border-emerald-500/20' :
                      'border-primary/20'
                    }`}>
                      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-50 to-green-50 
                                     dark:from-emerald-950/30 dark:to-green-950/20 border-2 border-emerald-200/50 
                                     dark:border-emerald-700/30 rounded-full shadow-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 tracking-widest uppercase">
                          Activity Logged
                        </span>
                      </div>
                    </div>
                    
                    {/* Bottom accent bar - Matching Assets Cards */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      colorTheme === 'primary' ? 'from-primary via-secondary to-accent' :
                      colorTheme === 'accent' ? 'from-accent via-primary to-secondary' :
                      colorTheme === 'secondary' ? 'from-secondary via-accent to-primary' :
                      colorTheme === 'emerald' ? 'from-emerald-500 via-green-500 to-emerald-400' :
                      'from-primary via-secondary to-accent'
                    } rounded-b-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          /* Ultra-Premium Empty State */
          <div className="text-center py-16">
            {/* Floating activity icon */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-30 animate-pulse" />
              <div className="relative p-8 bg-gradient-to-br from-background via-background/95 to-background/90 rounded-full border-2 border-primary/30 shadow-2xl">
                <Activity className="h-16 w-16 text-primary drop-shadow-lg" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Activity Observatory
            </h3>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your Crown Vault activity will appear here as you build and manage your legacy
            </p>
          </div>
        )}
      </div>
    </div>
  );
}