'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSectionById } from '@/lib/decision-memo/personal-section-map';
import { getComponentProps } from '@/lib/decision-memo/personal-prop-mapper';
import { computeMemoProps } from '@/lib/decision-memo/compute-memo-props';
import { RiskLevel } from '@/lib/decision-memo/personal-ai-intelligence';
import { PdfMemoData } from '@/lib/pdf/pdf-types';
import { Loader2 } from 'lucide-react';
import { SectionErrorBoundary } from './SectionErrorBoundary';

interface PersonalMainPanelProps {
  memoData: PdfMemoData;
  backendData: any;
  intakeId: string;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  riskLevel: RiskLevel;
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number> | Record<string, any>;
}

export default function PersonalMainPanel({
  memoData,
  backendData,
  intakeId,
  activeSection,
  riskLevel
  ,
  onCitationClick,
  citationMap
}: PersonalMainPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Memoize section definition to avoid recalculation
  const sectionDef = useMemo(() => getSectionById(activeSection), [activeSection]);

  // Memoize computed props to avoid recalculation on every render
  const computedProps = useMemo(() => computeMemoProps(memoData), [memoData]);

  // Memoize component props to avoid recalculation on every render
  const componentProps = useMemo(
    () =>
      sectionDef
        ? getComponentProps(
            activeSection,
            memoData,
            backendData,
            intakeId,
            computedProps,
            onCitationClick,
            citationMap
          )
        : {},
    [activeSection, memoData, backendData, intakeId, computedProps, sectionDef, onCitationClick, citationMap]
  );

  // Simulate loading on section change
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timeout);
  }, [activeSection]);

  if (!sectionDef) {
    return (
      <div className="flex-1 bg-background">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Section not found</p>
        </div>
      </div>
    );
  }

  const SectionComponent = sectionDef.component;

  return (
    <div className="w-full bg-background">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <p className="mt-4 text-sm text-muted-foreground">Loading section...</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] }}
            className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-6 pb-8 sm:pb-12"
          >
            <SectionErrorBoundary sectionName={sectionDef.title}>
              <div className="overflow-x-hidden">
                <SectionComponent
                  {...componentProps}
                  {...(sectionDef.componentProps || {})}
                />
              </div>
            </SectionErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
