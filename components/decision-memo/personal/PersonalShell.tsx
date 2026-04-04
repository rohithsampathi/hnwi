'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PdfMemoData } from '@/lib/pdf/pdf-types';
import { PersonalAI } from '@/lib/decision-memo/personal-ai-intelligence';
import { getAllVisibleSections } from '@/lib/decision-memo/personal-section-map';
import PersonalSidebar from './PersonalSidebar';
import PersonalMainPanel from './PersonalMainPanel';
import PersonalMobileNav from './PersonalMobileNav';
import PersonalStickyControls from './PersonalStickyControls';

interface PersonalShellProps {
  memoData: PdfMemoData;
  backendData: any;
  intakeId: string;
  onExportPDF?: () => void;
  isExportingPDF?: boolean;
  onSwitchToReportView?: () => void;
}

export default function PersonalShell({
  memoData,
  backendData,
  intakeId,
  onExportPDF,
  isExportingPDF,
  onSwitchToReportView,
}: PersonalShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const visibleSections = getAllVisibleSections(memoData);
  const initialSectionId = searchParams.get('section') || visibleSections[0]?.id || 'memo-header';

  const [activeSection, setActiveSection] = useState(initialSectionId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [viewedSections, setViewedSections] = useState<Set<string>>(new Set([initialSectionId]));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize AI
  const ai = useMemo(
    () => new PersonalAI(memoData, viewedSections),
    [memoData, viewedSections]
  );

  const riskLevel = ai.getRiskLevel();
  const recommendation = ai.getRecommendation();
  const insights = ai.getInsights();

  // Load viewed sections from localStorage
  useEffect(() => {
    const storageKey = `audit_progress_${intakeId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setViewedSections(new Set(parsed));
      } catch (e) {
        console.error('Failed to parse viewed sections:', e);
      }
    }
  }, [intakeId]);

  // Persist viewed sections to localStorage
  useEffect(() => {
    const storageKey = `audit_progress_${intakeId}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(viewedSections)));
  }, [viewedSections, intakeId]);

  // Sync URL with active section
  useEffect(() => {
    const currentSection = searchParams.get('section');
    if (currentSection !== activeSection) {
      const url = new URL(window.location.href);
      url.searchParams.set('section', activeSection);
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [activeSection, searchParams, router]);

  // Mark sections as viewed
  useEffect(() => {
    if (!viewedSections.has(activeSection)) {
      setViewedSections(prev => new Set([...prev, activeSection]));
    }
  }, [activeSection, viewedSections]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileSidebarOpen(false);
    const panel = document.getElementById('personal-main-panel');
    if (panel) panel.scrollTo({ top: 0, behavior: 'instant' });
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ═══ SIDEBAR ═══ Fixed, same position as app sidebar (rendered outside flow) */}
      <PersonalSidebar
        memoData={memoData}
        backendData={backendData}
        intakeId={intakeId}
        activeSection={activeSection}
        viewedSections={viewedSections}
        collapsed={sidebarCollapsed}
        onSectionChange={handleSectionChange}
        onToggle={toggleSidebar}
        recommendation={recommendation}
        insights={insights}
        riskLevel={riskLevel}
      />

      {/* ═══ TOP BAR ═══ War Room controls */}
      <div className="flex-shrink-0">
        <PersonalStickyControls
          intakeId={intakeId}
          onExportPDF={onExportPDF}
          isExportingPDF={isExportingPDF}
          onSwitchToReportView={onSwitchToReportView}
        />
      </div>

      {/* ═══ MAIN CONTENT ═══ Single scroll authority */}
      <div
        id="personal-main-panel"
        className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-0"
        style={{
          filter: !sidebarCollapsed ? 'blur(2px)' : 'none',
          opacity: !sidebarCollapsed ? 0.6 : 1,
          transition: 'filter 0.3s ease, opacity 0.3s ease'
        }}
        onClick={() => { if (!sidebarCollapsed) setSidebarCollapsed(true); }}
      >
        <PersonalMainPanel
          memoData={memoData}
          backendData={backendData}
          intakeId={intakeId}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          riskLevel={riskLevel}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex-shrink-0">
        <PersonalMobileNav
          memoData={memoData}
          activeSection={activeSection}
          viewedSections={viewedSections}
          onSectionChange={handleSectionChange}
        />
      </div>
    </div>
  );
}
