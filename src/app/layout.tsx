"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import AuthSync from "../components/AuthSync";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowIntro(false);
    }, 1300);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <html lang="bn">
      <body className="bg-surface text-navy">
        <AuthSync />

        {showIntro && (
          <div className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#05070b] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,128,128,0.18),transparent_45%)]" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_0_80px_rgba(0,128,128,0.18)] backdrop-blur-xl sm:h-28 sm:w-28">
                <span className="text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
                  F<span className="text-[#008080]">X</span>
                </span>
              </div>

              <div className="mt-7 text-center">
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Feni<span className="text-[#008080]">X</span>
                </h1>

                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.35em] text-white/40 sm:text-xs">
                  Feni Business Ecosystem
                </p>
              </div>

              <div className="mt-8 h-1 w-24 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full origin-left animate-[pulse_1.2s_ease-in-out]" />
              </div>
            </div>
          </div>
        )}

        <div
          className={
            showIntro
              ? "min-h-screen opacity-0"
              : "min-h-screen opacity-100 transition-opacity duration-300"
          }
        >
          {children}
        </div>
      </body>
    </html>
  );
}
