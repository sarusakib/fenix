"use server";

import { generateEmbedding } from "./generateEmbedding";
import { createClient } from "../../utils/supabase/server";

export async function saveBusinessEmbedding(businessId, text) {
  try {
    if (!businessId || !text?.trim()) {
      return {
        success: false,
        error: "Business ID এবং text প্রয়োজন।",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User authenticated নয়।",
      };
    }

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, name, owner_id")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      return {
        success: false,
        error: "Business পাওয়া যায়নি।",
      };
    }

    if (business.owner_id !== user.id) {
      return {
        success: false,
        error: "এই business update করার অনুমতি নেই।",
      };
    }

    const embedding = await generateEmbedding(text);

    if (!embedding || embedding.length !== 384) {
      return {
        success: false,
        error: "Valid 384-dimensional embedding পাওয়া যায়নি।",
      };
    }

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        feni_brain_embedding: embedding,
      })
      .eq("id", businessId);

    if (updateError) {
      console.error("Embedding update error:", updateError);

      return {
        success: false,
        error: "Embedding database-এ save করা যায়নি।",
      };
    }

    return {
      success: true,
      message: "Feni Brain embedding successfully saved.",
    };
  } catch (error) {
    console.error("saveBusinessEmbedding error:", error);

    return {
      success: false,
      error: error.message || "Unknown error.",
    };
  }
      }
