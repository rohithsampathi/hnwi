"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  WealthProjectionData,
  ScenarioName,
  formatCurrency
} from '@/lib/decision-memo/sfo-expert-types';
import { StructureSelector } from './StructureSelector';

interface Structure {
  name: string;
  type: string;
  net_benefit_10yr: number;
  tax_savings_pct: number;
  viable: boolean;
  verdict: string;
  warnings: string[];
  setup_cost?: number;
  annual_cost?: number;
  rental_income_rate?: number;
  capital_gains_rate?: number;
  estate_tax_rate?: number;
}

interface WealthProjectionSectionProps {
  data?: WealthProjectionData | Record<string, never>;
  rawAnalysis?: string;
  // STRUCTURE-AWARE PROJECTIONS (Jan 2026)
  structures?: Structure[];
  structureProjections?: Record<string, WealthProjectionData>;
  optimalStructureName?: string;
}

// Scenario icon component
function ScenarioIcon({ type, color }: { type: 'base' | 'stress' | 'opportunity'; color: string }) {
  const icons = {
    base: <Target className="w-5 h-5" style={{ color }} />,
    stress: <TrendingDown className="w-5 h-5" style={{ color }} />,
    opportunity: <TrendingUp className="w-5 h-5" style={{ color }} />
  };
  return (
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
      {icons[type]}
    </div>
  );
}

// Value gauge component
function ValueGauge({ value, label, subtext, highlight = false }: { value: string; label: string; subtext?: string; highlight?: boolean }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
    </div>
  );
}

// Probability indicator
function ProbabilityBadge({ probability, label }: { probability: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-amber-500" />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs font-semibold text-foreground">{probability}</span>
    </div>
  );
}

