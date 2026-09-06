"use client";

import { useState } from "react";
import { saveBusinessEmbedding } from "../actions/saveBusinessEmbedding";

const BUSINESS_ID = "69abbbe2-f9f1-48a3-a6b3-ccdfa3caca64";

const BUSINESS_TEXT =
  "ফেনী শহরে সাশ্রয়ী দামে পোশাক, শাড়ি ও ফ্যাশন পণ্য বিক্রির ব্যবসা।";

export default function GuidePage() {
  const [status, setStatus] = useState("");

  const handleGenerate = async () => {
    setStatus("Embedding তৈরি হচ্ছে...");

    const result = await saveBusinessEmbedding(
      BUSINESS_ID,
      BUSINESS_TEXT
    );

    if (result.success) {
      setStatus("✅ Embedding successfully saved!");
    } else {
      setStatus(`❌ ${result.error}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold">Feni Brain</h1>

        <p className="mt-3 text-gray-600">
          Embedding Test
        </p>

        <button
          onClick={handleGenerate}
          className="mt-8 rounded-lg bg-black px-6 py-3 text-white font-semibold"
        >
          Generate Business Embedding
        </button>

        {status && (
          <p className="mt-6 text-sm">
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
