'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, LayoutGrid, FileText, Download } from 'lucide-react';
import { PdfMemoData } from '@/lib/pdf/pdf-types';
import { RiskLevel, getRiskTheme, PersonalAI } from '@/lib/decision-memo/personal-ai-intelligence';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';

interface PersonalHeaderProps {
  intakeId: string;
  memoData: PdfMemoData;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  viewedCount: number;
  totalCount: number;
  riskLevel: RiskLevel;
  aiStatus: string;
}

export default function PersonalHeader({
  intakeId,
  memoData,
  sidebarCollapsed,
  onToggleSidebar,
  viewedCount,
  totalCount,
  riskLevel,
}: PersonalHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme } = useTheme();
  const riskTheme = getRiskTheme(riskLevel);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const progressPercentage = (viewedCount / totalCount) * 100;

  // Toggle between Personal mode and Legacy view
  const toggleView = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('personal') === 'true') {
      params.delete('personal');
    } else {
      params.set('personal', 'true');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 h-14 sm:h-16 border-b border-border bg-surface/95 backdrop-blur-sm flex-shrink-0">
      <div className="h-full flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-6">
        {/* Left section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Menu toggle - hidden on mobile (using bottom nav), visible on desktop */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 hover:bg-surface-hover rounded-lg transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
            aria-label="Toggle menu"
          >
            {sidebarCollapsed ? (
              <Menu className="w-5 h-5 text-gold" />
            ) : (
              <X className="w-5 h-5 text-gold" />
            )}
          </button>

          {/* Audit ID - compact on mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gold rounded-full" />
            <div className="hidden sm:block">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Audit</div>
              <div className="text-sm font-mono text-foreground">{intakeId.slice(-8)}</div>
            </div>
            <div className="sm:hidden">
              <div className="text-xs font-mono text-foreground">{intakeId.slice(-6)}</div>
            </div>
          </div>

          {/* War Room mode indicator - hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1.5 bg-gold/10 rounded-lg border border-gold/30">
            <LayoutGrid className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs text-gold font-medium">War Room Mode</span>
          </div>
        </div>

        {/* Center section - Progress */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-gold font-medium tabular-nums">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {viewedCount} / {totalCount} sections
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Toggle View Button - icon only on mobile */}
          <button
            onClick={toggleView}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-border hover:border-border/80 transition-colors group min-w-[44px] min-h-[44px]"
            aria-label="Exit War Room Mode"
          >
            <FileText className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors hidden sm:inline">
              Standard View
            </span>
          </button>

          {/* Export PDF - hidden on mobile */}
          <button
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:border-border/80 transition-colors group"
          >
            <Download className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors hidden sm:inline">
              Export
            </span>
          </button>

          {/* Divider - hidden on mobile */}
          <div className="hidden sm:block w-px h-8 bg-border" />

          {/* Risk indicator - compact on mobile */}
          <div
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
            style={{
              borderColor: riskTheme.borderColor,
              color: riskTheme.accentColor,
              backgroundColor: `${riskTheme.bgColor}20`,
            }}
          >
            {riskLevel}
          </div>
        </div>
      </div>
    </header>
  );
}
