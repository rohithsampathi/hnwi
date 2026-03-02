// =============================================================================
// DECISION MEMO PAGE
// For logged-in users: Shows world map dashboard
// For non-logged-in users: Vault Entry Sequence → Landing Page
// Intake form lives at /decision-memo/intake (separate route for refresh safety)
// =============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DecisionMemoLanding } from '@/components/decision-memo/DecisionMemoLanding';
import { VaultEntrySequence } from '@/components/assessment/VaultEntrySequence';
import { useOpportunities } from '@/lib/hooks/useOpportunities';
import { getCurrentUser } from '@/lib/auth-manager';
import { usePageTitle } from '@/hooks/use-page-title';
import { CrownLoader } from '@/components/ui/crown-loader';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamically import the War Room Map component with SSR disabled
const WarRoomMap = dynamic(
  () => import('@/components/decision-memo/WarRoomMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-background">
        <div className="flex items-center justify-center h-full">
          <CrownLoader size="lg" text="Loading Your Audits" />
        </div>
      </div>
    )
  }
);

type FlowStage = 'vault' | 'landing';

// Module-level flag to prevent vault from showing multiple times in session
let vaultShownThisSession = false;

export default function DecisionMemoPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [flowStage, setFlowStage] = useState<FlowStage>(() => {
    if (vaultShownThisSession) {
      return 'landing';
    }
    return 'vault';
  });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [briefCount, setBriefCount] = useState<number>(1875);
  const [audits, setAudits] = useState<any[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(true);

  // Filter states (same as dashboard)
  const [timeframe, setTimeframe] = useState<string>('live');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCrownAssets, setShowCrownAssets] = useState(true);
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Fetch opportunities using the same hook as home dashboard
  const {
    cities,
    loading: loadingOpportunities,
    availableCategories
  } = useOpportunities({
    isPublic: false, // Use authenticated endpoint
    mode: 'dashboard',
    timeframe
  });

  usePageTitle(
    'Decision Memo',
    'Strategic intelligence for high-stakes allocation decisions'
  );

  // Check if user is logged in
  useEffect(() => {
    const user = getCurrentUser();
    setIsLoggedIn(!!(user && (user.id || user.user_id)));
  }, []);

  // Fetch user's audits if logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLoadingAudits(false);
      return;
    }

    const fetchAudits = async () => {
      try {
        const response = await fetch('/api/decision-memo/user-audits', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAudits(data.audits || []);
        }
      } catch (error) {
        console.error('Failed to fetch audits:', error);
      } finally {
        setLoadingAudits(false);
      }
    };

    fetchAudits();
  }, [isLoggedIn]);

  // Initialize selected categories when available categories change
  useEffect(() => {
    if (availableCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(availableCategories);
    }
  }, [availableCategories, selectedCategories.length]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close timeframe dropdown if clicking outside
      if (isDropdownOpen && !target.closest('.timeframe-dropdown')) {
        setIsDropdownOpen(false);
      }

      // Close category dropdown if clicking outside
      if (isCategoryDropdownOpen && !target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, isCategoryDropdownOpen]);

  // Fetch opportunities for the vault map background
  useEffect(() => {
    async function fetchData() {
      try {
        const [oppsRes, countsRes] = await Promise.all([
          fetch('/api/public/assessment/preview-opportunities?show_all=true'),
          fetch('/api/developments/counts')
        ]);

        if (oppsRes.ok) {
          const data = await oppsRes.json();
          let opps = Array.isArray(data) ? data : (data.opportunities || data.data || []);
          setOpportunities(opps.filter((o: any) => o.latitude && o.longitude));
        }

        if (countsRes.ok) {
          const data = await countsRes.json();
          setBriefCount(data.developments?.total_count || data.total || data.count || 1875);
        }
      } catch {
        // Silent fail - use defaults
      }
    }
    fetchData();
  }, []);

  // Handle vault completion
  const handleVaultComplete = () => {
    vaultShownThisSession = true;
    setFlowStage('landing');
  };

  // Handle start audit — navigate to dedicated intake route
  const handleStartAudit = () => {
    router.push('/decision-memo/intake');
  };

  // For logged-in users: Show War Room map with audits
  if (isLoggedIn) {
    if (loadingAudits) {
      return (
        <div className="w-full h-screen bg-background">
          <div className="flex items-center justify-center h-full">
            <CrownLoader size="lg" text="Loading Your Audits" />
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 overflow-hidden">
        {/* War Room Map - Fullscreen */}
        <WarRoomMap
          audits={audits}
          onAuditClick={(intakeId) => {
            router.push(`/decision-memo/audit/${intakeId}?personal=true`);
          }}
        />

        {/* Overlay Header - Positioned like home dashboard */}
        <div className="absolute top-20 md:top-24 left-4 md:left-[80px] z-[400] px-0 sm:px-2 lg:px-4 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 md:h-5 w-4 md:w-5 text-gold" />
            <h1 className="text-base md:text-xl lg:text-2xl font-bold text-foreground">
              War Room
            </h1>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm ml-6 md:ml-7 mb-2 md:mb-3">
            Strategic Intelligence Memo Audits • {audits.length} Total
          </p>
        </div>

        {/* Start New Audit Button - Top Right */}
        <div className="absolute top-20 md:top-24 right-4 md:right-8 z-[400]">
          <Button
            onClick={handleStartAudit}
            className="bg-gold hover:bg-gold/90 text-black font-semibold px-3 sm:px-6 py-2.5 shadow-lg pointer-events-auto"
          >
            <span className="hidden sm:inline">Start New Audit</span>
            <span className="sm:hidden">New Audit</span>
          </Button>
        </div>
      </div>
    );
  }

  // For non-logged-in users: Vault Entry Sequence
  if (flowStage === 'vault') {
    return (
      <VaultEntrySequence
        onComplete={handleVaultComplete}
        briefCount={briefCount}
        opportunities={opportunities}
      />
    );
  }

  // Landing Page for non-logged-in users
  return (
    <DecisionMemoLanding onContinue={handleStartAudit} />
  );
}
