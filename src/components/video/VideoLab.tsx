import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Upload,
  Play,
  Pause,
  Download,
  Sparkles,
  Monitor,
  Smartphone,
  Square,
  Loader2,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Wand2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { isAnthropicConfigured, initAnthropicClient } from '@/services/ai';
import Anthropic from '@anthropic-ai/sdk';

type AspectRatio = '16:9' | '9:16' | '1:1';
type Resolution = '720p' | '1080p';
type VideoStyle = 'educational' | 'promotional' | 'storytelling' | 'tutorial';
type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'linkedin';

interface GeneratedScript {
  hook: string;
  body: string[];
  callToAction: string;
  visualSuggestions: string[];
  duration: string;
}

const videoStyleOptions: { id: VideoStyle; label: string; description: string }[] = [
  { id: 'educational', label: 'Educational', description: 'Informative & teaching' },
  { id: 'promotional', label: 'Promotional', description: 'Product or brand focused' },
  { id: 'storytelling', label: 'Storytelling', description: 'Narrative & engaging' },
  { id: 'tutorial', label: 'Tutorial', description: 'Step-by-step guide' },
];

const videoPlatformOptions: { id: VideoPlatform; label: string; maxDuration: string }[] = [
  { id: 'tiktok', label: 'TikTok', maxDuration: '60s' },
  { id: 'instagram', label: 'Reels', maxDuration: '90s' },
  { id: 'youtube', label: 'YouTube Shorts', maxDuration: '60s' },
  { id: 'linkedin', label: 'LinkedIn', maxDuration: '2min' },
];

const loadingMessages = [
  'Dreaming up frames...',
  'Synthesizing temporal consistency...',
  'Rendering cinematic lighting...',
  'Adding motion dynamics...',
  'Polishing final touches...',
];

interface AspectRatioOption {
  id: AspectRatio;
  label: string;
  icon: React.ReactNode;
}

const aspectRatioOptions: AspectRatioOption[] = [
  { id: '16:9', label: 'Landscape', icon: <Monitor size={16} /> },
  { id: '9:16', label: 'Portrait', icon: <Smartphone size={16} /> },
  { id: '1:1', label: 'Square', icon: <Square size={16} /> },
];

const resolutionOptions: Resolution[] = ['720p', '1080p'];

