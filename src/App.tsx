import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { RootErrorBoundary } from './components/layout/RootErrorBoundary';
import { Dashboard } from './features/dashboard/Dashboard';
import { TrendRadar } from './features/trends/TrendRadar';
import { ContentComposer } from './features/composer/ContentComposer';
import { useSociStore } from './store/useSociStore';

const SettingsView = () => (
  <div className="text-white">
    <h2 className="text-2xl font-bold mb-4">System Configuration</h2>
    <p className="text-slate-400">Securely manage API keys and automation parameters.</p>
    <div className="mt-8 p-8 border border-slate-800 rounded-xl bg-slate-900/50 text-center text-slate-500">
      Settings module locked in Demo Mode.
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { activeView } = useSociStore();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'trends': return <TrendRadar />;
      case 'composer': return <ContentComposer />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto p-8 pt-10">
           {renderView()}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <RootErrorBoundary>
      <AppContent />
    </RootErrorBoundary>
  );
}

export default App;