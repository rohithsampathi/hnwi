"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface FilterSettings {
  ticketBand: string[];
  horizon: string[];
  risk: string[];
  postingDate: string[];
}

interface OpportunityFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterSettings;
  onFiltersChange: (filters: FilterSettings) => void;
  isMobile?: boolean;
}

const ticketBands = [
  { id: "under-1m", label: "Under $1M", value: "under-1m" },
  { id: "1m-5m", label: "$1M - $5M", value: "1m-5m" },
  { id: "5m-10m", label: "$5M - $10M", value: "5m-10m" },
  { id: "over-10m", label: "Over $10M", value: "over-10m" }
];

const horizons = [
  { id: "short", label: "Short Term (< 2 years)", value: "short" },
  { id: "medium", label: "Medium Term (2-5 years)", value: "medium" },
  { id: "long", label: "Long Term (5+ years)", value: "long" }
];

const riskLevels = [
  { id: "low", label: "Low Risk", value: "low" },
  { id: "medium", label: "Medium Risk", value: "medium" },
  { id: "high", label: "High Risk", value: "high" }
];

const postingDates = [
  { id: "last-7", label: "Last 7 days", value: "last-7" },
  { id: "last-30", label: "Last 30 days", value: "last-30" },
  { id: "last-90", label: "Last 90 days", value: "last-90" },
  { id: "all", label: "All time", value: "all" }
];

interface FilterSectionProps {
  title: string;
  options: Array<{ id: string; label: string; value: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

function FilterSection({ title, options, selectedValues, onChange }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };
  
  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={isExpanded}
        aria-controls={`filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`} 
        />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
            id={`filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-accent/50 rounded p-1 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                  className="rounded border-border text-primary focus:ring-primary focus:ring-2"
                  id={`${title.toLowerCase().replace(/\s+/g, '-')}-${option.id}`}
                  aria-describedby={`${title.toLowerCase().replace(/\s+/g, '-')}-desc`}
                />
                <span className="text-sm text-muted-foreground">
                  {option.label}
                </span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OpportunityFilterDrawer({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  isMobile = false 
}: OpportunityFilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FilterSettings>(filters);
  
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handleFilterChange = (key: keyof FilterSettings, values: string[]) => {
    const newFilters = { ...localFilters, [key]: values };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };
  
  const clearAllFilters = () => {
    const clearedFilters: FilterSettings = {
      ticketBand: [],
      horizon: [],
      risk: [],
      postingDate: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };
  
  const getActiveFilterCount = () => {
    return Object.values(localFilters).reduce((count, arr) => count + arr.length, 0);
  };
  
  const drawerContent = (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Filters</h2>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-8 h-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <FilterSection
          title="Ticket Size"
          options={ticketBands}
          selectedValues={localFilters.ticketBand}
          onChange={(values) => handleFilterChange("ticketBand", values)}
        />
        
        <Separator />
        
        <FilterSection
          title="Investment Horizon"
          options={horizons}
          selectedValues={localFilters.horizon}
          onChange={(values) => handleFilterChange("horizon", values)}
        />
        
        <Separator />
        
        <FilterSection
          title="Risk Level"
          options={riskLevels}
          selectedValues={localFilters.risk}
          onChange={(values) => handleFilterChange("risk", values)}
        />
        
        <Separator />
        
        <FilterSection
          title="Posted"
          options={postingDates}
          selectedValues={localFilters.postingDate}
          onChange={(values) => handleFilterChange("postingDate", values)}
        />
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full"
          disabled={getActiveFilterCount() === 0}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] z-50 rounded-t-lg overflow-hidden"
            >
              {drawerContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          />
          
          {/* Desktop Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 z-50 shadow-lg"
          >
            {drawerContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}