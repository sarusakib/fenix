"use server";

export async function generateEmbedding(text) {
  const hfToken = process.env.HUGGINGFACE_API_KEY;

  const model =
    "sentence-transformers/all-MiniLM-L6-v2";

  const url =
    `https://router.huggingface.co/hf-inference/models/${model}/pipeline/feature-extraction`;

  if (!hfToken) {
    throw new Error("HUGGINGFACE_API_KEY পাওয়া যায়নি।");
  }

  if (!text || !text.trim()) {
    throw new Error("Embedding তৈরির জন্য text প্রয়োজন।");
  }

  try {
    const response = await fetch(url, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        inputs: text.trim(),
      }),

      cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "Hugging Face API Error:",
        response.status,
        responseText
      );

      throw new Error(
        `Hugging Face API error (${response.status})`
      );
    }

    const data = JSON.parse(responseText);

    const embedding = Array.isArray(data[0])
      ? data[0]
      : data;

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
    console.error("Embedding generation failed:", error);

    throw new Error(
      error?.message || "Embedding তৈরি করা যায়নি।"
    );
  }
}
