import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildPublishedContent, extractPublishedAt, fetchArticleText, summarizeNews, titleSimilarity, clean as cleanNewsText } from "../_shared/news-auto.ts";

const MAX_EMBEDDING_BACKFILL = 12;

const ALLOWED_HOSTS = new Set([
  "bangladesh.gov.bd","feni.gov.bd","bbs.feni.gov.bd","sadar.feni.gov.bd",
  "chhagalnaiya.feni.gov.bd","daganbhuiyan.feni.gov.bd","fulgazi.feni.gov.bd",
  "parshuram.feni.gov.bd","sonagazi.feni.gov.bd","lged.sadar.feni.gov.bd",
  "zpfeni.gov.bd","feni.judiciary.gov.bd",
  "www.ntvbd.com","publisher.ntvbd.com","www.prothomalo.com",
  "www.ajkerpatrika.com","fenirshomoy.com","www.fenirshomoy.com",
  "feninewsbd.com","www.feninewsbd.com",
]);

function isAllowedSourceUrl(raw: string) {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function cleanHtml(input: string) {
  let html = input;
  for (const tag of ["script","style","noscript","svg","template"]) {
    html = html.replace(new RegExp("<" + tag + "[^>]*>[\\s\\S]*?<\\/" + tag + ">","gi")," ");
  }
  return html.replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/gi," ")
    .replace(/&amp;/gi,"&")
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/&lt;/gi,"<")
    .replace(/&gt;/gi,">")
    .replace(/\s+/g," ")
    .trim();
}

const NEWS_LOCAL_TERMS = [
  "ফেনী","ফেনীতে","ফেনী সদর","ছাগলনাইয়া","ছাগলনাইয়া","দাগনভূঞা","দাগনভূইয়া",
  "ফুলগাজী","পরশুরাম","সোনাগাজী","মহিপাল","ফেনী শহর","feni","chhagalnaiya",
  "daganbhuiyan","fulgazi","parshuram","sonagazi",
];

const NEWS_NAV_NOISE = new Set([
  "home","হোম","latest","সর্বশেষ","জাতীয়","আন্তর্জাতিক","বাংলাদেশ","বিশ্ব",
  "অর্থনীতি","খেলা","বিনোদন","শিক্ষা","রাজনীতি","contact","যোগাযোগ","about","প্রথম পাতা",
]);

function cleanTitle(input: string) {
  return cleanHtml(input)
    .replace(/[|•]+/g," ")
    .replace(/\s+/g," ")
    .trim()
    .slice(0,240);
}

function isNewsItemTitle(value: string) {
  const normalized=value.trim().toLowerCase();
  return normalized.length>=8 &&
    normalized.length<=240 &&
    !NEWS_NAV_NOISE.has(normalized) &&
    !/^page\s*\d+$/i.test(normalized);
}

function isLikelyStoryUrl(itemUrl:string, sourceUrl:string, parserKey:string) {
  const item=new URL(itemUrl);
  const source=new URL(sourceUrl);
  if(item.hostname.toLowerCase()!==source.hostname.toLowerCase()) return false;

  const path=item.pathname.toLowerCase();

  if(parserKey==="notice_html") {
    return (
      /\/(notice|notices)(\/|$)/i.test(path) ||
      /\/(form-(administrative|legal-aid|circulars))(\/|$)/i.test(path) ||
      /notice|notices/i.test(decodeURIComponent(path))
    );
  }

  if(/\/(category|topic|tag|author|page|search|archive|feed|wp-json)(\/|$)/i.test(path)) return false;
  if(/\/(about|contact|privacy|terms|login|register|menu)(\/|$)/i.test(path)) return false;
  return true;
}
function extractNewsItems(raw: string, sourceUrl: string, parserKey: string) {
  const items:{title:string;url:string;publishedAt:string|null}[]=[];
  const seen=new Set<string>();
  const sourcePage=new URL(sourceUrl);
  const localOnly=/fenirshomoy\.com|feninewsbd\.com/i.test(sourceUrl);

  const regex=/<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  for(const match of raw.matchAll(regex)) {
    const href=String(match[2]??"").trim();
    const title=cleanTitle(String(match[3]??""));
    if(!href||!isNewsItemTitle(title)) continue;

    let itemUrl:string;
    try {
      const url=new URL(href,sourcePage);
      if(!isAllowedSourceUrl(url.toString())) continue;
      if(url.hostname.toLowerCase()!==sourcePage.hostname.toLowerCase()) continue;
      url.hash="";
      itemUrl=url.toString();
      if(!isLikelyStoryUrl(itemUrl,sourceUrl,parserKey)) continue;
    } catch {
      continue;
    }

    if(itemUrl===sourcePage.toString() || seen.has(itemUrl)) continue;

    const localRelevant=NEWS_LOCAL_TERMS.some((term)=>
      title.toLowerCase().includes(term.toLowerCase()) ||
      itemUrl.toLowerCase().includes(term.toLowerCase()),
    );

    if(parserKey==="news_html" && localOnly && !localRelevant) continue;

    seen.add(itemUrl);
    items.push({title,url:itemUrl,publishedAt:null});
    if(items.length>=24) break;
  }

  return items;
}

