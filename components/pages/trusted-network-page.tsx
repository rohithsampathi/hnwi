"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { CrownLoader } from "@/components/ui/crown-loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Shield,
  Users,
  Search,
  Filter,
  MapPin,
  Globe,
  Award,
  Briefcase,
  Clock,
  CheckCircle2,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Linkedin,
  AlertCircle,
  Building2,
  GraduationCap,
  TrendingUp,
  Network,
  Coins,
  FileText,
  PiggyBank,
  Calculator,
  Scale,
  Gem,
  Home,
  Wallet,
  Users2,
  HeartHandshake,
  ShieldCheck,
  Landmark,
  Plane,
  Gavel,
  Building,
  Palette,
  Sparkles,
  Settings,
  BookOpen
} from "lucide-react";
import { getMetallicCardStyle } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { PageHeaderWithBack } from "@/components/ui/back-button";
import {
  getExecutors,
  getExecutor,
  requestIntroduction,
  type ExecutorFilters
} from "@/lib/api";
import type {
  Executor,
  ExecutorCategory,
  ExecutorSubcategory
} from "@/types/executor";
import { CATEGORY_METADATA, SUBCATEGORY_NAMES } from "@/types/executor";

interface TrustedNetworkPageProps {
  onNavigate?: (route: string) => void;
}

