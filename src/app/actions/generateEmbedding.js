'use server'

import { HfInference } from '@huggingface/inference'

const MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
const EMBEDDING_DIMENSION = 384
const MAX_TEXT_LENGTH = 1200

export async function generateEmbedding(text) {
  const hfToken = process.env.HUGGINGFACE_API_KEY

  if (!hfToken) {
    console.error('Feni Brain: HUGGINGFACE_API_KEY is not configured.')
    throw new Error('Feni Brain service is not configured.')
  }

  if (typeof text !== 'string') {
    throw new Error('Invalid embedding input.')
  }

  const cleanText = text.trim().slice(0, MAX_TEXT_LENGTH)

  if (!cleanText) {
    throw new Error('Embedding text is required.')
  }

  try {
    const hf = new HfInference(hfToken)

    const result = await hf.featureExtraction({
      model: MODEL,
      inputs: cleanText,
      provider: 'hf-inference',
    })

    const embedding = Array.isArray(result?.[0]) ? result[0] : result

    if (!Array.isArray(embedding)) {
      throw new Error('Invalid embedding response.')
    }

    if (embedding.length !== EMBEDDING_DIMENSION) {
      throw new Error('Invalid embedding dimension.')
    }

    return embedding
  } catch (error) {
    console.error('Feni Brain embedding request failed:', {
      name: error?.name,
      status: error?.status,
    })

    throw new Error('Feni Brain is temporarily unavailable.')
  }
}
