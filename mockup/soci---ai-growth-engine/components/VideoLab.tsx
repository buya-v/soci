
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

// Use type casting instead of global augmentation to avoid "identical modifiers" and type mismatch conflicts
// with pre-existing 'aistudio' definitions in the environment.
const getAIStudio = () => (window as any).aistudio;

const VideoLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [image, setImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const aistudio = getAIStudio();
    if (aistudio) {
      const selected = await aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    }
  };

  const handleOpenKeySelector = async () => {
    const aistudio = getAIStudio();
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume the key selection was successful after triggering openSelectKey() to mitigate potential race conditions.
      setHasApiKey(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    setGenerating(true);
    setVideoUrl(null);
    setLoadingStep('Initializing Engine...');

    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key from the dialog.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'A professional cinematic video for social media',
        config: {
          numberOfVideos: 1,
          resolution,
          aspectRatio
        }
      };

      if (image) {
        config.image = {
          imageBytes: image.split(',')[1],
          mimeType: image.split(';')[0].split(':')[1]
        };
      }

      setLoadingStep('Transmitting request to Veo cluster...');
      let operation = await ai.models.generateVideos(config);

      const messages = [
        'Dreaming up frames...',
        'Synthesizing temporal consistency...',
        'Rendering cinematic lighting...',
        'Encoding high-fidelity motion...',
        'Almost there, final touches...'
      ];

      let msgIdx = 0;
      while (!operation.done) {
        setLoadingStep(messages[msgIdx % messages.length]);
        msgIdx++;
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setLoadingStep('Downloading assets...');
        // Append API key when fetching from the download link as required.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error(error);
      // Reset the key selection state if the request fails with "Requested entity was not found."
      if (error.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        alert("API Key session expired or invalid. Please re-select your key.");
      } else {
        alert("Generation failed. Ensure you have a valid paid project API key.");
      }
    } finally {
      setGenerating(false);
      setLoadingStep('');
    }
  };

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center p-20 glass-panel rounded-3xl space-y-6">
        <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center text-4xl">🔑</div>
        <h2 className="text-2xl font-bold">Paid API Key Required</h2>
        <p className="text-gray-400 text-center max-w-md">
          Veo video generation requires a paid Google Cloud Project API key. 
          Please select a key from a project with billing enabled.
        </p>
        {/* Link to the billing documentation as required by the Veo guidelines. */}
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noreferrer"
          className="text-indigo-400 text-sm underline"
        >
          Learn more about billing
        </a>
        <button 
          onClick={handleOpenKeySelector}
          className="gradient-bg px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold">Veo Motion Generator</h3>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Movement Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 mt-2 text-sm text-gray-200 h-24 focus:border-indigo-500 outline-none"
              placeholder="Describe the motion... e.g., 'A dramatic zoom into the glowing circuits of an AI brain'"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Aspect Ratio</label>
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 mt-2 text-sm focus:border-indigo-500 outline-none"
              >
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Quality</label>
              <select 
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 mt-2 text-sm focus:border-indigo-500 outline-none"
              >
                <option value="720p">HD (720p)</option>
                <option value="1080p">Full HD (1080p)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Animate Existing Image (Optional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`mt-2 border-2 border-dashed border-gray-800 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500/50 transition-colors ${image ? 'bg-indigo-600/5' : 'bg-transparent'}`}
            >
              {image ? (
                <div className="relative inline-block">
                  <img src={image} alt="Preview" className="h-24 rounded-lg object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >✕</button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <span className="text-2xl block mb-2">📸</span>
                  <p className="text-xs">Click to upload image to animate</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          <button 
            onClick={generateVideo}
            disabled={generating}
            className="w-full gradient-bg py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 disabled:opacity-50 hover:scale-[1.02] transition-transform"
          >
            {generating ? 'Engine Generating...' : 'Synthesize Video'}
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="glass-panel flex-1 rounded-3xl overflow-hidden border border-gray-800 flex items-center justify-center bg-black relative">
          {generating ? (
            <div className="text-center p-8 space-y-6">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-indigo-400">{loadingStep}</p>
                <p className="text-sm text-gray-500 italic">This usually takes 2-3 minutes. Don't close this tab.</p>
              </div>
            </div>
          ) : videoUrl ? (
            <video 
              src={videoUrl} 
              className={`w-full h-full object-contain ${aspectRatio === '9:16' ? 'max-h-[80vh]' : ''}`} 
              controls 
              autoPlay 
              loop
            />
          ) : (
            <div className="text-center p-12 space-y-4">
              <div className="text-6xl grayscale opacity-20">🎬</div>
              <p className="text-gray-500 max-w-xs mx-auto">Configure your temporal coordinates and hit Synthesize to generate your autonomous video asset.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLab;
