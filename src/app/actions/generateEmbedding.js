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
    console.log("Feni Brain: Starting embedding request...");

    const hf = new HfInference(hfToken);

    const result = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text.trim(),
      provider: "hf-inference",
    });

    console.log("Feni Brain: Hugging Face response received.");

    const embedding = Array.isArray(result[0])
      ? result[0]
      : result;

    if (!Array.isArray(embedding)) {
      throw new Error(
        "DIAGNOSTIC: Hugging Face response array নয়।"
      );
    }

    console.log(
      `Feni Brain: Embedding dimension = ${embedding.length}`
    );

    if (embedding.length !== 384) {
      throw new Error(
        `DIAGNOSTIC: Embedding dimension ${embedding.length}, expected 384.`
      );
    }

    return embedding;
  } catch (error) {
    console.error("========== FENI BRAIN ERROR ==========");
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error status:", error?.status);
    console.error("Error cause:", error?.cause);
    console.error("Full error:", error);
    console.error("======================================");

    const message = error?.message || "Unknown Hugging Face error.";

    throw new Error(
      `Feni Brain diagnostic: ${message}`
    );
  }
    }
