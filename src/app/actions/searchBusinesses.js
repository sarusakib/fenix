"use server";

import { generateEmbedding } from "./generateEmbedding";
import { createClient } from "../../utils/supabase/server";

export async function searchBusinesses(query) {
  try {
    if (!query?.trim()) {
      return {
        success: false,
        error: "Search query প্রয়োজন।",
      };
    }

    const embedding = await generateEmbedding(query.trim());

    if (!embedding || embedding.length !== 384) {
      return {
        success: false,
        error: "Valid 384-dimensional embedding পাওয়া যায়নি।",
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("match_businesses", {
      query_embedding: embedding,
      match_threshold: 0.50,
      match_count: 10,
    });

    if (error) {
      console.error("Feni Brain search error:", error);

      return {
        success: false,
        error: "Business search করা যায়নি।",
      };
    }

    return {
      success: true,
      results: data || [],
    };
  } catch (error) {
    console.error("Feni Brain search failed:", error);

    return {
      success: false,
      error: error?.message || "Search failed.",
    };
  }
}
