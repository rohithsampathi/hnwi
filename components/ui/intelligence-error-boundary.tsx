"use client";

import React from "react";
import { Construction, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ElitePulseErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ElitePulseErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ElitePulseErrorBoundary extends React.Component<
  ElitePulseErrorBoundaryProps,
  ElitePulseErrorBoundaryState
> {
  constructor(props: ElitePulseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ElitePulseErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      return <DefaultElitePulseErrorFallback error={this.state.error!} retry={this.retry} />;
    }

    return this.props.children;
  }
}

function DefaultElitePulseErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full" />
            <div className="relative w-16 h-16 rounded-full border border-gold/30 bg-surface flex items-center justify-center">
              <Construction className="w-8 h-8 text-gold" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h3 className="text-xl font-medium text-foreground tracking-tight">
            Something broke.
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We are fixing this. Will be live shortly.
          </p>
        </div>

        {/* Retry Button */}
        <div className="pt-2">
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors text-sm font-medium text-foreground"
          >
            <RefreshCw className="w-4 h-4 text-gold" strokeWidth={1.5} />
            Reconnect
          </button>
        </div>

        {/* Technical Details (Dev Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="pt-4 text-left">
            <summary className="text-xs text-muted-foreground/60 cursor-pointer hover:text-muted-foreground transition-colors font-mono">
              Technical Details
            </summary>
            <pre className="text-xs text-muted-foreground/60 mt-3 p-4 rounded-lg bg-surface border border-border overflow-x-auto font-mono">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Wrapper hook for easier usage
export function useElitePulseErrorBoundary() {
  return {
    ElitePulseErrorBoundary,
    DefaultElitePulseErrorFallback
  };
}