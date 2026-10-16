# FeniX AI provider setup

## Feni Brain answers and automated News summaries

FeniX supports Gemini as the preferred chat/summarization provider, with Hugging Face as the existing fallback provider. The server-side code accepts either `GEMINI_API_KEY` or `GOOGLE_GEMINI_API_KEY`; do not use a `NEXT_PUBLIC_` prefix.

### 1. Add a Gemini API key for the web app

1. Create an API key in Google AI Studio.
2. In Vercel → FeniX project → Settings → Environment Variables, add `GEMINI_API_KEY`.
3. Enable it for the Production environment and Preview if preview testing is needed.
4. Redeploy the branch/deployment after the variable is saved. Do not expose the value in client-side code or logs.

The default chat and News summary model is `gemini-3.8-flash` (current stable Flash model). You can override it with `FENI_BRAIN_GEMINI_MODEL`. The standard API currently lists free input/output tokens for this model, subject to account eligibility, rate limits and Google's terms. Free-tier requests may be used to improve Google products, so avoid sending private profile details, credentials, health information or other sensitive personal data; use a suitable paid configuration if that data-use policy is not acceptable. When a Gemini key is configured, Feni Brain uses it before the Hugging Face chat provider, which prevents an exhausted Hugging Face chat balance from breaking normal AI answers.

### 2. Add the key for scheduled News summaries

Vercel environment variables are not automatically passed to Supabase Edge Functions. In Supabase → Project Settings → Edge Functions → Secrets, add the same server-side key as `GEMINI_API_KEY`.

The `fenix-brain-source-refresh` function will then use Gemini to write and validate News briefs. If no Gemini key is configured, it continues to use `HUGGINGFACE_API_KEY`. Never put provider keys in public/client environment variables or commit the real key to GitHub.

### 3. Embedding/semantic-search limitation

This change does **not** switch the embedding model. Query embeddings still use the multilingual Hugging Face model `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` and the existing database vectors are 384-dimensional vectors from that model. The provider error seen in logs indicates the current Hugging Face inference allowance is exhausted or unavailable.

Do not replace only the query embedding with a different model: vectors from different models are not comparable, even when both have 384 dimensions. To restore semantic retrieval, either restore Hugging Face inference access/credits for the same model or complete a planned migration that re-embeds all stored Brain chunks and business records with one new model before switching query embeddings. Keyword, structured fact, local directory, article, and product retrieval continue as fallbacks, but semantic matching may be unavailable while embedding generation is failing.

### 4. Verify scheduled News automation

The repository migration schedules `fenix-brain-source-refresh-daily` every six hours (four runs per day), not once per calendar day. In Supabase SQL Editor, check that the job exists and is active:

```sql
select jobname, schedule, active, next_run
from cron.job
where jobname = 'fenix-brain-source-refresh-daily';
```

Also verify that the `fenix-brain-source-refresh` Edge Function is deployed, its refresh secret is present in Supabase Vault as `fenix_brain_refresh_secret`, and recent function logs show successful runs with published records. A schedule row alone does not prove that the HTTP request succeeded or that a News item passed the source, freshness, duplication, and quality checks.

## Current status

- Feni Brain chat: Gemini provider support is implemented in this branch; it needs a valid `GEMINI_API_KEY` configured in Vercel to bypass the exhausted Hugging Face chat allowance.
- Auto News summaries: Gemini provider support is implemented in this branch; it needs the key configured in Supabase Edge Function Secrets.
- Semantic embeddings: still depends on Hugging Face inference; needs credits/access restored or a coordinated full-vector migration.
- Production: this change is staged on a feature branch and has not been deployed to production.