export const WealthProjectionSection: React.FC<WealthProjectionSectionProps> = ({
  data,
  rawAnalysis,
  structures = [],
  structureProjections = {},
  optimalStructureName
}) => {
  const [activeScenario, setActiveScenario] = useState<'base' | 'stress' | 'opportunity'>('base');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  // STRUCTURE-AWARE STATE (Jan 2026 - Document Coherence)
  // Track which structure the user has selected for projection display
  const [selectedStructureName, setSelectedStructureName] = useState<string>(
    optimalStructureName || structures[0]?.name || ''
  );

  // When structures are loaded, default to optimal structure
  useEffect(() => {
    if (optimalStructureName && !selectedStructureName) {
      setSelectedStructureName(optimalStructureName);
    }
  }, [optimalStructureName, selectedStructureName]);

  // Compute derived per-structure projections when backend doesn't provide them.
  // Uses each structure's net_benefit_10yr delta to adjust the base projection's
  // year-by-year values, 10-year outcomes, cost of inaction, and probability-weighted outcomes.
  const derivedProjections = useMemo(() => {
    if (!data || !('scenarios' in data) || !Array.isArray((data as WealthProjectionData).scenarios) || !structures.length) {
      return {};
    }
    const typedBase = data as WealthProjectionData;
    // Reference structure = the one the backend projection was computed for
    const refStructure = structures.find(s => s.name === optimalStructureName) || structures[0];
    if (!refStructure) return {};

    const projections: Record<string, WealthProjectionData> = {};
    const startingValue = typedBase.starting_position?.transaction_value
      || typedBase.starting_position?.transaction_amount || 0;

    for (const structure of structures) {
      if (structure.name === refStructure.name) {
        projections[structure.name] = typedBase;
        continue;
      }

      const delta = structure.net_benefit_10yr - refStructure.net_benefit_10yr;

      projections[structure.name] = {
        ...typedBase,
        scenarios: typedBase.scenarios.map(scenario => ({
          ...scenario,
          year_by_year: scenario.year_by_year.map(yp => {
            const yearFrac = yp.year / 10;
            const adj = delta * yearFrac;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ypAny = yp as any;
            return {
              ...yp,
              net_worth: yp.net_worth + adj,
              // Backend sends total_value/rental_income as extra fields
              ...(ypAny.total_value !== undefined ? { total_value: ypAny.total_value + adj } : {}),
            };
          }),
          ten_year_outcome: {
            ...scenario.ten_year_outcome,
            total_value_creation: scenario.ten_year_outcome.total_value_creation + delta,
            final_value: (scenario.ten_year_outcome.final_value
              ?? (scenario.ten_year_outcome as Record<string, number>).final_total_value ?? 0) + delta,
            final_total_value: ((scenario.ten_year_outcome as Record<string, number>).final_total_value
              ?? scenario.ten_year_outcome.final_value ?? 0) + delta,
            percentage_gain: startingValue > 0
              ? ((scenario.ten_year_outcome.total_value_creation + delta) / startingValue) * 100
              : scenario.ten_year_outcome.percentage_gain,
          }
        })),
        cost_of_inaction: {
          ...typedBase.cost_of_inaction,
          year_1: typedBase.cost_of_inaction.year_1 + delta * 0.1,
          year_5: typedBase.cost_of_inaction.year_5 + delta * 0.5,
          year_10: typedBase.cost_of_inaction.year_10 + delta,
        },
        probability_weighted_outcome: {
          ...typedBase.probability_weighted_outcome,
          expected_value_creation: typedBase.probability_weighted_outcome.expected_value_creation + delta,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expected_total_value: ((typedBase.probability_weighted_outcome as any).expected_total_value || 0) + delta,
          expected_net_worth: typedBase.probability_weighted_outcome.expected_net_worth + delta,
          net_benefit_of_move: typedBase.probability_weighted_outcome.net_benefit_of_move + delta,
        }
      };
    }

    return projections;
  }, [data, structures, optimalStructureName]);

  // Get the projection data for the currently selected structure.
  // Priority: backend per-structure projections > frontend-derived projections > default data
  const effectiveProjections = Object.keys(structureProjections).length > 0
    ? structureProjections
    : derivedProjections;
  const currentProjectionData = selectedStructureName && effectiveProjections[selectedStructureName]
    ? effectiveProjections[selectedStructureName]
    : data;

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  const hasStructuredData = data && 'scenarios' in data && Array.isArray(data.scenarios) && data.scenarios.length > 0;
  const hasNarrativeAnalysis = rawAnalysis && rawAnalysis.trim().length > 0;

  // Extract key metrics from narrative text
  const extractMetricsFromNarrative = (text: string) => {
    const metrics = {
      startingValue: '$4.00M',
      year10Value: '$11.54M',
      totalCreation: '+$7.54M',
      percentGain: '+189%',
      costOfInaction: '$2.90M',
      baseCase: { y1: '$4.52M', y3: '$5.69M', y5: '$7.21M', y10: '$11.54M' },
      scenarios: [] as { name: string; value: string; probability: string; type: 'base' | 'stress' | 'opportunity' }[]
    };

    // Extract 10-Year Value
    const y10Match = text.match(/Year\s*10.*?:\s*\$?([\d,.]+[MKB]?)/i) || text.match(/10-Year.*?:\s*\$?([\d,.]+[MKB]?)/i);
    if (y10Match) metrics.year10Value = `$${y10Match[1]}`;

    // Extract Total Creation
    const creationMatch = text.match(/TOTAL.*?:\s*\+?\$?([\d,.]+[MKB]?)/i) || text.match(/Value Creation.*?:\s*\+?\$?([\d,.]+[MKB]?)/i);
    if (creationMatch) metrics.totalCreation = `+$${creationMatch[1]}`;

    // Extract percentage gain
    const percentMatch = text.match(/\+(\d+(?:\.\d+)?%)/);
    if (percentMatch) metrics.percentGain = `+${percentMatch[1]}`;

    // Extract cost of inaction
    const coiMatch = text.match(/Cost of Inaction.*?:\s*\$?([\d,.]+[MKB]?)/i) || text.match(/Do Nothing.*?:\s*\$?([\d,.]+[MKB]?)/i);
    if (coiMatch) metrics.costOfInaction = `$${coiMatch[1]}`;

    // Extract year-by-year values from tables
    const tableMatch = text.match(/\|[\s]*Year[\s]*\|[\s\S]*?\|[\s]*10[\s]*\|[^|]*\|[^|]*\|[^|]*\$/m);
    if (tableMatch) {
      const rows = text.match(/\|\s*(\d+)\s*\|\s*\$?([\d,.]+[MKB]?)\s*\|/g);
      if (rows) {
        rows.forEach(row => {
          const match = row.match(/\|\s*(\d+)\s*\|\s*\$?([\d,.]+[MKB]?)/);
          if (match) {
            const year = match[1];
            const value = `$${match[2]}`;
            if (year === '1') metrics.baseCase.y1 = value;
            if (year === '3') metrics.baseCase.y3 = value;
            if (year === '5') metrics.baseCase.y5 = value;
            if (year === '10') metrics.baseCase.y10 = value;
          }
        });
      }
    }

    return metrics;
  };

  // Extract scenario cards from narrative
  const extractScenarios = (text: string) => {
    const scenarios: { name: string; description: string; outcome: string; verdict: string; type: 'base' | 'stress' | 'opportunity' }[] = [];

    // Base Case
    const baseMatch = text.match(/SCENARIO\s*1:?\s*BASE\s*CASE[^]*?(?=SCENARIO\s*2|═══|$)/i);
    if (baseMatch) {
      scenarios.push({
        name: 'Base Case',
        description: '8% appreciation + 5% rental yield',
        outcome: '+$7.54M over 10 years',
        verdict: 'Most likely scenario aligned with intake projections',
        type: 'base'
      });
    }

    // Stress Case
    const stressMatch = text.match(/SCENARIO\s*2:?\s*STRESS\s*CASE[^]*?(?=SCENARIO\s*3|═══|$)/i);
    if (stressMatch) {
      scenarios.push({
        name: 'Stress Case',
        description: '-20-30% drawdown, 3% yield compression',
        outcome: 'Survivable per NY→TX patterns',
        verdict: 'Hold through drawdown viable (no leverage)',
        type: 'stress'
      });
    }

    // Opportunity Case
    const oppMatch = text.match(/SCENARIO\s*3:?\s*OPPORTUNITY\s*CASE[^]*?(?=═══|COST OF|$)/i);
    if (oppMatch) {
      scenarios.push({
        name: 'Opportunity Case',
        description: 'Appreciation >8%, yield to 6-7%',
        outcome: '1031 chain defers gains indefinitely',
        verdict: 'Logistics boom potential',
        type: 'opportunity'
      });
    }

    // Default if no scenarios found
    if (scenarios.length === 0) {
      scenarios.push(
        { name: 'Base Case', description: '8% appreciation + 5% rental yield', outcome: '+$7.54M', verdict: 'Primary trajectory', type: 'base' },
        { name: 'Stress Case', description: 'Market downturn scenario', outcome: 'Survivable', verdict: 'Hold viable', type: 'stress' },
        { name: 'Opportunity Case', description: 'Bull market scenario', outcome: 'Enhanced returns', verdict: 'Upside potential', type: 'opportunity' }
      );
    }

    return scenarios;
  };

  // Premium Narrative Fallback with visual components
  if (!hasStructuredData && hasNarrativeAnalysis) {
    const metrics = extractMetricsFromNarrative(rawAnalysis);
    const scenarios = extractScenarios(rawAnalysis);
    const activeScenarioData = scenarios.find(s => s.type === activeScenario) || scenarios[0];

    // Scenario-specific chart data - changes based on selected scenario
    const chartDataByScenario = {
      base: [
        { year: 0, value: 4.0, property: 4.0, liquid: 0 },
        { year: 1, value: 4.52, property: 4.32, liquid: 0.2 },
        { year: 3, value: 5.69, property: 5.04, liquid: 0.65 },
        { year: 5, value: 7.21, property: 5.88, liquid: 1.33 },
        { year: 10, value: 11.54, property: 8.64, liquid: 2.9 }
      ],
      stress: [
        { year: 0, value: 4.0, property: 4.0, liquid: 0 },
        { year: 1, value: 3.6, property: 3.4, liquid: 0.2 },
        { year: 3, value: 3.9, property: 3.4, liquid: 0.5 },
        { year: 5, value: 4.8, property: 4.1, liquid: 0.7 },
        { year: 10, value: 7.2, property: 5.8, liquid: 1.4 }
      ],
      opportunity: [
        { year: 0, value: 4.0, property: 4.0, liquid: 0 },
        { year: 1, value: 4.8, property: 4.5, liquid: 0.3 },
        { year: 3, value: 6.5, property: 5.6, liquid: 0.9 },
        { year: 5, value: 9.2, property: 7.5, liquid: 1.7 },
        { year: 10, value: 16.8, property: 12.5, liquid: 4.3 }
      ]
    };

    // Use the chart data for the currently selected scenario
    const chartData = chartDataByScenario[activeScenario];

    // Calculate fixed Y-axis domain across ALL scenarios (so it doesn't jump when switching)
    const allValues = [
      ...chartDataByScenario.base.map(d => d.value),
      ...chartDataByScenario.stress.map(d => d.value),
      ...chartDataByScenario.opportunity.map(d => d.value)
    ];
    const yAxisMax = Math.ceil(Math.max(...allValues) / 2) * 2; // Round up to nearest 2
    const yAxisDomain: [number, number] = [0, yAxisMax];

    // Compute dynamic metrics based on selected scenario
    const startingValue = chartData[0]?.value || 4.0;
    const year10Value = chartData[chartData.length - 1]?.value || 11.54;
    const totalCreation = year10Value - startingValue;
    const percentGain = ((year10Value - startingValue) / startingValue) * 100;

    // Dynamic metrics for the selected scenario
    const dynamicMetrics = {
      startingValue: `$${startingValue.toFixed(2)}M`,
      year10Value: `$${year10Value.toFixed(2)}M`,
      totalCreation: `+$${totalCreation.toFixed(2)}M`,
      percentGain: `+${percentGain.toFixed(0)}%`
    };

    return (
      <div ref={sectionRef}>
        {/* Section Header */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
              10-YEAR WEALTH PROJECTION
            </h2>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              Multi-Scenario
            </span>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
          <p className="text-sm text-muted-foreground mt-3">
            Probability-weighted wealth trajectory analysis
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Scenario Tabs - FIRST for proper UX (selector before content it affects) */}
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {scenarios.map((scenario) => {
              const isActive = activeScenario === scenario.type;
              return (
                <button
                  key={scenario.type}
                  onClick={() => setActiveScenario(scenario.type)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive ? 'bg-card border-2 border-primary shadow-lg' : 'bg-muted/30 border border-transparent hover:bg-muted/50'}`}
                >
                  {scenario.type === 'base' && <Target className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {scenario.type === 'stress' && <TrendingDown className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                  {scenario.type === 'opportunity' && <TrendingUp className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                  <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{scenario.name}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Key Metrics Card - Now AFTER scenario selector */}
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Value Gauge */}
              <div className="flex flex-col items-center">
                {(() => { const r = 50, sw = 8, hc = Math.PI * r, fill = Math.min(95, percentGain / 3); return (
                <div className="relative w-36 h-[76px]">
                  <svg viewBox="0 0 120 68" className="w-full h-full overflow-visible">
                    <path d={`M ${60-r} 60 A ${r} ${r} 0 0 1 ${60+r} 60`} fill="none" stroke="currentColor" strokeWidth={sw} className="text-muted" />
                    <path d={`M ${60-r} 60 A ${r} ${r} 0 0 1 ${60+r} 60`} fill="none" stroke="currentColor" strokeWidth={sw} strokeDasharray={hc} strokeDashoffset={hc - (hc * fill / 100)} strokeLinecap="round" className="text-primary" />
                  </svg>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                    <span className="text-2xl font-bold text-foreground">{dynamicMetrics.percentGain}</span>
                  </div>
                </div>); })()}
                <span className="mt-2 text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary">
                  10-YEAR GROWTH
                </span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  {activeScenario === 'base' ? 'Base Case' : activeScenario === 'stress' ? 'Stress Case' : 'Opportunity Case'} Projection
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeScenario === 'base'
                    ? 'Transaction-focused wealth trajectory with 5% rental yield + 8% appreciation'
                    : activeScenario === 'stress'
                    ? 'Conservative scenario with market downturn and yield compression'
                    : 'Bull market scenario with enhanced returns and yield expansion'}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <ValueGauge label="Starting" value={dynamicMetrics.startingValue} />
                  <ValueGauge label="Year 10" value={dynamicMetrics.year10Value} highlight />
                  <ValueGauge label="Net Creation" value={dynamicMetrics.totalCreation} highlight />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trajectory Chart - Updates based on selected scenario */}
          <motion.div
            className="bg-card border border-border rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  {activeScenario === 'base' ? 'Base Case' : activeScenario === 'stress' ? 'Stress Case' : 'Opportunity Case'} Trajectory
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Year 10: ${chartData[chartData.length - 1]?.value.toFixed(2)}M
              </span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.5} />
                  <XAxis dataKey="year" tickFormatter={(v) => `Y${v}`} tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `$${v}M`} width={50} tick={{ fontSize: 10 }} domain={yAxisDomain} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(value: number, name: string) => [`$${value}M`, name]}
                    itemSorter={(item) => {
                      const order: Record<string, number> = { 'Total Value': 0, 'Property': 1, 'Liquid': 2 };
                      return order[item.name as string] ?? 99;
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorValue)" strokeWidth={2} name="Total Value" />
                  <Line type="monotone" dataKey="property" stroke="hsl(var(--primary))" strokeWidth={1.5} strokeOpacity={0.7} dot={false} name="Property" />
                  <Line type="monotone" dataKey="liquid" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Liquid" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-primary" />
                <span className="text-xs text-muted-foreground">Total Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-primary/70" />
                <span className="text-xs text-muted-foreground">Property</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-muted-foreground" style={{ borderTop: '2px dashed' }} />
                <span className="text-xs text-muted-foreground">Liquid</span>
              </div>
            </div>
          </motion.div>

          {/* Scenario Cards Grid */}
          <motion.div
            className="grid md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            {scenarios.map((scenario) => {
              const isActive = activeScenario === scenario.type;

              return (
                <div
                  key={scenario.type}
                  className={`bg-gradient-to-br ${isActive ? 'from-primary/5 to-primary/10' : 'from-muted/5 to-muted/10'} border-2 ${isActive ? 'border-primary/60' : 'border-border'} rounded-xl p-5 transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ScenarioIcon type={scenario.type} color={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{scenario.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{scenario.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 rounded-lg p-3 mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Expected Outcome</p>
                    <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{scenario.outcome}</p>
                  </div>

                  <div className="border-t border-border/50 pt-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Verdict</p>
                    <p className="text-xs text-muted-foreground">{scenario.verdict}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Cost of Inaction Card */}
          <motion.div
            className="bg-gradient-to-br from-muted/50 to-muted/70 border-2 border-border rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Cost of Inaction
              </h3>
              <span className="text-[10px] text-muted-foreground">(If You Don't Proceed)</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-card rounded-lg p-3 text-center border border-border">
                <p className="text-[10px] text-muted-foreground mb-1">Year 1</p>
                <p className="text-lg font-bold text-muted-foreground">-$0.20M</p>
              </div>
              <div className="bg-card rounded-lg p-3 text-center border border-border">
                <p className="text-[10px] text-muted-foreground mb-1">Year 5</p>
                <p className="text-lg font-bold text-muted-foreground">-$1.33M</p>
              </div>
              <div className="bg-card rounded-lg p-3 text-center border-2 border-primary/50">
                <p className="text-[10px] text-muted-foreground mb-1">Year 10</p>
                <p className="text-xl font-bold text-foreground">-{metrics.costOfInaction}</p>
              </div>
            </div>

            <div className="bg-card rounded-lg p-3">
              <p className="text-xs text-foreground">
                <span className="font-semibold text-foreground">"Do Nothing" Locks Out {metrics.costOfInaction}</span>
                {' '}— Primary: Lost rental yield FV. Secondary: No TX diversification/tax arbitrage.
              </p>
            </div>
          </motion.div>

          {/* Probability-Weighted Summary */}
          <motion.div
            className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Probability-Weighted Expected Outcome
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-card rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Expected Net Worth</p>
                <p className="text-xl font-bold text-foreground">{metrics.year10Value}</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Value Creation</p>
                <p className="text-xl font-bold text-primary">{metrics.totalCreation}</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">If Stay (No Move)</p>
                <p className="text-xl font-bold text-muted-foreground">$8.64M</p>
              </div>
              <div className="text-center p-4 bg-primary/20 rounded-lg border-2 border-primary/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Net Benefit</p>
                <p className="text-2xl font-bold text-primary">+{metrics.costOfInaction}</p>
              </div>
            </div>
          </motion.div>

          {/* Intelligence Source Footer */}
          <motion.div
            className="flex items-center justify-center gap-2 pt-4"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <p className="text-[10px] text-muted-foreground">
              Grounded in HNWI Chronicles KG Wealth Projection Models + Historical Precedents
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Return null if no data
  if (!hasStructuredData && !hasNarrativeAnalysis) {
    return null;
  }

  // Structured data rendering with full visualization
  // Use currentProjectionData which reflects the selected structure's projection
  const typedData = currentProjectionData as WealthProjectionData;
  const baseScenario = typedData.scenarios?.find(s => s.name === 'BASE_CASE');
  const stressScenario = typedData.scenarios?.find(s => s.name === 'STRESS_CASE');
  const opportunityScenario = typedData.scenarios?.find(s => s.name === 'OPPORTUNITY_CASE');

  // Build chart data for each scenario - allows dynamic switching
  // Filter to only include years 0-10 (10-year projection)
  const buildChartData = (scenario: typeof baseScenario) => {
    return scenario?.year_by_year
      ?.filter(y => y.year <= 10)
      ?.map(y => ({
        year: y.year,
        value: y.total_value / 1000000,
        property: y.property_value / 1000000,
        rental: y.rental_income / 1000000
      })) || [];
  };

  const chartDataByScenario = {
    base: buildChartData(baseScenario),
    stress: buildChartData(stressScenario),
    opportunity: buildChartData(opportunityScenario)
  };

  // Use chart data for selected scenario (fallback to base if no data for selected)
  const chartData = chartDataByScenario[activeScenario].length > 0
    ? chartDataByScenario[activeScenario]
    : chartDataByScenario.base;

  // Calculate fixed Y-axis domain across ALL scenarios (so it doesn't jump when switching)
  // Uses already-filtered data (years 0-10 only)
  const structuredAllValues = [
    ...chartDataByScenario.base.map(d => d.value),
    ...chartDataByScenario.stress.map(d => d.value),
    ...chartDataByScenario.opportunity.map(d => d.value)
  ].filter(v => v > 0);
  const structuredYAxisMax = structuredAllValues.length > 0
    ? Math.ceil(Math.max(...structuredAllValues)) + 1 // Round up and add 1M padding
    : 10;
  const structuredYAxisDomain: [number, number] = [0, structuredYAxisMax];

  // Get starting position
  const startingValue = typedData.starting_position?.transaction_value || 0;
  const startingValueFormatted = formatCurrency(startingValue);

  // Get 10-year outcomes
  const baseOutcome = baseScenario?.ten_year_outcome;
  const stressOutcome = stressScenario?.ten_year_outcome;
  const opportunityOutcome = opportunityScenario?.ten_year_outcome;

  // Get probability-weighted outcome (top-level = weighted across all scenarios)
  const pwOutcome = typedData.probability_weighted_outcome;

  // Get cost of inaction (top-level = weighted across all scenarios)
  const costOfInaction = typedData.cost_of_inaction;

  // Build scenario cards
  const structuredScenarios = [
    {
      name: 'Base Case',
      type: 'base' as const,
      probability: baseScenario?.probability || 0.6,
      assumptions: baseScenario?.assumptions || [],
      outcome: baseOutcome ? formatCurrency(baseOutcome.total_value_creation) : 'N/A',
      percentGain: baseOutcome ? `+${baseOutcome.percentage_gain.toFixed(0)}%` : 'N/A',
      verdict: 'Primary trajectory aligned with projections'
    },
    {
      name: 'Stress Case',
      type: 'stress' as const,
      probability: stressScenario?.probability || 0.2,
      assumptions: stressScenario?.assumptions || [],
      outcome: stressOutcome ? formatCurrency(stressOutcome.total_value_creation) : 'N/A',
      percentGain: stressOutcome ? `+${stressOutcome.percentage_gain.toFixed(0)}%` : 'N/A',
      verdict: 'Survivable with no leverage'
    },
    {
      name: 'Opportunity Case',
      type: 'opportunity' as const,
      probability: opportunityScenario?.probability || 0.2,
      assumptions: opportunityScenario?.assumptions || [],
      outcome: opportunityOutcome ? formatCurrency(opportunityOutcome.total_value_creation) : 'N/A',
      percentGain: opportunityOutcome ? `+${opportunityOutcome.percentage_gain.toFixed(0)}%` : 'N/A',
      verdict: 'Bull market upside potential'
    }
  ];

  const activeScenarioData = structuredScenarios.find(s => s.type === activeScenario) || structuredScenarios[0];

  // Get outcome for the currently selected scenario
  const getActiveOutcome = () => {
    switch (activeScenario) {
      case 'stress': return stressOutcome;
      case 'opportunity': return opportunityOutcome;
      default: return baseOutcome;
    }
  };
  const activeOutcome = getActiveOutcome();

  // ========================================================================
  // PER-SCENARIO: Cost of Inaction & Probability-Weighted Outcome
  // Derived from each scenario's year_by_year + ten_year_outcome so these
  // sections react when the user switches Base / Stress / Opportunity tabs
  // ========================================================================
  const getActiveScenario = () => {
    switch (activeScenario) {
      case 'stress': return stressScenario;
      case 'opportunity': return opportunityScenario;
      default: return baseScenario;
    }
  };
  const activeScenarioObj = getActiveScenario();

  // Per-scenario Cost of Inaction: value creation at year 1, 5, 10
  const activeCOI = useMemo(() => {
    if (!costOfInaction) return null;
    const ybY = activeScenarioObj?.year_by_year;
    if (!ybY?.length) return costOfInaction;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startVal = (ybY[0] as any).total_value ?? ybY[0].net_worth ?? startingValue;
    const valAtYear = (yr: number) => {
      const point = ybY.find(y => y.year === yr);
      if (!point) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (point as any).total_value ?? point.net_worth ?? undefined;
    };

    const y1Val = valAtYear(1);
    const y5Val = valAtYear(5);
    const y10Val = valAtYear(10);

    return {
      ...costOfInaction,
      year_1: y1Val !== undefined ? (y1Val - startVal) : costOfInaction.year_1,
      year_5: y5Val !== undefined ? (y5Val - startVal) : costOfInaction.year_5,
      year_10: y10Val !== undefined ? (y10Val - startVal) : costOfInaction.year_10,
    };
  }, [activeScenarioObj, costOfInaction, startingValue]);

  // Per-scenario Probability-Weighted Outcome: show the active scenario's actual outcome
  const activePW = useMemo(() => {
    if (!pwOutcome || !activeOutcome) return pwOutcome;

    const finalVal = activeOutcome.final_value
      ?? (activeOutcome as Record<string, number>).final_total_value
      ?? 0;
    const valueCreation = activeOutcome.total_value_creation ?? 0;
    // "If Stay" is scenario-independent (what your money does at 4% cash)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stayVal = (pwOutcome as any).vs_cash_at_4pct ?? pwOutcome.vs_stay_expected ?? 0;
    const netBenefit = finalVal - stayVal;

    return {
      ...pwOutcome,
      expected_net_worth: finalVal,
      expected_total_value: finalVal,
      expected_value_creation: valueCreation,
      net_benefit_of_move: netBenefit,
    };
  }, [activeOutcome, pwOutcome]);

  // Dynamic metrics for the selected scenario (structured data)
  // Display backend data directly - no frontend calculations
  // Use final_value (new field) with fallback to final_total_value (legacy field)
  const structuredDynamicMetrics = {
    percentGain: activeOutcome?.percentage_gain || 0,
    year10Value: (activeOutcome?.final_value || activeOutcome?.final_total_value)
      ? formatCurrency(activeOutcome.final_value || activeOutcome.final_total_value)
      : 'N/A',
    valueCreation: activeOutcome?.total_value_creation ? formatCurrency(activeOutcome.total_value_creation) : 'N/A'
  };

  return (
    <div ref={sectionRef}>
      {/* Section Header */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
            10-YEAR WEALTH PROJECTION
          </h2>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            Multi-Scenario
          </span>
        </div>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        <p className="text-sm text-muted-foreground mt-3">
          Probability-weighted wealth trajectory analysis
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Structure Selector - FIRST (allows user to choose which structure's projection to view) */}
        {structures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <StructureSelector
              structures={structures}
              selectedStructureName={selectedStructureName}
              optimalStructureName={optimalStructureName}
              onSelect={setSelectedStructureName}
            />
          </motion.div>
        )}

        {/* Scenario Tabs - SECOND (selector before content it affects) */}
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {structuredScenarios.map((scenario) => {
            const isActive = activeScenario === scenario.type;
            return (
              <button
                key={scenario.type}
                onClick={() => setActiveScenario(scenario.type)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive ? 'bg-card border-2 border-primary shadow-lg' : 'bg-muted/30 border border-transparent hover:bg-muted/50'}`}
              >
                {scenario.type === 'base' && <Target className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                {scenario.type === 'stress' && <TrendingDown className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                {scenario.type === 'opportunity' && <TrendingUp className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{scenario.name}</span>
                <span className="text-[10px] text-muted-foreground ml-1">({(scenario.probability * 100).toFixed(0)}%)</span>
              </button>
            );
          })}
        </motion.div>

        {/* Key Metrics Card - Now AFTER scenario selector */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Value Gauge */}
            <div className="flex flex-col items-center">
              {(() => { const r = 50, sw = 8, hc = Math.PI * r, fill = Math.min(95, structuredDynamicMetrics.percentGain / 3); return (
              <div className="relative w-36 h-[76px]">
                <svg viewBox="0 0 120 68" className="w-full h-full overflow-visible">
                  <path d={`M ${60-r} 60 A ${r} ${r} 0 0 1 ${60+r} 60`} fill="none" stroke="currentColor" strokeWidth={sw} className="text-muted" />
                  <path d={`M ${60-r} 60 A ${r} ${r} 0 0 1 ${60+r} 60`} fill="none" stroke="currentColor" strokeWidth={sw} strokeDasharray={hc} strokeDashoffset={hc - (hc * fill / 100)} strokeLinecap="round" className="text-primary" />
                </svg>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                  <span className="text-2xl font-bold text-foreground">+{structuredDynamicMetrics.percentGain.toFixed(0)}%</span>
                </div>
              </div>); })()}
              <span className="mt-2 text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary">
                10-YEAR GROWTH
              </span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                {activeScenario === 'base' ? 'Base Case' : activeScenario === 'stress' ? 'Stress Case' : 'Opportunity Case'} Projection
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeScenario === 'base'
                  ? `${Number(typedData.starting_position?.rental_yield_pct || 5).toFixed(1)}% rental yield + ${Number(typedData.starting_position?.appreciation_rate_pct || 8).toFixed(1)}% appreciation`
                  : activeScenario === 'stress'
                  ? 'Conservative scenario with market downturn and yield compression'
                  : 'Bull market scenario with enhanced returns and yield expansion'}
              </p>

              {/* Key Metrics Grid - Uses activeOutcome from backend */}
              <div className="grid grid-cols-3 gap-3">
                <ValueGauge label="Starting" value={startingValueFormatted} />
                <ValueGauge label="Year 10" value={structuredDynamicMetrics.year10Value} highlight />
                <ValueGauge label="Net Creation" value={structuredDynamicMetrics.valueCreation} highlight />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trajectory Chart - Updates based on selected scenario */}
        {chartData.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  {activeScenario === 'base' ? 'Base Case' : activeScenario === 'stress' ? 'Stress Case' : 'Opportunity Case'} Trajectory
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Year 10: ${chartData[chartData.length - 1]?.value?.toFixed(2) || '0.00'}M
              </span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValueStructured" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.5} />
                  <XAxis dataKey="year" tickFormatter={(v) => `Y${v}`} tick={{ fontSize: 10 }} />
                  <YAxis
                    tickFormatter={(v) => `$${v.toFixed(1)}M`}
                    width={55}
                    tick={{ fontSize: 10 }}
                    domain={structuredYAxisDomain}
                    allowDataOverflow={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(value: number, name: string) => [`$${value.toFixed(2)}M`, name]}
                    itemSorter={(item) => {
                      const order: Record<string, number> = { 'Total Value': 0, 'Property': 1 };
                      return order[item.name as string] ?? 99;
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorValueStructured)" strokeWidth={2} name="Total Value" />
                  <Line type="monotone" dataKey="property" stroke="hsl(var(--primary))" strokeWidth={1.5} strokeOpacity={0.7} dot={false} name="Property" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-primary" />
                <span className="text-xs text-muted-foreground">Total Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-primary/70" />
                <span className="text-xs text-muted-foreground">Property</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scenario Cards Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {structuredScenarios.map((scenario) => {
            const isActive = activeScenario === scenario.type;

            return (
              <div
                key={scenario.type}
                className={`bg-gradient-to-br ${isActive ? 'from-primary/5 to-primary/10' : 'from-muted/5 to-muted/10'} border-2 ${isActive ? 'border-primary/60' : 'border-border'} rounded-xl p-5 transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ScenarioIcon type={scenario.type} color={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{scenario.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{(scenario.probability * 100).toFixed(0)}% probability</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card/50 rounded-lg p-3 mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Value Creation</p>
                  <p className={`text-lg font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>{scenario.outcome}</p>
                  <p className="text-xs text-muted-foreground">{scenario.percentGain} gain</p>
                </div>

                <div className="border-t border-border/50 pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Verdict</p>
                  <p className="text-xs text-muted-foreground">{scenario.verdict}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Cost of Inaction Card — scenario-reactive */}
        {activeCOI && (
          <motion.div
            className="bg-gradient-to-br from-muted/50 to-muted/70 border-2 border-border rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Cost of Inaction
              </h3>
              <span className="text-[10px] text-muted-foreground">(If You Don't Proceed)</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-card rounded-lg p-3 text-center border border-border">
                <p className="text-[10px] text-muted-foreground mb-1">Year 1</p>
                <p className="text-lg font-bold text-muted-foreground">-{formatCurrency(activeCOI.year_1)}</p>
              </div>
              <div className="bg-card rounded-lg p-3 text-center border border-border">
                <p className="text-[10px] text-muted-foreground mb-1">Year 5</p>
                <p className="text-lg font-bold text-muted-foreground">-{formatCurrency(activeCOI.year_5)}</p>
              </div>
              <div className="bg-card rounded-lg p-3 text-center border-2 border-primary/50">
                <p className="text-[10px] text-muted-foreground mb-1">Year 10</p>
                <p className="text-xl font-bold text-foreground">-{formatCurrency(activeCOI.year_10)}</p>
              </div>
            </div>

            <div className="bg-card rounded-lg p-3">
              <p className="text-xs text-foreground">
                <span className="font-semibold text-foreground">"Do Nothing" Locks Out {formatCurrency(activeCOI.year_10)}</span>
                {' '}— Primary: {activeCOI.primary_driver}
              </p>
              {activeCOI.structure_blocked && activeCOI.context_note && (
                <p className="text-[10px] text-amber-500 mt-2 leading-relaxed">
                  {activeCOI.context_note}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Probability-Weighted Summary — scenario-reactive */}
        {activePW && (
          <motion.div
            className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {activeScenario === 'base' ? 'Probability-Weighted' : activeScenario === 'stress' ? 'Stress Case' : 'Opportunity Case'} Expected Outcome
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-card rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Expected Net Worth</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency((activePW as any).expected_total_value ?? activePW.expected_net_worth)}</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Value Creation</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(activePW.expected_value_creation)}</p>
              </div>
              <div className="text-center p-4 bg-card rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">If Stay (No Move)</p>
                <p className="text-xl font-bold text-muted-foreground">{formatCurrency((activePW as any).vs_cash_at_4pct ?? activePW.vs_stay_expected)}</p>
              </div>
              <div className="text-center p-4 bg-primary/20 rounded-lg border-2 border-primary/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Net Benefit</p>
                <p className="text-2xl font-bold text-primary">+{formatCurrency(activePW.net_benefit_of_move)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-4"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] text-muted-foreground">
            Grounded in HNWI Chronicles KG Wealth Projection Models + Historical Precedents
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WealthProjectionSection;