export function VideoLab() {
  const { apiKeys, addNotification } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Script generation state
  const [showScriptPanel, setShowScriptPanel] = useState(true);
  const [scriptTopic, setScriptTopic] = useState('');
  const [videoStyle, setVideoStyle] = useState<VideoStyle>('educational');
  const [videoPlatform, setVideoPlatform] = useState<VideoPlatform>('tiktok');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Initialize Anthropic client
  useEffect(() => {
    if (apiKeys.anthropic) {
      initAnthropicClient(apiKeys.anthropic);
    }
  }, [apiKeys.anthropic]);

  const anthropicReady = isAnthropicConfigured();

  // Cycle through loading messages
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setLoadingMessageIndex(0);

    // Simulate video generation (would call Veo API in production)
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Use a sample video URL for demo
    setGeneratedVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
    setIsGenerating(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleGenerateScript = async () => {
    if (!scriptTopic.trim()) return;

    if (!anthropicReady) {
      addNotification({
        type: 'warning',
        title: 'API Key Required',
        message: 'Configure Anthropic API key in Automation Hub',
      });
      return;
    }

    setIsGeneratingScript(true);

    try {
      const client = new Anthropic({
        apiKey: apiKeys.anthropic,
        dangerouslyAllowBrowser: true,
      });

      const platformInfo = videoPlatformOptions.find(p => p.id === videoPlatform);
      const styleInfo = videoStyleOptions.find(s => s.id === videoStyle);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are an expert video scriptwriter specializing in short-form social media content. Create engaging, platform-optimized scripts that capture attention immediately.

Output format: Respond with valid JSON only, no markdown, no code blocks.`,
        messages: [
          {
            role: 'user',
            content: `Create a ${videoStyle} video script for ${videoPlatform} about: "${scriptTopic}"

Requirements:
- Platform: ${platformInfo?.label} (max ${platformInfo?.maxDuration})
- Style: ${styleInfo?.description}
- Must start with a strong hook (first 3 seconds are crucial)
- Include visual suggestions for each section
- End with a clear call-to-action

Respond with this exact JSON structure:
{
  "hook": "The attention-grabbing opening line (spoken in first 3 seconds)",
  "body": ["Point 1 with key message", "Point 2 with supporting info", "Point 3 with value/insight"],
  "callToAction": "What viewers should do next",
  "visualSuggestions": ["Visual for hook", "Visual for body section", "Visual for CTA"],
  "duration": "Estimated video duration"
}

Make the script conversational, authentic, and optimized for ${videoPlatform}'s audience.`,
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      const parsed = JSON.parse(textContent.text);
      setGeneratedScript({
        hook: parsed.hook || '',
        body: Array.isArray(parsed.body) ? parsed.body : [],
        callToAction: parsed.callToAction || '',
        visualSuggestions: Array.isArray(parsed.visualSuggestions) ? parsed.visualSuggestions : [],
        duration: parsed.duration || '30-60s',
      });

      // Also set the motion prompt based on the script
      setPrompt(`${parsed.hook} - ${parsed.body.join('. ')} Visual style: cinematic, engaging, ${videoStyle}`);

      addNotification({
        type: 'success',
        title: 'Script Generated',
        message: 'Your video script is ready. Review and customize as needed.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Script Generation Failed',
        message: err instanceof Error ? err.message : 'Could not generate script',
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy to clipboard',
      });
    }
  };

  const getFullScript = () => {
    if (!generatedScript) return '';
    return `HOOK:\n${generatedScript.hook}\n\nBODY:\n${generatedScript.body.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nCALL TO ACTION:\n${generatedScript.callToAction}\n\nVISUAL SUGGESTIONS:\n${generatedScript.visualSuggestions.map((v, i) => `${i + 1}. ${v}`).join('\n')}`;
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '1:1': return 'aspect-square';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Video Lab</h1>
          <p className="text-gray-400">Create AI-powered video content from text prompts</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          anthropicReady ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
        }`}>
          <span className={`w-2 h-2 rounded-full ${anthropicReady ? 'bg-success' : 'bg-warning'}`} />
          Script AI {anthropicReady ? 'Ready' : 'Not Configured'}
        </div>
      </div>

      {/* AI Script Generator */}
      <GlassCard className="p-6">
        <button
          onClick={() => setShowScriptPanel(!showScriptPanel)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-purple/20">
              <FileText size={20} className="text-accent-purple" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Script Writer</h3>
              <p className="text-sm text-gray-500">Generate platform-optimized video scripts</p>
            </div>
          </div>
          {showScriptPanel ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {showScriptPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-4">
                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video Topic</label>
                  <input
                    type="text"
                    value={scriptTopic}
                    onChange={(e) => setScriptTopic(e.target.value)}
                    placeholder="e.g., 5 productivity tips for remote workers"
                    className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                    <div className="grid grid-cols-2 gap-2">
                      {videoPlatformOptions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setVideoPlatform(p.id)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                            videoPlatform === p.id
                              ? 'bg-primary/20 text-primary-light border border-primary/30'
                              : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                          }`}
                        >
                          <span className="block">{p.label}</span>
                          <span className="text-[10px] opacity-60">{p.maxDuration}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {videoStyleOptions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setVideoStyle(s.id)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                            videoStyle === s.id
                              ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                              : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  variant="primary"
                  onClick={handleGenerateScript}
                  disabled={!scriptTopic.trim() || isGeneratingScript || !anthropicReady}
                  className="w-full"
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Writing Script...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} className="mr-2" />
                      Generate Script
                    </>
                  )}
                </Button>

                {/* Generated Script Display */}
                <AnimatePresence>
                  {generatedScript && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 pt-4 border-t border-glass-border"
                    >
                      {/* Duration Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Estimated Duration</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          {generatedScript.duration}
                        </span>
                      </div>

                      {/* Hook Section */}
                      <div className="p-4 bg-accent-pink/5 rounded-xl border border-accent-pink/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-accent-pink uppercase">Hook (0-3s)</span>
                          <button
                            onClick={() => copyToClipboard(generatedScript.hook, 'hook')}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            {copiedSection === 'hook' ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-gray-400" />}
                          </button>
                        </div>
                        <p className="text-sm text-white">{generatedScript.hook}</p>
                      </div>

                      {/* Body Section */}
                      <div className="p-4 bg-white/5 rounded-xl border border-glass-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">Main Content</span>
                          <button
                            onClick={() => copyToClipboard(generatedScript.body.join('\n'), 'body')}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            {copiedSection === 'body' ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-gray-400" />}
                          </button>
                        </div>
                        <ul className="space-y-2">
                          {generatedScript.body.map((point, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-300">
                              <span className="text-primary font-medium">{i + 1}.</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Section */}
                      <div className="p-4 bg-success/5 rounded-xl border border-success/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-success uppercase">Call to Action</span>
                          <button
                            onClick={() => copyToClipboard(generatedScript.callToAction, 'cta')}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            {copiedSection === 'cta' ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-gray-400" />}
                          </button>
                        </div>
                        <p className="text-sm text-white">{generatedScript.callToAction}</p>
                      </div>

                      {/* Visual Suggestions */}
                      <div className="p-4 bg-accent-purple/5 rounded-xl border border-accent-purple/20">
                        <span className="text-xs font-bold text-accent-purple uppercase block mb-2">Visual Suggestions</span>
                        <ul className="space-y-1">
                          {generatedScript.visualSuggestions.map((visual, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                              <Video size={12} className="mt-0.5 text-accent-purple" />
                              <span>{visual}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Copy Full Script */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(getFullScript(), 'full')}
                        className="w-full"
                      >
                        {copiedSection === 'full' ? (
                          <>
                            <Check size={14} className="mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="mr-1" />
                            Copy Full Script
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Controls */}
        <div className="space-y-6">
          {/* Motion Prompt */}
          <GlassCard className="p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Motion Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to create... e.g., 'A futuristic city at sunset with flying cars and neon lights'"
              rows={4}
              className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-primary transition-colors resize-none"
            />
            {generatedScript && (
              <p className="text-xs text-gray-500 mt-2">
                Prompt auto-filled from script. Edit as needed.
              </p>
            )}
          </GlassCard>

          {/* Aspect Ratio */}
          <GlassCard className="p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {aspectRatioOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setAspectRatio(option.id)}
                  className={`
                    py-3 px-4 rounded-xl text-sm font-medium transition-all
                    flex flex-col items-center gap-2
                    ${aspectRatio === option.id
                      ? 'bg-primary/20 text-primary-light border border-primary/30'
                      : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                    }
                  `}
                >
                  {option.icon}
                  <span>{option.label}</span>
                  <span className="text-xs opacity-60">{option.id}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Resolution */}
          <GlassCard className="p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Resolution
            </label>
            <div className="grid grid-cols-2 gap-2">
              {resolutionOptions.map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`
                    py-2.5 px-4 rounded-xl text-sm font-medium transition-all
                    ${resolution === res
                      ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                      : 'bg-white/5 text-gray-400 border border-glass-border hover:border-glass-border-hover'
                    }
                  `}
                >
                  {res}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Source Image Upload */}
          <GlassCard className="p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Source Image (Optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-glass-border rounded-xl text-gray-400 hover:border-primary/50 hover:text-primary-light transition-all flex flex-col items-center gap-2"
            >
              {sourceImage ? (
                <img src={sourceImage} alt="Source" className="h-20 object-contain rounded" />
              ) : (
                <>
                  <Upload size={24} />
                  <span className="text-sm">Upload image to animate</span>
                </>
              )}
            </button>
          </GlassCard>

          {/* Generate Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {loadingMessages[loadingMessageIndex]}
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Video
              </>
            )}
          </Button>
        </div>

        {/* Video Preview */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>

            <div className={`bg-gray-900 rounded-xl overflow-hidden mx-auto max-w-md ${getAspectRatioClass()}`}>
              {isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-t-accent-purple animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  </div>
                  <p className="text-sm text-gray-400 animate-pulse">
                    {loadingMessages[loadingMessageIndex]}
                  </p>
                </div>
              ) : generatedVideoUrl ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={generatedVideoUrl}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <button
                    onClick={togglePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause size={48} className="text-white" />
                    ) : (
                      <Play size={48} className="text-white" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                  <Video size={48} className="mb-2 opacity-50" />
                  <p className="text-sm">Video preview</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Video Actions */}
          {generatedVideoUrl && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Button variant="secondary" className="flex-1">
                <Sparkles size={16} />
                Regenerate
              </Button>
              <Button variant="primary" className="flex-1">
                <Download size={16} />
                Download
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
