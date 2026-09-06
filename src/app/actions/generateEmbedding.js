"use server";

export async function generateEmbedding(text) {
  const hfToken = process.env.HUGGINGFACE_API_KEY;
  const model = "sentence-transformers/all-MiniLM-L6-v2";
  const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`;

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face error:", errorText);
      throw new Error("ভেক্টর তৈরিতে সমস্যা হয়েছে!");
    }

    const data = await response.json();

    // Hugging Face কখনো [[...384 values...]]
    // আবার কখনো [...384 values...] return করতে পারে
    const embedding = Array.isArray(data[0]) ? data[0] : data;

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
    console.error("Error generating embedding:", error);
    throw error;
  }
    }
