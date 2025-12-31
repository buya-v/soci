import React, { useState, useEffect } from 'react';
import { Dashboard } from './views/Dashboard';
import { ContentEngine } from './views/ContentEngine';
import { Settings } from './views/Settings';
import { NavDock } from './components/layout/NavDock';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AuroraLoader } from './components/ui/AuroraLoader';
import { simulateApiCall } from './utils/resilience';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Initial boot sequence simulation
  useEffect(() => {
    const bootSequence = async () => {
      try {
        await simulateApiCall(true, 1500); // Simulate core system check
      } catch (e) {
        console.error("Boot failure handled silently");
      } finally {
        setIsLoading(false);
      }
    };
    bootSequence();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-deep">
        <AuroraLoader />
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Critical System Failure">
      <div className="min-h-screen pb-32 pt-12 px-6 max-w-7xl mx-auto">
        {/* Dynamic View Rendering */}
        <main className="animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'content' && <ContentEngine />}
          {activeTab === 'settings' && <Settings />}
        </main>

        {/* Floating Navigation */}
        <NavDock activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </ErrorBoundary>
  );
}

export default App;