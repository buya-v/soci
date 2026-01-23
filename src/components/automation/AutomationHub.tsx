import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Zap,
  Image as ImageIcon,
  Clock,
  MessageSquare,
  Check,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import {
  setPreferredProvider,
  getPreferredProvider,
  isAnthropicConfigured,
  isOpenAIConfigured,
  isGeminiConfigured,
  type AIProvider,
} from '@/services/ai-client';
import {
  initAnthropicClient,
  initOpenAIClient,
  initGeminiClient,
} from '@/services/ai';
import {
  isTwitterConnected,
  getTwitterUsername,
  disconnectTwitter,
  handleTwitterCallback,
  setOAuth1Credentials,
  getTwitterAuthType,
} from '@/services/twitter';
import type { Platform, Persona, AutomationSettings, PlatformCredential } from '@/types';

const toneOptions: Persona['tone'][] = ['professional', 'casual', 'witty', 'inspirational'];

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function ToggleSwitch({ enabled, onChange, label, description, icon }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-glass-border last:border-0">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-500'}`}>
          {icon}
        </div>
        <div>
          <p className="font-medium text-white">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`toggle-switch ${enabled ? 'active' : ''}`}
        aria-label={`Toggle ${label}`}
      />
    </div>
  );
}

interface TwitterCredentialsFormProps {
  onConnect: (accessToken: string, accessSecret: string, username: string) => void;
  isLoading?: boolean;
}

function TwitterCredentialsForm({ onConnect, isLoading }: TwitterCredentialsFormProps) {
  const [accessToken, setAccessToken] = useState('');
  const [accessSecret, setAccessSecret] = useState('');
  const [username, setUsername] = useState('');
  const [showTokens, setShowTokens] = useState(false);

  const handleConnect = () => {
    if (accessToken && accessSecret && username) {
      onConnect(accessToken, accessSecret, username);
    }
  };

  const isValid = accessToken.trim() && accessSecret.trim() && username.trim();

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">X Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace('@', ''))}
          placeholder="username (without @)"
          className="w-full bg-white/5 border border-glass-border rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:border-primary transition-colors text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Access Token</label>
        <div className="relative">
          <input
            type={showTokens ? 'text' : 'password'}
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Access Token from Twitter Developer Portal"
            className="w-full bg-white/5 border border-glass-border rounded-lg py-2 px-3 pr-10 text-white placeholder-gray-500 focus:border-primary transition-colors text-sm font-mono"
          />
          <button
            type="button"
            onClick={() => setShowTokens(!showTokens)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {showTokens ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Access Token Secret</label>
        <input
          type={showTokens ? 'text' : 'password'}
          value={accessSecret}
          onChange={(e) => setAccessSecret(e.target.value)}
          placeholder="Access Token Secret"
          className="w-full bg-white/5 border border-glass-border rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:border-primary transition-colors text-sm font-mono"
        />
      </div>
      <Button
        variant="primary"
        size="sm"
        className="w-full"
        onClick={handleConnect}
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" />
            Connecting...
          </>
        ) : (
          'Connect X Account'
        )}
      </Button>
      <p className="text-[10px] text-gray-500 text-center">
        Get tokens from{' '}
        <a
          href="https://developer.twitter.com/en/portal/projects"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Twitter Developer Portal
        </a>
        {' '}→ Your App → Keys and tokens
      </p>
    </div>
  );
}

interface PlatformCardProps {
  credential: PlatformCredential;
  onConnectOAuth1?: (accessToken: string, accessSecret: string, username: string) => void;
  onDisconnect?: () => void;
  isLoading?: boolean;
  authType?: 'oauth1' | 'oauth2' | null;
}

function PlatformCard({ credential, onConnectOAuth1, onDisconnect, isLoading, authType }: PlatformCardProps) {
  const platformLabels: Record<Platform, string> = {
    instagram: 'Instagram',
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    facebook: 'Facebook',
  };

  const isSupported = credential.platform === 'twitter';

  return (
    <div className={`
      glass-panel rounded-xl p-4 border transition-all
      ${credential.isConnected
        ? 'border-success/30 bg-success/5'
        : 'border-glass-border hover:border-glass-border-hover'
      }
    `}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-white">{platformLabels[credential.platform]}</span>
        {credential.isConnected ? (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check size={12} />
            Connected {authType === 'oauth1' ? '(API Key)' : ''}
          </span>
        ) : isSupported ? (
          <span className="flex items-center gap-1 text-xs text-primary">
            Ready to connect
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            Coming soon
          </span>
        )}
      </div>
      {credential.isConnected ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">@{credential.username}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            disabled={isLoading}
          >
            Disconnect
          </Button>
        </div>
      ) : isSupported && onConnectOAuth1 ? (
        <TwitterCredentialsForm onConnect={onConnectOAuth1} isLoading={isLoading} />
      ) : (
        <Button variant="secondary" size="sm" className="w-full" disabled>
          Coming Soon
        </Button>
      )}
    </div>
  );
}

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isConfigured: boolean;
  placeholder: string;
}

