'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/contexts/theme-context';
import { CATEGORIES, getSectionsByCategory } from '@/lib/decision-memo/personal-section-map';
import { PersonalRecommendation, PersonalInsight, RiskLevel } from '@/lib/decision-memo/personal-ai-intelligence';
import { PdfMemoData } from '@/lib/pdf/pdf-types';
import IntelligenceFeed from './IntelligenceFeed';
import {
  CheckCircle2,
  Circle,
  BarChart3,
  Calculator,
  Users,
  AlertTriangle,
  Landmark,
  Route,
  ListChecks,
  ChevronRight,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'ChartBar': BarChart3,
  'Calculator': Calculator,
  'Users': Users,
  'AlertTriangle': AlertTriangle,
  'Landmark': Landmark,
  'Route': Route,
  'ListChecks': ListChecks,
};

interface PersonalSidebarProps {
  memoData: PdfMemoData;
  backendData: any;
  intakeId: string;
  activeSection: string;
  viewedSections: Set<string>;
  collapsed: boolean;
  onSectionChange: (sectionId: string) => void;
  onToggle: () => void;
  recommendation: PersonalRecommendation;
  insights: PersonalInsight[];
  riskLevel: RiskLevel;
}

export default function PersonalSidebar({
  memoData,
  activeSection,
  viewedSections,
  collapsed,
  onSectionChange,
  onToggle,
  riskLevel
}: PersonalSidebarProps) {
  const { theme } = useTheme();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // ═══ EXACT same positioning as SidebarNavigation ═══
  // fixed left-0 top-0, height: 100vh, z: 9999
  return (
    <motion.aside
      className="hidden md:flex fixed left-0 top-0 bg-background border-r border-border shadow-xl flex-col"
      style={{
        height: '100vh',
        minHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 9999
      }}
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {collapsed ? (
        /* ═══ COLLAPSED STATE ═══ Icons only */
        <div className="flex flex-col h-full">
          {/* Logo — matches app sidebar exactly */}
          <div className="flex items-center justify-center px-4 py-3 border-b border-border/30 bg-background flex-shrink-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            >
              <Image src="/logo.png" alt="HNWI Chronicles" width={32} height={32} className="w-8 h-8" priority />
            </motion.div>
          </div>

          {/* Expand button */}
          <div className="p-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="w-full justify-center h-12 hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            </Button>
          </div>

          {/* Category Icons — matches home sidebar ghost button style */}
          <div className="p-3 pt-0 space-y-2 flex-1 overflow-y-auto">
            {CATEGORIES.map((category) => {
              const sections = getSectionsByCategory(category.id, memoData);
              if (sections.length === 0) return null;

              const hasActiveSection = sections.some(s => s.id === activeSection);
              const IconComponent = ICON_MAP[category.icon];

              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-full justify-center h-12 rounded-lg transition-all duration-200",
                    hasActiveSection
                      ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => {
                    onToggle();
                    setCollapsedCategories(prev => {
                      const next = new Set(prev);
                      next.delete(category.id);
                      return next;
                    });
                    if (sections.length > 0) {
                      onSectionChange(sections[0].id);
                    }
                  }}
                >
                  {IconComponent && (
                    <IconComponent className={cn(
                      "h-5 w-5 flex-shrink-0",
                      hasActiveSection ? "text-primary" : ""
                    )} />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ═══ EXPANDED STATE ═══ Full navigation */
        <div className="flex flex-col h-full">
          {/* Logo & Branding — matches app sidebar */}
          <div className="flex items-center justify-center px-4 py-3 border-b border-border/30 bg-background flex-shrink-0">
            <motion.div
              className="mr-2.5"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            >
              <Image src="/logo.png" alt="HNWI Chronicles" width={32} height={32} className="w-8 h-8" priority />
            </motion.div>
            <h1 className="text-base font-bold font-heading leading-tight break-words max-w-full tracking-wide">
              <span className={theme === 'dark' ? 'text-primary' : 'text-black'}>HNWI</span>{' '}
              <span className={theme === 'dark' ? 'text-[#C0C0C0]' : 'text-[#888888]'}>CHRONICLES</span>
            </h1>
          </div>

          {/* Collapse button */}
          <div className="p-3 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={onToggle}
              className="w-full justify-start gap-4 h-12 px-4 hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-semibold tracking-wide">Back</span>
            </Button>
          </div>

          {/* Section Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {CATEGORIES.map(category => {
              const sections = getSectionsByCategory(category.id, memoData);
              if (sections.length === 0) return null;

              const IconComponent = ICON_MAP[category.icon];
              const isCategoryCollapsed = collapsedCategories.has(category.id);
              const hasActiveSection = sections.some(s => s.id === activeSection);

              return (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                      hasActiveSection
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                        isCategoryCollapsed && "-rotate-90"
                      )}
                    />
                    {IconComponent && <IconComponent className={cn(
                      "w-4 h-4",
                      hasActiveSection ? "text-primary" : "text-muted-foreground"
                    )} />}
                    <span className={cn(
                      "text-xs font-semibold uppercase tracking-wider flex-1 text-left",
                      hasActiveSection ? "text-primary" : "text-muted-foreground"
                    )}>
                      {category.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{sections.length}</span>
                  </button>

                  <AnimatePresence initial={false}>
                    {!isCategoryCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pl-1">
                          {sections.map((section) => {
                            const isActive = section.id === activeSection;
                            const isViewed = viewedSections.has(section.id);

                            return (
                              <motion.button
                                key={section.id}
                                onClick={() => onSectionChange(section.id)}
                                className={cn(
                                  "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200",
                                  isActive
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                {isViewed ? (
                                  <CheckCircle2
                                    className={cn(
                                      "w-4 h-4 flex-shrink-0",
                                      isActive ? "text-primary" : "text-primary/70"
                                    )}
                                  />
                                ) : (
                                  <Circle className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className={cn(
                                    "text-sm font-medium truncate",
                                    isActive ? "text-primary" : "text-foreground"
                                  )}>
                                    {section.title}
                                  </div>
                                  {section.estimatedReadTime && (
                                    <div className="text-xs text-muted-foreground">{section.estimatedReadTime}m</div>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Intelligence Feed */}
          <div className="border-t border-border p-4 flex-shrink-0">
            <IntelligenceFeed />
          </div>

          {/* Footer */}
          <div className="mt-auto p-4 pb-6 border-t border-border/20 flex-shrink-0">
            <div className="text-xs text-muted-foreground text-center space-y-3">
              <div className="bg-card/50 rounded-lg p-2.5 border border-border/20">
                <div className="space-y-1">
                  <div className="font-bold tracking-wide text-foreground text-[11px] leading-tight">HNWI CHRONICLES</div>
                  <div className="text-primary font-medium text-[10px] leading-tight">Premium Edition</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="leading-relaxed text-[9px] break-words">
                  A product of <span className="font-semibold text-primary">Montaigne</span>
                </div>
                <div className="text-muted-foreground/80 font-medium text-[8px] leading-tight break-words">
                  &copy; 2026 All Rights Reserved.<br />HNWI Chronicles.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
