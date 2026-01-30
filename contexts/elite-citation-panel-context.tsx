// contexts/elite-citation-panel-context.tsx
// Citation Panel Context for Decision Memo

"use client";

import React, { createContext, useContext, useState } from 'react';

interface CitationPanelOptions {
  title?: string;
  description?: string;
  source?: string;
}

interface CitationPanelContextValue {
  isOpen: boolean;
  devIds: string[];
  options: CitationPanelOptions;
  openPanel: (devIds: string[], options?: CitationPanelOptions) => void;
  closePanel: () => void;
}

const CitationPanelContext = createContext<CitationPanelContextValue | undefined>(undefined);

export function CitationPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [devIds, setDevIds] = useState<string[]>([]);
  const [options, setOptions] = useState<CitationPanelOptions>({});

  const openPanel = (newDevIds: string[], newOptions: CitationPanelOptions = {}) => {
    setDevIds(newDevIds);
    setOptions(newOptions);
    setIsOpen(true);

    // Log for development
    console.log('📊 Opening Citation Panel:', {
      devIds: newDevIds,
      options: newOptions
    });
  };

  const closePanel = () => {
    setIsOpen(false);
    setDevIds([]);
    setOptions({});
  };

  return (
    <CitationPanelContext.Provider
      value={{
        isOpen,
        devIds,
        options,
        openPanel,
        closePanel
      }}
    >
      {children}

      {/* Citation Panel UI */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {options.title || 'Intelligence Analysis'}
                </h3>
                {options.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {options.description}
                  </p>
                )}
              </div>
              <button
                onClick={closePanel}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Dev IDs */}
              {Array.isArray(devIds) && devIds.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Development IDs
                  </h4>
                  {devIds.map((id, index) => (
                    <div
                      key={index}
                      className="bg-muted/30 rounded p-3 mb-2 font-mono text-xs text-muted-foreground"
                    >
                      {id}
                    </div>
                  ))}
                </div>
              )}

              {/* Source */}
              {options.source && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Intelligence Source
                  </h4>
                  <p className="text-sm text-foreground">{options.source}</p>
                </div>
              )}

              {/* Placeholder for additional analysis */}
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Full intelligence analysis and historical patterns would be displayed here,
                  pulling from the HNWI World knowledge graph with 1,562+ developments.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/20">
            <button
              onClick={closePanel}
              className="w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity"
            >
              Close Analysis
            </button>
          </div>
        </div>
      )}
    </CitationPanelContext.Provider>
  );
}

export function useCitationPanel() {
  const context = useContext(CitationPanelContext);
  if (!context) {
    throw new Error('useCitationPanel must be used within CitationPanelProvider');
  }
  return context;
}