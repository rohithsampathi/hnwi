'use client';

import { Database, AlertCircle } from 'lucide-react';

interface SectionEmptyStateProps {
  title?: string;
  message?: string;
  reason?: string;
  showDebug?: boolean;
  debugInfo?: Record<string, any>;
}

export function SectionEmptyState({
  title = 'No Data Available',
  message = 'This section does not have data for the current audit.',
  reason,
  showDebug = false,
  debugInfo
}: SectionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-6">
        <Database className="w-8 h-8 text-muted-foreground" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground text-center max-w-md mb-2">
        {message}
      </p>

      {reason && (
        <div className="flex items-start gap-2 mt-4 p-3 bg-surface-hover border border-border rounded-lg max-w-md">
          <AlertCircle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {reason}
          </p>
        </div>
      )}

      {showDebug && debugInfo && process.env.NODE_ENV === 'development' && (
        <details className="mt-6 text-xs text-muted-foreground font-mono bg-surface border border-border rounded-lg p-4 max-w-2xl">
          <summary className="cursor-pointer hover:text-foreground transition-colors mb-2">
            Debug Information
          </summary>
          <pre className="mt-2 overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// Helper function to check if data exists
export function hasRequiredData(data: any, requiredFields: string[]): boolean {
  if (!data) return false;

  return requiredFields.every(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], data);
    return value !== undefined && value !== null &&
           (Array.isArray(value) ? value.length > 0 : true);
  });
}
