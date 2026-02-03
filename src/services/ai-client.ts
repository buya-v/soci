/**
 * Secure AI client that calls serverless functions instead of exposing API keys in browser
 * This replaces the direct AI SDK calls with server-side proxied requests
 */

import type { Platform, Persona, Language } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';

// API base URL - uses relative paths for same-origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// AI Provider preference
export type AIProvider = 'anthropic' | 'gemini';
let preferredProvider: AIProvider = 'anthropic';

export function setPreferredProvider(provider: AIProvider) {
  preferredProvider = provider;
}

export function getPreferredProvider(): AIProvider {
  return preferredProvider;
}

// Platform-specific character limits and styles
const platformConfig: Record<Platform, { maxLength: number; style: string }> = {
  twitter: {
    maxLength: 280,
    style: 'concise, punchy, uses 1-2 relevant emojis, includes a hook',
  },
  instagram: {
    maxLength: 2200,
    style: 'engaging, storytelling, uses emojis, includes call-to-action, hashtag-friendly',
  },
  linkedin: {
    maxLength: 3000,
    style: 'professional, thought-leadership, insightful, uses line breaks for readability',
  },
  tiktok: {
    maxLength: 300,
    style: 'trendy, casual, uses gen-z language, hook in first line, emoji-heavy',
  },
  facebook: {
    maxLength: 63206,
    style: 'conversational, community-focused, shareable, uses emojis moderately, encourages engagement and discussion',
  },
};

// Tone configurations
const toneConfig: Record<Persona['tone'], string> = {
  professional: 'authoritative, data-driven, industry expert, credible',
  casual: 'friendly, conversational, relatable, approachable',
  witty: 'clever, humorous, uses wordplay, memorable one-liners',
  inspirational: 'motivating, uplifting, visionary, empowering',
};

export interface ContentGenerationParams {
  topic: string;
  platform: Platform;
  tone: Persona['tone'];
  niche?: string;
  targetAudience?: string;
  includeHashtags?: boolean;
  additionalContext?: string;
  language?: Language;
}

export interface GeneratedContent {
  caption: string;
  hashtags: string[];
  hook: string;
  callToAction: string;
}

export interface ContentVariation {
  caption: string;
  hashtags: string[];
  angle: string;
}

export interface ImageGenerationParams {
  prompt: string;
  style?: 'natural' | 'vivid';
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
}

export interface TrendAnalysis {
  relevanceScore: number;
  reasoning: string;
  suggestedAngles: string[];
  targetAudiences: string[];
  bestPlatforms: Platform[];
}

/**
 * Call AI API via serverless function (secure)
 */
export async function callAI(systemPrompt: string, userPrompt: string, maxTokens: number = 1024): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/ai/generate-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemPrompt,
      userPrompt,
      provider: preferredProvider,
      maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

/**
 * Generate content for social media posts
 */
export async function generateContent(params: ContentGenerationParams): Promise<GeneratedContent> {
  const { topic, platform, tone, niche, targetAudience, includeHashtags = true, additionalContext, language = 'en' } = params;
  const platformSettings = platformConfig[platform];
  const toneDescription = toneConfig[tone];
  const languageConfig = SUPPORTED_LANGUAGES.find(l => l.code === language);
  const languageName = languageConfig?.name || 'English';

  const systemPrompt = `You are an expert social media content creator specializing in viral, high-engagement content.

Your expertise:
- Creating platform-optimized content that drives engagement
- Understanding audience psychology and what makes content shareable
- Crafting hooks that stop the scroll
- Writing compelling calls-to-action
- Writing authentic, native-level content in multiple languages

Output format: Respond with valid JSON only, no markdown, no code blocks.
IMPORTANT: All content must be written in ${languageName}. Do not use any other language for the caption or call-to-action.`;

  const userPrompt = `Create a ${platform} post about: "${topic}"

Requirements:
- Tone: ${toneDescription}
- Style: ${platformSettings.style}
- Maximum length: ${platformSettings.maxLength} characters for the main caption
- Language: Write ALL content in ${languageName} (${language})
${niche ? `- Niche/Industry: ${niche}` : ''}
${targetAudience ? `- Target audience: ${targetAudience}` : ''}
${additionalContext ? `- Additional context: ${additionalContext}` : ''}

Respond with this exact JSON structure:
{
  "caption": "The main post content in ${languageName} (under ${platformSettings.maxLength} chars)",
  "hashtags": ["relevant", "hashtags", "without", "hash", "symbol"],
  "hook": "The attention-grabbing first line in ${languageName}",
  "callToAction": "What you want the audience to do in ${languageName}"
}

${includeHashtags ? `Include 5-8 relevant hashtags that work well for ${languageName}-speaking audiences.` : 'Do not include hashtags.'}
Make the content authentic, not generic. Avoid clichés. Write in natural, native ${languageName}.`;

  const responseText = await callAI(systemPrompt, userPrompt, 1024);

  try {
    const parsed = JSON.parse(responseText);
    return {
      caption: parsed.caption || '',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      hook: parsed.hook || '',
      callToAction: parsed.callToAction || '',
    };
  } catch {
    // If JSON parsing fails, extract content manually
    return {
      caption: responseText.slice(0, platformSettings.maxLength),
      hashtags: [],
      hook: '',
      callToAction: '',
    };
  }
}

