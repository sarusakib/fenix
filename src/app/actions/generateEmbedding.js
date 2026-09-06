"use server";

import { HfInference } from "@huggingface/inference";

export async function generateEmbedding(text) {
  const hfToken = process.env.HUGGINGFACE_API_KEY;

  if (!hfToken) {
    throw new Error("HUGGINGFACE_API_KEY পাওয়া যায়নি।");
  }

  if (!text || !text.trim()) {
    throw new Error("Embedding তৈরির জন্য text প্রয়োজন।");
  }

  try {
    const hf = new HfInference(hfToken);

    const result = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text.trim(),
      provider: "hf-inference",
    });

    const embedding = Array.isArray(result[0])
      ? result[0]
      : result;

    if (!Array.isArray(embedding)) {
      throw new Error("Invalid embedding response.");
    }

    if (embedding.length !== 384) {
      throw new Error(
        `ভুল embedding dimension: ${embedding.length}. Expected: 384.`
      );
    }

    return embedding;
  } catch (error) {
    console.error("Feni Brain embedding error:", error);

    throw new Error(
      error?.message || "Embedding তৈরি করা যায়নি।"
    );
  }
}
