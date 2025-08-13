"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import { AssetCategoryData, getRiskColor } from "@/lib/opportunity-atlas-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OpportunityAtlasProps {
  categories: AssetCategoryData[];
  selectedCategory: AssetCategoryData | null;
  onCategorySelect: (category: AssetCategoryData | null) => void;
  className?: string;
}

interface TooltipData {
  category: AssetCategoryData;
  x: number;
  y: number;
}

function Tooltip({ category, x, y, isVisible }: TooltipData & { isVisible: boolean }) {
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="absolute z-50 bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px] pointer-events-none"
        style={{
          left: `${x}px`,
          top: `${y - 10}px`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="space-y-2">
          <div className="font-semibold text-sm text-foreground">
            {category.name}
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Live Deals:</span>
              <span className="font-medium">{category.liveDealCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Median Return:</span>
              <span className="font-medium">{category.medianReturn}</span>
            </div>
            <div className="flex justify-between">
              <span>Median Ticket:</span>
              <span className="font-medium">{category.medianTicket}</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Level:</span>
              <span 
                className="font-medium"
                style={{ color: getRiskColor(category.medianRisk) }}
              >
                {category.medianRisk}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function OpportunityAtlas({ 
  categories,
  selectedCategory, 
  onCategorySelect, 
  className = "" 
}: OpportunityAtlasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  
  // Ref to store current selectedCategory for event handlers (avoids stale closure)
  const selectedCategoryRef = useRef(selectedCategory);
  
  // Keep ref in sync with selectedCategory prop
  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);
  
  // Always show all categories (like industry bubbles), but control opacity separately
  const displayCategories = categories;
  const maxDealCount = Math.max(...displayCategories.map(c => c.liveDealCount), 1);
  
  if (categories.length === 0) {
    return (
      <div className={`relative bg-card rounded-lg border border-border ${className}`}>
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
  
  useEffect(() => {
    if (!containerRef.current || displayCategories.length === 0) return;
    
    const updateVisualization = () => {
      // Clear previous
      d3.select(containerRef.current).selectAll("svg").remove();
      
      const container = containerRef.current!;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      const width = container.clientWidth - margin.left - margin.right;
      const height = 320 - margin.top - margin.bottom;
      
      // Calculate bubble sizes - increased for better visibility
      const minRadius = 45;
      const maxRadius = Math.min(100, width / 6);
      
      const radiusScale = d3
        .scaleSqrt()
        .domain([0, maxDealCount])
        .range([minRadius, maxRadius]);
      
      // Create SVG
      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("role", "img")
        .attr("aria-label", "Interactive opportunity atlas showing asset categories")
        .style("outline", "none")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Create force simulation for non-overlapping layout
      const simulation = d3
        .forceSimulation(displayCategories)
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody().strength(-60))
        .force(
          "collide",
          d3
            .forceCollide()
            .radius((d: any) => radiusScale(d.liveDealCount) + 25) // Increased padding
            .strength(1.0) // Maximum strength for no overlaps
            .iterations(6) // More iterations for better separation
        );
      
      // Create bubble groups
      const bubbles = svg
        .selectAll(".bubble")
        .data(displayCategories)
        .enter()
        .append("g")
        .attr("class", "bubble")
        .style("cursor", "pointer")
        .style("outline", "none")
        .style("user-select", "none");
      
      // Add outer ring for risk indication
      bubbles
        .append("circle")
        .attr("class", "risk-ring")
        .attr("r", (d: any) => radiusScale(d.liveDealCount) + (selectedCategoryRef.current?.id === d.id ? 8 : 4))
        .attr("fill", "none")
        .attr("stroke", (d: any) => getRiskColor(d.medianRisk))
        .attr("stroke-width", (d: any) => selectedCategoryRef.current?.id === d.id ? 4 : 2)
        .attr("opacity", 0.8);
      
      // Add main bubbles
      const circles = bubbles
        .append("circle")
        .attr("class", "main-circle")
        .attr("r", (d: any) => radiusScale(d.liveDealCount))
        .attr("fill", (d: any) => d.color)
        .attr("opacity", 0.85)
        .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))")
        .style("outline", "none")
        .style("cursor", "pointer")
        .on("click", (event, d: any) => {
          event.stopPropagation();
          const currentSelection = selectedCategoryRef.current;
          // Toggle selection like wealth radar bubbles
          if (currentSelection && currentSelection.id === d.id) {
            onCategorySelect(null); // Deselect if already selected
          } else {
            onCategorySelect(d); // Select this category
          }
        });
      
      // Add deal count badges
      bubbles
        .append("circle")
        .attr("class", "badge-bg")
        .attr("cx", (d: any) => radiusScale(d.liveDealCount) - 8)
        .attr("cy", (d: any) => -radiusScale(d.liveDealCount) + 8) 
        .attr("r", 12)
        .attr("fill", "rgba(255, 255, 255, 0.95)")
        .attr("stroke", (d: any) => d.color)
        .attr("stroke-width", 2);
      
      bubbles
        .append("text")
        .attr("class", "badge-text")
        .attr("x", (d: any) => radiusScale(d.liveDealCount) - 8)
        .attr("y", (d: any) => -radiusScale(d.liveDealCount) + 8)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", (d: any) => d.color)
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .text((d: any) => d.liveDealCount);
      
      // Add category labels with text wrapping
      bubbles
        .append("text")
        .attr("class", "category-label")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", "600")
        .attr("font-size", (d: any) => Math.min(radiusScale(d.liveDealCount) / 2.5, 16))
        .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.9)")
        .style("stroke", "rgba(0,0,0,0.5)")
        .style("stroke-width", "0.5px")
        .style("paint-order", "stroke fill")
        .style("cursor", "pointer")
        .each(function(d: any) {
          const text = d3.select(this);
          const words = d.name.split(/\s+/);
          const radius = radiusScale(d.liveDealCount);
          const fontSize = Math.min(radius / 2.5, 16);
          const lineHeight = 1.1;
          
          // Clear any existing text
          text.selectAll("tspan").remove();
          
          if (words.length === 1) {
            // Single word - center it
            text.append("tspan")
              .attr("x", 0)
              .attr("y", fontSize / 4)
              .text(words[0]);
          } else {
            // Multiple words - stack them
            const totalHeight = words.length * fontSize * lineHeight;
            const startY = -totalHeight / 2 + fontSize / 2;
            
            words.forEach((word, i) => {
              text.append("tspan")
                .attr("x", 0)
                .attr("y", startY + i * fontSize * lineHeight)
                .text(word);
            });
          }
        })
        .on("click", (event, d: any) => {
          event.stopPropagation();
          const currentSelection = selectedCategoryRef.current;
          // Toggle selection like wealth radar bubbles
          if (currentSelection && currentSelection.id === d.id) {
            onCategorySelect(null); // Deselect if already selected
          } else {
            onCategorySelect(d); // Select this category
          }
        });
      
      // Add interaction handlers
      bubbles
        .style("cursor", "pointer")
        .on("mouseover", function(event, d: any) {
          // Hover effects
          d3.select(this).select(".main-circle")
            .transition()
            .duration(200)
            .attr("opacity", 1)
            .style("filter", "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))");
          
          d3.select(this).select(".risk-ring")
            .transition()
            .duration(200)
            .attr("stroke-width", 3);
          
          // Show tooltip
          const [mouseX, mouseY] = d3.pointer(event, container);
          
          setTooltip({
            category: d,
            x: mouseX,
            y: mouseY
          });
        })
        .on("mouseout", function(event, d: any) {
          // Remove hover effects
          d3.select(this).select(".main-circle")
            .transition()
            .duration(200)
            .attr("opacity", 0.85)
            .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))");
          
          d3.select(this).select(".risk-ring")
            .transition()
            .duration(200)
            .attr("stroke-width", selectedCategoryRef.current?.id === d.id ? 4 : 2);
          
          setTooltip(null);
        });
      
      // Ensure proper event handling on all elements
      bubbles.selectAll("circle")
        .style("pointer-events", "all")
        .style("outline", "none"); // Remove any default focus outline
      
      bubbles.selectAll("text")
        .style("pointer-events", "all")
        .style("outline", "none");
      
      // Update selection state
      bubbles.select(".risk-ring")
        .attr("r", (d: any) => radiusScale(d.liveDealCount) + (selectedCategoryRef.current?.id === d.id ? 8 : 4))
        .attr("stroke-width", (d: any) => selectedCategoryRef.current?.id === d.id ? 4 : 2);
      
      // Run simulation
      simulation.nodes(displayCategories).on("tick", () => {
        bubbles.attr("transform", (d: any) => {
          const radius = radiusScale(d.liveDealCount) + 15;
          d.x = Math.max(radius, Math.min(width - radius, d.x || 0));
          d.y = Math.max(radius, Math.min(height - radius, d.y || 0));
          return `translate(${d.x},${d.y})`;
        });
      });
    };
    
    updateVisualization();
    
    const handleResize = () => {
      updateVisualization();
      setTooltip(null);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [displayCategories, selectedCategory, onCategorySelect, maxDealCount]);

  // Separate effect to handle selectedCategory changes for opacity without full re-render
  useEffect(() => {
    if (!containerRef.current || displayCategories.length === 0) return
    
    const container = containerRef.current
    const svg = d3.select(container).select("svg")
    
    if (svg.empty()) return // Wait for initial render
    
    const currentSelection = selectedCategoryRef.current
    
    // Update bubble opacity efficiently 
    svg.selectAll(".bubble")
      .style("opacity", (d: any) => {
        const shouldShow = !currentSelection || d.id === currentSelection.id
        return shouldShow ? "1" : "0.15"
      })
      .style("pointer-events", (d: any) => {
        const shouldShow = !currentSelection || d.id === currentSelection.id
        return shouldShow ? "auto" : "auto" // Keep all bubbles clickable for toggling
      })
    
  }, [selectedCategory, displayCategories]);
  
  return (
    <div className={`relative ${className}`}>
      {/* Dropdown above the container */}
      <div className="mb-4 flex justify-end">
        <Select 
          value={selectedCategory?.id || "all"} 
          onValueChange={(value) => {
            if (value === "all") {
              onCategorySelect(null);
            } else {
              const category = categories.find(c => c.id === value);
              if (category) onCategorySelect(category);
            }
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Container box */}
      <div className="bg-card rounded-lg border border-border">
        {/* Header and description inside the container */}
        <div className="pt-6 pb-4 px-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">Opportunity Atlas</h2>
          <p className="text-muted-foreground text-sm">
            {selectedCategory 
              ? `Showing ${selectedCategory.name} opportunities • ${selectedCategory.liveDealCount} deals available`
              : `Select an asset class to explore regional opportunities • ${categories.length} categories available`
            }
          </p>
        </div>
        {/* Visualization area */}
        <div className="relative px-6">
          <div 
            ref={containerRef} 
            className="w-full h-80 relative"
            style={{ 
              minHeight: "320px",
              outline: "none",
              userSelect: "none"
            }}
          />
          
          {tooltip && (
            <Tooltip
              category={tooltip.category}
              x={tooltip.x}
              y={tooltip.y}
              isVisible={true}
            />
          )}
        </div>
        
        {/* Legend and disclaimer inside the box */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap justify-center gap-4 text-xs mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              <span className="text-muted-foreground">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
              <span className="text-muted-foreground">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
              <span className="text-muted-foreground">High Risk</span>
            </div>
            <div className="text-muted-foreground">• Bubble size = Live deal count</div>
          </div>
          
          {/* Disclaimer */}
          <div className="text-center border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              For Information only. HNWI Chronicles is not a broker-dealer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}