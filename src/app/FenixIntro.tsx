"use client";

import { useEffect, useState } from "react";

type FenixIntroProps = {
  onComplete: () => void;
};

const SCENE_DURATION = 1000;

function FXLogo() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute h-44 w-44 rounded-full border border-white/[0.08] sm:h-56 sm:w-56" />
      <div className="absolute h-32 w-32 rounded-full border border-white/[0.07] sm:h-44 sm:w-44" />

      <div className="relative flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
        <span className="absolute left-1 text-[78px] font-black leading-none tracking-[-0.2em] text-white sm:text-[102px]">
          F
        </span>

        <span className="absolute right-0 top-1 text-[78px] font-black leading-none tracking-[-0.2em] text-white/75 sm:text-[102px]">
          X
        </span>

        <div className="absolute inset-0 rounded-full bg-white/[0.035] blur-2xl" />
      </div>
    </div>
  );
}

function TransportScene({ scene }: { scene: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(255,255,255,0.09),transparent_36%)]" />

      {scene === 0 && (
        <div className="relative h-[280px] w-[min(92vw,760px)]">
          <div className="absolute bottom-12 left-0 right-0 h-px bg-white/20" />
          <div className="absolute bottom-7 left-0 right-0 h-px bg-white/10" />

          <div className="absolute bottom-16 left-1/2 w-[78%] -translate-x-1/2">
            <div className="relative h-24 rounded-[28px] border border-white/30 bg-white/[0.06] shadow-[0_25px_80px_rgba(255,255,255,0.08)] sm:h-32">
              <div className="absolute left-8 right-8 top-5 h-9 rounded-xl border border-white/20 bg-white/[0.04] sm:h-12" />

              <div className="absolute bottom-3 left-8 h-4 w-4 rounded-full bg-white/80 sm:h-5 sm:w-5" />
              <div className="absolute bottom-3 right-8 h-4 w-4 rounded-full bg-white/80 sm:h-5 sm:w-5" />

              <div className="absolute -bottom-8 left-[-25%] h-px w-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>
          </div>

          <div className="absolute left-[7%] top-[25%] h-px w-[28%] bg-gradient-to-r from-transparent to-white/30" />
          <div className="absolute right-[7%] top-[38%] h-px w-[24%] bg-gradient-to-l from-transparent to-white/25" />
        </div>
      )}

      {scene === 1 && (
        <div className="relative h-[280px] w-[min(92vw,760px)]">
          <div className="absolute bottom-8 left-1/2 h-1 w-[90%] -translate-x-1/2 bg-white/20" />

          <div className="absolute bottom-12 left-1/2 w-[68%] -translate-x-1/2">
            <div className="relative h-28 rounded-[30px] border border-white/30 bg-white/[0.07] shadow-[0_30px_90px_rgba(255,255,255,0.07)] sm:h-36">
              <div className="absolute left-5 right-5 top-5 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-8 rounded-md border border-white/15 bg-white/[0.05] sm:h-10"
                  />
                ))}
              </div>

              <div className="absolute bottom-4 left-8 h-4 w-4 rounded-full border border-white/60" />
              <div className="absolute bottom-4 right-8 h-4 w-4 rounded-full border border-white/60" />
            </div>
          </div>

          <div className="absolute left-[7%] top-[24%] h-px w-[25%] bg-white/20" />
          <div className="absolute right-[7%] top-[35%] h-px w-[22%] bg-white/20" />
        </div>
      )}

      {scene === 2 && (
        <div className="relative h-[280px] w-[min(92vw,760px)]">
          <div className="absolute bottom-8 left-0 right-0">
            <div className="h-px bg-white/20" />
            <div className="mt-7 h-px bg-white/10" />
          </div>

          <div className="absolute bottom-12 left-1/2 w-[62%] -translate-x-1/2">
            <div className="relative h-24 rounded-[45%_35%_22%_22%] border border-white/30 bg-white/[0.07] shadow-[0_30px_100px_rgba(255,255,255,0.08)] sm:h-32">
              <div className="absolute left-[20%] right-[18%] top-4 h-9 rounded-[60%] border border-white/20 bg-white/[0.05] sm:h-12" />

              <div className="absolute -bottom-4 left-[16%] h-7 w-7 rounded-full border-4 border-black bg-white/80" />
              <div className="absolute -bottom-4 right-[16%] h-7 w-7 rounded-full border-4 border-black bg-white/80" />
            </div>
          </div>

          <div className="absolute left-[5%] top-[22%] h-px w-[26%] bg-gradient-to-r from-transparent to-white/30" />
          <div className="absolute right-[5%] top-[42%] h-px w-[25%] bg-gradient-to-l from-transparent to-white/30" />
        </div>
      )}

      {scene === 3 && (
        <div className="relative h-[300px] w-[min(94vw,820px)]">
          <div className="absolute bottom-8 left-0 right-0 h-px bg-white/20" />

          <div className="absolute bottom-12 left-1/2 h-40 w-[78%] -translate-x-1/2">
            <div className="absolute bottom-0 left-1/2 h-20 w-[72%] -translate-x-1/2 rounded-[45%] border border-white/20 bg-white/[0.035]" />

            <div className="absolute left-[12%] top-0 h-32 w-40 -skew-x-12 rounded-[35%] border border-white/25 bg-white/[0.055] sm:h-40 sm:w-52" />

            <div className="absolute right-[10%] top-8 h-24 w-32 skew-x-12 rounded-[35%] border border-white/20 bg-white/[0.045] sm:h-32 sm:w-44" />

            <div className="absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 rounded-full bg-white/80 shadow-[0_0_35px_rgba(255,255,255,0.8)]" />
          </div>

          <div className="absolute left-[10%] top-[25%] h-px w-[22%] bg-white/20" />
          <div className="absolute right-[10%] top-[32%] h-px w-[20%] bg-white/20" />
        </div>
      )}
    </div>
  );
}

