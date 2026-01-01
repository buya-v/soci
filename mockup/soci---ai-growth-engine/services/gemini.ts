
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Trend, UserNiche, GeneratedPost } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const discoverTrends = async (niche: UserNiche): Promise<Trend[]> => {
  // Use gemini-3-pro-preview for complex reasoning and factual trend analysis involving Google Search.
  // We avoid responseMimeType: "application/json" when using grounding tools per instructions.
  const prompt = `Find the top 5 most viral and relevant real-time trends for a brand in the "${niche.category}" niche. 
  Target audience: ${niche.targetAudience}. 
  Use Google Search to ensure trends are current and factual.
  
  Format your response exactly as a list of trends using this structure:
  ---
  TOPIC: [Trend Name]
  DESC: [Detailed description and viral potential]
  ACTION: [High-engagement post idea]
  RELEVANCE: [Number between 0 and 1]
  ---
  (repeat for each trend)`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // Per grounding guidelines: "The output response.text may not be in JSON format; do not attempt to parse it as JSON."
      // Thus, we handle the structured output manually.
    }
  });

  const text = response.text || "";
  const trends: Trend[] = [];
  const sections = text.split('---').filter(s => s.trim().startsWith('TOPIC:'));

  // Extract grounding sources as required by search grounding rules.
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
    title: chunk.web?.title || "Search Result",
    uri: chunk.web?.uri || "#"
  })) || [];

  sections.forEach((section, index) => {
    const topic = section.match(/TOPIC:\s*(.*)/)?.[1]?.trim() || "Unknown Trend";
    const description = section.match(/DESC:\s*(.*)/)?.[1]?.trim() || "";
    const action = section.match(/ACTION:\s*(.*)/)?.[1]?.trim() || "";
    const relevanceStr = section.match(/RELEVANCE:\s*([\d.]+)/)?.[1];
    const relevance = relevanceStr ? parseFloat(relevanceStr) : 0.8;

    trends.push({
      id: `trend-${Date.now()}-${index}`,
      topic,
      description,
      suggestedAction: action,
      relevance,
      sources
    });
  });

  return trends;
};

export const generatePostContent = async (trend: Trend, niche: UserNiche): Promise<Partial<GeneratedPost>> => {
  const prompt = `Create a viral social media post for the trend: "${trend.topic}".
  Context: ${trend.description}.
  Niche Brand Category: ${niche.category}.
  Brand Voice: ${niche.voice}.
  Target Audience: ${niche.targetAudience}.
  Provide a catchy caption, and 5-10 strategic hashtags.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caption: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          platform: { type: Type.STRING, description: "Suggested platform like Instagram, Twitter, etc." }
        },
        required: ["caption", "hashtags", "platform"]
      }
    }
  });

  // Accessing response.text as a property, not a method.
  return JSON.parse(response.text || "{}");
};

export const generatePostImage = async (caption: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `High-quality, professional aesthetic social media imagery for a post about: ${caption}. Modern, minimalist, and engaging visual style.`,
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  let imageUrl = "";
  // Iterating through all parts to find the image part as required by nano banana image generation guidelines.
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  return imageUrl;
};
