import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
  FileJson,
  HardDrive,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportData {
  version: string;
  exportedAt: string;
  data: {
    persona: ReturnType<typeof useAppStore.getState>['persona'];
    posts: ReturnType<typeof useAppStore.getState>['posts'];
    automationSettings: ReturnType<typeof useAppStore.getState>['automationSettings'];
    platformCredentials: ReturnType<typeof useAppStore.getState>['platformCredentials'];
    theme: ReturnType<typeof useAppStore.getState>['theme'];
    persistentNotifications: ReturnType<typeof useAppStore.getState>['persistentNotifications'];
  };
}

export function DataManager({ isOpen, onClose }: DataManagerProps) {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    persona,
    posts,
    automationSettings,
    platformCredentials,
    theme,
    persistentNotifications,
    setPersona,
    setPosts,
    updateAutomationSettings,
    updatePlatformCredential,
    setTheme,
    addNotification,
  } = useAppStore();

  // Export all data to JSON
  const handleExport = () => {
    const exportData: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        persona,
        posts,
        automationSettings,
        platformCredentials,
        theme,
        persistentNotifications,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soci-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Export Complete',
      message: 'Your data has been exported successfully',
    });
  };

  // Import data from JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData: ExportData = JSON.parse(content);

        // Validate the structure
        if (!importedData.version || !importedData.data) {
          throw new Error('Invalid backup file format');
        }

        // Import data
        if (importedData.data.persona) {
          setPersona(importedData.data.persona);
        }
        if (importedData.data.posts) {
          setPosts(importedData.data.posts);
        }
        if (importedData.data.automationSettings) {
          updateAutomationSettings(importedData.data.automationSettings);
        }
        if (importedData.data.platformCredentials) {
          importedData.data.platformCredentials.forEach((cred) => {
            updatePlatformCredential(cred.platform, cred);
          });
        }
        if (importedData.data.theme) {
          setTheme(importedData.data.theme);
        }

        setImportStatus('success');
        setStatusMessage(`Successfully imported ${importedData.data.posts?.length || 0} posts`);

        addNotification({
          type: 'success',
          title: 'Import Complete',
          message: 'Your data has been restored successfully',
        });
      } catch (err) {
        console.error('Import error:', err);
        setImportStatus('error');
        setStatusMessage('Failed to import data. Please check the file format.');

        addNotification({
          type: 'error',
          title: 'Import Failed',
          message: 'Could not parse the backup file',
        });
      }
    };

    reader.readAsText(file);
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset all data
  const handleReset = () => {
    localStorage.removeItem('soci-storage-v2');
    window.location.reload();
  };

  // Calculate storage usage
  const getStorageSize = () => {
    const data = localStorage.getItem('soci-storage-v2');
    if (!data) return '0 KB';
    const bytes = new Blob([data]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <HardDrive size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Data Management</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Storage Info */}
              <div className="p-4 bg-white/5 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Local Storage Used</span>
                  <span className="text-sm font-medium text-white">{getStorageSize()}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-400">Total Posts</span>
                  <span className="text-sm font-medium text-white">{posts.length}</span>
                </div>
              </div>

              {/* Status Message */}
              <AnimatePresence>
                {importStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
                      importStatus === 'success'
                        ? 'bg-success/20 text-success'
                        : 'bg-critical/20 text-critical'
                    }`}
                  >
                    {importStatus === 'success' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    <span className="text-sm">{statusMessage}</span>
                    <button
                      onClick={() => setImportStatus('idle')}
                      className="ml-auto p-1 hover:bg-white/10 rounded"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="space-y-3">
                {/* Export */}
                <Button
                  onClick={handleExport}
                  variant="secondary"
                  className="w-full justify-start gap-3"
                >
                  <Download size={18} />
                  <div className="text-left">
                    <p className="font-medium">Export Data</p>
                    <p className="text-xs text-gray-400">Download all data as JSON backup</p>
                  </div>
                </Button>

                {/* Import */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  className="w-full justify-start gap-3"
                >
                  <Upload size={18} />
                  <div className="text-left">
                    <p className="font-medium">Import Data</p>
                    <p className="text-xs text-gray-400">Restore from JSON backup file</p>
                  </div>
                </Button>

                {/* Reset */}
                <div className="pt-3 border-t border-glass-border">
                  {showConfirmReset ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-critical/10 border border-critical/30 rounded-lg"
                    >
                      <p className="text-sm text-gray-300 mb-3">
                        This will permanently delete all your data including posts, settings, and
                        preferences. This action cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleReset}
                          variant="primary"
                          className="flex-1 bg-critical hover:bg-critical/80"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete All Data
                        </Button>
                        <Button
                          onClick={() => setShowConfirmReset(false)}
                          variant="secondary"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <Button
                      onClick={() => setShowConfirmReset(true)}
                      variant="secondary"
                      className="w-full justify-start gap-3 text-critical hover:bg-critical/10"
                    >
                      <RefreshCw size={18} />
                      <div className="text-left">
                        <p className="font-medium">Reset All Data</p>
                        <p className="text-xs text-gray-400">Clear all data and start fresh</p>
                      </div>
                    </Button>
                  )}
                </div>
              </div>

              {/* File Format Info */}
              <div className="mt-4 pt-4 border-t border-glass-border">
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <FileJson size={14} className="mt-0.5 flex-shrink-0" />
                  <p>
                    Backup files are stored as JSON and include posts, settings, persona, and
                    preferences. API keys are not exported for security.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
