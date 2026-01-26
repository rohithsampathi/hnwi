"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Globe,
  Landmark,
  Calculator,
  FileText,
  Users,
  Wallet,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Plane,
  Scale,
  Briefcase,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTheme } from "@/contexts/theme-context";
import { getMetallicCardStyle } from "@/lib/colors";
import { StarRating } from "@/components/executor";

interface AcquisitionFlowProps {
  purchasePrice: number; // in USD
  expectedYield: number; // percentage
  expectedAppreciation: number; // percentage
  holdPeriod: number; // years
  buyerType: "individual" | "family_office" | "corporation";
  onNavigateToExecutor?: (executorId: string) => void;
  onRequestIntroduction?: (executorId: string) => void;
}

interface Phase {
  id: string;
  title: string;
  icon: typeof Building2;
  status: "completed" | "current" | "pending";
  description: string;
}

interface ExecutorRecommendation {
  id: string;
  name: string;
  firm: string;
  specialty: string;
  rating: number;
  reviews: number;
  category: "tax" | "legal" | "banking" | "immigration";
}

const PHASES: Phase[] = [
  {
    id: "structuring",
    title: "Pre-Acquisition Structuring",
    icon: Calculator,
    status: "current",
    description: "Optimize ownership structure and tax efficiency",
  },
  {
    id: "gip",
    title: "GIP Pathway Analysis",
    icon: Plane,
    status: "pending",
    description: "Global Investor Programme for PR status",
  },
  {
    id: "banking",
    title: "Banking Rails Setup",
    icon: Landmark,
    status: "pending",
    description: "Fund flow and FX execution",
  },
  {
    id: "tax",
    title: "Tax Architecture",
    icon: FileText,
    status: "pending",
    description: "US and Singapore tax compliance",
  },
  {
    id: "legal",
    title: "Legal Framework",
    icon: Scale,
    status: "pending",
    description: "Documentation and due diligence",
  },
  {
    id: "execution",
    title: "Execution & Completion",
    icon: CheckCircle2,
    status: "pending",
    description: "Transaction closing and handover",
  },
];

const EXECUTOR_RECOMMENDATIONS: ExecutorRecommendation[] = [
  {
    id: "marcus-chen",
    name: "Marcus Chen",
    firm: "KPMG Singapore",
    specialty: "Cross-border HNWI Tax",
    rating: 4.8,
    reviews: 23,
    category: "tax",
  },
  {
    id: "adrian-toh",
    name: "Adrian Toh",
    firm: "Rajah & Tann",
    specialty: "Singapore Real Estate Law",
    rating: 4.9,
    reviews: 42,
    category: "legal",
  },
  {
    id: "william-tan",
    name: "William Tan",
    firm: "Fragomen",
    specialty: "GIP Applications",
    rating: 4.9,
    reviews: 35,
    category: "immigration",
  },
  {
    id: "jonathan-yeo",
    name: "Jonathan Yeo",
    firm: "DBS Private Bank",
    specialty: "Property Finance",
    rating: 4.8,
    reviews: 28,
    category: "banking",
  },
];

