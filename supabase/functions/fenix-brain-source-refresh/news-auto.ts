const MODEL_DEFAULT = "Qwen/Qwen2.5-7B-Instruct";

function clean(value:string) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseJson(text:string) {
  const raw=clean(text);
  try { return JSON.parse(raw); } catch {}
  const fenced=raw.match(/\{[\s\S]*\}/);
  if (!fenced) return null;
  try { return JSON.parse(fenced[0]); } catch { return null; }
}

function tokens(value:string) {
  return new Set(
    clean(value).toLocaleLowerCase("bn-BD")
      .replace(/[^\p{L}\p{N}\s]/gu," ")
      .split(/\s+/)
      .filter((x)=>x.length>=3),
  );
}

export function titleSimilarity(a:string,b:string) {
  const aa=tokens(a), bb=tokens(b);
  if (!aa.size || !bb.size) return 0;
  let hit=0;
  for (const token of aa) if (bb.has(token)) hit++;
  return hit / new Set([...aa,...bb]).size;
}

function phraseOverlap(source:string, generated:string) {
  const s=clean(source).toLocaleLowerCase("bn-BD").split(/\s+/).filter((x)=>x.length>2);
  const g=clean(generated).toLocaleLowerCase("bn-BD").split(/\s+/).filter((x)=>x.length>2);
  if(s.length<8 || g.length<8) return 0;
  const sh=new Set<string>();
  for(let i=0;i<s.length-3;i++) sh.add(s.slice(i,i+4).join(" "));
  let hits=0;
  for(let i=0;i<g.length-3;i++) if(sh.has(g.slice(i,i+4).join(" "))) hits++;
  return hits / Math.max(1,g.length-3);
}

export async function fetchArticleText(fetchFn:(url:string)=>Promise<string>, url:string) {
  const html=await fetchFn(url);
  const articleMatch=html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)
    || html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const source=articleMatch?.[1] || html;
  const cleaned=source
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi," ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi," ")
    .replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/gi," ")
    .replace(/&amp;/gi,"&")
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/&lt;/gi,"<")
    .replace(/&gt;/gi,">")
    .replace(/\s+/g," ")
    .trim();
  return cleaned.slice(0,9000);
}

export function extractPublishedAt(html:string) {
  const candidates=[
    html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)/i)?.[1],
    html.match(/<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)/i)?.[1],
    html.match(/<time[^>]+datetime=["']([^"']+)/i)?.[1],
  ].filter(Boolean) as string[];
  for(const value of candidates){
    const date=new Date(value);
    if(!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

export async function summarizeNews({
  token,
  sourceName,
  sourceUrl,
  title,
  publishedAt,
  articleText,
}:{
  token:string;
  sourceName:string;
  sourceUrl:string;
  title:string;
  publishedAt:string|null;
  articleText:string;
}) {
  const prompt=[
    "You are the editorial summarizer for FeniX News.",
    "Create an ORIGINAL, concise news brief from the supplied source article.",
    "Do not copy sentences. Do not preserve long phrases. Do not invent facts, quotes, dates, numbers, people, locations, causes, or outcomes.",
    "Use only facts explicitly present in the supplied article text.",
    "Return ONLY valid JSON with these keys:",
    "title_bn,title_en,excerpt_bn,excerpt_en,summary_bn,summary_en,key_points_bn,key_points_en,why_it_matters_bn,why_it_matters_en,category,importance,quality_score,local_relevance.",
    "category must be one of local,business,jobs,events,public_notice,fenix.",
    "importance must be one of low,normal,high.",
    "key_points_bn and key_points_en must each be arrays of 3 to 5 short factual statements.",
    "why_it_matters must be cautious; if impact is not stated or cannot be inferred directly from the source, say that the practical impact is not independently confirmed.",
    "quality_score and local_relevance must be numbers from 0 to 1.",
    "The output will be published without a human click, so refuse to guess rather than fill gaps.",
    "",
    "SOURCE:",
    JSON.stringify({sourceName,sourceUrl,publishedAt,title,articleText:articleText.slice(0,8500)}),
  ].join("\n");

  const response=await fetch("https://router.huggingface.co/v1/chat/completions",{
    method:"POST",
    headers:{
      Authorization:"Bearer "+token,
      "Content-Type":"application/json",
    },
    body:JSON.stringify({
      model:Deno.env.get("FENI_NEWS_AI_MODEL") || MODEL_DEFAULT,
      messages:[
        {role:"system",content:"Return JSON only. No markdown. No extra commentary."},
        {role:"user",content:prompt},
      ],
      temperature:0.1,
      max_tokens:900,
    }),
  });

  if(!response.ok) throw new Error("News AI provider returned "+response.status);
  const data=await response.json();
  const text=String(data?.choices?.[0]?.message?.content || "");
  const parsed=parseJson(text);
  if(!parsed) throw new Error("News AI returned invalid JSON");

  const required=["title_bn","title_en","excerpt_bn","excerpt_en","summary_bn","summary_en","key_points_bn","key_points_en","why_it_matters_bn","why_it_matters_en","category","importance","quality_score","local_relevance"];
  for(const key of required) if(parsed[key]===undefined || parsed[key]===null) throw new Error("News AI missing "+key);

  const generated=[parsed.summary_bn,parsed.summary_en,parsed.excerpt_bn,parsed.excerpt_en,...(parsed.key_points_bn||[]),...(parsed.key_points_en||[]),parsed.why_it_matters_bn,parsed.why_it_matters_en].join(" ");
  if(phraseOverlap(articleText,generated)>0.28) throw new Error("Generated brief is too close to source text");

  if(
    !Array.isArray(parsed.key_points_bn) || !Array.isArray(parsed.key_points_en) ||
    parsed.key_points_bn.length<3 || parsed.key_points_en.length<3 ||
    String(parsed.title_bn).length<8 || String(parsed.title_en).length<8 ||
    String(parsed.summary_bn).length<120 || String(parsed.summary_en).length<120
  ) throw new Error("Generated brief failed quality validation");

  if(!["local","business","jobs","events","public_notice","fenix"].includes(parsed.category)) parsed.category="local";
  parsed.quality_score=Number(parsed.quality_score);
  parsed.local_relevance=Number(parsed.local_relevance);

  if(!Number.isFinite(parsed.quality_score) || !Number.isFinite(parsed.local_relevance)) {
    throw new Error("Generated brief returned invalid scores");
  }
  if(parsed.quality_score<0.78 || parsed.local_relevance<0.55) {
    throw new Error("Generated brief did not pass quality/local relevance threshold");
  }
  return parsed;
}

export function buildPublishedContent(brief:any,sourceName:string,sourceUrl:string,automationNote:string) {
  const bnPoints=(brief.key_points_bn||[]).slice(0,5).map((x:string)=>"• "+clean(x)).join("\n");
  const enPoints=(brief.key_points_en||[]).slice(0,5).map((x:string)=>"• "+clean(x)).join("\n");
  const bn=[
    clean(brief.summary_bn),
    "",
    "মূল তথ্য",
    bnPoints,
    "",
    "কেন গুরুত্বপূর্ণ",
    clean(brief.why_it_matters_bn),
    "",
    automationNote,
  ].join("\n");
  const en=[
    clean(brief.summary_en),
    "",
    "Key points",
    enPoints,
    "",
    "Why it matters",
    clean(brief.why_it_matters_en),
    "",
    automationNote,
  ].join("\n");
  return {content_bn:bn.slice(0,10000),content_en:en.slice(0,10000)};
}

export { clean };
