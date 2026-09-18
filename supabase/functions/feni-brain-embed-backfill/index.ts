import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

async function getDb() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error("Supabase environment is incomplete.");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

async function authorized(
  req: Request,
  db: ReturnType<typeof createClient>,
) {
  const supplied = req.headers.get("x-fenix-refresh-secret");
  const { data, error } = await db.rpc(
    "fenix_brain_internal_refresh_secret",
  );

  return !error && Boolean(supplied) && supplied === data;
}

async function embed(text: string, token: string) {
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/pipeline/feature-extraction/" +
      MODEL,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true },
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Embedding provider returned " + response.status);
  }

  const data = await response.json();
  const vector = Array.isArray(data?.[0]) ? data[0] : data;

  if (!Array.isArray(vector) || vector.length !== 384) {
    throw new Error("Unexpected embedding dimension.");
  }

  return vector;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const db = await getDb();

    if (!(await authorized(req, db))) {
      return new Response("Unauthorized", { status: 401 });
    }

    const hfToken = Deno.env.get("HUGGINGFACE_API_KEY");

    if (!hfToken) {
      return Response.json(
        {
          success: false,
          error: "HUGGINGFACE_API_KEY is not configured.",
          embedded: 0,
        },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const requestedLimit = Number(body.limit ?? 5);
    const limit = Math.min(
      Math.max(
        Number.isFinite(requestedLimit) ? requestedLimit : 5,
        1,
      ),
      10,
    );

    const { data: chunks, error } = await db
      .from("fenix_brain_chunks")
      .select("id, content")
      .eq("status", "active")
      .is("embedding", null)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      return Response.json(
        { success: false, error: error.message, embedded: 0 },
        { status: 500 },
      );
    }

    let embedded = 0;
    const failures: Array<{ id: string; error: string }> = [];

    for (const chunk of chunks ?? []) {
      try {
        const vector = await embed(chunk.content, hfToken);

        const { error: updateError } = await db
          .from("fenix_brain_chunks")
          .update({
            embedding: vector,
            embedding_model: MODEL,
            updated_at: new Date().toISOString(),
          })
          .eq("id", chunk.id)
          .is("embedding", null);

        if (updateError) {
          throw new Error(updateError.message);
        }

        embedded++;
      } catch (error) {
        failures.push({
          id: chunk.id,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
      }
    }

    const { count: remaining } = await db
      .from("fenix_brain_chunks")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("embedding", null);

    return Response.json({
      success: true,
      embedded,
      remaining: remaining ?? 0,
      failures,
      model: MODEL,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
        embedded: 0,
      },
      { status: 500 },
    );
  }
});