export function SingaporeAcquisitionFlow({
  purchasePrice,
  expectedYield,
  expectedAppreciation,
  holdPeriod,
  buyerType,
  onNavigateToExecutor,
  onRequestIntroduction,
}: AcquisitionFlowProps) {
  const { theme } = useTheme();
  const [activePhase, setActivePhase] = useState("structuring");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const metallicStyle = getMetallicCardStyle(theme);

  // Calculations
  const sgdRate = 1.35; // USD to SGD
  const purchasePriceSGD = purchasePrice * sgdRate;

  // ABSD scenarios
  const absdForeign = purchasePriceSGD * 0.6;
  const absdPR = purchasePriceSGD * 0.05;
  const absdSavings = absdForeign - absdPR;

  // BSD calculation (progressive)
  const bsd =
    purchasePriceSGD <= 180000
      ? purchasePriceSGD * 0.01
      : purchasePriceSGD <= 360000
      ? 1800 + (purchasePriceSGD - 180000) * 0.02
      : purchasePriceSGD <= 1000000
      ? 5400 + (purchasePriceSGD - 360000) * 0.03
      : purchasePriceSGD <= 1500000
      ? 24600 + (purchasePriceSGD - 1000000) * 0.04
      : purchasePriceSGD <= 3000000
      ? 44600 + (purchasePriceSGD - 1500000) * 0.05
      : 119600 + (purchasePriceSGD - 3000000) * 0.06;

  // Total costs
  const totalCostForeign = purchasePriceSGD + absdForeign + bsd;
  const totalCostPR = purchasePriceSGD + absdPR + bsd;

  // Rental projections
  const annualRental = purchasePrice * (expectedYield / 100);
  const netOperatingIncome = annualRental * 0.75; // 25% expenses

  // Exit value
  const exitValue =
    purchasePrice * Math.pow(1 + expectedAppreciation / 100, holdPeriod);
  const capitalGain = exitValue - purchasePrice;
  const totalReturn = capitalGain + netOperatingIncome * holdPeriod;
  const irr =
    Math.pow((purchasePrice + totalReturn) / totalCostPR * sgdRate, 1 / holdPeriod) - 1;

  const formatCurrency = (value: number, currency: "USD" | "SGD" = "USD") => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(value);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tax":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "legal":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "banking":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "immigration":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Singapore Penthouse Acquisition
          </h1>
          <p className="text-muted-foreground">
            Cross-border transaction simulation for NYC Family Office
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          10-12 weeks timeline
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Purchase Price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(purchasePrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(purchasePriceSGD, "SGD")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expected Yield</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {expectedYield}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(annualRental)}/year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Appreciation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {expectedAppreciation}%
            </div>
            <p className="text-xs text-muted-foreground">Annual CAGR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Projected IRR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {(irr * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {holdPeriod}-year hold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ABSD Comparison */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">
              Critical: Additional Buyer's Stamp Duty (ABSD)
            </CardTitle>
          </div>
          <CardDescription>
            Singapore imposes 60% ABSD on foreign buyers. GIP pathway reduces
            this to 5%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Foreign Buyer */}
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <h4 className="font-semibold text-red-500 mb-3">
                Direct Foreign Purchase
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Purchase Price</span>
                  <span>{formatCurrency(purchasePriceSGD, "SGD")}</span>
                </div>
                <div className="flex justify-between text-red-500 font-medium">
                  <span>ABSD (60%)</span>
                  <span>{formatCurrency(absdForeign, "SGD")}</span>
                </div>
                <div className="flex justify-between">
                  <span>BSD</span>
                  <span>{formatCurrency(bsd, "SGD")}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Cost</span>
                  <span>{formatCurrency(totalCostForeign, "SGD")}</span>
                </div>
              </div>
            </div>

            {/* PR via GIP */}
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-emerald-500">
                  With GIP (PR Status)
                </h4>
                <Badge className="bg-emerald-500 text-white text-[10px]">
                  RECOMMENDED
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Purchase Price</span>
                  <span>{formatCurrency(purchasePriceSGD, "SGD")}</span>
                </div>
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>ABSD (5%)</span>
                  <span>{formatCurrency(absdPR, "SGD")}</span>
                </div>
                <div className="flex justify-between">
                  <span>BSD</span>
                  <span>{formatCurrency(bsd, "SGD")}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Cost</span>
                  <span>{formatCurrency(totalCostPR, "SGD")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <span className="font-medium">Potential Savings with GIP</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(absdSavings, "SGD")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ~{formatCurrency(absdSavings / sgdRate)} USD
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Phase Navigator */}
      <Card>
        <CardHeader>
          <CardTitle>Acquisition Phases</CardTitle>
          <CardDescription>
            Click each phase to expand details and recommended executors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-4">
              {PHASES.map((phase, index) => {
                const Icon = phase.icon;
                const isActive = activePhase === phase.id;
                const isCompleted = phase.status === "completed";

                return (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={cn(
                        "relative flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all",
                        isActive
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setActivePhase(phase.id)}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "relative z-10 h-12 w-12 rounded-full flex items-center justify-center",
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isActive
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{phase.title}</h4>
                          <ChevronRight
                            className={cn(
                              "h-5 w-5 transition-transform",
                              isActive && "rotate-90"
                            )}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {phase.description}
                        </p>

                        {/* Expanded content */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t"
                            >
                              {phase.id === "structuring" && (
                                <div className="space-y-3">
                                  <p className="text-sm">
                                    Foreign ownership analysis complete. Two
                                    pathways identified:
                                  </p>
                                  <ul className="text-sm space-y-2">
                                    <li className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                      <span>
                                        Direct purchase: 60% ABSD (
                                        {formatCurrency(absdForeign, "SGD")})
                                      </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                                      <span>
                                        GIP pathway: 5% ABSD, saves{" "}
                                        {formatCurrency(absdSavings, "SGD")}
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              )}

                              {phase.id === "gip" && (
                                <div className="space-y-3">
                                  <p className="text-sm">
                                    Global Investor Programme requirements:
                                  </p>
                                  <ul className="text-sm space-y-1">
                                    <li>
                                      • Minimum SGD 200M global AUM for Family
                                      Office
                                    </li>
                                    <li>
                                      • SGD 25M investment in Singapore entities
                                    </li>
                                    <li>• 5 investment professionals (3 SG/PR)</li>
                                    <li>• 6-9 month approval timeline</li>
                                  </ul>
                                </div>
                              )}

                              {phase.id === "banking" && (
                                <div className="space-y-3">
                                  <p className="text-sm">
                                    Fund flow from NYC to Singapore:
                                  </p>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline">JPM NYC</Badge>
                                    <ArrowRight className="h-4 w-4" />
                                    <Badge variant="outline">SWIFT</Badge>
                                    <ArrowRight className="h-4 w-4" />
                                    <Badge variant="outline">DBS SG</Badge>
                                    <ArrowRight className="h-4 w-4" />
                                    <Badge variant="outline">Escrow</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    FX forward contract recommended to lock
                                    USD/SGD rate
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Executors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recommended Executors
          </CardTitle>
          <CardDescription>
            Verified partners for this transaction type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {EXECUTOR_RECOMMENDATIONS.map((executor) => (
              <div
                key={executor.id}
                className={cn(
                  "p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer",
                  metallicStyle.className
                )}
                style={metallicStyle.style}
                onClick={() => onNavigateToExecutor?.(executor.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{executor.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {executor.firm}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={getCategoryColor(executor.category)}
                  >
                    {executor.category}
                  </Badge>
                </div>

                <p className="text-sm mb-3">{executor.specialty}</p>

                <div className="flex items-center justify-between">
                  <StarRating
                    rating={executor.rating}
                    size="sm"
                    showValue
                    showCount
                    count={executor.reviews}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestIntroduction?.(executor.id);
                    }}
                  >
                    Request Intro
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Projection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {holdPeriod}-Year Financial Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Rental Income (Net)
              </h4>
              <div className="text-2xl font-bold">
                {formatCurrency(netOperatingIncome * holdPeriod)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(netOperatingIncome)}/year after expenses
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Capital Appreciation
              </h4>
              <div className="text-2xl font-bold text-emerald-500">
                {formatCurrency(capitalGain)}
              </div>
              <p className="text-xs text-muted-foreground">
                Exit value: {formatCurrency(exitValue)}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Total Return
              </h4>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalReturn)}
              </div>
              <p className="text-xs text-muted-foreground">
                {((totalReturn / (totalCostPR / sgdRate)) * 100).toFixed(0)}%
                multiple on capital
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Return Breakdown</span>
              <span className="text-sm text-muted-foreground">
                {holdPeriod} years
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Rental Income</span>
                  <span>
                    {(
                      (netOperatingIncome * holdPeriod) /
                      (totalReturn) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (netOperatingIncome * holdPeriod) / totalReturn * 100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Capital Appreciation</span>
                  <span>
                    {(capitalGain / totalReturn * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={capitalGain / totalReturn * 100}
                  className="h-2 [&>div]:bg-emerald-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button size="lg" className="flex-1 md:flex-none">
          <FileText className="h-4 w-4 mr-2" />
          Generate Decision Memo
        </Button>
        <Button size="lg" variant="outline" className="flex-1 md:flex-none">
          <Users className="h-4 w-4 mr-2" />
          Schedule Executor Calls
        </Button>
        <Button size="lg" variant="outline" className="flex-1 md:flex-none">
          <ExternalLink className="h-4 w-4 mr-2" />
          Export Full Analysis
        </Button>
      </div>
    </div>
  );
}
