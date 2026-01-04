import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { Platform, Persona, Language } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';

// API key management
let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

export function initAnthropicClient(apiKey: string) {
  anthropicClient = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true, // For client-side demo; in production, use backend
  });
}

export function initOpenAIClient(apiKey: string) {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // For client-side demo; in production, use backend
  });
}

export function isAnthropicConfigured(): boolean {
  return anthropicClient !== null;
}

export function isOpenAIConfigured(): boolean {
  return openaiClient !== null;
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

export async function generateContent(params: ContentGenerationParams): Promise<GeneratedContent> {
  if (!anthropicClient) {
    throw new Error('Anthropic API key not configured. Please add your API key in Settings.');
  }

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

  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response');
  }

  try {
    const parsed = JSON.parse(textContent.text);
    return {
      caption: parsed.caption || '',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      hook: parsed.hook || '',
      callToAction: parsed.callToAction || '',
    };
  } catch {
    // If JSON parsing fails, extract content manually
    return {
      caption: textContent.text.slice(0, platformSettings.maxLength),
      hashtags: [],
      hook: '',
      callToAction: '',
    };
  }
}

export interface ContentVariation {
  caption: string;
  hashtags: string[];
  angle: string;
}

export async function generateContentVariations(
  params: ContentGenerationParams,
  count: number = 3
): Promise<ContentVariation[]> {
  if (!anthropicClient) {
    throw new Error('Anthropic API key not configured. Please add your API key in Settings.');
  }

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

  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response');
  }

  try {
    const parsed = JSON.parse(textContent.text);
    return parsed.variations || [];
  } catch {
    return [];
  }
}

export interface ImageGenerationParams {
  prompt: string;
  style?: 'natural' | 'vivid';
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
}

export async function generateImage(params: ImageGenerationParams): Promise<string> {
  if (!openaiClient) {
    throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
  }

  const { prompt, style = 'vivid', size = '1024x1024', quality = 'standard' } = params;

  const enhancedPrompt = `Create a modern, professional social media image: ${prompt}.
Style: Clean, high-quality, suitable for social media marketing.
Do not include any text or words in the image.`;

  const response = await openaiClient.images.generate({
    model: 'dall-e-3',
    prompt: enhancedPrompt,
    n: 1,
    size,
    style,
    quality,
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error('No image generated');
  }

  return imageUrl;
}

export async function generateImageFromContent(
  topic: string,
  platform: Platform,
  tone: Persona['tone']
): Promise<string> {
  if (!anthropicClient || !openaiClient) {
    throw new Error('Both Anthropic and OpenAI API keys are required for image generation.');
  }

  // First, use Claude to create an optimal image prompt
  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Create a DALL-E image prompt for a ${platform} post about "${topic}" with a ${tone} tone.

The image should be:
- Eye-catching and scroll-stopping
- Professional and high-quality
- Suitable for ${platform}
- No text in the image

Respond with just the image prompt, nothing else. Keep it under 200 characters.`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response');
  }

  const imagePrompt = textContent.text.trim();

  // Determine size based on platform
  const sizeMap: Record<Platform, '1024x1024' | '1024x1792' | '1792x1024'> = {
    instagram: '1024x1024',
    twitter: '1792x1024',
    linkedin: '1792x1024',
    tiktok: '1024x1792',
    facebook: '1792x1024',
  };

  return generateImage({
    prompt: imagePrompt,
    size: sizeMap[platform],
    style: 'vivid',
  });
}

export interface TrendAnalysis {
  relevanceScore: number;
  reasoning: string;
  suggestedAngles: string[];
  targetAudiences: string[];
  bestPlatforms: Platform[];
}

// Helper to format API errors with user-friendly messages
function formatApiError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('credit balance') || message.includes('too low')) {
    return new Error('API credits depleted. Please add credits at console.anthropic.com or update your API key.');
  }
  if (message.includes('invalid_api_key') || message.includes('401')) {
    return new Error('Invalid API key. Please check your API key in Automation settings.');
  }
  if (message.includes('rate_limit') || message.includes('429')) {
    return new Error('Rate limit exceeded. Please wait a moment and try again.');
  }

  return error instanceof Error ? error : new Error(message);
}

export async function analyzeTrendRelevance(
  trend: string,
  niche: string,
  topics: string[]
): Promise<TrendAnalysis> {
  if (!anthropicClient) {
    throw new Error('Anthropic API key not configured. Please add your API key in Automation settings.');
  }

  try {
    const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Analyze how relevant this trend is to the given niche and topics.

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

relevanceScore should be 0-100. Only include platforms from: twitter, instagram, linkedin, tiktok, facebook`,
      },
    ],
    system: 'You are a social media trend analyst. Respond with valid JSON only.',
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    try {
      return JSON.parse(textContent.text);
    } catch {
      return {
        relevanceScore: 50,
        reasoning: 'Unable to analyze',
        suggestedAngles: [],
        targetAudiences: [],
        bestPlatforms: ['twitter'],
      };
    }
  } catch (error) {
    throw formatApiError(error);
  }
}
