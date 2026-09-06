"use client";

import { useState } from "react";
import { generateEmbedding } from "./actions/generateEmbedding";

export default function Home() {
  const [query, setQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    console.log("সার্চ করা হচ্ছে:", query);
    
    // আমাদের তৈরি করা সার্ভার অ্যাকশনটি কল করছি
    const vector = await generateEmbedding(query);
    
    console.log("Hugging Face থেকে পাওয়া ভেক্টর:", vector);
    alert("কনসোল চেক করুন! ভেক্টর সফলভাবে তৈরি হয়েছে।");
  };

  return (
    <main className="p-10 max-w-2xl mx-auto text-center mt-20">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">FeniBrain AI 🧠</h1>
      <p className="mb-8 text-gray-600">আপনার ব্যবসার আইডিয়া বা প্রশ্ন খুঁজুন</p>
      
      <form onSubmit={handleSearch} className="flex gap-2 justify-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="যেমন: কম টাকায় কাপড়ের ব্যবসা..."
          className="border border-gray-400 rounded-lg px-4 py-3 w-full text-black focus:outline-none focus:border-blue-500"
        />
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
        >
          খুঁজুন
        </button>
      </form>
    </main>
  );
      }
