"use server";

export async function generateEmbedding(text) {
  const hf_token = process.env.HUGGINGFACE_API_KEY;
  const model = "sentence-transformers/all-MiniLM-L6-v2";
  const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hf_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      throw new Error("ভেক্টর তৈরিতে সমস্যা হয়েছে!");
    }

    const embedding = await response.json();
    return embedding;
    
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
                            }