function ApiKeyInput({ label, value, onChange, isConfigured, placeholder }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {isConfigured && (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check size={12} />
            Configured
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type={showKey ? 'text' : 'password'}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 pr-12 text-white placeholder-gray-500 focus:border-primary transition-colors font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {!isConfigured && localValue && (
        <p className="text-xs text-warning flex items-center gap-1">
          <AlertCircle size={12} />
          Key will be saved when you leave this field
        </p>
      )}
    </div>
  );
}

export function AutomationHub() {
  const { apiKeys, setApiKey, addNotification } = useAppStore();
  const [niche, setNiche] = useState('Technology & Innovation');
  const [audience, setAudience] = useState('Entrepreneurs, startup founders, tech enthusiasts');
  const [tone, setTone] = useState<Persona['tone']>('professional');
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>({
    autoPostDiscovery: true,
    aiImageSynthesis: true,
    smartScheduling: false,
    autoEngagement: false,
  });
  const [anthropicConfigured, setAnthropicConfigured] = useState(() => isAnthropicConfigured());
  const [openaiConfigured, setOpenaiConfigured] = useState(() => isOpenAIConfigured());
  const [geminiConfigured, setGeminiConfigured] = useState(() => isGeminiConfigured());
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(getPreferredProvider());
  const [twitterConnected, setTwitterConnected] = useState(() => isTwitterConnected());
  const [twitterUsername, setTwitterUsername] = useState<string | null>(() => getTwitterUsername());
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle OAuth callback on mount
  useEffect(() => {
    const callbackResult = handleTwitterCallback();
    if (callbackResult.success) {
      setTwitterConnected(true);
      setTwitterUsername(callbackResult.username || null);
      addNotification({
        type: 'success',
        title: 'X Connected',
        message: `Successfully connected @${callbackResult.username}`,
      });
    } else if (callbackResult.error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: callbackResult.error,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build platform credentials dynamically
  const platformCredentials: PlatformCredential[] = [
    { platform: 'twitter', isConnected: twitterConnected, username: twitterUsername || undefined },
    { platform: 'instagram', isConnected: false },
    { platform: 'facebook', isConnected: false },
    { platform: 'linkedin', isConnected: false },
    { platform: 'tiktok', isConnected: false },
  ];

  const handleConnectTwitterOAuth1 = (accessToken: string, accessSecret: string, username: string) => {
    setIsConnecting(true);
    try {
      setOAuth1Credentials(accessToken, accessSecret, username);
      setTwitterConnected(true);
      setTwitterUsername(username);
      addNotification({
        type: 'success',
        title: 'X Connected',
        message: `Successfully connected @${username}`,
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to save credentials',
      });
    }
    setIsConnecting(false);
  };

  const handleDisconnectTwitter = () => {
    disconnectTwitter();
    setTwitterConnected(false);
    setTwitterUsername(null);
    addNotification({
      type: 'info',
      title: 'X Disconnected',
      message: 'Your X account has been disconnected',
    });
  };

  // API Key handlers
  const handleAnthropicKeyChange = (key: string) => {
    setApiKey('anthropic', key);
    if (key) {
      initAnthropicClient(key);
      setAnthropicConfigured(isAnthropicConfigured());
      addNotification({
        type: 'success',
        title: 'Anthropic API Key Saved',
        message: 'Claude AI is now ready for content generation',
      });
    }
  };

  const handleOpenAIKeyChange = (key: string) => {
    setApiKey('openai', key);
    if (key) {
      initOpenAIClient(key);
      setOpenaiConfigured(isOpenAIConfigured());
      addNotification({
        type: 'success',
        title: 'OpenAI API Key Saved',
        message: 'DALL-E is now ready for image generation',
      });
    }
  };

  const handleGeminiKeyChange = (key: string) => {
    setApiKey('gemini', key);
    if (key) {
      initGeminiClient(key);
      setGeminiConfigured(isGeminiConfigured());
      addNotification({
        type: 'success',
        title: 'Gemini API Key Saved',
        message: 'Gemini 2.0 Flash is now ready for content generation',
      });
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setPreferredProvider(provider);
    addNotification({
      type: 'info',
      title: 'AI Provider Changed',
      message: `Now using ${provider === 'anthropic' ? 'Claude (Anthropic)' : 'Gemini (Google)'} for content generation`,
    });
  };

  const updateSetting = (key: keyof AutomationSettings, value: boolean) => {
    setAutomationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Saving settings:', { niche, audience, tone, automationSettings });
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your configuration has been updated',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Automation Hub</h1>
        <p className="text-gray-400">Configure your autonomous growth engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Persona Configuration */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings size={20} className="text-primary" />
              Persona Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Niche / Category
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., SaaS, Fitness, Finance..."
                  className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Audience
                </label>
                <textarea
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Describe your ideal audience..."
                  rows={3}
                  className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Brand Voice
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {toneOptions.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`
                        py-2.5 px-4 rounded-xl text-sm font-medium capitalize transition-all
                        ${tone === t
                          ? 'bg-primary/20 text-primary-light border border-primary/30'
                          : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                        }
                      `}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Automation Toggles */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={20} className="text-accent-purple" />
              Automation Features
            </h3>

            <div>
              <ToggleSwitch
                enabled={automationSettings.autoPostDiscovery}
                onChange={(v) => updateSetting('autoPostDiscovery', v)}
                label="Auto-Post Discovery"
                description="Automatically find and curate trending content"
                icon={<Zap size={18} />}
              />
              <ToggleSwitch
                enabled={automationSettings.aiImageSynthesis}
                onChange={(v) => updateSetting('aiImageSynthesis', v)}
                label="AI Image Synthesis"
                description="Generate images for your posts automatically"
                icon={<ImageIcon size={18} />}
              />
              <ToggleSwitch
                enabled={automationSettings.smartScheduling}
                onChange={(v) => updateSetting('smartScheduling', v)}
                label="Smart Scheduling"
                description="Post at optimal times for maximum engagement"
                icon={<Clock size={18} />}
              />
              <ToggleSwitch
                enabled={automationSettings.autoEngagement}
                onChange={(v) => updateSetting('autoEngagement', v)}
                label="Auto-Engagement"
                description="Automatically reply to comments and mentions"
                icon={<MessageSquare size={18} />}
              />
            </div>
          </GlassCard>
        </div>

        {/* Platform Connections & API Keys */}
        <div className="space-y-6">
          {/* AI API Keys */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Key size={20} className="text-accent-pink" />
              AI API Keys
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Configure your AI providers to enable content and image generation.
            </p>
            <div className="space-y-4">
              <ApiKeyInput
                label="Anthropic API Key (Claude)"
                value={apiKeys.anthropic}
                onChange={handleAnthropicKeyChange}
                isConfigured={anthropicConfigured}
                placeholder="sk-ant-..."
              />
              <ApiKeyInput
                label="Google Gemini API Key"
                value={apiKeys.gemini || ''}
                onChange={handleGeminiKeyChange}
                isConfigured={geminiConfigured}
                placeholder="AIza..."
              />
              <ApiKeyInput
                label="OpenAI API Key (DALL-E)"
                value={apiKeys.openai}
                onChange={handleOpenAIKeyChange}
                isConfigured={openaiConfigured}
                placeholder="sk-..."
              />

              {/* Provider Selection */}
              {(anthropicConfigured || geminiConfigured) && (
                <div className="pt-4 border-t border-glass-border">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Preferred AI Provider for Content Generation
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleProviderChange('anthropic')}
                      disabled={!anthropicConfigured}
                      className={`
                        py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
                        ${selectedProvider === 'anthropic'
                          ? 'bg-primary/20 text-primary-light border border-primary/30'
                          : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                        }
                        ${!anthropicConfigured ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <span>Claude</span>
                      {selectedProvider === 'anthropic' && <Check size={14} />}
                    </button>
                    <button
                      onClick={() => handleProviderChange('gemini')}
                      disabled={!geminiConfigured}
                      className={`
                        py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
                        ${selectedProvider === 'gemini'
                          ? 'bg-primary/20 text-primary-light border border-primary/30'
                          : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                        }
                        ${!geminiConfigured ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <span>Gemini</span>
                      {selectedProvider === 'gemini' && <Check size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedProvider === 'anthropic'
                      ? 'Using Claude Sonnet for content generation'
                      : 'Using Gemini 2.0 Flash for content generation'
                    }
                  </p>
                </div>
              )}
            </div>
            {(!anthropicConfigured && !geminiConfigured) && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-xs text-warning">
                  Add an Anthropic or Gemini API key to enable AI-powered content generation
                </p>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Connected Platforms
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {platformCredentials.map((credential) => (
                <PlatformCard
                  key={credential.platform}
                  credential={credential}
                  onConnectOAuth1={credential.platform === 'twitter' ? handleConnectTwitterOAuth1 : undefined}
                  onDisconnect={credential.platform === 'twitter' ? handleDisconnectTwitter : undefined}
                  isLoading={credential.platform === 'twitter' && isConnecting}
                  authType={credential.platform === 'twitter' ? getTwitterAuthType() : null}
                />
              ))}
            </div>
          </GlassCard>

          {/* Quick Stats */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Automation Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-3xl font-bold gradient-text">127</p>
                <p className="text-sm text-gray-500">Posts Generated</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-3xl font-bold gradient-text">89%</p>
                <p className="text-sm text-gray-500">Engagement Rate</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-3xl font-bold gradient-text">24</p>
                <p className="text-sm text-gray-500">Hours Saved</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-3xl font-bold gradient-text">4.2K</p>
                <p className="text-sm text-gray-500">New Followers</p>
              </div>
            </div>
          </GlassCard>

          {/* Save Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            className="w-full"
          >
            Save Configuration
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
