"use client";

import { useEffect, useState } from "react";

type FenixIntroProps = {
  onComplete: () => void;
};

export default function FenixIntro({ onComplete }: FenixIntroProps) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setExit(true);
    }, 1050);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, 1400);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const mainFeathers = Array.from({ length: 42 });
  const blueFeathers = Array.from({ length: 28 });
  const goldFeathers = Array.from({ length: 18 });

  return (
    <div
      className={`fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#030506] text-white transition-all duration-350 ${
        exit ? "scale-[1.03] opacity-0" : "scale-100 opacity-100"
      }`}
    >
      {/* =====================================================
          LIVING FEATHER BACKGROUND
          Pure CSS — no image required
          ===================================================== */}

      <div
        className="fenix-feather-bg"
        aria-hidden="true"
      >
        {/* Main cream / silver feathers */}
        {mainFeathers.map((_, i) => (
          <span
            key={`main-${i}`}
            className="fenix-feather"
            style={
              {
                "--i": i,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Blue / silver inner layer */}
        {blueFeathers.map((_, i) => (
          <span
            key={`blue-${i}`}
            className="fenix-feather-blue"
            style={
              {
                "--i": i,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Warm gold center accents */}
        {goldFeathers.map((_, i) => (
          <span
            key={`gold-${i}`}
            className="fenix-feather-gold"
            style={
              {
                "--i": i,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Central spiral */}
        <div className="fenix-feather-core" />
      </div>

      {/* =====================================================
          EXISTING FENIX INTRO
          Kept as the foreground layer
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0 z-[25] bg-[radial-gradient(circle_at_50%_45%,rgba(0,128,128,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(255,215,0,0.04),transparent_28%)]" />

      {/* Rotating cinematic rings */}
      <div className="pointer-events-none absolute z-[26] h-[280px] w-[280px] rounded-full border border-white/[0.08] animate-[spin_8s_linear_infinite] sm:h-[360px] sm:w-[360px]" />

      <div className="pointer-events-none absolute z-[26] h-[210px] w-[210px] rounded-full border border-white/[0.06] animate-[spin_5s_linear_infinite_reverse] sm:h-[280px] sm:w-[280px]" />

      {/* Main branding */}
      <div className="relative z-[30] flex flex-col items-center">
        {/* FX emblem */}
        <div
          className={`relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/15 bg-black/25 shadow-[0_0_90px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-700 sm:h-28 sm:w-28 ${
            exit
              ? "scale-110 opacity-0"
              : "scale-100 opacity-100"
          }`}
        >
          <div className="absolute inset-2 rounded-[22px] border border-white/10" />

          <div className="absolute inset-4 rounded-[18px] border border-white/[0.06]" />

          <span className="relative text-4xl font-black tracking-[-0.08em] sm:text-5xl">
            F<span className="text-white/65">X</span>
          </span>

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
        </div>

        {/* FeniX title */}
        <div
          className={`mt-7 text-center transition-all duration-700 ${
            exit
              ? "translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">
            Feni<span className="text-white/65">X</span>
          </h1>

          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.38em] text-white/45 sm:text-[10px]">
            Feni Business Ecosystem
          </p>
        </div>

        {/* Loading */}
        <div className="mt-9 h-[2px] w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[fenixLoad_1.05s_ease-out_forwards] bg-gradient-to-r from-white/20 via-white to-white/20" />
        </div>

        <p className="mt-3 text-[7px] font-medium uppercase tracking-[0.5em] text-white/30">
          Loading
        </p>
      </div>

      {/* Cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 z-[40] bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.16)_55%,rgba(0,0,0,0.72)_100%)]" />

      {/* Subtle film grain */}
      <div className="pointer-events-none absolute inset-0 z-[50] opacity-[0.025] [background-image:radial-gradient(rgba(255,255,255,0.8)_0.5px,transparent_0.5px)] [background-size:4px_4px]" />
    </div>
  );
            }