export default function FenixIntro({ onComplete }: FenixIntroProps) {
  const [phase, setPhase] = useState<"meaning" | "transport" | "brand">(
    "meaning",
  );
  const [scene, setScene] = useState(0);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        setPhase("transport");
      }, 2800),
    );

    for (let i = 1; i <= 4; i++) {
      timers.push(
        window.setTimeout(() => {
          setScene(i);
        }, 2800 + SCENE_DURATION * i),
      );
    }

    timers.push(
      window.setTimeout(() => {
        setPhase("brand");
      }, 6800),
    );

    timers.push(
      window.setTimeout(() => {
        setExit(true);
      }, 8500),
    );

    timers.push(
      window.setTimeout(() => {
        onComplete();
      }, 8800),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[999999] overflow-hidden bg-black text-white transition-opacity duration-300 ${
        exit ? "opacity-0" : "opacity-100"
      }`}
      style={{
        willChange: "opacity",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.045),transparent_42%)]" />

      {phase === "meaning" && (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-center">
          <div className="max-w-4xl animate-[fenixMeaning_2.8s_ease-in-out_forwards]">
            <p className="text-[clamp(22px,4vw,48px)] font-light leading-[1.15] tracking-[-0.035em] text-white/90">
              <span className="font-black">F</span>earless{" "}
              <span className="font-black">E</span>nergy{" "}
              <span className="font-black">N</span>avigates{" "}
              <span className="font-black">I</span>nfinite{" "}
              <span className="font-black">X</span>-factors.
            </p>

            <div className="mx-auto mt-8 h-px w-20 bg-white/25" />
          </div>
        </div>
      )}

      {phase === "transport" && (
        <div className="relative min-h-screen">
          <div
            key={scene}
            className="absolute inset-0 animate-[fenixScene_1s_ease-in-out_forwards]"
            style={{
              willChange: "transform, opacity",
            }}
          >
            <TransportScene scene={scene} />
          </div>

          <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-white/35">
              FeniX Mobility
            </p>

            <div className="mt-4 flex justify-center gap-2">
              {[0, 1, 2, 3].map((item) => (
                <span
                  key={item}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    item === scene
                      ? "w-8 bg-white"
                      : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "brand" && (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center animate-[fenixBrand_1.5s_ease-out_forwards]">
          <FXLogo />

          <div className="mt-8 text-center">
            <h1 className="text-4xl font-black tracking-[-0.07em] sm:text-6xl">
              FeniX
            </h1>

            <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.42em] text-white/35 sm:text-[10px]">
              Feni Business Ecosystem
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fenixMeaning {
          0% {
            opacity: 0;
            transform: translate3d(0, 12px, 0);
          }

          18% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          76% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          100% {
            opacity: 0;
            transform: translate3d(0, -8px, 0);
          }
        }

        @keyframes fenixScene {
          0% {
            opacity: 0;
            transform: translate3d(0, 14px, 0) scale(1.015);
          }

          18% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }

          82% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }

          100% {
            opacity: 0;
            transform: translate3d(0, -10px, 0) scale(1.01);
          }
        }

        @keyframes fenixBrand {
          0% {
            opacity: 0;
            transform: scale(0.96);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes fenixMeaning {
            0%,
            100% {
              opacity: 1;
              transform: none;
            }
          }

          @keyframes fenixScene {
            0%,
            100% {
              opacity: 1;
              transform: none;
            }
          }

          @keyframes fenixBrand {
            0%,
            100% {
              opacity: 1;
              transform: none;
            }
          }
        }
      `}</style>
    </div>
  );
}
