"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AssetCategoryData, getRiskColor } from "@/lib/opportunity-atlas-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Building2, 
  PiggyBank, 
  TrendingUp, 
  Coins, 
  Bitcoin, 
  CreditCard,
  Filter,
  MapPin,
  Store,
  Share2,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Phone,
  Loader2,
  MessageCircle,
  ThumbsUp
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { getMetallicCardStyle } from "@/lib/colors";
import { GoldenScroll } from "@/components/ui/golden-scroll";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import type { Opportunity } from "@/lib/api";
import { CitationText } from "@/components/elite/citation-text";

interface OpportunityAtlasProps {
  categories: AssetCategoryData[];
  selectedCategory: AssetCategoryData | null;
  onCategorySelect: (category: AssetCategoryData | null) => void;
  className?: string;
  opportunityScoring?: {
    getScore: (opportunityName: string) => {
      score: number;
      conviction: 'high' | 'medium' | 'watch' | 'avoid';
      thesis: string;
      reasoning?: string;
    } | undefined;
    marketInsight?: string;
    timingEdge?: string;
  } | null;
  onOpportunityView?: (opportunityId: string) => void;
  targetOpportunityId?: string | null;
}

// Icon mapping for categories
const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'real-estate':
      return Building2;
    case 'private-equity':
      return PiggyBank;
    case 'venture-capital':
      return TrendingUp;
    case 'strategic-metals':
      return Coins;
    case 'crypto-digital':
      return Bitcoin;
    case 'fixed-income':
      return CreditCard;
    default:
      return PiggyBank;
  }
};

// Region options for filtering
const regions = [
  { id: 'all', name: 'All Regions' },
  { id: 'north-america', name: 'North America' },
  { id: 'europe', name: 'Europe' },
  { id: 'asia-pacific', name: 'Asia Pacific' },
  { id: 'middle-east', name: 'Middle East' },
  { id: 'africa', name: 'Africa' },
  { id: 'south-america', name: 'South America' }
];

