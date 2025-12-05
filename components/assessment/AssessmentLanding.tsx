// components/assessment/AssessmentLanding.tsx
// World-class SOTA assessment landing experience

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Lock, Zap } from 'lucide-react';
import { VaultEntrySequence } from './VaultEntrySequence';

interface AssessmentLandingProps {
  onContinue: () => void;
}

export const AssessmentLanding: React.FC<AssessmentLandingProps> = ({ onContinue }) => {
  const [briefCount, setBriefCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [showVaultEntry, setShowVaultEntry] = useState(true);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  // Fetch dynamic brief count
  useEffect(() => {
    async function fetchBriefCount() {
      try {
        const response = await fetch('/api/developments/counts');
        if (response.ok) {
          const data = await response.json();

          // Try different possible field names
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
        setBriefCount(1900); // Fallback
      } finally {
        setLoadingCount(false);
      }
    }

    fetchBriefCount();
  }, []);

  // Fetch opportunities for vault entry background map
  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const response = await fetch('/api/public/assessment/preview-opportunities');
        if (response.ok) {
          const data = await response.json();

          // Handle different API response formats
          let opps = [];
          if (Array.isArray(data)) {
            opps = data;
          } else if (data.opportunities && Array.isArray(data.opportunities)) {
            opps = data.opportunities;
          } else if (data.data && Array.isArray(data.data)) {
            opps = data.data;
          }


          // Get ALL opportunities that have valid coordinates
          const validOpps = opps
            .filter((opp: any) => opp.latitude && opp.longitude);

          setOpportunities(validOpps);
        } else {
        }
      } catch (error) {
      }
    }

    fetchOpportunities();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <>
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
        {/* Vault frame border - persists after entry */}
        {vaultUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {/* Corner accents */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/30" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/30" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/30" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/30" />
          </motion.div>
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <motion.div
        initial={vaultUnlocked ? { opacity: 0, scale: 0.95 } : false}
        animate={vaultUnlocked ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20"
      >

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: vaultUnlocked ? 0.3 : 0 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-md border border-primary/40 mb-6 sm:mb-8 shadow-xl shadow-primary/10"
          >
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">VERIFIED HNWI ACCESS ONLY</span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 sm:mb-8 leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: vaultUnlocked ? 0.5 : 0 }}
          >
            Most HNWIs never know
            <br />
            <motion.span
              className="text-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: vaultUnlocked ? 1.2 : 0.3 }}
            >
              their strategic DNA.
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: vaultUnlocked ? 1.8 : 0.4 }}
          >
            You're about to. 10 scenarios. 8 minutes. Your exact wealth archetype.
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
            className={`group inline-flex items-center justify-center gap-3 px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl font-bold text-base sm:text-lg md:text-xl transition-all shadow-2xl ${
              isStarting
                ? 'bg-primary/50 text-primary-foreground/70 cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:shadow-primary/30'
            }`}
          >
            {isStarting ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <span>Discover Your DNA</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>

          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-4 sm:mt-5">
            Free for verified members • No signup required
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: vaultUnlocked ? 3.2 : 0.6 }}
          className="bg-card/50 backdrop-blur-xl border border-primary/30 rounded-3xl p-6 sm:p-8 md:p-10 mb-12 sm:mb-16 md:mb-20 shadow-2xl"
        >
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Powered by real intelligence
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-light">
              Your results are calibrated against actual HNWI behavioral data
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-2">
                {loadingCount ? '...' : formatNumber(briefCount || 1900)}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wider">
                Intelligence Briefs
              </div>
              <div className="text-xs text-muted-foreground/60 font-light">
                Since Feb 2023
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-2">
                140K+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wider">
                Wealth Movements
              </div>
              <div className="text-xs text-muted-foreground/60 font-light">
                Tracked globally
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-2">
                10
              </div>
              <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium uppercase tracking-wider">
                Real Scenarios
              </div>
              <div className="text-xs text-muted-foreground/60 font-light">
                8 minutes to complete
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: vaultUnlocked ? 3.8 : 0.8 }}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Three wealth archetypes
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              Each archetype sees opportunities differently. Discover yours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                tier: 'ARCHITECT',
                tagline: 'Build systems',
                desc: 'You construct wealth infrastructure that compounds across generations.',
                gradient: 'from-primary/20 to-primary/5'
              },
              {
                tier: 'OPERATOR',
                tagline: 'Execute deals',
                desc: 'You identify windows, move capital fast, and maximize returns on timing.',
                gradient: 'from-primary/15 to-primary/5'
              },
              {
                tier: 'OBSERVER',
                tagline: 'Preserve capital',
                desc: 'You monitor threats, hedge exposure, and protect what you have built.',
                gradient: 'from-primary/10 to-primary/5'
              },
            ].map((archetype, index) => (
              <motion.div
                key={archetype.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (vaultUnlocked ? 4.0 : 0.9) + (index * 0.15) }}
                className="group relative bg-card/50 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 sm:p-8 hover:border-primary/50 hover:bg-card/70 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${archetype.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none`} />

                <div className="relative z-10">
                  <div className="mb-4 sm:mb-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-3 sm:mb-4">
                      <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">
                        {archetype.tier}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                      {archetype.tagline}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed font-light">
                    {archetype.desc}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: vaultUnlocked ? 4.6 : 1.0 }}
          className="bg-card/40 backdrop-blur-2xl border border-primary/30 rounded-3xl p-6 sm:p-8 md:p-10 mb-12 sm:mb-16 shadow-2xl"
        >
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              What you'll discover
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-light">
              8 minutes. Life-changing clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {[
              {
                title: 'Your strategic archetype',
                desc: 'Architect, Operator, or Observer—know how you naturally make wealth decisions'
              },
              {
                title: 'Personalized intelligence brief',
                desc: 'PDF report with your behavioral analysis and tailored opportunity matches'
              },
              {
                title: 'Crisis response simulation',
                desc: 'See how your Digital Twin handles market volatility and regulatory shifts'
              },
              {
                title: 'Opportunity calibration',
                desc: 'Which $100K+ deals align with your DNA vs. which ones you should avoid'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.0 + (index * 0.1) }}
                className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-background/50 border border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="flex-shrink-0 mt-1">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-primary/10">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-primary/70" />
              <span className="font-light">100% private • Zero data stored</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary/70" />
              <span className="font-light">Results in ~8 minutes</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: vaultUnlocked ? 5.2 : 1.2 }}
          className="text-center"
        >
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 mb-6 sm:mb-8">
            <div className="bg-card/90 backdrop-blur-xl rounded-xl px-8 sm:px-12 md:px-16 py-6 sm:py-8 md:py-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                Ready to know your DNA?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground font-light mb-6 sm:mb-8">
                {loadingCount ? 'Loading' : formatNumber(briefCount || 1900)} intelligence briefs • 140K+ wealth movements • Your exact archetype
              </p>

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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group inline-flex items-center justify-center gap-3 px-10 sm:px-14 md:px-16 py-4 sm:py-5 md:py-6 rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all shadow-2xl ${
                  isStarting
                    ? 'bg-primary/50 text-primary-foreground/70 cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:shadow-primary/30'
                }`}
              >
                {isStarting ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Initializing...</span>
                  </>
                ) : (
                  <>
                    <span>Begin Assessment</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground/60 font-light">
            Used by verified HNWIs globally • Completely private
          </p>
        </motion.div>

      </motion.div>
      </div>
    </>
  );
};