function categoryForNews(title:string, parserKey:string) {
  if(parserKey==="notice_html") return "public_notice";
  const value=title.toLowerCase();
  if(value.includes("চাকরি")||value.includes("নিয়োগ")||value.includes("নিয়োগ")||value.includes("job")) return "jobs";
  if(value.includes("ব্যবসা")||value.includes("বাজার")||value.includes("business")) return "business";
  if(value.includes("অনুষ্ঠান")||value.includes("উৎসব")||value.includes("event")) return "events";
  return "local";
}

async function fetchAllowlistedSource(sourceUrl:string,headers:Record<string,string>) {
  let currentUrl=sourceUrl;
  for(let redirectCount=0;redirectCount<=3;redirectCount+=1) {
    if(!isAllowedSourceUrl(currentUrl)) {
      throw new Error("Blocked redirect to non-allowlisted host");
    }

    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15000);
    let response:Response;
    try {
      response=await fetch(currentUrl,{headers,redirect:"manual",signal:controller.signal});
    } finally {
      clearTimeout(timeout);
    }

    if([301,302,303,307,308].includes(response.status)) {
      const location=response.headers.get("location");
      if(!location) throw new Error("Redirect without location");
      currentUrl=new URL(location,currentUrl).toString();
      continue;
    }

    return {response,finalUrl:currentUrl};
  }

  throw new Error("Too many redirects");
}

