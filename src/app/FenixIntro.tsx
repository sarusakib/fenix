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

  return (
    <div
      className={`fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#030506] text-white transition-all duration-350 ${
        exit
          ? "scale-[1.03] opacity-0"
          : "scale-100 opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,128,128,0.18),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(255,215,0,0.06),transparent_28%)]" />

      <div className="absolute h-[280px] w-[280px] rounded-full border border-[#008080]/10 animate-[spin_8s_linear_infinite] sm:h-[360px] sm:w-[360px]" />

      <div className="absolute h-[210px] w-[210px] rounded-full border border-white/[0.05] animate-[spin_5s_linear_infinite_reverse] sm:h-[280px] sm:w-[280px]" />

      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.045] shadow-[0_0_90px_rgba(0,128,128,0.22)] backdrop-blur-xl transition-all duration-700 sm:h-28 sm:w-28 ${
            exit
              ? "scale-110 opacity-0"
              : "scale-100 opacity-100"
          }`}
        >
          <div className="absolute inset-2 rounded-[22px] border border-[#008080]/20" />

          <span className="relative text-4xl font-black tracking-[-0.08em] sm:text-5xl">
            F<span className="text-[#008080]">X</span>
          </span>

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#FFD700] shadow-[0_0_14px_rgba(255,215,0,0.9)]" />
        </div>

        <div
          className={`mt-7 text-center transition-all duration-700 ${
            exit
              ? "translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">
            Feni<span className="text-[#008080]">X</span>
          </h1>

          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.38em] text-white/35 sm:text-[10px]">
            Feni Business Ecosystem
          </p>
        </div>

        <div className="mt-9 h-[2px] w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[fenixLoad_1.05s_ease-out_forwards] bg-gradient-to-r from-[#008080] via-white to-[#FFD700]" />
        </div>
      </div>
    </div>
  );
      }
