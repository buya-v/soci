import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/ui/Toast';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { NotificationCenter } from './components/ui/NotificationCenter';
import { CommandPalette, useCommandPalette } from './components/ui/CommandPalette';
import { DataManager } from './components/settings/DataManager';
import { Login } from './components/auth/Login';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { useAppStore } from './store/useAppStore';
import type { ViewType } from './types';

// Lazy load view components for code splitting
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const TrendEngine = lazy(() => import('./components/trends/TrendEngine').then(m => ({ default: m.TrendEngine })));
const ContentLab = lazy(() => import('./components/content/ContentLab').then(m => ({ default: m.ContentLab })));
const TemplatesLibrary = lazy(() => import('./components/templates/TemplatesLibrary').then(m => ({ default: m.TemplatesLibrary })));
const HashtagCollections = lazy(() => import('./components/templates/HashtagCollections').then(m => ({ default: m.HashtagCollections })));
const MediaLibrary = lazy(() => import('./components/media/MediaLibrary').then(m => ({ default: m.MediaLibrary })));
const DraftsQueue = lazy(() => import('./components/drafts/DraftsQueue').then(m => ({ default: m.DraftsQueue })));
const CalendarView = lazy(() => import('./components/calendar/CalendarView').then(m => ({ default: m.CalendarView })));
const VideoLab = lazy(() => import('./components/video/VideoLab').then(m => ({ default: m.VideoLab })));
const AutomationHub = lazy(() => import('./components/automation/AutomationHub').then(m => ({ default: m.AutomationHub })));
const BudgetManager = lazy(() => import('./components/budget/BudgetManager').then(m => ({ default: m.BudgetManager })));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-deep">
      {/* Animated loader */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
        <div
          className="absolute inset-2 rounded-full border-2 border-t-accent-purple animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
        <div
          className="absolute inset-4 rounded-full border-2 border-t-accent-pink animate-spin"
          style={{ animationDuration: '2s' }}
        />
      </div>
      <h2 className="text-xl font-bold gradient-text mb-2">SOCI</h2>
      <p className="text-sm text-gray-500">Initializing AI Growth Engine...</p>
    </div>
  );
}

// Lightweight loading fallback for lazy-loaded views
function ViewLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
      </div>
    </div>
  );
}

function AppContent() {
  const { activeView, setActiveView } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const commandPalette = useCommandPalette();

  const handleShowHelp = useCallback(() => {
    setShowShortcutsModal(true);
  }, []);

  const handleShowNotifications = useCallback(() => {
    setShowNotifications(true);
  }, []);

  const handleShowDataManager = useCallback(() => {
    setShowDataManager(true);
  }, []);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(handleShowHelp);

  // Initialize theme
  useTheme();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'trends':
        return <TrendEngine />;
      case 'content':
        return <ContentLab />;
      case 'templates':
        return <TemplatesLibrary />;
      case 'hashtags':
        return <HashtagCollections />;
      case 'media':
        return <MediaLibrary />;
      case 'drafts':
        return <DraftsQueue />;
      case 'calendar':
        return <CalendarView />;
      case 'video':
        return <VideoLab />;
      case 'automation':
        return <AutomationHub />;
      case 'budget':
        return <BudgetManager />;
      default:
        return <Dashboard />;
    }
  };

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-deep">
      {/* Background glow effects */}
      <div className="bg-glow bg-glow-primary" />
      <div className="bg-glow bg-glow-purple" />

      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:block">
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          onShowShortcuts={handleShowHelp}
          onShowNotifications={handleShowNotifications}
        />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav
          activeView={activeView}
          onViewChange={handleViewChange}
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen p-4 lg:p-6 pt-16 lg:pt-6 pb-20 lg:pb-6">
        <Suspense fallback={<ViewLoadingFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        onShowShortcuts={handleShowHelp}
        onShowNotifications={handleShowNotifications}
        onShowDataManager={handleShowDataManager}
      />

      {/* Data Manager */}
      <DataManager
        isOpen={showDataManager}
        onClose={() => setShowDataManager(false)}
      />
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Initial boot sequence
  useEffect(() => {
    const bootSequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
    };
    bootSequence();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
