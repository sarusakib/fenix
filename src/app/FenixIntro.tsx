"use client";

import { useEffect, useState } from "react";

type FenixIntroProps = {
  onComplete: () => void;
};

const INTRO_EXIT_START = 3000;
const INTRO_COMPLETE = 3650;

export default function FenixIntro({
  onComplete,
}: FenixIntroProps) {
  const [stage, setStage] = useState<
    "enter" | "hold" | "exit"
  >("enter");

  useEffect(() => {
    const holdTimer = window.setTimeout(() => {
      setStage("hold");
    }, 900);

    const exitTimer = window.setTimeout(() => {
      setStage("exit");
    }, INTRO_EXIT_START);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, INTRO_COMPLETE);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const mainFeathers = Array.from({ length: 42 });
  const blueFeathers = Array.from({ length: 28 });
  const goldFeathers = Array.from({ length: 18 });

  const isExit = stage === "exit";

  return (
    <div
      className={[
        "fixed inset-0 z-[99999]",
        "min-h-screen overflow-hidden",
        "bg-[#030506] text-white",
        "transition-[opacity,transform] duration-[650ms]",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",
        isExit
          ? "scale-[1.045] opacity-0"
          : "scale-100 opacity-100",
      ].join(" ")}
      aria-label="FeniX intro"
    >
      {/* =====================================================
          LIVING FEATHER BACKGROUND
          ===================================================== */}

      <div
        className={[
          "fenix-feather-bg",
          "transition-all duration-[1400ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          isExit
            ? "scale-[1.08] opacity-0"
            : "scale-100 opacity-100",
        ].join(" ")}
        aria-hidden="true"
      >
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

        <div className="fenix-feather-core" />
      </div>

      {/* =====================================================
          LOGIN-PAGE MATCHING ATMOSPHERE
          ===================================================== */}

      <div
        className={[
          "pointer-events-none absolute inset-0 z-10",
          "transition-opacity duration-[1000ms]",
          isExit ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,128,128,0.18),transparent_34%),radial-gradient(circle_at_50%_78%,rgba(255,215,0,0.045),transparent_26%)]" />

        <div className="absolute inset-0 bg-gradient-to-b from-[#05070b]/25 via-transparent to-[#05070b]/65" />
      </div>

      {/* =====================================================
          CINEMATIC RINGS
          ===================================================== */}

      <div
        className={[
          "pointer-events-none absolute left-1/2 top-1/2 z-20",
          "h-[280px] w-[280px]",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full",
          "border border-[#008080]/10",
          "animate-[spin_10s_linear_infinite]",
          "sm:h-[360px] sm:w-[360px]",
          "transition-all duration-[900ms]",
          isExit
            ? "scale-[1.3] opacity-0"
            : "scale-100 opacity-100",
        ].join(" ")}
      />

      <div
        className={[
          "pointer-events-none absolute left-1/2 top-1/2 z-20",
          "h-[205px] w-[205px]",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full",
          "border border-white/[0.045]",
          "animate-[spin_7s_linear_infinite_reverse]",
          "sm:h-[270px] sm:w-[270px]",
          "transition-all duration-[900ms]",
          isExit
            ? "scale-[1.25] opacity-0"
            : "scale-100 opacity-100",
        ].join(" ")}
      />

      {/* =====================================================
          MAIN FENIX BRAND
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <div
          className={[
            "flex flex-col items-center",
            "transition-[opacity,transform,filter]",
            "duration-[900ms]",
            "ease-[cubic-bezier(0.22,1,0.36,1)]",
            isExit
              ? "translate-y-[-10px] scale-[1.16] opacity-0 blur-[6px]"
              : "translate-y-0 scale-100 opacity-100 blur-0",
          ].join(" ")}
        >
          {/* FX MARK */}

          <div
            className={[
              "relative flex",
              "h-24 w-24 sm:h-28 sm:w-28",
              "items-center justify-center",
              "rounded-[28px]",
              "border border-white/10",
              "bg-[#05070b]/35",
              "backdrop-blur-xl",
              "shadow-[0_0_90px_rgba(0,128,128,0.20)]",
              "transition-all duration-[1100ms]",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",
              stage === "enter"
                ? "scale-[0.86] opacity-0"
                : "scale-100 opacity-100",
            ].join(" ")}
          >
            <div className="absolute inset-2 rounded-[22px] border border-[#008080]/20" />

            <div className="absolute inset-4 rounded-[18px] border border-white/[0.045]" />

            <span className="relative text-4xl font-black tracking-[-0.08em] sm:text-5xl">
              F
              <span className="text-[#008080]">
                X
              </span>
            </span>

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#FFD700] shadow-[0_0_14px_rgba(255,215,0,0.65)]" />
          </div>

          {/* FeniX NAME */}

          <div
            className={[
              "mt-7 text-center",
              "transition-[opacity,transform]",
              "duration-[1100ms]",
              "delay-[100ms]",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",
              stage === "enter"
                ? "translate-y-3 opacity-0"
                : "translate-y-0 opacity-100",
            ].join(" ")}
          >
            <h1 className="text-3xl font-black tracking-[-0.055em] sm:text-4xl">
              Feni
              <span className="text-[#008080]">
                X
              </span>
            </h1>

            <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.38em] text-white/35 sm:text-[10px]">
              Feni Business Ecosystem
            </p>
          </div>

          {/* LOADING LINE */}

          <div
            className={[
              "mt-9 h-[2px] w-28 overflow-hidden rounded-full",
              "bg-white/[0.08]",
              "transition-opacity duration-700",
              stage === "enter"
                ? "opacity-0"
                : "opacity-100",
            ].join(" ")}
          >
            <div
              className={[
                "h-full w-full origin-left",
                "bg-gradient-to-r",
                "from-[#008080]/30",
                "via-white",
                "to-[#FFD700]/55",
                "animate-[fenixLoad_2.5s_cubic-bezier(0.22,1,0.36,1)_forwards]",
              ].join(" ")}
            />
          </div>

          <p
            className={[
              "mt-3 text-[7px]",
              "font-medium uppercase",
              "tracking-[0.5em]",
              "text-white/25",
              "transition-opacity duration-700",
              stage === "enter"
                ? "opacity-0"
                : "opacity-100",
            ].join(" ")}
          >
            Loading
          </p>
        </div>
      </div>

      {/* =====================================================
          FINAL CINEMATIC VIGNETTE
          ===================================================== */}

      <div
        className={[
          "pointer-events-none absolute inset-0 z-40",
          "bg-[radial-gradient(circle_at_center,transparent_22%,rgba(0,0,0,0.16)_55%,rgba(0,0,0,0.78)_100%)]",
          "transition-opacity duration-[800ms]",
          isExit ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />

      {/* Subtle grain */}

      <div className="pointer-events-none absolute inset-0 z-50 opacity-[0.025] [background-image:radial-gradient(rgba(255,255,255,0.8)_0.5px,transparent_0.5px)] [background-size:4px_4px]" />
    </div>
  );
              }
