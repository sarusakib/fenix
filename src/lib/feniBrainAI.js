import { HfInference } from '@huggingface/inference'

const DEFAULT_PRIMARY_PROVIDER = 'together'

export async function runFeniBrainChat({ token, model, messages, max_tokens, temperature }) {
  const primaryProvider = process.env.FENI_BRAIN_PROVIDER || DEFAULT_PRIMARY_PROVIDER
  const providers = [...new Set([primaryProvider, 'auto'])]

  let lastError = null

  for (const provider of providers) {
    try {
      const hf = new HfInference(token)
      const response = await hf.chatCompletion({
        model,
        provider,
        messages,
        max_tokens,
        temperature,
      })

      return { response, provider }
    } catch (error) {
      lastError = error
      console.error('Feni Brain provider attempt failed:', {
        provider,
        name: error?.name,
        status: error?.status,
        message: error?.message?.slice?.(0, 240),
      })
    }
  }

  throw lastError || new Error('Feni Brain provider unavailable.')
}
