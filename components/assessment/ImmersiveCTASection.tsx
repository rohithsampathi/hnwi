// components/assessment/ImmersiveCTASection.tsx
// Immersive scroll-animated CTA section with tier-specific actions

"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Download,
  Home,
  Crown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ImmersiveCTASectionProps {
  tier: 'architect' | 'operator' | 'observer';
  sessionId: string;
  onDownloadPDF: () => void;
  onArchitectContact: () => void;
  onNavigate: (route: string) => void;
  forensicVerdict: string;
}

export function ImmersiveCTASection({
  tier,
  sessionId,
  onDownloadPDF,
  onArchitectContact,
  onNavigate,
  forensicVerdict
}: ImmersiveCTASectionProps) {
  const sectionRef = useRef(null);
  const narrativeRef = useRef(null);
  const ctaRef = useRef(null);

  const isNarrativeInView = useInView(narrativeRef, { once: true, amount: 0.3 });
  const isCTAInView = useInView(ctaRef, { once: true, amount: 0.3 });

  const tierNarratives = {
    architect: {
      title: "You've Proven You're an Architect",
      narrative: [
        "While others react to market movements, you design the structures that capture wealth across jurisdictions.",
        "Your strategic thinking places you in the top 5% of HNWI wealth managers globally.",
        "You don't just participate in markets—you architect systems that compound advantages over decades."
      ],
      cta: {
        title: "Join Architect Collective",
        subtitle: "Building Generational Infrastructure",
        description: "Become a founding architect: access $500K+ opportunities, collective deal flow, and peer syndication. Together we build wealth systems that transcend jurisdictions.",
        action: "Request Architect Access",
        icon: Crown,
        gradient: "from-primary/10 to-primary/5",
        borderColor: "border-primary/30"
      }
    },
    operator: {
      title: "You're a Tactical Operator",
      narrative: [
        "You execute with precision within established systems, maximizing every opportunity.",
        "Your tactical approach has served you well—but there's a higher tier waiting.",
        "Operators who evolve into Architects don't just earn more—they build generational wealth."
      ],
      cta: {
        title: "Upgrade to Operator",
        subtitle: "$599/month • Building Together",
        description: "Get daily intelligence briefs, access $100K+ deals, connect with top investors, and use unlimited AI advisor. Your funding supports building peer intelligence for everyone.",
        action: "Support Operator Mission",
        icon: TrendingUp,
        gradient: "from-muted/50 to-muted/20",
        borderColor: "border-border"
      }
    },
    observer: {
      title: "Time for Strategic Action",
      narrative: [
        "Passive wealth management leaves you vulnerable to regulatory surprises and market shifts.",
        "The gap between where you are and where you could be grows wider every quarter.",
        "Observers who wait too long wake up to frozen accounts, unexpected taxes, and missed opportunities."
      ],
      cta: {
        title: "Join Observer Network",
        subtitle: "$199/month • Protecting Together",
        description: "Get weekly intelligence updates, regulatory change alerts, basic AI advisor access, and wealth tracking tools. Your funding supports building early warning systems for everyone.",
        action: "Support Protection Mission",
        icon: AlertTriangle,
        gradient: "from-muted/50 to-muted/20",
        borderColor: "border-border"
      }
    }
  };

  const config = tierNarratives[tier];
  const CTAIcon = config.cta.icon;

  return (
    <section ref={sectionRef} className="pt-8 pb-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Download PDF - Always visible */}
        <div className="bg-card p-6 border border-border text-center">
          <button
            onClick={onDownloadPDF}
            className="inline-flex items-center gap-3 px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground font-bold transition-all rounded-lg"
          >
            <Download size={20} />
            Download Full Report (PDF)
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            Cryptographically signed • {forensicVerdict}
          </p>
        </div>

        {/* Scroll-triggered Narrative */}
        <motion.div
          ref={narrativeRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isNarrativeInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className={`bg-gradient-to-br ${config.cta.gradient} p-8 rounded-lg border ${config.cta.borderColor} overflow-hidden`}>
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">{config.title}</h2>
              </div>

              <div className="space-y-4">
                {config.narrative.map((paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isNarrativeInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, delay: 0.2 + (index * 0.2) }}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .animate-shimmer {
              animation: shimmer 3s infinite;
            }
          `}</style>
        </motion.div>

        {/* Scroll-triggered Main CTA */}
        <motion.div
          ref={ctaRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isCTAInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={`bg-card p-8 border-2 ${config.cta.borderColor} rounded-lg shadow-xl`}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 bg-gradient-to-br ${config.cta.gradient} rounded-lg`}>
                <CTAIcon className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">{config.cta.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {config.cta.subtitle}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {config.cta.description}
            </p>

            <button
              onClick={tier === 'architect' ? onArchitectContact : () => {
                // For Operator/Observer: Initialize Razorpay payment
                alert('Razorpay integration coming next...');
              }}
              className="w-full group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:opacity-90 text-primary-foreground font-bold transition-all rounded-lg text-lg relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                {config.cta.action}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Animated background pulse */}
              <motion.div
                className="absolute inset-0 bg-primary-foreground/10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </button>

            {tier === 'architect' && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                No payment required now. Let's architect your legacy together.
              </p>
            )}
            {tier !== 'architect' && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Monthly funding • Cancel anytime • Supporting collective intelligence
              </p>
            )}
          </div>
        </motion.div>

        {/* Return to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isCTAInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="text-center pt-4"
        >
          <button
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home size={16} />
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    </section>
  );
}