export function TrustedNetworkPage({ onNavigate }: TrustedNetworkPageProps) {
  const { theme } = useTheme();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const metallicStyle = getMetallicCardStyle(theme);

  // State
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedExecutorId, setExpandedExecutorId] = useState<string | null>(null);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [selectedExecutor, setSelectedExecutor] = useState<Executor | null>(null);
  const [introLoading, setIntroLoading] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<ExecutorCategory | "all">("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "trusted_partner" | "general_listing">("all");

  // Introduction request form
  const [needDescription, setNeedDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "normal" | "high">("normal");
  const [estimatedValue, setEstimatedValue] = useState("");

  // Extract filters from URL params
  useEffect(() => {
    const category = searchParams.get("category");
    const jurisdiction = searchParams.get("jurisdiction");
    const executorId = searchParams.get("executor");

    if (category) setCategoryFilter(category as ExecutorCategory);
    if (jurisdiction) setJurisdictionFilter(jurisdiction);
    if (executorId) setExpandedExecutorId(executorId);
  }, [searchParams]);

  // Load executors
  useEffect(() => {
    loadExecutors();
  }, [categoryFilter, subcategoryFilter, jurisdictionFilter, languageFilter, searchQuery, tierFilter]);

  const loadExecutors = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: ExecutorFilters = {
        accepting_clients: true,
        limit: 50
      };

      if (categoryFilter !== "all") filters.category = categoryFilter;
      if (subcategoryFilter !== "all") filters.subcategory = subcategoryFilter as any;
      if (jurisdictionFilter !== "all") filters.jurisdiction = jurisdictionFilter;
      if (languageFilter !== "all") filters.language = languageFilter;
      if (tierFilter !== "all") filters.tier = tierFilter;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const response = await getExecutors(filters);

      // Sort executors: trusted partners first, then general listings
      const sortedExecutors = response.executors.sort((a, b) => {
        if (a.tier === 'trusted_partner' && b.tier !== 'trusted_partner') return -1;
        if (a.tier !== 'trusted_partner' && b.tier === 'trusted_partner') return 1;
        return 0;
      });

      setExecutors(sortedExecutors);
    } catch (err: any) {
      setError(err.message || "Failed to load executors");
    } finally {
      setLoading(false);
    }
  };

  // Get unique jurisdictions and languages from executors
  const uniqueJurisdictions = useMemo(() => {
    const jurisdictions = new Set<string>();
    executors.forEach(exec => exec.jurisdictions.forEach(j => jurisdictions.add(j)));
    return Array.from(jurisdictions).sort();
  }, [executors]);

  const uniqueLanguages = useMemo(() => {
    const languages = new Set<string>();
    executors.forEach(exec => exec.languages.forEach(l => languages.add(l)));
    return Array.from(languages).sort();
  }, [executors]);

  // Get subcategories for selected category
  const availableSubcategories = useMemo(() => {
    if (categoryFilter === "all") return [];
    const categoryData = (CATEGORY_METADATA as any[]).find(c => c.id === categoryFilter);
    return categoryData?.subcategories || [];
  }, [categoryFilter]);

  // Handle introduction request
  const handleRequestIntroduction = async () => {
    if (!selectedExecutor || !needDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your needs",
        variant: "destructive"
      });
      return;
    }

    try {
      setIntroLoading(true);

      await requestIntroduction(selectedExecutor.executor_id, {
        user_need_description: needDescription,
        urgency,
        estimated_engagement_value: estimatedValue || undefined,
        triggered_by: "manual_request"
      });

      toast({
        title: "Introduction Request Sent",
        description: `${selectedExecutor.first_name} will contact you directly within ${selectedExecutor.response_time_commitment || "24-48 hours"}`,
      });

      setShowIntroModal(false);
      setNeedDescription("");
      setUrgency("normal");
      setEstimatedValue("");
      setSelectedExecutor(null);
    } catch (err: any) {
      toast({
        title: "Request Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIntroLoading(false);
    }
  };

  const openIntroModal = (executor: Executor) => {
    setSelectedExecutor(executor);
    setShowIntroModal(true);
  };

  // Category icon mapping
  // Category display name mapping (actual API categories)
  const CATEGORY_NAMES: Record<string, string> = {
    alternative_assets: "Alternative Assets",
    real_estate: "Real Estate",
    tax_structuring: "Tax Structuring",
    immigration_residency: "Immigration & Residency",
    wealth_planning: "Wealth Planning",
    tax_optimization: "Tax Optimization",
    legal_services: "Legal Services",
    family_office: "Family Office",
  };

  // Subcategory display names (actual API subcategories)
  const ACTUAL_SUBCATEGORY_NAMES: Record<string, string> = {
    fine_art: "Fine Art",
    precious_metals: "Precious Metals",
    off_market_luxury: "Off-Market Luxury",
    pre_launch_development: "Pre-Launch Development",
    singapore_tax: "Singapore Tax",
    uae_difc: "UAE DIFC",
    golden_visa: "Golden Visa",
    // Legacy subcategories from types
    retirement_planning: "Retirement Planning",
    estate_planning: "Estate Planning",
    philanthropy: "Philanthropy & Giving",
    insurance: "Insurance & Risk Management",
    international_tax: "International Tax",
    offshore_structures: "Offshore Structures",
    residency_planning: "Residency Planning",
    compliance: "Tax Compliance",
    corporate_law: "Corporate Law",
    immigration: "Immigration Law",
    trust_formation: "Trust Formation",
    dispute_resolution: "Dispute Resolution",
    private_equity: "Private Equity",
    art_collectibles: "Art & Collectibles",
    crypto: "Cryptocurrency",
    setup: "Family Office Setup",
    governance: "Governance & Succession",
    concierge: "Concierge Services",
    education: "Next-Gen Education",
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      // Main categories (actual API categories)
      alternative_assets: Gem,
      real_estate: Building,
      tax_structuring: Calculator,
      immigration_residency: Landmark,
      wealth_planning: PiggyBank,
      tax_optimization: Calculator,
      legal_services: Scale,
      family_office: Building2,

      // Actual API subcategories
      fine_art: Palette,
      precious_metals: Coins,
      off_market_luxury: Building,
      pre_launch_development: TrendingUp,
      singapore_tax: Globe,
      uae_difc: Landmark,
      golden_visa: Award,

      // Legacy subcategories
      retirement_planning: Clock,
      estate_planning: Home,
      philanthropy: HeartHandshake,
      insurance: ShieldCheck,
      international_tax: Globe,
      offshore_structures: Landmark,
      residency_planning: MapPin,
      compliance: FileText,
      corporate_law: Building,
      immigration: Plane,
      trust_formation: Shield,
      dispute_resolution: Gavel,
      private_equity: TrendingUp,
      art_collectibles: Palette,
      crypto: Sparkles,
      setup: Settings,
      governance: Users2,
      concierge: Award,
      education: BookOpen,
    };

    return iconMap[category] || Briefcase;
  };

  // Get display name - ALWAYS returns the category name (not subcategory)
  const getCategoryDisplayName = (executor: Executor): string => {
    // Always show the category name in the badge
    if (executor.primary_category && CATEGORY_NAMES[executor.primary_category]) {
      return CATEGORY_NAMES[executor.primary_category];
    }
    // Fallback to raw category or "Specialist"
    return executor.primary_category || "Specialist";
  };


  // Availability badge color
  const getAvailabilityColor = (capacity: string) => {
    switch (capacity) {
      case "available": return "#10B981";
      case "limited": return "#F59E0B";
      case "unavailable": return "#EF4444";
      default: return "#6B7280";
    }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 pb-20">
        {/* Header */}
        <PageHeaderWithBack
          title="Executor Directory"
          icon={Network}
          description="Vetted executors for intelligence-driven action"
          onBack={() => onNavigate?.("dashboard")}
        />
        <div className="mb-8" />

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(val) => {
            setCategoryFilter(val as any);
            setSubcategoryFilter("all");
          }}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(CATEGORY_METADATA as any[]).map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subcategory Filter */}
          <Select
            value={subcategoryFilter}
            onValueChange={setSubcategoryFilter}
            disabled={categoryFilter === "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Specializations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {availableSubcategories.map((sub: any) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Jurisdiction Filter */}
          <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Jurisdictions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jurisdictions</SelectItem>
              {uniqueJurisdictions.map(j => (
                <SelectItem key={j} value={j}>{j}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tier Filter */}
          <Select value={tierFilter} onValueChange={(val) => setTierFilter(val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="trusted_partner">Verified Partners</SelectItem>
              <SelectItem value="general_listing">General Listing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, firm, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Active Filters */}
        {(categoryFilter !== "all" || jurisdictionFilter !== "all" || tierFilter !== "all" || searchQuery) && (
          <div className="flex flex-wrap gap-2">
            {categoryFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {(CATEGORY_METADATA as any[]).find(c => c.id === categoryFilter)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter("all")} />
              </Badge>
            )}
            {jurisdictionFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {jurisdictionFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setJurisdictionFilter("all")} />
              </Badge>
            )}
            {tierFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {tierFilter === "trusted_partner" ? "Verified Partners" : "General Listing"}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setTierFilter("all")} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <CrownLoader message="Loading Executors..." />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadExecutors}>Retry</Button>
        </div>
      )}

      {/* Executors Grid */}
      {!loading && !error && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {executors.length} executor{executors.length !== 1 ? "s" : ""} found
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executors.map((executor, index) => {
              const isExpanded = expandedExecutorId === executor.executor_id;

              return (
                <div key={executor.executor_id} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`${getMetallicCardStyle(theme).className} hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer`}
                    style={getMetallicCardStyle(theme).style}
                    onClick={() => setExpandedExecutorId(isExpanded ? null : executor.executor_id)}
                  >
                    {/* Premium Banner - Full Width Top */}
                    <div className="relative w-full h-48 mb-6">
                      <div className={`w-full h-full flex items-center justify-center ${theme === 'dark' ? 'bg-muted/30' : 'bg-muted/20'}`}>
                        {(() => {
                          const CategoryIcon = getCategoryIcon(executor.primary_subcategory || executor.primary_category);
                          return <CategoryIcon className={`h-20 w-20 ${theme === 'dark' ? 'text-muted-foreground/60' : 'text-muted-foreground/50'}`} />;
                        })()}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                      {/* Category Badge in top-right corner */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end max-w-[200px] z-10">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-black/40 text-white' : 'bg-black/70 text-white'} backdrop-blur-sm text-center whitespace-nowrap`}>
                          {getCategoryDisplayName(executor)}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 pt-0">
                      {/* Header Row: Name and Chevron */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-4">
                          {executor.tier === "trusted_partner" && (
                            <PremiumBadge className="font-bold px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5 mb-2">
                              <Shield className="h-3.5 w-3.5" />
                              VERIFIED PARTNER
                            </PremiumBadge>
                          )}
                          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
                            {executor.first_name} {executor.last_name}
                          </h3>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                            {executor.professional_title}
                          </p>
                          {/* Firm Name */}
                          <div className="mt-2">
                            <p className={`text-xl font-black leading-none ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                              {executor.firm_name}
                            </p>
                            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'} mt-1`}>
                              {executor.years_experience} years experience
                            </p>
                          </div>
                        </div>

                        {/* Expand Toggle */}
                        <div className={`${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="text-left mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className={`h-4 w-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
                            {executor.city}, {executor.country}
                          </p>
                        </div>
                      </div>

                      {/* Links (Website & LinkedIn) - Verified Partners Only */}
                      {executor.tier === "trusted_partner" && executor.website_url && (
                        <div className="text-left mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className={`h-4 w-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                            <a
                              href={executor.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`text-sm font-medium hover:underline ${theme === 'dark' ? 'text-primary' : 'text-primary'}`}
                            >
                              {new URL(executor.website_url).hostname.replace('www.', '')}
                            </a>
                          </div>
                        </div>
                      )}

                      {executor.tier === "trusted_partner" && executor.linkedin_url && (
                        <div className="text-left mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Linkedin className={`h-4 w-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                            <a
                              href={executor.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`text-sm font-medium hover:underline ${theme === 'dark' ? 'text-primary' : 'text-primary'}`}
                            >
                              LinkedIn
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Credentials */}
                      {executor.credentials && (
                        <div className="text-left mb-4">
                          <div className="flex items-start gap-2">
                            <Award className={`h-4 w-4 mt-0.5 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                            <div className="flex-1">
                              <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
                                Credentials
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'} leading-relaxed`}>
                                {typeof executor.credentials === 'string' ? executor.credentials : executor.credentials.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Jurisdictions */}
                      {executor.jurisdictions && Array.isArray(executor.jurisdictions) && executor.jurisdictions.length > 0 && (
                        <div className="text-left mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className={`h-4 w-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
                              Jurisdictions
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-6">
                            {executor.jurisdictions.slice(0, 3).map(j => (
                              <Badge
                                key={j}
                                variant="outline"
                                className="text-xs font-normal px-2 py-1 rounded-md text-muted-foreground border-muted-foreground/30 whitespace-nowrap w-fit"
                              >
                                {j}
                              </Badge>
                            ))}
                            {executor.jurisdictions.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs font-normal px-2 py-1 rounded-md text-muted-foreground border-muted-foreground/30 whitespace-nowrap w-fit"
                              >
                                +{executor.jurisdictions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Specialization */}
                      {executor.specialization_statement && (
                        <div className="text-left mb-4">
                          <div className="flex items-start gap-2">
                            <FileText className={`h-4 w-4 mt-0.5 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`} />
                            <div className="flex-1">
                              <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white/70' : 'text-gray-700'}`}>
                                Specialization
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'} leading-relaxed`}>
                                {executor.specialization_statement}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Availability Status */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: executor.accepting_clients
                                ? getAvailabilityColor(executor.current_capacity || "available")
                                : getAvailabilityColor("unavailable")
                            }}
                          />
                          <span className="text-xs text-muted-foreground capitalize">
                            {executor.accepting_clients
                              ? (executor.current_capacity === "limited" ? "Limited Capacity" : "Accepting Clients")
                              : "Not Accepting"}
                          </span>
                        </div>
                        {executor.consultation_offered && executor.consultation_free && (
                          <Badge variant="outline" className="text-xs">
                            Free Consult
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Expanded Details - Separate Card Below */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className={`${getMetallicCardStyle(theme).className} p-6`} style={getMetallicCardStyle(theme).style}
                        onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-4">
                            {/* Full Bio */}
                            {executor.bio && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2">About</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{executor.bio}</p>
                              </div>
                            )}

                            {/* Education */}
                            {executor.education && (
                              <div className="flex items-start gap-2">
                                <GraduationCap className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                  <p className="text-xs font-semibold mb-1">Education</p>
                                  <p className="text-sm text-muted-foreground">{executor.education}</p>
                                </div>
                              </div>
                            )}

                            {/* Professional Memberships */}
                            {executor.professional_memberships && Array.isArray(executor.professional_memberships) && executor.professional_memberships.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Professional Memberships</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {executor.professional_memberships.map((mem, i) => (
                                    <li key={i}>• {mem}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Notable Work */}
                            {executor.notable_work && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Notable Work</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{executor.notable_work}</p>
                              </div>
                            )}

                            {/* Engagement Details */}
                            <div className="grid grid-cols-2 gap-4">
                              {executor.typical_engagement_range && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-1">Typical Engagement</h4>
                                  <p className="text-sm text-muted-foreground">{executor.typical_engagement_range}</p>
                                </div>
                              )}
                              {executor.typical_timeline && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-1">Timeline</h4>
                                  <p className="text-sm text-muted-foreground">{executor.typical_timeline}</p>
                                </div>
                              )}
                            </div>

                            {/* Consultation Info */}
                            {executor.consultation_offered && (
                              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-semibold">
                                    {executor.consultation_free ? "Free" : "Paid"} Consultation Available
                                  </span>
                                </div>
                                {executor.consultation_duration_minutes && (
                                  <p className="text-sm text-muted-foreground">
                                    {executor.consultation_duration_minutes} minutes
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Links */}
                            <div className="flex gap-2">
                              {executor.linkedin_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(executor.linkedin_url, "_blank");
                                  }}
                                >
                                  <Linkedin className="h-3 w-3 mr-1" />
                                  LinkedIn
                                </Button>
                              )}
                              {executor.website_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(executor.website_url, "_blank");
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Website
                                </Button>
                              )}
                            </div>

                            {/* Request Introduction Button */}
                            <Button
                              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                              disabled={!executor.accepting_clients}
                              onClick={(e) => {
                                e.stopPropagation();
                                openIntroModal(executor);
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Request Introduction
                            </Button>

                            {executor.response_time_commitment && (
                              <p className="text-xs text-center text-muted-foreground">
                                Typical response: {executor.response_time_commitment}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {executors.length === 0 && (
            <div className="text-center py-12">
              <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Executors Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryFilter("all");
                  setSubcategoryFilter("all");
                  setJurisdictionFilter("all");
                  setTierFilter("all");
                  setSearchQuery("");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </>
      )}
      </div>

      {/* Introduction Request Modal */}
      <Dialog open={showIntroModal} onOpenChange={setShowIntroModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Introduction</DialogTitle>
            <DialogDescription>
              {selectedExecutor && (
                <>
                  Connect with {selectedExecutor.first_name} {selectedExecutor.last_name} at {selectedExecutor.firm_name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Need Description */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe Your Needs <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="E.g., Need tax planning for Dubai relocation with $2M portfolio..."
                value={needDescription}
                onChange={(e) => setNeedDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="text-sm font-medium mb-2 block">Urgency</label>
              <Select value={urgency} onValueChange={(val) => setUrgency(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - General inquiry</SelectItem>
                  <SelectItem value="normal">Normal - Within 2-4 weeks</SelectItem>
                  <SelectItem value="high">High - Immediate action needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Engagement Value */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Estimated Engagement Value (Optional)
              </label>
              <Input
                placeholder="E.g., $50K-$500K"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
              />
            </div>

            {/* Privacy Notice */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                Your request will be sent directly to {selectedExecutor?.first_name}.
                They will contact you via email to schedule a consultation.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIntroModal(false)} disabled={introLoading}>
              Cancel
            </Button>
            <Button onClick={handleRequestIntroduction} disabled={introLoading || !needDescription.trim()}>
              {introLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
