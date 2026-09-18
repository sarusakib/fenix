import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_HOSTS = new Set([
  "bangladesh.gov.bd","feni.gov.bd","bbs.feni.gov.bd","sadar.feni.gov.bd",
  "chhagalnaiya.feni.gov.bd","daganbhuiyan.feni.gov.bd","fulgazi.feni.gov.bd",
  "parshuram.feni.gov.bd","sonagazi.feni.gov.bd","lged.sadar.feni.gov.bd",
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
    embed_pending:0,
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

      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),15000);
      let response:Response;
      try {
        response=await fetch(source.url,{
          headers,redirect:"follow",signal:controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

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

      await db.from("fenix_brain_source_refresh").update({
        next_refresh_at:retryAt(source.refresh_interval_hours),
        last_checked_at:now,last_error:message,updated_at:now,
      }).eq("source_id",source.source_id);
    }
  }

  return Response.json(report);
});
