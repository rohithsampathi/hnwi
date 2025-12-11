// components/report/SpiderGraphComparison.tsx
// Multi-dimensional radar/spider chart for peer comparison
// Uses centralized theme colors only

'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { SpiderGraphData, ImprovementArea } from '@/types/assessment-report';

interface SpiderGraphComparisonProps {
  data: SpiderGraphData;
}

export function SpiderGraphComparison({ data }: SpiderGraphComparisonProps) {
  const { dimensions, user_scores, peer_average, top_performers, improvement_areas, hnwi_world_count } = data;
  const svgRef = useRef<SVGSVGElement>(null);
  const [themeKey, setThemeKey] = useState(0);

  // Compute theme-aware colors at component level for use in both SVG and legend
  const getProfileColor = () => {
    if (typeof window === 'undefined') return '#3b82f6'; // SSR fallback
    const style = getComputedStyle(document.documentElement);
    const primaryHSL = style.getPropertyValue('--primary').trim();
    return primaryHSL ? `hsl(${primaryHSL})` : '#3b82f6';
  };

  // Detect theme changes and force re-render
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeKey(prev => prev + 1);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !dimensions.length) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2 - 80;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create scales
    const angleScale = d3.scaleLinear()
      .domain([0, dimensions.length])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius]);

    // Premium HNWI color scheme - Theme-aware
    const style = getComputedStyle(document.documentElement);
    const primaryHSL = style.getPropertyValue('--primary').trim();
    const backgroundHSL = style.getPropertyValue('--background').trim();

    // Detect theme mode (light vs dark) by parsing lightness value
    // HSL format: "H S% L%" or "H, S%, L%" or "Hdeg S% L%" where L is lightness (0-100%)
    // Light mode: L >= 50% (typically 100% for white)
    // Dark mode: L < 50% (typically 0-20% for black/dark)
    // Match the last percentage value in the string (lightness)
    const lightnessMatch = backgroundHSL.match(/(\d+)%(?:\s*\)|$)/g);
    const lightnessValue = lightnessMatch && lightnessMatch.length > 0
      ? lightnessMatch[lightnessMatch.length - 1].match(/(\d+)/)
      : null;
    const lightness = lightnessValue ? parseInt(lightnessValue[1]) : 100; // Default to light mode
    const isDarkMode = lightness < 50;

    // Premium colors - vibrant and sophisticated
    const primaryColor = primaryHSL ? `hsl(${primaryHSL})` : '#3b82f6'; // Fallback to vibrant blue

    // USER PROFILE COLOR - Black in light mode, Primary in dark mode
    const userProfileColor = isDarkMode ? primaryColor : '#000000';

    // TEXT COLOR - Gold (primary) in dark mode, Black in light mode
    const textColor = isDarkMode ? primaryColor : '#000000';

    // TOP 0.1% COLOR - Grey in both modes
    const topPerformersColor = '#9CA3AF'; // Grey
    const platinumGray = '#E5E4E2';

    // Add subtle radial gradient background for depth
    const defs = svg.append('defs');

    const radialGradient = defs.append('radialGradient')
      .attr('id', 'spider-bg-gradient');
    radialGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', userProfileColor)
      .attr('stop-opacity', 0.05);
    radialGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', userProfileColor)
      .attr('stop-opacity', 0);

    // Background circle
    svg.append('circle')
      .attr('r', radius)
      .attr('fill', 'url(#spider-bg-gradient)');

    // Draw premium circular grid with gradients
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      svg.append('circle')
        .attr('r', (radius / levels) * i)
        .attr('fill', 'none')
        .attr('stroke', i === levels ? topPerformersColor : platinumGray)
        .attr('stroke-width', i === levels ? 2 : 1)
        .attr('stroke-opacity', i === levels ? 0.5 : 0.2)
        .attr('stroke-dasharray', i === levels ? 'none' : '4,4');

      // Add percentage labels with better styling
      if (i < levels) {
        svg.append('text')
          .attr('x', 5)
          .attr('y', -(radius / levels) * i)
          .attr('fill', textColor)
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .attr('opacity', 0.7)
          .text(`${(i / levels * 100).toFixed(0)}%`);
      }
    }

    // Draw premium axes
    dimensions.forEach((dim, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const lineEnd = radiusScale(1);

      svg.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', Math.cos(angle) * lineEnd)
        .attr('y2', Math.sin(angle) * lineEnd)
        .attr('stroke', platinumGray)
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.3);

      // Add labels with text wrapping for long labels
      const labelRadius = radius + 40;
      const words = dim.split(' ');
      const labelGroup = svg.append('g')
        .attr('transform', `translate(${Math.cos(angle) * labelRadius}, ${Math.sin(angle) * labelRadius})`);

      // Premium label styling - Theme-aware
      if (words.length > 2 || dim.length > 18) {
        const midpoint = Math.ceil(words.length / 2);
        const line1 = words.slice(0, midpoint).join(' ');
        const line2 = words.slice(midpoint).join(' ');

        labelGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '-0.3em')
          .attr('fill', textColor)
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .attr('letter-spacing', '0.5px')
          .text(line1);

        labelGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '1em')
          .attr('fill', textColor)
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .attr('letter-spacing', '0.5px')
          .text(line2);
      } else {
        labelGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', textColor)
          .attr('font-size', '13px')
          .attr('font-weight', '700')
          .attr('letter-spacing', '0.5px')
          .text(dim);
      }
    });

    // Function to create path data
    const createPathData = (scores: number[]) => {
      const points = scores.map((score, i) => {
        const angle = angleScale(i) - Math.PI / 2;
        return {
          x: Math.cos(angle) * radiusScale(score),
          y: Math.sin(angle) * radiusScale(score)
        };
      });

      // Close the path by adding the first point at the end
      points.push(points[0]);

      const lineGenerator = d3.line<{ x: number; y: number }>()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveLinearClosed);

      return lineGenerator(points);
    };

    // Add glow effect filter
    const filter = defs.append('filter')
      .attr('id', 'glow');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw top 0.1% performers area (SUBTLE BENCHMARK - DIM)
    svg.append('path')
      .attr('d', createPathData(top_performers))
      .attr('fill', topPerformersColor)
      .attr('fill-opacity', 0.03)
      .attr('stroke', topPerformersColor)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8,4')
      .attr('stroke-opacity', 0.3);

    // Draw peer average area - subtle platinum
    svg.append('path')
      .attr('d', createPathData(peer_average))
      .attr('fill', platinumGray)
      .attr('fill-opacity', 0.08)
      .attr('stroke', platinumGray)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.3);

    // Draw user scores (BRIGHT & PROMINENT - YOUR PROFILE)
    svg.append('path')
      .attr('d', createPathData(user_scores))
      .attr('fill', userProfileColor)
      .attr('fill-opacity', 0.45)
      .attr('stroke', userProfileColor)
      .attr('stroke-width', 5)
      .attr('filter', 'url(#glow)');

    // Add prominent data points for user scores (BRIGHT)
    user_scores.forEach((score, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const r = radiusScale(score);

      // Outer glow circle (enhanced)
      svg.append('circle')
        .attr('cx', Math.cos(angle) * r)
        .attr('cy', Math.sin(angle) * r)
        .attr('r', 12)
        .attr('fill', userProfileColor)
        .attr('opacity', 0.35);

      // Main data point (larger and brighter)
      svg.append('circle')
        .attr('cx', Math.cos(angle) * r)
        .attr('cy', Math.sin(angle) * r)
        .attr('r', 7)
        .attr('fill', userProfileColor)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 3.5)
        .attr('filter', 'url(#glow)');
    });

  }, [dimensions, user_scores, top_performers, themeKey]);

  return (
    <div className="relative bg-gradient-to-br from-card via-card to-card/50 rounded-2xl overflow-hidden border border-primary/20 shadow-2xl mb-8">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-6 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
              Multi-Dimensional Performance Analysis
            </h2>
            <p className="text-sm text-muted-foreground">
              {hnwi_world_count
                ? `Benchmarked against ${hnwi_world_count.toLocaleString()} HNWI World developments • Since Feb 2023`
                : `${dimensions.length} key dimensions analyzed`
              }
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6 px-4">
            <LegendItem label="Your Profile" color="currentColor" className="dark:text-primary text-black" />
            <LegendItem label="Top 0.1%" color="#9CA3AF" border="dashed" />
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative px-8 py-8 bg-gradient-to-b from-transparent to-muted/10">
        <div className="flex justify-center">
          <svg ref={svgRef} className="max-w-full h-auto drop-shadow-lg" />
        </div>

        {/* Mobile Legend */}
        <div className="flex md:hidden justify-center gap-6 mt-6 pt-6 border-t border-border">
          <LegendItem label="Your Profile" color="currentColor" className="dark:text-primary text-black" />
          <LegendItem label="Top 0.1%" color="#9CA3AF" border="dashed" />
        </div>
      </div>

      {/* Premium Improvement Areas - FOMO Redesign */}
      {improvement_areas && improvement_areas.length > 0 && (
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-xl border border-primary/20 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Critical Performance Gaps
                </h3>
                <p className="text-sm text-muted-foreground">
                  Where top 0.1% peers are outperforming your positioning
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border">
                <span className="text-xs font-semibold text-muted-foreground">PRIORITY</span>
                <span className="text-xs font-bold text-primary">{Math.min(3, improvement_areas.length)} GAPS</span>
              </div>
            </div>
            <div className="space-y-4">
              {improvement_areas.slice(0, 3).map((area, i) => (
                <div
                  key={i}
                  className="group relative bg-card/80 backdrop-blur-sm rounded-lg p-5 border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
                >
                  {/* Rank Badge */}
                  <div className="absolute -left-2 -top-2 w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                    <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                  </div>

                  <div className="ml-4 space-y-4">
                    {/* Header */}
                    <div>
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                        {area.dimension}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        You're {(area.improvement_potential || 0).toFixed(0)}% behind top 0.1% benchmark
                      </p>
                    </div>

                    {/* Performance Gap Visual */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Your Position</span>
                        <span className="text-muted-foreground">Top 0.1%</span>
                      </div>
                      <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                        {/* Your score */}
                        <div
                          className="absolute inset-y-0 left-0 bg-foreground/40 rounded-full"
                          style={{ width: `${(area.current_score * 100).toFixed(0)}%` }}
                        />
                        {/* Target line */}
                        <div
                          className="absolute inset-y-0 bg-primary rounded-full"
                          style={{
                            left: `${(area.current_score * 100).toFixed(0)}%`,
                            width: `${((area.target_score - area.current_score) * 100).toFixed(0)}%`
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-medium text-foreground">
                          {(area.current_score * 100).toFixed(0)}%
                        </span>
                        <span className="font-mono font-bold text-primary">
                          {(area.target_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Peer Context - FOMO */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50">
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-primary">+{(area.improvement_potential || 0).toFixed(0)}%</div>
                        <div className="text-[10px] text-muted-foreground">Gap to Close</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-foreground">Top 0.1%</div>
                        <div className="text-[10px] text-muted-foreground">Benchmark</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-foreground">High</div>
                        <div className="text-[10px] text-muted-foreground">Priority</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Footer - FOMO Trigger */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-semibold text-primary">Closing these gaps</span> would position you within the top 0.1% of peer cohort performance benchmarks
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface LegendItemProps {
  label: string;
  color: string;
  border?: 'solid' | 'dashed';
  className?: string;
}

function LegendItem({ label, color, border = 'solid', className }: LegendItemProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className || ''}`}>
      <div
        className={`w-3 h-3 rounded-sm shadow-sm ${border === 'dashed' ? 'border-2 border-dashed opacity-60' : ''}`}
        style={{
          backgroundColor: color,
          borderColor: border === 'dashed' ? color : undefined
        }}
      />
      <span className="text-foreground text-sm font-medium tracking-wide">{label}</span>
    </div>
  );
}
