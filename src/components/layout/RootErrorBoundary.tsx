import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full border-red-500/20">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white">System Malfunction</h2>
          <p className="text-slate-400 text-sm">
            The autonomous engine encountered a critical error. Diagnostics trace:
          </p>
          <div className="w-full bg-black/50 p-3 rounded font-mono text-xs text-red-400 overflow-x-auto">
            {error.message}
          </div>
          <button
            onClick={() => {
              localStorage.clear(); // Hard reset
              window.location.reload();
            }}
            className="flex items-center gap-2 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Emergency Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export const RootErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};