
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TrendEngine from './components/TrendEngine';
import ContentLab from './components/ContentLab';
import VideoLab from './components/VideoLab';
import AutomationHub from './components/AutomationHub';
import { AppTab, UserNiche, Trend } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [niche, setNiche] = useState<UserNiche>({
    category: 'Artificial Intelligence & Productivity',
    targetAudience: 'Tech-savvy professionals and developers',
    voice: 'Futuristic & Innovative'
  });

  const handleSelectTrend = (trend: Trend) => {
    setSelectedTrend(trend);
    setActiveTab(AppTab.CONTENT);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard />;
      case AppTab.TRENDS:
        return <TrendEngine niche={niche} onSelectTrend={handleSelectTrend} />;
      case AppTab.CONTENT:
        return <ContentLab selectedTrend={selectedTrend} niche={niche} />;
      case AppTab.VIDEO:
        return <VideoLab />;
      case AppTab.AUTOMATION:
        return <AutomationHub niche={niche} setNiche={setNiche} />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return 'Growth Hub Overview';
      case AppTab.TRENDS: return 'Trend Analysis Engine';
      case AppTab.CONTENT: return 'AI Creative Studio';
      case AppTab.VIDEO: return 'Temporal Video Synthesis';
      case AppTab.AUTOMATION: return 'Agent Configuration';
      default: return 'Soci Engine';
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100 overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8 relative">
        {/* Background glow effects */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="fixed bottom-0 left-64 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <header className="mb-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h2>
              <p className="text-gray-500 mt-1">Autonomous management for <span className="text-indigo-400 font-medium">@{niche.category.split(' ')[0]}Growth</span></p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img key={i} className="w-8 h-8 rounded-full border-2 border-gray-950" src={`https://picsum.photos/32/32?random=${i}`} alt="user" />
                ))}
              </div>
              <div className="h-10 w-[1px] bg-gray-800"></div>
              <button className="bg-gray-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
                Profile
              </button>
            </div>
          </div>
        </header>

        <div className="pb-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
