import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStack: boolean;
}

// Helper to access store outside React
const getStore = () => useAppStore.getState();

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showStack: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Report error to Zustand store
    const store = getStore();
    store.addError({
      message: error.message || "Unknown error",
      stack: error.stack,
      source: "ErrorBoundary",
    });
  }

  private handleReset = () => {
    // Reset component state only - no page reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
    });

    // Call optional onReset callback for parent cleanup
    this.props.onReset?.();
  };

  private toggleStack = () => {
    this.setState((prev) => ({ showStack: !prev.showStack }));
  };

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      const { error, errorInfo, showStack } = this.state;

      return (
        <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-8 bg-deep/50 border border-critical/30 rounded-xl backdrop-blur-md">
          <AlertTriangle className="w-12 h-12 text-critical mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            {this.props.fallbackTitle || "System Boundary Triggered"}
          </h2>
          <p className="text-gray-400 text-center max-w-md mb-6">
            Our resilience protocols caught an anomaly. Click below to recover this view without losing your work.
          </p>

          {/* Error message */}
          <div className="p-3 bg-black/40 rounded-md border border-white/5 mb-4 w-full max-w-sm overflow-hidden">
            <code className="text-xs text-critical font-mono break-all">
              {error?.message || "Unknown Error"}
            </code>
          </div>

          {/* Stack trace (dev mode only) */}
          {isDev && error?.stack && (
            <div className="w-full max-w-sm mb-4">
              <button
                onClick={this.toggleStack}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2"
              >
                {showStack ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showStack ? "Hide" : "Show"} Stack Trace
              </button>
              {showStack && (
                <div className="p-3 bg-black/60 rounded-md border border-white/5 overflow-auto max-h-48">
                  <pre className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap">
                    {error.stack}
                    {errorInfo?.componentStack && (
                      <>
                        {"\n\nComponent Stack:"}
                        {errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-2 bg-aurora-neon/10 hover:bg-aurora-neon/20 text-aurora-neon border border-aurora-neon/50 rounded-lg transition-all duration-300 hover:shadow-glow-soft"
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
