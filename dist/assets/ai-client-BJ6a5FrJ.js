const v=[{code:"en",name:"English",nativeName:"English",direction:"ltr"},{code:"mn",name:"Mongolian",nativeName:"Монгол",direction:"ltr"},{code:"es",name:"Spanish",nativeName:"Español",direction:"ltr"},{code:"fr",name:"French",nativeName:"Français",direction:"ltr"},{code:"de",name:"German",nativeName:"Deutsch",direction:"ltr"},{code:"pt",name:"Portuguese",nativeName:"Português",direction:"ltr"},{code:"it",name:"Italian",nativeName:"Italiano",direction:"ltr"},{code:"ja",name:"Japanese",nativeName:"日本語",direction:"ltr"},{code:"zh",name:"Chinese",nativeName:"中文",direction:"ltr"},{code:"ko",name:"Korean",nativeName:"한국어",direction:"ltr"},{code:"ar",name:"Arabic",nativeName:"العربية",direction:"rtl"},{code:"hi",name:"Hindi",nativeName:"हिन्दी",direction:"ltr"},{code:"ru",name:"Russian",nativeName:"Русский",direction:"ltr"},{code:"nl",name:"Dutch",nativeName:"Nederlands",direction:"ltr"},{code:"tr",name:"Turkish",nativeName:"Türkçe",direction:"ltr"}],w="";let p="anthropic";function b(n){p=n}function A(){return p}const $={twitter:{maxLength:280,style:"concise, punchy, uses 1-2 relevant emojis, includes a hook"},instagram:{maxLength:2200,style:"engaging, storytelling, uses emojis, includes call-to-action, hashtag-friendly"},linkedin:{maxLength:3e3,style:"professional, thought-leadership, insightful, uses line breaks for readability"},tiktok:{maxLength:300,style:"trendy, casual, uses gen-z language, hook in first line, emoji-heavy"},facebook:{maxLength:63206,style:"conversational, community-focused, shareable, uses emojis moderately, encourages engagement and discussion"}},N={professional:"authoritative, data-driven, industry expert, credible",casual:"friendly, conversational, relatable, approachable",witty:"clever, humorous, uses wordplay, memorable one-liners",inspirational:"motivating, uplifting, visionary, empowering"};async function f(n,o,a=1024){const e=await fetch(`${w}/api/ai/generate-content`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemPrompt:n,userPrompt:o,provider:p,maxTokens:a})});if(!e.ok){const t=await e.json().catch(()=>({error:"Request failed"}));throw new Error(t.error||`Request failed with status ${e.status}`)}return(await e.json()).text}async function x(n){const{topic:o,platform:a,tone:e,niche:i,targetAudience:t,includeHashtags:h=!0,additionalContext:l,language:d="en"}=n,r=$[a],m=N[e],u=v.find(c=>c.code===d),s=(u==null?void 0:u.name)||"English",g=`You are an expert social media content creator specializing in viral, high-engagement content.

Your expertise:
- Creating platform-optimized content that drives engagement
- Understanding audience psychology and what makes content shareable
- Crafting hooks that stop the scroll
- Writing compelling calls-to-action
- Writing authentic, native-level content in multiple languages

Output format: Respond with valid JSON only, no markdown, no code blocks.
IMPORTANT: All content must be written in ${s}. Do not use any other language for the caption or call-to-action.`,k=`Create a ${a} post about: "${o}"

Requirements:
- Tone: ${m}
- Style: ${r.style}
- Maximum length: ${r.maxLength} characters for the main caption
- Language: Write ALL content in ${s} (${d})
${i?`- Niche/Industry: ${i}`:""}
${t?`- Target audience: ${t}`:""}
${l?`- Additional context: ${l}`:""}

Respond with this exact JSON structure:
{
  "caption": "The main post content in ${s} (under ${r.maxLength} chars)",
  "hashtags": ["relevant", "hashtags", "without", "hash", "symbol"],
  "hook": "The attention-grabbing first line in ${s}",
  "callToAction": "What you want the audience to do in ${s}"
}

${h?`Include 5-8 relevant hashtags that work well for ${s}-speaking audiences.`:"Do not include hashtags."}
Make the content authentic, not generic. Avoid clichés. Write in natural, native ${s}.`,y=await f(g,k,1024);try{const c=JSON.parse(y);return{caption:c.caption||"",hashtags:Array.isArray(c.hashtags)?c.hashtags:[],hook:c.hook||"",callToAction:c.callToAction||""}}catch{return{caption:y.slice(0,r.maxLength),hashtags:[],hook:"",callToAction:""}}}async function T(n,o=3){const{topic:a,platform:e,tone:i,language:t="en"}=n,h=$[e],l=N[i],d=v.find(g=>g.code===t),r=(d==null?void 0:d.name)||"English",m=`You are an expert social media content creator. Generate multiple unique variations of content, each with a different angle or approach.

Output format: Respond with valid JSON only, no markdown, no code blocks.
IMPORTANT: All content must be written in ${r}. Do not use any other language.`,u=`Create ${o} different ${e} posts about: "${a}"

Requirements for each:
- Tone: ${l}
- Style: ${h.style}
- Maximum length: ${h.maxLength} characters
- Language: Write ALL content in ${r} (${t})
- Each variation should have a unique angle/approach

Respond with this exact JSON structure:
{
  "variations": [
    {
      "caption": "Post content in ${r}",
      "hashtags": ["relevant", "hashtags"],
      "angle": "Brief description of this variation's unique angle"
    }
  ]
}

Make each variation distinctly different while staying on topic. Write in natural, native ${r}.`,s=await f(m,u,2048);try{return JSON.parse(s).variations||[]}catch{return[]}}async function S(n){const{prompt:o,style:a="vivid",size:e="1024x1024",quality:i="standard"}=n,t=await fetch(`${w}/api/ai/generate-image`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:o,style:a,size:e,quality:i})});if(!t.ok){const l=await t.json().catch(()=>({error:"Request failed"}));throw new Error(l.error||"Failed to generate image")}return(await t.json()).imageUrl}async function P(n,o,a){const e="You are a social media trend analyst. Respond with valid JSON only, no markdown, no code blocks.",i=`Analyze how relevant this trend is to the given niche and topics.

Trend: "${n}"
Niche: "${o}"
Topics of interest: ${a.join(", ")}

Respond with this exact JSON structure:
{
  "relevanceScore": 85,
  "reasoning": "Brief explanation of why this score",
  "suggestedAngles": ["angle 1", "angle 2", "angle 3"],
  "targetAudiences": ["audience 1", "audience 2"],
  "bestPlatforms": ["twitter", "linkedin"]
}

relevanceScore should be 0-100. Only include platforms from: twitter, instagram, linkedin, tiktok, facebook`,t=await f(e,i,512);try{return JSON.parse(t)}catch{return{relevanceScore:50,reasoning:"Unable to analyze",suggestedAngles:[],targetAudiences:[],bestPlatforms:["twitter"]}}}function O(){return!0}function L(){return!0}function R(){return!0}export{v as S,P as a,S as b,T as c,f as d,A as e,L as f,x as g,R as h,O as i,b as s};