// Opportunity card component for the right panel
function OpportunityCard({ 
  opportunity, 
  onClick, 
  isExpanded, 
  onShare,
  shareState,
  onTalkToConcierge,
  conciergeState,
  scoring,
  onOpportunityView
}: { 
  opportunity: Opportunity; 
  onClick: () => void;
  isExpanded: boolean;
  onShare: (opportunity: Opportunity) => void;
  shareState: { [key: string]: boolean };
  onTalkToConcierge: (opportunity: Opportunity) => void;
  conciergeState: { [key: string]: boolean };
  scoring?: {
    score: number;
    conviction: 'high' | 'medium' | 'watch' | 'avoid';
    thesis: string;
    reasoning?: string;
  } | null;
  onOpportunityView?: (opportunityId: string) => void;
}) {
  const { theme } = useTheme();
  const metallicStyle = getMetallicCardStyle(theme);
  
  // Get conviction styling
  const getConvictionStyle = (conviction: string) => {
    switch (conviction) {
      case 'high':
        return {
          color: '#22c55e', // green-500
          backgroundColor: '#22c55e20',
          borderColor: '#22c55e'
        };
      case 'medium':
        return {
          color: '#f59e0b', // amber-500
          backgroundColor: '#f59e0b20',
          borderColor: '#f59e0b'
        };
      case 'watch':
        return {
          color: '#3b82f6', // blue-500
          backgroundColor: '#3b82f620',
          borderColor: '#3b82f6'
        };
      case 'avoid':
        return {
          color: '#ef4444', // red-500
          backgroundColor: '#ef444420',
          borderColor: '#ef4444'
        };
      default:
        return {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
        };
    }
  };
  
  const handleCardClick = () => {
    // Track opportunity view if scoring is available
    if (scoring && onOpportunityView && opportunity.id) {
      onOpportunityView(opportunity.id);
    }
    onClick();
  };
  
  return (
    <motion.div
      id={`opportunity-card-${opportunity.id}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="transition-all duration-300"
      style={{
        outline: isExpanded 
          ? `0.2px solid ${theme === "dark" ? "#DAA520" : "#C0C0C0"}` 
          : "none"
      }}
    >
      <div
        className="p-6 cursor-pointer transition-all duration-200"
        style={metallicStyle.style}
        onClick={handleCardClick}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-2">
              <h4 className={`font-semibold text-sm line-clamp-2 ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                {opportunity.title}
              </h4>
            </div>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              {opportunity.region && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {opportunity.region}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
          
          <p className={`text-xs line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {opportunity.description}
          </p>
          
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              {opportunity.value && (
                <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {opportunity.value}
                </span>
              )}
              {opportunity.expectedReturn && (
                <span className="font-medium" style={{ color: '#DAA520' }}>
                  {opportunity.expectedReturn.replace(/annually?/i, 'Annual Returns')}
                </span>
              )}
            </div>
            
            {opportunity.riskLevel && (
              <Badge 
                variant={
                  opportunity.riskLevel === "Low" ? "default" :
                  opportunity.riskLevel === "Medium" ? "secondary" : "destructive"
                }
                className="text-xs"
              >
                {opportunity.riskLevel} Risk
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div className="p-4 space-y-4">
              {/* Investment Executive Summary */}
              <div className="space-y-6">
                
                {/* Primary Investment Metrics - Clean Cards Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Investment Size Card */}
                  {opportunity.value && (
                    <div className="p-4 rounded-lg bg-muted/20 border border-muted">
                      <div className="text-center">
                        <h6 className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          INVESTMENT SIZE
                        </h6>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {opportunity.value}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Expected Returns Card */}
                  {opportunity.expectedReturn && (
                    <div className="p-4 rounded-lg bg-muted/20 border border-muted">
                      <div className="text-center">
                        <h6 className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          EXPECTED RETURNS
                        </h6>
                        <p className="text-lg font-bold" style={{ color: '#DAA520' }}>
                          {opportunity.expectedReturn}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Investment Horizon Card */}
                  {opportunity.investmentHorizon && (
                    <div className="p-4 rounded-lg bg-muted/20 border border-muted">
                      <div className="text-center">
                        <h6 className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          TIME HORIZON
                        </h6>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {opportunity.investmentHorizon}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Risk Assessment with Progress Bar */}
                {opportunity.riskLevel && (
                  <div className="p-4 rounded-lg bg-muted/10 border border-muted">
                    <h6 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      RISK ASSESSMENT
                    </h6>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Risk Level</span>
                      <span className="text-sm font-bold" style={{ 
                        color: theme === "dark" 
                          ? getRiskColor(opportunity.riskLevel as "Low" | "Medium" | "High")
                          : (() => {
                              switch (opportunity.riskLevel) {
                                case "Low": return "#047857"; // darker green
                                case "Medium": return "#D97706"; // darker amber  
                                case "High": return "#DC2626"; // darker red
                                default: return "#374151"; // darker gray
                              }
                            })()
                      }}>
                        {opportunity.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: opportunity.riskLevel === 'Low' ? '85%' : 
                                 opportunity.riskLevel === 'Medium' ? '60%' : '25%',
                          backgroundColor: getRiskColor(opportunity.riskLevel as "Low" | "Medium" | "High")
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Conservative</span>
                      <span>Moderate</span>
                      <span>Aggressive</span>
                    </div>
                  </div>
                )}

                {/* Geographic & Sector Information */}
                <div className="grid grid-cols-2 gap-4">
                  {(opportunity.region || opportunity.country) && (
                    <div>
                      <h6 className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        GEOGRAPHIC FOCUS
                      </h6>
                      <div className="space-y-1">
                        {opportunity.region && (
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {opportunity.region}
                          </p>
                        )}
                        {opportunity.country && (
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {opportunity.country}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {(opportunity.industry || opportunity.type) && (
                    <div>
                      <h6 className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        SECTOR CLASSIFICATION
                      </h6>
                      <div className="space-y-1">
                        {opportunity.industry && (
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {opportunity.industry}
                          </p>
                        )}
                        {opportunity.type && (
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {opportunity.type}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Viktor Rajesh-Volkov Intelligence Analysis */}
                {scoring && (
                  <div className="p-4 rounded-lg" style={{
                    backgroundColor: getConvictionStyle(scoring.conviction).backgroundColor,
                    border: `1px solid ${getConvictionStyle(scoring.conviction).borderColor}30`
                  }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getConvictionStyle(scoring.conviction).color }}
                      />
                      <h6 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        VIKTOR RAJESH-VOLKOV ANALYSIS
                      </h6>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{
                          ...getConvictionStyle(scoring.conviction),
                          borderWidth: '1px'
                        }}
                      >
                        {scoring.conviction.toUpperCase()} CONVICTION
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {/* Alignment Score Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground">Portfolio Alignment Score</span>
                          <span className="text-xs font-bold" style={{ color: getConvictionStyle(scoring.conviction).color }}>
                            {Math.round(scoring.score)}/100
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${scoring.score}%`,
                              backgroundColor: getConvictionStyle(scoring.conviction).color
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Investment Thesis */}
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-black/20' : 'bg-white/50'}`}>
                        <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="font-semibold text-primary">Viktor's Thesis:</span><br />
                          {scoring.thesis}
                        </p>
                      </div>
                      
                      {/* Detailed Analysis */}
                      {scoring.reasoning && (
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-black/10' : 'bg-gray-50/80'}`}>
                          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="font-semibold">Strategic Analysis:</span><br />
                            {scoring.reasoning}
                          </p>
                        </div>
                      )}
                      
                      {/* Entry Window Timing */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-black/20' : 'bg-white/40'}`}>
                          <p className="text-xs text-muted-foreground mb-1">Entry Window</p>
                          <p className="text-xs font-bold" style={{ color: getConvictionStyle(scoring.conviction).color }}>
                            {scoring.conviction === 'high' ? 'Immediate' : 
                             scoring.conviction === 'medium' ? 'Q1-Q2 2024' :
                             scoring.conviction === 'watch' ? 'Monitor' : 'Avoid'}
                          </p>
                        </div>
                        <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-black/20' : 'bg-white/40'}`}>
                          <p className="text-xs text-muted-foreground mb-1">Peer Signals</p>
                          <p className="text-xs font-bold" style={{ color: getConvictionStyle(scoring.conviction).color }}>
                            {scoring.conviction === 'high' ? 'Strong Buy' :
                             scoring.conviction === 'medium' ? 'Accumulate' : 
                             scoring.conviction === 'watch' ? 'Hold' : 'Sell'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Elite Pulse Intelligence Attribution */}
                      <div className="border-t border-muted-foreground/20 pt-2">
                        <p className="text-xs text-muted-foreground italic">
                          Analysis powered by Elite Pulse Intelligence System
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Investment Thesis */}
                {opportunity.description && (
                  <div>
                    <h6 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      INVESTMENT THESIS
                    </h6>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {opportunity.description}
                    </p>
                  </div>
                )}

                {/* Key Highlights - Only if both pros and cons exist */}
                {(opportunity.pros?.length && opportunity.cons?.length) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h6 className={`text-sm font-semibold mb-3 text-green-600 dark:text-green-400`}>
                        KEY STRENGTHS
                      </h6>
                      <ul className="space-y-2">
                        {opportunity.pros.slice(0, 3).map((pro, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                            <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                              {pro}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h6 className={`text-sm font-semibold mb-3 text-amber-600 dark:text-amber-400`}>
                        KEY CONSIDERATIONS
                      </h6>
                      <ul className="space-y-2">
                        {opportunity.cons.slice(0, 3).map((con, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></div>
                            <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                              {con}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>


              {/* Victor Analysis Section - Only show if we have actual Victor data, not just basic opportunity fields */}
              {(opportunity.victor_reasoning || opportunity.strategic_insights || opportunity.risk_assessment || opportunity.victor_action || opportunity.confidence_level || opportunity.opportunity_window || opportunity.victor_score) && (
                <div className="mt-6 p-4 rounded-lg border border-border bg-card">

                  <div className="space-y-3">

                    {/* Elite Pulse Analysis - Only show if we have actual Victor analysis */}
                    {(opportunity.victor_reasoning || opportunity.reasoning || opportunity.analysis) && (
                      <div className="text-xs">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-foreground">Elite Pulse Analysis</span>
                          {/* Victor Score Badge */}
                          {opportunity.victor_score && (
                            <div
                              className="px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg group flex-shrink-0"
                              style={{
                                background: opportunity.victor_score === 'JUICY'
                                  ? "linear-gradient(135deg, #DC143C 0%, #FF1744 25%, #B71C1C 50%, #FF1744 75%, #DC143C 100%)" // Metallic ruby
                                  : opportunity.victor_score === 'MODERATE'
                                  ? "linear-gradient(135deg, #FFB300 0%, #FFC107 25%, #FF8F00 50%, #FFC107 75%, #FFB300 100%)" // Metallic topaz
                                  : "linear-gradient(135deg, #10B981 0%, #34D399 25%, #059669 50%, #34D399 75%, #10B981 100%)", // Metallic emerald for FAR_FETCHED
                                border: opportunity.victor_score === 'JUICY'
                                  ? "2px solid rgba(220, 20, 60, 0.5)"
                                  : opportunity.victor_score === 'MODERATE'
                                  ? "2px solid rgba(255, 193, 7, 0.5)"
                                  : "2px solid rgba(16, 185, 129, 0.5)",
                                boxShadow: opportunity.victor_score === 'JUICY'
                                  ? "0 2px 8px rgba(220, 20, 60, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                                  : opportunity.victor_score === 'MODERATE'
                                  ? "0 2px 8px rgba(255, 193, 7, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                                  : "0 2px 8px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
                                color: "#ffffff",
                                textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)"
                              }}
                            >
                              {opportunity.victor_score}
                            </div>
                          )}
                        </div>
                        <div className="text-muted-foreground leading-relaxed">
                          <CitationText
                            text={opportunity.victor_reasoning || opportunity.reasoning || opportunity.analysis}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Strategic Insights */}
                    {opportunity.strategic_insights && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block mb-1">Strategic Insights</span>
                        <div className="text-muted-foreground leading-relaxed">
                          <CitationText
                            text={opportunity.strategic_insights}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Opportunity Window */}
                    {opportunity.opportunity_window && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block mb-1">Timing Window</span>
                        <div className="text-muted-foreground leading-relaxed">
                          {opportunity.opportunity_window}
                        </div>
                      </div>
                    )}

                    {/* Pros and Cons */}
                    {(opportunity.pros || opportunity.cons) && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {opportunity.pros && opportunity.pros.length > 0 && (
                          <div>
                            <span className="font-semibold text-primary block mb-1">Pros</span>
                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                              {opportunity.pros.slice(0, 3).map((pro: string, idx: number) => (
                                <li key={idx} className="text-[10px]">{pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {opportunity.cons && opportunity.cons.length > 0 && (
                          <div>
                            <span className="font-semibold text-primary opacity-80 block mb-1">Cons</span>
                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                              {opportunity.cons.slice(0, 3).map((con: string, idx: number) => (
                                <li key={idx} className="text-[10px]">{con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Risk Assessment - Highlighted */}
                    {(opportunity.risk_assessment || opportunity.hnwi_alignment) && (
                      <div className="text-xs p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                        <span className="font-semibold text-primary block mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                          Risk Assessment
                        </span>
                        <div className="text-muted-foreground leading-relaxed">
                          {opportunity.risk_assessment || opportunity.hnwi_alignment || 'Standard market risk applies. Monitor position regularly.'}
                        </div>
                      </div>
                    )}

                    {/* Market Pulse Alignment */}
                    {opportunity.elite_pulse_alignment && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block mb-1">Market Pulse</span>
                        <div className="text-muted-foreground leading-relaxed">
                          {opportunity.elite_pulse_alignment}
                        </div>
                      </div>
                    )}

                    {/* Legacy fields */}
                    {opportunity.key_factors && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block mb-1">Key Factors</span>
                        <div className="text-muted-foreground leading-relaxed">
                          {opportunity.key_factors}
                        </div>
                      </div>
                    )}

                    {opportunity.implementation && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block mb-1">Implementation</span>
                        <div className="text-muted-foreground leading-relaxed">
                          {opportunity.implementation}
                        </div>
                      </div>
                    )}

                    {/* Action and Confidence Section */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {opportunity.victor_action && (
                            <Badge
                              variant={opportunity.victor_action === 'BUY' ? 'default' :
                                      opportunity.victor_action === 'SELL' ? 'destructive' :
                                      'secondary'}
                              className="text-xs font-bold"
                            >
                              {opportunity.victor_action}
                            </Badge>
                          )}
                        </div>
                        {opportunity.confidence_level && (
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className="font-medium text-foreground">{Math.round(opportunity.confidence_level * 100)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collapse Arrow - Centered */}
                  <div className="flex justify-center mt-2 pt-2 border-t border-border/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick(); // This toggles the expanded state
                      }}
                      className="p-1 rounded-full hover:bg-muted transition-colors group"
                      aria-label="Collapse"
                    >
                      <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  </div>

                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(opportunity);
                  }}
                  className={`flex items-center gap-1 transition-all text-xs px-3 py-1.5 h-7 font-medium ${
                    opportunity?.id && shareState?.[opportunity.id]
                      ? theme === 'dark'
                        ? 'bg-green-900/20 border-green-500 text-green-400 hover:bg-primary hover:text-white hover:border-primary'
                        : 'bg-green-50 border-green-500 text-green-700 hover:bg-primary hover:text-white hover:border-primary'
                      : theme === 'dark'
                        ? 'text-white hover:bg-primary hover:text-white hover:border-primary'
                        : 'text-black hover:bg-primary hover:text-white hover:border-primary'
                  }`}
                >
                  {opportunity?.id && shareState?.[opportunity.id] ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Share2 className="w-3 h-3" />
                  )}
                  {opportunity?.id && shareState?.[opportunity.id] ? 'Copied!' : 'Share'}
                </Button>
                
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-3 py-1.5 h-7 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTalkToConcierge(opportunity);
                  }}
                  disabled={opportunity?.id ? (conciergeState?.[opportunity.id] || false) : false}
                >
                  {opportunity?.id && conciergeState?.[opportunity.id] ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-1 h-3 w-3" />
                      Talk to Concierge
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function OpportunityAtlasNew({
  categories,
  selectedCategory,
  onCategorySelect,
  className = "",
  opportunityScoring,
  onOpportunityView,
  targetOpportunityId
}: OpportunityAtlasProps) {
  const { theme } = useTheme();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');
  const [showStickyCategories, setShowStickyCategories] = useState(false);
  const [expandedOpportunityId, setExpandedOpportunityId] = useState<string | null>(null);
  const [shareState, setShareState] = useState<{ [key: string]: boolean }>({});
  const [conciergeState, setConciergeState] = useState<{ [key: string]: boolean }>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const { toast } = useToast();
  const categoriesRef = useRef<HTMLDivElement>(null);
  const opportunitiesRef = useRef<HTMLDivElement>(null);
  
  // Screen size detection for mobile/desktop check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setScreenSize(window.innerWidth < 768 ? 'mobile' : 'desktop');
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Sticky categories effect for mobile
  useEffect(() => {
    if (screenSize !== 'mobile') return;
    
    const categoriesElement = categoriesRef.current;
    if (!categoriesElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky when categories section is not visible
        setShowStickyCategories(!entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '-56px 0px 0px 0px' // Account for header height
      }
    );

    observer.observe(categoriesElement);

    return () => {
      observer.disconnect();
    };
  }, [screenSize]);

  // Scroll to target opportunity when specified
  useEffect(() => {
    if (targetOpportunityId && categories.length > 0) {

      // Find the opportunity across all categories
      let foundOpportunity: Opportunity | null = null;
      let foundCategory: AssetCategoryData | null = null;
      let bestMatch: { opportunity: Opportunity; category: AssetCategoryData; score: number } | null = null;

      const searchTerm = decodeURIComponent(targetOpportunityId).toLowerCase();

      for (const category of categories) {
        // Check for ID match first (in case we have a real MongoDB ID)
        const idMatch = category.opportunities.find(opp => opp.id === targetOpportunityId);
        if (idMatch) {
          foundOpportunity = idMatch;
          foundCategory = category;
          break;
        }

        // Main flow: Use intelligent fuzzy matching for all title-based searches
        category.opportunities.forEach(opp => {
          const oppTitle = opp.title.toLowerCase();
          let matchScore = 0;

          // Exact title match gets highest score
          if (oppTitle === searchTerm) {
            matchScore = 100;
          } else {
            // Smart keyword matching
            const searchWords = searchTerm.split(' ').filter(w => w.length > 2);
            const titleWords = oppTitle.split(' ').filter(w => w.length > 2);

            // Score each matching word
            searchWords.forEach(searchWord => {
              titleWords.forEach(titleWord => {
                if (titleWord === searchWord) {
                  matchScore += 3; // Exact word match
                } else if (titleWord.includes(searchWord) || searchWord.includes(titleWord)) {
                  matchScore += 2; // Partial word match
                }
              });
            });

            // Industry/type specific matching
            const keyTerms = [
              ['platinum', 'metal', 'precious'],
              ['real estate', 'property', 'development', 'residential', 'commercial'],
              ['shortage', 'supply', 'demand', 'scarcity'],
              ['global', 'international', 'worldwide'],
              ['tech', 'technology', 'software', 'ai', 'artificial'],
              ['energy', 'renewable', 'solar', 'wind', 'battery'],
              ['equity', 'private', 'venture', 'capital']
            ];

            keyTerms.forEach(termGroup => {
              const searchHasTerm = termGroup.some(term => searchTerm.includes(term));
              const titleHasTerm = termGroup.some(term => oppTitle.includes(term));
              if (searchHasTerm && titleHasTerm) {
                matchScore += 5; // Bonus for matching industry/type
              }
            });
          }

          // Track the best match
          if (matchScore > 0 && (!bestMatch || matchScore > bestMatch.score)) {
            bestMatch = { opportunity: opp, category, score: matchScore };
          }
        });
      }

      // Use the best match found (lowered threshold to 1 for any match)
      if (!foundOpportunity && bestMatch && bestMatch.score > 0) {
        foundOpportunity = bestMatch.opportunity;
        foundCategory = bestMatch.category;
      }

      if (foundOpportunity && foundCategory) {

        // Show ALL opportunities instead of filtering by category for better UX
        // This allows users to explore other opportunities while having the target expanded
        onCategorySelect(null);

        // Expand the opportunity
        setExpandedOpportunityId(foundOpportunity.id);

        // Scroll to the opportunity card after a short delay
        setTimeout(() => {
          const element = document.getElementById(`opportunity-card-${foundOpportunity.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 800); // Slightly longer delay to ensure DOM is ready
      } else {

        // Show all opportunities even when no exact match is found
        onCategorySelect(null);

        // Still show a helpful message but more subtle
        toast({
          title: "Showing All Opportunities",
          description: "Browse all available opportunities that may match your interest.",
          duration: 3000,
        });
      }
    }
  }, [targetOpportunityId, categories, onCategorySelect]);

  const maxDealCount = Math.max(...categories.map(c => c.liveDealCount), 1);
  const totalDealCount = categories.reduce((sum, category) => sum + category.liveDealCount, 0);
  
  // Filter opportunities based on selected region
  const getFilteredOpportunities = (category: AssetCategoryData) => {
    if (selectedRegion === 'all') return category.opportunities;
    return category.opportunities.filter(opp => 
      opp.region?.toLowerCase().replace(/\s+/g, '-') === selectedRegion
    );
  };
  
  // Get all opportunities from all categories with region filtering
  const getAllFilteredOpportunities = () => {
    const allOpportunities = categories.flatMap(category => category.opportunities);
    if (selectedRegion === 'all') return allOpportunities;
    return allOpportunities.filter(opp => 
      opp.region?.toLowerCase().replace(/\s+/g, '-') === selectedRegion
    );
  };
  
  // Handle opportunity click (toggle expansion)
  const handleOpportunityClick = (opportunity: Opportunity) => {
    if (!opportunity?.id) {
      return;
    }
    
    if (expandedOpportunityId === opportunity.id) {
      setExpandedOpportunityId(null);
    } else {
      setExpandedOpportunityId(opportunity.id);
      // Store opportunity info for reference
      sessionStorage.setItem('currentOpportunityId', opportunity.id);
    }
    
    // Scroll to the beginning of the card after a short delay
    setTimeout(() => {
      const cardElement = document.getElementById(`opportunity-card-${opportunity.id}`);
      if (cardElement) {
        cardElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  // Handle share functionality with clipboard - copy URL
  const handleShare = async (opportunity: Opportunity) => {
    if (!opportunity?.id) {
      toast({
        title: "Error",
        description: "Unable to share this opportunity. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      // Build the opportunity URL using the public share route
      const baseUrl = window.location.origin;
      const opportunityUrl = `${baseUrl}/share/opportunity/${opportunity.id}`;
      
      await navigator.clipboard.writeText(opportunityUrl);
      
      // Show success toast
      toast({
        title: "URL Copied",
        description: `Opportunity link copied to clipboard`,
        duration: 2000,
      });
      
      // Show success state
      if (opportunity?.id) {
        setShareState(prev => ({ ...(prev || {}), [opportunity.id]: true }));
        
        // Reset success state after 2 seconds
        setTimeout(() => {
          setShareState(prev => ({ ...(prev || {}), [opportunity.id]: false }));
        }, 2000);
      }
      
    } catch (error) {
      // Fallback: try to use the older method with URL
      const baseUrl = window.location.origin;
      const opportunityUrl = `${baseUrl}/prive-exchange/${opportunity.region}/${opportunity.id}`;
      
      try {
        const textArea = document.createElement('textarea');
        textArea.value = opportunityUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Show success toast
        toast({
          title: "URL Copied",
          description: `Opportunity link copied to clipboard`,
          duration: 2000,
        });
        
        if (opportunity?.id) {
          setShareState(prev => ({ ...(prev || {}), [opportunity.id]: true }));
          setTimeout(() => {
            setShareState(prev => ({ ...(prev || {}), [opportunity.id]: false }));
          }, 2000);
        }
      } catch (fallbackError) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy opportunity URL. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  // Handle talk to concierge functionality with Formspree - Mobile/PWA Safe
  const handleTalkToConcierge = async (opportunity: Opportunity) => {
    if (!opportunity?.id) {
      toast({
        title: "Error",
        description: "Invalid opportunity selected. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Prevent double submissions
    if (conciergeState?.[opportunity.id]) {
      return;
    }
    
    setConciergeState(prev => ({ ...(prev || {}), [opportunity.id]: true }));
    
    try {
      const user = null; // Get user from auth context if needed
      const userId = user?.id || localStorage.getItem("userId") || "";
      const userEmail = user?.email || localStorage.getItem("userEmail") || "";
      const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || "Unknown User";
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch("https://formspree.io/f/xldgwozd", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          opportunityTitle: opportunity.title,
          userName,
          userId,
          userEmail,
          opportunityId: opportunity.id,
          opportunityType: opportunity.type,
          opportunityValue: opportunity.value,
          region: opportunity.region,
          source: "Privé Exchange",
          timestamp: new Date().toISOString(),
          _subject: `Concierge Request: ${opportunity.title}`,
          message: `User ${userName} (${userEmail}) requests concierge assistance for: ${opportunity.title}. Type: ${opportunity.type}, Value: ${opportunity.value}, Region: ${opportunity.region}`
        }),
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to submit request: ${response.status}`);
      }
      
      // Small delay to ensure state is stable before showing dialog
      setTimeout(() => {
        setSelectedOpportunity(opportunity);
        setShowSuccessDialog(true);
      }, 100);
      
      toast({
        title: "Concierge Notified",
        description: `Our concierge will contact you about ${opportunity.title}.`,
        duration: 5000,
      });
    } catch (error) {
      const errorMessage = error.name === 'AbortError' 
        ? 'Request timed out. Please try again.'
        : 'Unable to reach concierge. Please try again.';
        
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      if (opportunity?.id) {
        // Small delay to prevent race conditions
        setTimeout(() => {
          setConciergeState(prev => ({ ...(prev || {}), [opportunity.id]: false }));
        }, 500);
      }
    }
  };
  
  if (categories.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="py-8 px-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Opportunity Atlas</h2>
          <p className="text-muted-foreground text-sm mb-4">
            No investment opportunities available at the moment.
          </p>
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              For Information only. HNWI Chronicles is not a broker-dealer
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // For mobile: Categories at top, opportunities below
  if (screenSize === 'mobile') {
    return (
      <div className={`relative ${className}`}>
        {/* Description */}
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            {selectedCategory 
              ? `Showing ${selectedCategory.name} opportunities • ${getFilteredOpportunities(selectedCategory).length} deals available`
              : `Showing all investment opportunities • ${getAllFilteredOpportunities().length} deals available`
            }
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mb-6" ref={categoriesRef}>
          <div className="grid grid-cols-2 gap-3">
            {/* All Categories Option */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                !selectedCategory 
                  ? `border-primary ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`
                  : 'border-transparent bg-muted/50 hover:border-primary/30'
              }`}
              onClick={() => onCategorySelect(null)}
            >
              <div className="flex flex-col items-center space-y-2 text-center">
                <Store className="w-5 h-5" style={{ color: theme === 'dark' ? '#DAA520' : '#C0C0C0' }} />
                <div>
                  <h4 className={`font-semibold text-xs ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    All Categories
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {getAllFilteredOpportunities().length} deals
                  </p>
                </div>
              </div>
            </motion.div>

            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.id);
              const isSelected = selectedCategory?.id === category.id;
              const progressPercentage = (category.liveDealCount / totalDealCount) * 100;
              
              return (
                <motion.div
                  key={category.id}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                    isSelected 
                      ? `border-primary ${theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'}`
                      : 'border-transparent bg-muted/50 hover:border-primary/30'
                  }`}
                  onClick={() => onCategorySelect(category)}
                >
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <IconComponent className="w-5 h-5" style={{ color: '#DAA520' }} />
                    <div>
                      <h4 className={`font-semibold text-xs ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}>
                        {category.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {category.liveDealCount} deals
                      </p>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-full h-1 bg-muted rounded-full">
                      <div 
                        className="h-1 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${progressPercentage}%`,
                          backgroundColor: '#DAA520'
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Region Filter */}
        <div className="mb-4 flex justify-between items-center">
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {selectedCategory ? selectedCategory.name : 'All Opportunities'}
          </h3>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent 
              className="z-[60]" 
              side="bottom" 
              align="end" 
              sideOffset={4} 
              avoidCollisions={true} 
              position="popper"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Opportunities List */}
        <div className="space-y-3" ref={opportunitiesRef}>
          {selectedCategory ? (
            getFilteredOpportunities(selectedCategory).length > 0 ? (
              getFilteredOpportunities(selectedCategory).map((opportunity) => {
                const scoring = opportunityScoring?.getScore ? opportunityScoring.getScore(opportunity.title) : null;
                return (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onClick={() => handleOpportunityClick(opportunity)}
                    isExpanded={opportunity?.id ? expandedOpportunityId === opportunity.id : false}
                    onShare={handleShare}
                    shareState={shareState}
                    onTalkToConcierge={handleTalkToConcierge}
                    conciergeState={conciergeState}
                    scoring={scoring}
                    onOpportunityView={onOpportunityView}
                  />
                );
              })
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground mb-2">
                  No opportunities found in {regions.find(r => r.id === selectedRegion)?.name || 'selected region'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSelectedRegion('all')}
                >
                  Show All Regions
                </Button>
              </div>
            )
          ) : (
            getAllFilteredOpportunities().length > 0 ? (
              getAllFilteredOpportunities().map((opportunity) => {
                const scoring = opportunityScoring?.getScore ? opportunityScoring.getScore(opportunity.title) : null;
                return (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onClick={() => handleOpportunityClick(opportunity)}
                    isExpanded={opportunity?.id ? expandedOpportunityId === opportunity.id : false}
                    onShare={handleShare}
                    shareState={shareState}
                    onTalkToConcierge={handleTalkToConcierge}
                    conciergeState={conciergeState}
                    scoring={scoring}
                    onOpportunityView={onOpportunityView}
                  />
                );
              })
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground mb-2">
                  No opportunities found in {regions.find(r => r.id === selectedRegion)?.name || 'selected region'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSelectedRegion('all')}
                >
                  Show All Regions
                </Button>
              </div>
            )
          )}
        </div>

        {/* Footer disclaimer */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            For Information only. HNWI Chronicles is not a broker-dealer
          </p>
        </div>

        {/* Sticky Categories */}
        <AnimatePresence>
          {showStickyCategories && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[56px] left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3"
            >
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {/* All Categories Sticky Button */}
                <Button
                  variant={!selectedCategory ? "default" : "outline"}
                  size="sm"
                  className="flex-shrink-0 text-xs px-3 py-1.5 h-auto"
                  onClick={() => onCategorySelect(null)}
                >
                  <Store className="w-3 h-3 mr-1" />
                  All ({getAllFilteredOpportunities().length})
                </Button>

                {/* Category Sticky Buttons */}
                {categories.map((category) => {
                  const IconComponent = getCategoryIcon(category.id);
                  const isSelected = selectedCategory?.id === category.id;
                  
                  return (
                    <Button
                      key={category.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="flex-shrink-0 text-xs px-3 py-1.5 h-auto"
                      onClick={() => onCategorySelect(category)}
                    >
                      <IconComponent className="w-3 h-3 mr-1" style={{ color: isSelected ? 'inherit' : '#DAA520' }} />
                      {category.name} ({category.liveDealCount})
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  // Desktop: Two-column layout (1:2 ratio like Elite Pulse)
  return (
    <div className={`relative ${className}`}>
      {/* Description */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm">
          {selectedCategory 
            ? `Showing ${selectedCategory.name} opportunities • ${getFilteredOpportunities(selectedCategory).length} deals available`
            : `Showing all investment opportunities • ${getAllFilteredOpportunities().length} deals available`
          }
        </p>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Left Column - Categories (1 part) */}
        <div className="md:col-span-1 lg:col-span-2">
          <div className="h-full">
            <div className="pb-3">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Asset Categories
              </h3>
            </div>
            <GoldenScroll maxHeight="calc(100vh - 300px)" className="space-y-3 p-2">
              {categories.map((category) => {
                const IconComponent = getCategoryIcon(category.id);
                const isSelected = selectedCategory?.id === category.id;
                const progressPercentage = (category.liveDealCount / totalDealCount) * 100;
                
                return isSelected ? (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-lg cursor-pointer transition-all duration-200 border-transparent hover:border-primary/30 hover:bg-primary/5 relative"
                    style={{
                      ...getMetallicCardStyle(theme).style,
                      outline: `1px solid ${theme === "dark" ? "#DAA520" : "#C0C0C0"}`,
                      outlineOffset: '2px'
                    }}
                    onClick={() => onCategorySelect(null)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="p-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#DAA52033', color: '#DAA520' }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}>
                          {category.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Live Deals</span>
                        <span className="font-medium">{category.liveDealCount}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${progressPercentage}%`,
                            backgroundColor: '#DAA520'
                          }}
                        />
                      </div>
                      
                      {/* Additional category stats */}
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-muted-foreground">{category.medianReturn} returns</span>
                        <Badge 
                          variant={
                            category.medianRisk === "Low" ? "default" :
                            category.medianRisk === "Medium" ? "secondary" : "destructive"
                          }
                          className="text-xs px-2 py-0.5"
                        >
                          {category.medianRisk} Risk
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-lg cursor-pointer transition-all duration-200 border-transparent hover:border-primary/30 hover:bg-primary/5"
                    style={getMetallicCardStyle(theme).style}
                    onClick={() => onCategorySelect(category)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="p-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#DAA52033', color: '#DAA520' }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}>
                          {category.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Live Deals</span>
                        <span className="font-medium">{category.liveDealCount}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${progressPercentage}%`,
                            backgroundColor: '#DAA520'
                          }}
                        />
                      </div>
                      
                      {/* Additional category stats */}
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-muted-foreground">{category.medianReturn} returns</span>
                        <Badge 
                          variant={
                            category.medianRisk === "Low" ? "default" :
                            category.medianRisk === "Medium" ? "secondary" : "destructive"
                          }
                          className="text-xs px-2 py-0.5"
                        >
                          {category.medianRisk} Risk
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </GoldenScroll>
          </div>
        </div>
        
        {/* Right Column - Opportunity List (2 parts) */}
        <div className="md:col-span-1 lg:col-span-3">
          <div className="h-full">
            <div className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  {selectedCategory ? selectedCategory.name : 'All Opportunities'}
                </h3>
                
                {/* Region Filter */}
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[60]" 
                    side="bottom" 
                    align="end" 
                    sideOffset={4}
                    avoidCollisions={true}
                    position="popper"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <GoldenScroll maxHeight="calc(100vh - 400px)">
              {selectedCategory ? (
                <div className="space-y-3">
                  {getFilteredOpportunities(selectedCategory).length > 0 ? (
                    getFilteredOpportunities(selectedCategory).map((opportunity) => {
                      const scoring = opportunityScoring?.getScore ? opportunityScoring.getScore(opportunity.title) : null;
                      return (
                        <OpportunityCard
                          key={opportunity.id}
                          opportunity={opportunity}
                          onClick={() => handleOpportunityClick(opportunity)}
                          isExpanded={opportunity?.id ? expandedOpportunityId === opportunity.id : false}
                          onShare={handleShare}
                          shareState={shareState}
                          onTalkToConcierge={handleTalkToConcierge}
                          conciergeState={conciergeState}
                          scoring={scoring}
                          onOpportunityView={onOpportunityView}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No opportunities found in {regions.find(r => r.id === selectedRegion)?.name || 'selected region'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setSelectedRegion('all')}
                      >
                        Show All Regions
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {getAllFilteredOpportunities().length > 0 ? (
                    getAllFilteredOpportunities().map((opportunity) => {
                      const scoring = opportunityScoring?.getScore ? opportunityScoring.getScore(opportunity.title) : null;
                      return (
                        <OpportunityCard
                          key={opportunity.id}
                          opportunity={opportunity}
                          onClick={() => handleOpportunityClick(opportunity)}
                          isExpanded={opportunity?.id ? expandedOpportunityId === opportunity.id : false}
                          onShare={handleShare}
                          shareState={shareState}
                          onTalkToConcierge={handleTalkToConcierge}
                          conciergeState={conciergeState}
                          scoring={scoring}
                          onOpportunityView={onOpportunityView}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No opportunities found in {regions.find(r => r.id === selectedRegion)?.name || 'selected region'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setSelectedRegion('all')}
                      >
                        Show All Regions
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </GoldenScroll>
          </div>
        </div>
      </div>
      
      {/* Footer disclaimer */}
      <div className="pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          For Information only. HNWI Chronicles is not a broker-dealer
        </p>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              Concierge Notified
            </DialogTitle>
            <DialogDescription>
              Our concierge has been informed about your interest in{" "}
              <span className="font-semibold">{selectedOpportunity?.title}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 p-4 rounded-lg my-4">
            <p className="text-sm">
              Our wealth management specialist will contact you shortly to discuss this investment opportunity in detail
              and answer any questions you may have.
            </p>
            <div className="flex items-center gap-2 mt-3 text-primary">
              <Phone className="h-4 w-4" />
              <p className="text-sm font-medium">Expect a call within 24 hours</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className={`${getMetallicCardStyle(theme).className}`}
              style={{
                ...getMetallicCardStyle(theme).style,
                color: theme === "dark" ? "white" : "black"
              }}
            >
              Continue Exploring
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}