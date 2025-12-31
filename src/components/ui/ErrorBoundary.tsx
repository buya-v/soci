import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[SOCI-ERR] Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-8 bg-deep/50 border border-critical/30 rounded-xl backdrop-blur-md">
          <AlertTriangle className="w-12 h-12 text-critical mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            {this.props.fallbackTitle || "System Boundary Triggered"}
          </h2>
          <p className="text-gray-400 text-center max-w-md mb-6">
            Our resilience protocols caught an anomaly. The application state has been preserved to prevent a crash.
          </p>
          <div className="p-3 bg-black/40 rounded-md border border-white/5 mb-6 w-full max-w-sm overflow-hidden">
            <code className="text-xs text-critical font-mono break-all">
              {this.state.error?.message || "Unknown Error"}
            </code>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-2 bg-critical/10 hover:bg-critical/20 text-critical border border-critical/50 rounded-lg transition-all duration-300"
          >
            <RefreshCw size={16} />
            Graceful Reset
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}