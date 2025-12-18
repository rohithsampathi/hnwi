// components/assessment/AssessmentLanding.tsx
// World-class SOTA assessment landing experience

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Shield, Target, Layers, Zap, FileText, TrendingUp } from 'lucide-react';
import { VaultEntrySequence } from './VaultEntrySequence';

interface AssessmentLandingProps {
  onContinue: () => void;
}

// PRODUCTION FIX: Module-level flag survives sessionStorage clearing and service worker caching
let vaultShownInThisAppSession = false;

export const AssessmentLanding: React.FC<AssessmentLandingProps> = ({ onContinue }) => {
  const [briefCount, setBriefCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  const getVaultInitialState = () => {
    if (typeof window === 'undefined') {
      return { showVault: false, unlocked: false };
    }

    if (vaultShownInThisAppSession) {
      return { showVault: false, unlocked: true };
    } else {
      vaultShownInThisAppSession = true;
      return { showVault: true, unlocked: false };
    }
  };

  const [vaultState] = useState(getVaultInitialState);
  const [showVaultEntry, setShowVaultEntry] = useState(vaultState.showVault);
  const [vaultUnlocked, setVaultUnlocked] = useState(vaultState.unlocked);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  useEffect(() => {
    async function fetchBriefCount() {
      try {
        const response = await fetch('/api/developments/counts');
        if (response.ok) {
          const data = await response.json();
          const count = data.developments?.total_count || data.total || data.count || data.total_count || data.briefs;
          if (count && typeof count === 'number') {
            setBriefCount(count);
          } else {
            setBriefCount(1900);
          }
        } else {
          setBriefCount(1900);
        }
      } catch (error) {
        setBriefCount(1900);
      } finally {
        setLoadingCount(false);
      }
    }

    fetchBriefCount();
  }, []);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const response = await fetch('/api/public/assessment/preview-opportunities');
        if (response.ok) {
          const data = await response.json();
          let opps = [];
          if (Array.isArray(data)) {
            opps = data;
          } else if (data.opportunities && Array.isArray(data.opportunities)) {
            opps = data.opportunities;
          } else if (data.data && Array.isArray(data.data)) {
            opps = data.data;
          }
          const validOpps = opps.filter((opp: any) => opp.latitude && opp.longitude);
          setOpportunities(validOpps);
        }
      } catch (error) {
        // Silent fail
      }
    }

    fetchOpportunities();
  }, []);

  return (
    <div>
      {/* Vault Entry Sequence */}
      {showVaultEntry && (
        <VaultEntrySequence
          onComplete={() => {
            setShowVaultEntry(false);
            setVaultUnlocked(true);
          }}
          briefCount={briefCount || 1900}
          opportunities={opportunities}
        />
      )}

      {/* Main Landing Content */}
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Vault frame border */}
        {vaultUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/30" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/30" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/30" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/30" />
          </motion.div>
        )}

        {/* Ambient gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <motion.div
          initial={vaultUnlocked ? { opacity: 0, scale: 0.95 } : false}
          animate={vaultUnlocked ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24"
        >

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: vaultUnlocked ? 0.3 : 0 }}
            className="text-center mb-40"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-md border border-primary/40 mb-8 shadow-xl shadow-primary/10"
            >
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">INVITE-ONLY • VERIFIED ACCESS</span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 leading-[1.05] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: vaultUnlocked ? 0.5 : 0 }}
            >
              Reveal your strategic DNA
              <br />
              <motion.span
                className="text-primary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: vaultUnlocked ? 1.2 : 0.3 }}
              >
                under visibility pressure.
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: vaultUnlocked ? 1.8 : 0.4 }}
            >
              A decision drill for cross-border and real-asset complexity.
              <br />
              Output: archetype, posture map, and a short report — no allocations.
            </motion.p>

            <motion.button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isStarting) {
                  setIsStarting(true);
                  onContinue();
                }
              }}
              disabled={isStarting}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: vaultUnlocked ? 2.4 : 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group inline-flex items-center justify-center gap-3 px-12 py-6 rounded-2xl font-bold text-lg transition-all shadow-2xl relative overflow-hidden ${
                isStarting
                  ? 'bg-primary/50 text-primary-foreground/70 cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:shadow-primary/30'
              }`}
            >
              {/* Animated gradient overlay */}
              {!isStarting && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                {isStarting ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Initializing...</span>
                  </>
                ) : (
                  <>
                    <span>Begin the Drill</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>

            <motion.p
              className="text-sm text-muted-foreground/70 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: vaultUnlocked ? 3.0 : 0.6 }}
            >
              Free • No signup • Completely private
            </motion.p>
          </motion.div>

          {/* Intelligence Foundation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: vaultUnlocked ? 3.2 : 0.8 }}
            className="mb-40"
          >
            <div className="bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-2xl border border-primary/20 rounded-3xl p-10 sm:p-14 shadow-2xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Built on tracked intelligence
                </h2>
                <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
                  Your answers are benchmarked against patterns we track across real-world developments and wealth signals.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-8 sm:gap-12">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl font-bold text-primary mb-4 bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                    {loadingCount ? '...' : formatNumber(briefCount || 1900)}
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium uppercase tracking-wider">
                    HNWI Developments
                  </div>
                  <div className="text-xs text-muted-foreground/60 font-light mt-2">
                    Since Feb 2023
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-6xl sm:text-7xl font-bold text-primary mb-4 bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                    92K+
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium uppercase tracking-wider">
                    Wealth Signals
                  </div>
                  <div className="text-xs text-muted-foreground/60 font-light mt-2">
                    Tracked globally
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-6xl sm:text-7xl font-bold text-primary mb-4 bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                    10
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium uppercase tracking-wider">
                    Scenarios
                  </div>
                  <div className="text-xs text-muted-foreground/60 font-light mt-2">
                    ~10 minutes
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Three Archetypes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: vaultUnlocked ? 3.8 : 1.0 }}
            className="mb-40"
          >
            <div className="text-center mb-14">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-5">
                Three decision archetypes
              </h2>
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                Same markets. Different instincts. Discover yours.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  tier: 'ARCHITECT',
                  tagline: 'Build systems',
                  desc: 'You build wealth infrastructure that compounds across generations. Multi-jurisdiction structures, generational planning, institutional thinking.',
                  icon: Layers,
                  gradient: 'from-primary/20 via-primary/10 to-primary/5',
                  borderGlow: 'group-hover:shadow-primary/20'
                },
                {
                  tier: 'OPERATOR',
                  tagline: 'Execute windows',
                  desc: 'You spot timing edges and move capital quickly. Tactical excellence, opportunity recognition, fast execution within established systems.',
                  icon: Target,
                  gradient: 'from-primary/15 via-primary/8 to-primary/5',
                  borderGlow: 'group-hover:shadow-primary/15'
                },
                {
                  tier: 'OBSERVER',
                  tagline: 'Defend capital',
                  desc: 'You monitor threats and protect what you have built. Regulatory awareness, risk mitigation, wealth preservation through volatility.',
                  icon: Shield,
                  gradient: 'from-primary/10 via-primary/6 to-primary/5',
                  borderGlow: 'group-hover:shadow-primary/10'
                },
              ].map((archetype, index) => {
                const Icon = archetype.icon;
                return (
                  <motion.div
                    key={archetype.tier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (vaultUnlocked ? 4.0 : 1.1) + (index * 0.15) }}
                    className={`group relative bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl border border-primary/30 rounded-3xl p-8 hover:border-primary/60 transition-all duration-500 shadow-xl ${archetype.borderGlow}`}
                  >
                    {/* Animated gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${archetype.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none`} />

                    <div className="relative z-10">
                      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="mb-4">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">
                          {archetype.tier}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-4">
                        {archetype.tagline}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-light">
                        {archetype.desc}
                      </p>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-3xl" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* What You'll Receive */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: vaultUnlocked ? 4.6 : 1.2 }}
            className="bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-2xl border border-primary/20 rounded-3xl p-10 sm:p-14 shadow-2xl mb-32"
          >
            <div className="text-center mb-12">
              <h3 className="text-4xl sm:text-5xl font-bold text-foreground mb-5">
                What you'll receive
              </h3>
              <p className="text-xl text-muted-foreground font-light">
                A complete intelligence profile
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: 'Your archetype',
                  desc: 'Architect, Operator, or Observer—where your decisions cluster under visibility pressure.',
                  icon: Target
                },
                {
                  title: 'Posture map',
                  desc: 'Visual breakdown of your positioning across key decision dimensions and strategic gaps.',
                  icon: TrendingUp
                },
                {
                  title: 'Intelligence report',
                  desc: 'Cryptographically signed PDF with behavioural analysis and strategic recommendations.',
                  icon: FileText
                },
                {
                  title: 'Opportunity calibration',
                  desc: 'Which $500K+ style moves align with your posture—and which ones typically punish it.',
                  icon: Zap
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.3 + (index * 0.1) }}
                    className="group p-8 rounded-2xl bg-gradient-to-br from-background/80 to-background/50 border border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-primary" strokeWidth={2} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-foreground mb-3">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Privacy footer */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-10 mt-10 border-t border-primary/10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary/70" />
                <span>100% private</span>
              </div>
              <span>•</span>
              <span>No allocation disclosure</span>
              <span>•</span>
              <span>Zero data stored</span>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary/70" />
                <span>Results in ~10 minutes</span>
              </div>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: vaultUnlocked ? 5.2 : 1.4 }}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground/60 font-light leading-relaxed max-w-3xl mx-auto">
              This is a decision-making simulation to surface strategic patterns. Scenarios reference structuring and regulatory themes as analytical exercises only. Not legal, tax, or financial advice.
            </p>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};
