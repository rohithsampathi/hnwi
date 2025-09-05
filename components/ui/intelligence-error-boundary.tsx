"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    console.error('Elite Pulse Intelligence Error:', error, errorInfo);
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
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100">
              Elite Pulse Intelligence Temporarily Unavailable
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Our AI systems are experiencing a brief interruption. Intelligence data will be restored shortly.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="text-xs text-amber-600 dark:text-amber-400 cursor-pointer">
                  Technical Details
                </summary>
                <pre className="text-xs text-amber-600 dark:text-amber-400 mt-1 whitespace-pre-wrap">
                  {error.message}
                </pre>
              </details>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={retry}
                className="text-xs h-7 px-3 border-amber-300 dark:border-amber-700"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry Intelligence
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Wrapper hook for easier usage
export function useElitePulseErrorBoundary() {
  return {
    ElitePulseErrorBoundary,
    DefaultElitePulseErrorFallback
  };
}