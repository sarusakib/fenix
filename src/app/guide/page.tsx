"use client";

import { useState } from "react";
import { saveBusinessEmbedding } from "../actions/saveBusinessEmbedding";
import { searchBusinesses } from "../actions/searchBusinesses";

const BUSINESS_ID = "69abbbe2-f9f1-48a3-a6b3-ccdfa3caca64";

const BUSINESS_TEXT =
  "ফেনী শহরে সাশ্রয়ী দামে পোশাক, শাড়ি ও ফ্যাশন পণ্য বিক্রির ব্যবসা।";

export default function GuidePage() {
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

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

  const handleSearch = async () => {
    if (!query.trim()) {
      setStatus("⚠️ Search query লিখুন।");
      return;
    }

    setStatus("🧠 Feni Brain search করছে...");
    setResults([]);

    const result = await searchBusinesses(query);

    if (result.success) {
      setResults(result.results);
      setStatus(`✅ ${result.results.length}টি result পাওয়া গেছে।`);
    } else {
      setStatus(`❌ ${result.error}`);
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-2xl">

        <h1 className="text-3xl font-bold">
          Feni Brain
        </h1>

        <p className="mt-2 text-gray-600">
          Semantic Business Search Test
        </p>

        <button
          onClick={handleGenerate}
          className="mt-8 rounded-lg bg-black px-6 py-3 font-semibold text-white"
        >
          Generate Business Embedding
        </button>

        <div className="mt-10">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="যেমন: ফেনীতে কম দামে শাড়ি কোথায় পাব?"
            className="w-full rounded-lg border px-4 py-3 outline-none"
          />

          <button
            onClick={handleSearch}
            className="mt-3 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white"
          >
            Search with Feni Brain
          </button>
        </div>

        {status && (
          <p className="mt-6 text-sm">
            {status}
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-4">
            {results.map((business) => (
              <div
                key={business.id}
                className="rounded-xl border p-5"
              >
                <h2 className="text-xl font-semibold">
                  {business.name}
                </h2>

                <p className="mt-2 text-gray-600">
                  {business.description}
                </p>

                <p className="mt-3 text-sm font-semibold">
                  Similarity:{" "}
                  {Number(business.similarity).toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
          }