/**
 * Generate multiple content variations
 */
export async function generateContentVariations(
  params: ContentGenerationParams,
  count: number = 3
): Promise<ContentVariation[]> {
  const { topic, platform, tone, language = 'en' } = params;
  const platformSettings = platformConfig[platform];
  const toneDescription = toneConfig[tone];
  const languageConfig = SUPPORTED_LANGUAGES.find(l => l.code === language);
  const languageName = languageConfig?.name || 'English';

  const systemPrompt = `You are an expert social media content creator. Generate multiple unique variations of content, each with a different angle or approach.

Output format: Respond with valid JSON only, no markdown, no code blocks.
IMPORTANT: All content must be written in ${languageName}. Do not use any other language.`;

  const userPrompt = `Create ${count} different ${platform} posts about: "${topic}"

Requirements for each:
- Tone: ${toneDescription}
- Style: ${platformSettings.style}
- Maximum length: ${platformSettings.maxLength} characters
- Language: Write ALL content in ${languageName} (${language})
- Each variation should have a unique angle/approach

Respond with this exact JSON structure:
{
  "variations": [
    {
      "caption": "Post content in ${languageName}",
      "hashtags": ["relevant", "hashtags"],
      "angle": "Brief description of this variation's unique angle"
    }
  ]
}

Make each variation distinctly different while staying on topic. Write in natural, native ${languageName}.`;

  const responseText = await callAI(systemPrompt, userPrompt, 2048);

  try {
    const parsed = JSON.parse(responseText);
    return parsed.variations || [];
  } catch {
    return [];
  }
}

/**
 * Generate image via serverless function (secure)
 */
export async function generateImage(params: ImageGenerationParams): Promise<string> {
  const { prompt, style = 'vivid', size = '1024x1024', quality = 'standard' } = params;

  const response = await fetch(`${API_BASE_URL}/api/ai/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      style,
      size,
      quality,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Failed to generate image');
  }

  const data = await response.json();
  return data.imageUrl;
}

/**
 * Generate image with AI-optimized prompt
 */
export async function generateImageFromContent(
  topic: string,
  platform: Platform,
  tone: Persona['tone']
): Promise<string> {
  // First, create an optimal image prompt using AI
  const systemPrompt = 'You are an expert at creating DALL-E image prompts. Respond with just the prompt text, nothing else.';

  const userPrompt = `Create a DALL-E image prompt for a ${platform} post about "${topic}" with a ${tone} tone.

The image should be:
- Eye-catching and scroll-stopping
- Professional and high-quality
- Suitable for ${platform}
- No text in the image

Respond with just the image prompt, nothing else. Keep it under 200 characters.`;

  const imagePrompt = await callAI(systemPrompt, userPrompt, 256);

  // Determine size based on platform
  const sizeMap: Record<Platform, '1024x1024' | '1024x1792' | '1792x1024'> = {
    instagram: '1024x1024',
    twitter: '1792x1024',
    linkedin: '1792x1024',
    tiktok: '1024x1792',
    facebook: '1792x1024',
  };

  return generateImage({
    prompt: imagePrompt.trim(),
    size: sizeMap[platform],
    style: 'vivid',
  });
}

/**
 * Analyze trend relevance
 */
export async function analyzeTrendRelevance(
  trend: string,
  niche: string,
  topics: string[]
): Promise<TrendAnalysis> {
  const systemPrompt = 'You are a social media trend analyst. Respond with valid JSON only, no markdown, no code blocks.';

  const userPrompt = `Analyze how relevant this trend is to the given niche and topics.

Trend: "${trend}"
Niche: "${niche}"
Topics of interest: ${topics.join(', ')}

Respond with this exact JSON structure:
{
  "relevanceScore": 85,
  "reasoning": "Brief explanation of why this score",
  "suggestedAngles": ["angle 1", "angle 2", "angle 3"],
  "targetAudiences": ["audience 1", "audience 2"],
  "bestPlatforms": ["twitter", "linkedin"]
}

relevanceScore should be 0-100. Only include platforms from: twitter, instagram, linkedin, tiktok, facebook`;

  const responseText = await callAI(systemPrompt, userPrompt, 512);

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      relevanceScore: 50,
      reasoning: 'Unable to analyze',
      suggestedAngles: [],
      targetAudiences: [],
      bestPlatforms: ['twitter'],
    };
  }
}

// Compatibility functions - AI is now always configured server-side
export function isAnyAIConfigured(): boolean {
  return true; // Server-side keys
}

export function isAnthropicConfigured(): boolean {
  return true; // Server-side keys
}

export function isOpenAIConfigured(): boolean {
  return true; // Server-side keys
}

export function isGeminiConfigured(): boolean {
  return true; // Server-side keys
}