async function publishDiscoveredNews(
  db:any,
  source:any,
  items:{title:string;url:string;publishedAt:string|null}[],
  now:string,
) {
  if(!items.length) return {discovered:0,inserted:0,publicationStatus:"none"};
  if(!source.auto_publish || Number(source.trust_tier || 99) > 2) {
    return {discovered:items.length,inserted:0,publicationStatus:"review"};
  }

  const recent=await db
    .from("news_posts")
    .select("title_bn,title_en,source_item_key")
    .eq("status","published")
    .order("published_at",{ascending:false})
    .limit(200);

  const recentTitles=(recent.data||[]).map((row:any)=>cleanNewsText([row.title_bn,row.title_en].filter(Boolean).join(" ")));
  const rows:any[]=[];
  let inserted=0;
  const maxPerRun=4;

  for(const item of items) {
    if(rows.length>=maxPerRun) break;

    try {
      const fetched=await fetchAllowlistedSource(item.url,{
        "User-Agent":"FeniX-News-AutoPublisher/1.0",
      });
      if(!fetched.response.ok) throw new Error("Article HTTP "+fetched.response.status);
      const raw=await fetched.response.text();
      if(raw.length>500000) throw new Error("Article exceeds safe read limit");

      const articleText=await fetchArticleText(async()=>raw,item.url);
      if(articleText.length<500) throw new Error("Article content too short");

      const sourcePublishedAt=extractPublishedAt(raw)||item.publishedAt||null;
      if(sourcePublishedAt) {
        const ageMs=Date.now()-Date.parse(sourcePublishedAt);
        if(Number.isFinite(ageMs) && ageMs>72*3600000) continue;
      }

      const brief=await summarizeNews({
        token:Deno.env.get("HUGGINGFACE_API_KEY")||"",
        sourceName:String(source.publisher||source.title||"FeniX News Source"),
        sourceUrl:item.url,
        title:item.title,
        publishedAt:sourcePublishedAt,
        articleText,
      });

      const combinedTitle=cleanNewsText([brief.title_bn,brief.title_en].join(" "));
      const duplicate=recentTitles.some((existing:string)=>titleSimilarity(combinedTitle,existing)>=0.76);
      if(duplicate) continue;

      const fingerprint=await sha256(combinedTitle.toLocaleLowerCase("bn-BD").replace(/\s+/g," ").trim());
      const automationStatus=Number(source.trust_tier||99)===1?"auto_official":"auto_curated";
      const sourceName=String(source.publisher||source.title||"FeniX News Source");
      const automationNote=Number(source.trust_tier||99)===1
        ? `FeniX-এর automated official-source brief। মূল তথ্য ${sourceName}-এর প্রকাশিত উৎস থেকে সংক্ষেপ করা হয়েছে; প্রয়োজনে Source খুলে মূল নোটিশ দেখুন।`
        : `FeniX-এর automated curated brief। ${sourceName}-এর প্রকাশিত প্রতিবেদনের তথ্য সংক্ষেপ ও পুনর্গঠন করা হয়েছে; পূর্ণ তথ্যের জন্য Source দেখুন।`;

      const content=buildPublishedContent(brief,sourceName,item.url,automationNote);

      const row={
        slug:"auto-"+fingerprint.slice(0,20),
        title_bn:cleanNewsText(brief.title_bn).slice(0,240),
        title_en:cleanNewsText(brief.title_en).slice(0,240),
        excerpt_bn:cleanNewsText(brief.excerpt_bn).slice(0,900),
        excerpt_en:cleanNewsText(brief.excerpt_en).slice(0,900),
        content_bn:content.content_bn,
        content_en:content.content_en,
        category:brief.category,
        status:"published",
        featured:false,
        breaking:false,
        source_name:sourceName,
        source_url:item.url,
        source_item_key:await sha256(item.url),
        source_published_at:sourcePublishedAt,
        discovered_at:now,
        automation_status:automationStatus,
        verification_status:Number(source.trust_tier||99)===1?"official_source":"reported",
        image_url:null,
        author_id:null,
        published_at:now,
        story_fingerprint:fingerprint,
        ads_eligible:false,
      };

      const ins=await db.from("news_posts").insert(row).select("id").maybeSingle();
      if(ins.error) {
        if(ins.error.code==="23505") continue;
        throw new Error("News insert failed: "+ins.error.message);
      }
      if(ins.data?.id){
        inserted++;
        rows.push(row);
        recentTitles.push(combinedTitle);
      }
    } catch(e) {
      console.error("FeniX automated news item skipped:",{
        source_id:source.source_id,
        url:item.url,
        error:e instanceof Error?e.message:"unknown",
      });
    }
  }

  return {
    discovered:items.length,
    inserted,
    publicationStatus:inserted?"published":"none",
  };
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2,"0")).join("");
}

function chunkText(text: string,size=1200,overlap=160) {
  const out:string[]=[];
  let start=0;
  while(start<text.length && out.length<500) {
    const end=Math.min(text.length,start+size);
    const value=text.slice(start,end).trim();
    if(value) out.push(value);
    if(end===text.length) break;
    start=Math.max(start+1,end-overlap);
  }
  return out;
}

async function embed(text:string,token:string) {
  const r=await fetch(
    "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    {
      method:"POST",
      headers:{
        Authorization:"Bearer "+token,
        "Content-Type":"application/json",
      },
      body:JSON.stringify({
        inputs:text,
        options:{wait_for_model:true},
      }),
    },
  );
  if(!r.ok) throw new Error("Embedding provider returned "+r.status);
  const data=await r.json();
  const vector=Array.isArray(data?.[0]) ? data[0] : data;
  if(!Array.isArray(vector)||vector.length!==384) {
    throw new Error("Unexpected embedding dimension");
  }
  return vector;
}

