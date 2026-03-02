'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`Error in section ${this.props.sectionName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-gold" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Section Temporarily Unavailable
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            This section encountered an issue while loading. This may be due to missing data
            or a configuration issue.
          </p>
          <details className="text-xs text-muted-foreground font-mono bg-surface border border-border rounded-lg p-4 max-w-2xl">
            <summary className="cursor-pointer hover:text-foreground transition-colors mb-2">
              Technical Details
            </summary>
            <div className="mt-2 space-y-2">
              <div>
                <span className="text-gold">Section:</span> {this.props.sectionName}
              </div>
              <div>
                <span className="text-gold">Error:</span> {this.state.error?.message || 'Unknown error'}
              </div>
              <div>
                <span className="text-gold">Stack:</span>
                <pre className="mt-1 text-xs overflow-x-auto">
                  {this.state.error?.stack}
                </pre>
              </div>
            </div>
          </details>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-6 px-4 py-2 rounded-lg border border-gold text-gold hover:bg-gold/10 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to wrap sections
export function withSectionErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  sectionName: string
) {
  return function WrappedComponent(props: P) {
    return (
      <SectionErrorBoundary sectionName={sectionName}>
        <Component {...props} />
      </SectionErrorBoundary>
    );
  };
}
