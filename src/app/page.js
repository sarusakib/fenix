"use client";

import { useState } from "react";
import { generateEmbedding } from "./actions/generateEmbedding";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setResults([]);

    try {
      // ১. ইউজারের লেখা থেকে ভেক্টর তৈরি করা
      const vector = await generateEmbedding(query);
      
      // ২. ভেক্টরটি ডাটাবেসে পাঠিয়ে মিল খোঁজা
      const { data, error } = await supabase.rpc('match_businesses', {
        query_embedding: vector,
        match_threshold: 0.1, // কতোটুকু মিল থাকতে হবে (০.১ মানে কিছুটা মিল থাকলেই দেখাবে)
        match_count: 5 // সর্বোচ্চ কয়টি রেজাল্ট দেখাবে
      });

      if (error) throw error;
      
      // ৩. ডাটাবেস থেকে পাওয়া রেজাল্ট সেভ করা
      setResults(data);
    } catch (error) {
      console.error("খুঁজতে গিয়ে সমস্যা হয়েছে:", error);
      alert("দুঃখিত, কিছু একটা সমস্যা হয়েছে!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-10 max-w-2xl mx-auto text-center mt-20">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">FeniBrain AI 🧠</h1>
      <p className="mb-8 text-gray-600">আপনার ব্যবসার আইডিয়া বা প্রশ্ন খুঁজুন</p>
      
      <form onSubmit={handleSearch} className="flex gap-2 justify-center mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="যেমন: কম টাকায় কাপড়ের ব্যবসা..."
          className="border border-gray-400 rounded-lg px-4 py-3 w-full text-black focus:outline-none focus:border-blue-500"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:bg-gray-400"
        >
          {isLoading ? "খুঁজছি..." : "খুঁজুন"}
        </button>
      </form>

      {/* রেজাল্ট দেখানোর জায়গা */}
      <div className="text-left space-y-4">
        {results && results.length > 0 ? (
          results.map((business) => (
            <div key={business.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{business.name}</h2>
              <p className="text-gray-600">{business.description}</p>
              <span className="inline-block mt-3 text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded">
                মিল: {Math.round(business.similarity * 100)}%
              </span>
            </div>
          ))
        ) : (
          !isLoading && query && <p className="text-gray-500 text-center">কোনো ব্যবসা পাওয়া যায়নি।</p>
        )}
      </div>
    </main>
  );
}