function nextAt(hours:number) {
  const safe=Math.max(1,Math.min(Number(hours||24),168));
  return new Date(Date.now()+safe*3600000).toISOString();
}

function retryAt(hours:number) {
  const safe=Math.max(1,Math.min(Number(hours||24),6));
  return new Date(Date.now()+safe*3600000).toISOString();
}

Deno.serve(async(req)=>{
  if(req.method!=="POST") {
    return new Response("Method Not Allowed",{status:405});
  }

  const supplied=req.headers.get("x-fenix-refresh-secret");
  const url=Deno.env.get("SUPABASE_URL");
  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!serviceKey) {
    return new Response("Supabase environment is incomplete",{status:500});
  }

  const db=createClient(url,serviceKey,{auth:{persistSession:false}});
  const {data:secretValue}=await db.rpc("fenix_brain_internal_refresh_secret");
  if(!supplied||supplied!==secretValue) {
    return new Response("Unauthorized",{status:401});
  }

  const hf=Deno.env.get("HUGGINGFACE_API_KEY")||"";
  const body=await req.json().catch(()=>({}));
  const limit=Math.min(Math.max(Number(body.limit??8),1),20);
  const {data:sources,error}=await db.rpc(
    "claim_due_feni_brain_sources_v2",
    {p_limit:limit},
  );

  if(error) return Response.json({error:error.message},{status:500});

  const report={
    checked:0,changed:0,unchanged:0,failed:0,published:0,embedded:0,
    embed_pending:0,embedding_backfill_embedded:0,embedding_backfill_failed:0,
    embedding_backfill_blocked:false,embedding_backfill_remaining:0,quarantined_sources:0,
  };

  for(const source of sources??[]) {
    report.checked++;

    const run=await db
      .from("fenix_brain_update_runs")
      .insert({source_id:source.source_id})
      .select("id")
      .single();

    const runId=run.data?.id;

    try {
      const headers:Record<string,string>={
        "User-Agent":"FeniX-Feni-Brain-Updater/1.1",
      };
      if(source.etag) headers["If-None-Match"]=source.etag;
      if(source.last_modified) headers["If-Modified-Since"]=source.last_modified;

      if(!isAllowedSourceUrl(source.url)) {
        throw new Error("Source host is not allowlisted");
      }

      const fetched=await fetchAllowlistedSource(source.url,headers);
      const response=fetched.response;
      const finalSourceUrl=fetched.finalUrl;
      const now=new Date().toISOString();

      if(response.status===304) {
        report.unchanged++;
        await db.from("fenix_brain_update_runs").update({
          completed_at:now,status:"unchanged",http_status:304,
        }).eq("id",runId);

        await db.from("fenix_brain_source_refresh").update({
          next_refresh_at:nextAt(source.refresh_interval_hours),
          last_checked_at:now,last_success_at:now,last_http_status:304,
          last_error:null,updated_at:now,
        }).eq("source_id",source.source_id);
        continue;
      }

      if(!response.ok) throw new Error("HTTP "+response.status);

      const raw=await response.text();
      if(raw.length>source.max_bytes) {
        throw new Error("Source exceeds configured byte limit");
      }

      if(source.parser_key==="notice_html" || source.parser_key==="news_html") {
        const items=extractNewsItems(raw,finalSourceUrl,source.parser_key);
        if(!items.length) throw new Error("News source produced no usable local items");

        const itemSignature=await sha256(items.map((item)=>item.url+"|"+item.title).join("\n"));
        const refreshNow=await db
          .from("fenix_brain_source_refresh")
          .select("last_content_hash")
          .eq("source_id",source.source_id)
          .single();
        const previousItemHash=refreshNow.data?.last_content_hash??null;

        if(previousItemHash===itemSignature) {
          report.unchanged++;
          await db.from("fenix_brain_update_runs").update({
            completed_at:now,status:"unchanged",http_status:response.status,
            content_hash:itemSignature,bytes_read:raw.length,
          }).eq("id",runId);
        } else {
          const newsResult=await publishDiscoveredNews(db,source,items,now);
          report.changed++;
          report.published+=newsResult.inserted;

          await db.from("fenix_brain_update_candidates").insert({
            source_id:source.source_id,
            content_hash:itemSignature,
            previous_hash:previousItemHash,
            title:source.title,
            source_url:finalSourceUrl,
            extracted_content:items.slice(0,20).map((item)=>item.title).join("\n"),
            change_summary:previousItemHash
              ? `News source changed; discovered ${newsResult.discovered} local items and inserted ${newsResult.inserted} news records.`
              : `Initial news discovery; found ${newsResult.discovered} local items.`,
            status:source.auto_publish ? "auto_published" : "pending",
            reviewed_at:source.auto_publish ? now : null,
          });

          await db.from("fenix_brain_update_runs").update({
            completed_at:now,status:"changed",http_status:response.status,
            content_hash:itemSignature,bytes_read:raw.length,
          }).eq("id",runId);
        }

        await db.from("fenix_brain_source_refresh").update({
          next_refresh_at:nextAt(source.refresh_interval_hours),
          last_checked_at:now,
          last_success_at:now,
          last_http_status:response.status,
          last_content_hash:itemSignature,
          etag:response.headers.get("etag"),
          last_modified:response.headers.get("last-modified"),
          last_error:null,
          updated_at:now,
        }).eq("source_id",source.source_id);

        continue;
      }

      const text=cleanHtml(raw);
      if(text.length<80) throw new Error("Source produced insufficient text");

      const hash=await sha256(text);
      const refresh=await db
        .from("fenix_brain_source_refresh")
        .select("last_content_hash")
        .eq("source_id",source.source_id)
        .single();

      const previousHash=refresh.data?.last_content_hash??null;

      if(previousHash===hash) {
        report.unchanged++;
        await db.from("fenix_brain_update_runs").update({
          completed_at:now,status:"unchanged",http_status:response.status,
          content_hash:hash,bytes_read:raw.length,
        }).eq("id",runId);
      } else {
        report.changed++;

        const candidate=await db
          .from("fenix_brain_update_candidates")
          .insert({
            source_id:source.source_id,
            content_hash:hash,
            previous_hash:previousHash,
            title:source.title,
            source_url:source.url,
            extracted_content:text,
            change_summary:previousHash
              ? "Source content changed."
              : "Initial automatic source snapshot.",
            status:source.auto_publish ? "approved" : "pending",
          })
          .select("id")
          .single();

        if(candidate.data?.id && source.auto_publish && source.trust_tier===1) {
          const oldDocs=await db
            .from("fenix_brain_documents")
            .select("id")
            .eq("source_id",source.source_id)
            .eq("status","active");

          for(const old of oldDocs.data??[]) {
            await db.from("fenix_brain_documents").update({
              status:"archived",updated_at:now,
            }).eq("id",old.id);
          }

          const doc=await db.from("fenix_brain_documents").insert({
            source_id:source.source_id,
            title:source.title,
            document_type:"knowledge",
            language_code:"bn",
            content:text,
            summary:text.slice(0,500),
            status:"active",
            metadata:{
              auto_updated:true,
              content_hash:hash,
              embedding_status:hf?"complete":"pending",
            },
          }).select("id").single();

          if(doc.data?.id) {
            const chunks=chunkText(text);
            for(let i=0;i<chunks.length;i++) {
              let vector=null;
              if(hf) {
                try {
                  vector=await embed(chunks[i],hf);
                  report.embedded++;
                } catch(e) {
                  report.embed_pending++;
                  console.error("Feni Brain chunk embedding failed:",{
                    source_id:source.source_id,
                    chunk_index:i,
                    error:e instanceof Error?e.message:"unknown",
                  });
                }
              } else {
                report.embed_pending++;
              }

              const row={
                document_id:doc.data.id,
                chunk_index:i,
                content:chunks[i],
                embedding:vector,
                embedding_model:vector
                  ? "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
                  : null,
                status:"active",
              };

              const insert=await db
                .from("fenix_brain_chunks")
                .insert(row);

              if(insert.error) {
                throw new Error(
                  "Chunk insert failed: "+insert.error.message,
                );
              }
            }

            await db.from("fenix_brain_update_candidates").update({
              status:"auto_published",
              published_document_id:doc.data.id,
              reviewed_at:now,
            }).eq("id",candidate.data.id);

            report.published++;
          }
        }

        await db.from("fenix_brain_update_runs").update({
          completed_at:now,status:"changed",http_status:response.status,
          content_hash:hash,bytes_read:raw.length,
        }).eq("id",runId);
      }

      await db.from("fenix_brain_source_refresh").update({
        next_refresh_at:nextAt(source.refresh_interval_hours),
        last_checked_at:now,
        last_success_at:now,
        last_http_status:response.status,
        last_content_hash:hash,
        etag:response.headers.get("etag"),
        last_modified:response.headers.get("last-modified"),
        last_error:null,
        updated_at:now,
      }).eq("source_id",source.source_id);
    } catch(e) {
      const now=new Date().toISOString();
      const message=e instanceof Error?e.message:"Unknown error";
      report.failed++;

      await db.from("fenix_brain_update_runs").update({
        completed_at:now,status:"failed",error:message,
      }).eq("id",runId);

      const certificateFailure =
        /unknownissuer|certificate|tls|ssl/i.test(message);

      if (certificateFailure) {
        const recent = await db
          .from("fenix_brain_update_runs")
          .select("status,error")
          .eq("source_id", source.source_id)
          .order("started_at", { ascending: false })
          .limit(3);

        const consecutiveCertificateFailures =
          Array.isArray(recent.data) &&
          recent.data.length >= 3 &&
          recent.data.every(
            (row) =>
              row.status === "failed" &&
              /unknownissuer|certificate|tls|ssl/i.test(String(row.error ?? "")),
          );

        if (consecutiveCertificateFailures) {
          await db
            .from("fenix_brain_source_refresh")
            .update({
              enabled: false,
              next_refresh_at: new Date(Date.now() + 7 * 86400000).toISOString(),
              last_checked_at: now,
              last_error: "Automatic refresh quarantined after repeated TLS/certificate failures. Manual review required.",
              updated_at: now,
            })
            .eq("source_id", source.source_id);

          report.quarantined_sources++;
          continue;
        }
      }

      await db.from("fenix_brain_source_refresh").update({
        next_refresh_at:retryAt(source.refresh_interval_hours),
        last_checked_at:now,last_error:message,updated_at:now,
      }).eq("source_id",source.source_id);
    }
  }

  if (!hf) {
    report.embedding_backfill_blocked = true;
  } else {
    const activeDocs = await db
      .from("fenix_brain_documents")
      .select("id")
      .eq("status", "active")
      .limit(1000);

    const activeDocumentIds = (activeDocs.data ?? []).map((row) => row.id).filter(Boolean);

    if (activeDocumentIds.length) {
      const pending = await db
        .from("fenix_brain_chunks")
        .select("id,content")
        .eq("status", "active")
        .is("embedding", null)
        .in("document_id", activeDocumentIds)
        .order("updated_at", { ascending: true })
        .limit(MAX_EMBEDDING_BACKFILL);

      for (const chunk of pending.data ?? []) {
        try {
          const vector = await embed(String(chunk.content ?? "").slice(0, 1200), hf);
          const saved = await db
            .from("fenix_brain_chunks")
            .update({
              embedding: vector,
              embedding_model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
              updated_at: new Date().toISOString(),
            })
            .eq("id", chunk.id)
            .is("embedding", null);

          if (saved.error) throw new Error(saved.error.message);
          report.embedding_backfill_embedded++;
        } catch (e) {
          report.embedding_backfill_failed++;
          console.error("Feni Brain embedding backfill failed:", {
            chunk_id: chunk.id,
            error: e instanceof Error ? e.message : "unknown",
          });
        }
      }
    }
  }

  const remaining = await db
    .from("fenix_brain_chunks")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .is("embedding", null);

  report.embedding_backfill_remaining = Number(remaining.count ?? 0);

  return Response.json(report);
});
