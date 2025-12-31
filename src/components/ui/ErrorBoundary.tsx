import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // In production, log to Sentry/Datadog here
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-md w-full rounded-2xl border-l-4 border-red-500 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">System Integrity Interrupted</h1>
            <p className="text-slate-400 mb-6">
              The autonomous engine encountered an unexpected anomaly. Safety protocols have been engaged.
            </p>
            <div className="bg-black/30 p-4 rounded-lg w-full text-left mb-6 overflow-hidden">
              <code className="text-xs text-red-400 font-mono">
                Error: {this.state.error?.message || 'Unknown Exception'}
              </code>
            </div>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-indigo-600 text-white rounded-xl transition-all font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Reboot Module
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}