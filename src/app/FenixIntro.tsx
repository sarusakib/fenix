"use client";

import { useEffect, useRef, useState } from "react";

type FenixIntroProps = {
  onComplete: () => void;
};

const INTRO_HOLD = 900;
const INTRO_EXIT_START = 3200;
const INTRO_COMPLETE = 3900;

type Feather = {
  angle: number;
  radius: number;
  radiusBase: number;
  size: number;
  length: number;
  width: number;
  speed: number;
  orbit: number;
  twist: number;
  phase: number;
  depth: number;
  layer: number;
  color: "silver" | "teal" | "gold" | "dark";
  alpha: number;
  curve: number;
  flutter: number;
};

type Spark = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  phase: number;
};

const TAU = Math.PI * 2;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function createFeather(
  width: number,
  height: number,
  mobile: boolean,
  index: number,
): Feather {
  const maxRadius = Math.max(width, height) * (mobile ? 0.56 : 0.7);

  const band = Math.random();
  let radius: number;

  if (band < 0.2) {
    radius = rand(maxRadius * 0.16, maxRadius * 0.32);
  } else if (band < 0.58) {
    radius = rand(maxRadius * 0.3, maxRadius * 0.6);
  } else {
    radius = rand(maxRadius * 0.55, maxRadius);
  }

  const palette = Math.random();

  let color: Feather["color"];

  if (palette < 0.08) {
    color = "gold";
  } else if (palette < 0.27) {
    color = "teal";
  } else if (palette < 0.68) {
    color = "silver";
  } else {
    color = "dark";
  }

  const layer = radius / maxRadius;

  return {
    angle:
      (index / 230) * TAU +
      rand(-0.12, 0.12) +
      radius * 0.0028,

    radius,

    radiusBase: radius,

    size: rand(
      mobile ? 0.62 : 0.7,
      mobile ? 1.0 : 1.22,
    ),

    length: rand(
      mobile ? 48 : 62,
      mobile ? 120 : 205,
    ) * (1.1 - layer * 0.25),

    width: rand(
      mobile ? 14 : 17,
      mobile ? 35 : 54,
    ),

    speed: rand(0.000025, 0.000075) *
      (Math.random() > 0.5 ? 1 : -1),

    orbit: rand(0.00025, 0.0007),

    twist: rand(-0.35, 0.35),

    phase: rand(0, TAU),

    depth: rand(0.35, 1),

    layer,

    color,

    alpha:
      color === "dark"
        ? rand(0.32, 0.68)
        : color === "gold"
          ? rand(0.48, 0.8)
          : rand(0.48, 0.9),

    curve: rand(-0.35, 0.35),

    flutter: rand(0.3, 1),
  };
}

function createSpark(): Spark {
  return {
    angle: rand(0, TAU),
    radius: rand(80, 700),
    speed: rand(0.0002, 0.0007),
    size: rand(0.4, 1.7),
    alpha: rand(0.15, 0.65),
    phase: rand(0, TAU),
  };
}

export default function FenixIntro({
  onComplete,
}: FenixIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stage, setStage] = useState<
    "enter" | "hold" | "exit"
  >("enter");

  useEffect(() => {
    const holdTimer = window.setTimeout(() => {
      setStage("hold");
    }, INTRO_HOLD);

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

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    let animationFrame = 0;
    let destroyed = false;

    let feathers: Feather[] = [];
    let sparks: Spark[] = [];

    let lastTime = performance.now();
    let elapsed = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const isMobileDevice =
      window.innerWidth <= 600 ||
      navigator.maxTouchPoints > 1;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;

      dpr = Math.min(
        window.devicePixelRatio || 1,
        isMobileDevice ? 1.5 : 2,
      );

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = width * height;

      let count: number;

      if (area < 300000) {
        count = 115;
      } else if (area < 800000) {
        count = 165;
      } else if (area < 1800000) {
        count = 235;
      } else {
        count = 310;
      }

      feathers = Array.from(
        { length: count },
        (_, i) =>
          createFeather(
            width,
            height,
            isMobileDevice,
            i,
          ),
      );

      sparks = Array.from(
        {
          length: isMobileDevice ? 24 : 48,
        },
        createSpark,
      );
    }

    resize();

    window.addEventListener("resize", resize);

    function drawBackground() {
      const cx = width * 0.5;
      const cy = height * 0.5;

      const bg = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.max(width, height) * 0.72,
      );

      bg.addColorStop(0, "#101617");
      bg.addColorStop(0.14, "#1a2222");
      bg.addColorStop(0.3, "#303637");
      bg.addColorStop(0.52, "#15191a");
      bg.addColorStop(0.78, "#07090a");
      bg.addColorStop(1, "#010202");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const tealGlow = ctx.createRadialGradient(
        cx - width * 0.04,
        cy - height * 0.03,
        0,
        cx - width * 0.04,
        cy - height * 0.03,
        Math.max(width, height) * 0.5,
      );

      tealGlow.addColorStop(
        0,
        "rgba(0,128,128,0.18)",
      );

      tealGlow.addColorStop(
        0.35,
        "rgba(0,128,128,0.055)",
      );

      tealGlow.addColorStop(
        1,
        "rgba(0,128,128,0)",
      );

      ctx.fillStyle = tealGlow;
      ctx.fillRect(0, 0, width, height);

      const warmGlow = ctx.createRadialGradient(
        width * 0.72,
        height * 0.32,
        0,
        width * 0.72,
        height * 0.32,
        Math.max(width, height) * 0.42,
      );

      warmGlow.addColorStop(
        0,
        "rgba(210,155,80,0.08)",
      );

      warmGlow.addColorStop(
        1,
        "rgba(210,155,80,0)",
      );

      ctx.fillStyle = warmGlow;
      ctx.fillRect(0, 0, width, height);
    }

    function drawFeather(
      feather: Feather,
      time: number,
    ) {
      const cx = width * 0.5;
      const cy = height * 0.5;

      const wave =
        Math.sin(
          time * 0.0011 * feather.flutter +
            feather.phase,
        ) * 0.06;

      const radius =
        feather.radius +
        Math.sin(
          time * 0.00045 +
            feather.phase,
        ) *
          (12 + feather.layer * 20);

      const angle =
        feather.angle +
        time * feather.orbit +
        wave;

      const depth =
        0.55 +
        Math.sin(
          time * 0.00038 +
            feather.phase,
        ) *
          0.35;

      const x =
        cx +
        Math.cos(angle) *
          radius;

      const y =
        cy +
        Math.sin(angle) *
          radius *
          0.78;

      const tangent =
        angle +
        Math.PI / 2;

      const inwardPull =
        Math.sin(
          time * 0.00032 +
            feather.phase,
        ) * 0.12;

      const rotation =
        tangent +
        feather.twist +
        inwardPull;

      const perspective =
        0.72 +
        depth * 0.48;

      const length =
        feather.length *
        feather.size *
        perspective;

      const featherWidth =
        feather.width *
        feather.size *
        perspective;

      ctx.save();

      ctx.translate(x, y);

      ctx.rotate(rotation);

      const flutter =
        Math.sin(
          time * 0.002 +
            feather.phase,
        ) *
        feather.flutter *
        0.12;

      ctx.transform(
        1,
        flutter,
        0,
        1,
        0,
        0,
      );

      ctx.globalAlpha =
        feather.alpha *
        (0.52 + depth * 0.48);

      if (feather.layer < 0.3) {
        ctx.filter =
          "blur(1.2px)";
      } else if (feather.layer > 0.78) {
        ctx.filter =
          "blur(0.35px)";
      } else {
        ctx.filter = "none";
      }

      const grad =
        ctx.createLinearGradient(
          0,
          0,
          length,
          0,
        );

      if (feather.color === "silver") {
        grad.addColorStop(
          0,
          "#161b1b",
        );

        grad.addColorStop(
          0.22,
          "#5e6665",
        );

        grad.addColorStop(
          0.52,
          "#b9b5ab",
        );

        grad.addColorStop(
          0.78,
          "#e4dfd5",
        );

        grad.addColorStop(
          1,
          "#8d918e",
        );
      }

      if (feather.color === "teal") {
        grad.addColorStop(
          0,
          "#071719",
        );

        grad.addColorStop(
          0.28,
          "#15565b",
        );

        grad.addColorStop(
          0.55,
          "#23878a",
        );

        grad.addColorStop(
          0.78,
          "#83b5b3",
        );

        grad.addColorStop(
          1,
          "#315f61",
        );
      }

      if (feather.color === "gold") {
        grad.addColorStop(
          0,
          "#33251b",
        );

        grad.addColorStop(
          0.3,
          "#8c5a32",
        );

        grad.addColorStop(
          0.62,
          "#d29a55",
        );

        grad.addColorStop(
          0.82,
          "#f0ca88",
        );

        grad.addColorStop(
          1,
          "#80552e",
        );
      }

      if (feather.color === "dark") {
        grad.addColorStop(
          0,
          "#070909",
        );

        grad.addColorStop(
          0.35,
          "#171c1c",
        );

        grad.addColorStop(
          0.7,
          "#414847",
        );

        grad.addColorStop(
          1,
          "#161b1b",
        );
      }

      // Soft feather shadow
      ctx.shadowColor =
        feather.color === "teal"
          ? "rgba(0,128,128,0.16)"
          : feather.color === "gold"
            ? "rgba(210,150,70,0.12)"
            : "rgba(0,0,0,0.6)";

      ctx.shadowBlur =
        feather.layer > 0.65
          ? 10
          : 16;

      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 7;

      // Feather body
      ctx.beginPath();

      ctx.moveTo(0, 0);

      ctx.bezierCurveTo(
        length * 0.2,
        -featherWidth * 0.45,
        length * 0.58,
        -featherWidth * 0.58,
        length,
        0,
      );

      ctx.bezierCurveTo(
        length * 0.63,
        featherWidth * 0.52,
        length * 0.2,
        featherWidth * 0.38,
        0,
        0,
      );

      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Central rachis
      const rachis =
        ctx.createLinearGradient(
          0,
          0,
          length,
          0,
        );

      rachis.addColorStop(
        0,
        "rgba(20,22,22,0.7)",
      );

      rachis.addColorStop(
        0.35,
        "rgba(245,242,232,0.7)",
      );

      rachis.addColorStop(
        0.75,
        "rgba(255,255,255,0.88)",
      );

      rachis.addColorStop(
        1,
        "rgba(255,255,255,0)",
      );

      ctx.beginPath();

      ctx.moveTo(0, 0);

      ctx.quadraticCurveTo(
        length * 0.5,
        feather.curve *
          featherWidth,
        length,
        -featherWidth * 0.03,
      );

      ctx.strokeStyle = rachis;
      ctx.lineWidth =
        Math.max(
          0.65,
          featherWidth * 0.035,
        );

      ctx.stroke();

      // Individual feather barbs
      const barbCount = Math.floor(
        clamp(length / 9, 7, 22),
      );

      ctx.globalAlpha *= 0.68;

      for (
        let i = 2;
        i < barbCount;
        i++
      ) {
        const t =
          i / barbCount;

        const bx =
          length * t;

        const envelope =
          Math.sin(
            Math.PI * t,
          );

        const barb =
          featherWidth *
          envelope *
          0.54;

        const side =
          i % 2 === 0
            ? -1
            : 1;

        const bend =
          side *
          barb *
          (0.72 +
            Math.sin(
              time * 0.001 +
                feather.phase +
                i,
            ) *
              0.08);

        ctx.beginPath();

        ctx.moveTo(
          bx,
          0,
        );

        ctx.quadraticCurveTo(
          bx -
            length *
              0.055,
          bend * 0.35,
          bx -
            length *
              0.11,
          bend,
        );

        ctx.strokeStyle =
          feather.color ===
          "teal"
            ? "rgba(190,235,232,0.32)"
            : feather.color ===
                "gold"
              ? "rgba(255,222,165,0.32)"
              : "rgba(255,255,255,0.26)";

        ctx.lineWidth =
          Math.max(
            0.45,
            featherWidth *
              0.018,
          );

        ctx.stroke();
      }

      // Specular highlight
      if (
        feather.depth > 0.7
      ) {
        const shine =
          ctx.createLinearGradient(
            length * 0.2,
            -featherWidth * 0.2,
            length * 0.82,
            0,
          );

        shine.addColorStop(
          0,
          "rgba(255,255,255,0)",
        );

        shine.addColorStop(
          0.52,
          "rgba(255,255,255,0.3)",
        );

        shine.addColorStop(
          0.66,
          "rgba(255,255,255,0.65)",
        );

        shine.addColorStop(
          0.72,
          "rgba(255,255,255,0)",
        );

        ctx.beginPath();

        ctx.moveTo(
          length * 0.18,
          -featherWidth * 0.15,
        );

        ctx.quadraticCurveTo(
          length * 0.52,
          -featherWidth * 0.22,
          length * 0.82,
          -featherWidth * 0.03,
        );

        ctx.strokeStyle = shine;

        ctx.lineWidth =
          Math.max(
            0.8,
            featherWidth * 0.055,
          );

        ctx.stroke();
      }

      ctx.restore();
    }

    function drawCore(time: number) {
      const cx = width * 0.5;
      const cy = height * 0.5;

      const coreRadius =
        Math.min(width, height) *
        0.115;

      // Outer teal aura
      const aura =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          coreRadius * 3.2,
        );

      aura.addColorStop(
        0,
        "rgba(0,128,128,0.12)",
      );

      aura.addColorStop(
        0.35,
        "rgba(0,128,128,0.055)",
      );

      aura.addColorStop(
        1,
        "rgba(0,128,128,0)",
      );

      ctx.fillStyle = aura;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        coreRadius * 3.2,
        0,
        TAU,
      );

      ctx.fill();

      // Dark center
      const core =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          coreRadius * 1.9,
        );

      core.addColorStop(
        0,
        "rgba(1,3,3,0.98)",
      );

      core.addColorStop(
        0.45,
        "rgba(5,10,10,0.95)",
      );

      core.addColorStop(
        0.7,
        "rgba(10,21,21,0.72)",
      );

      core.addColorStop(
        1,
        "rgba(10,15,15,0)",
      );

      ctx.fillStyle = core;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        coreRadius * 1.9,
        0,
        TAU,
      );

      ctx.fill();

      // Thin rotating energy ring
      ctx.save();

      ctx.translate(cx, cy);

      ctx.rotate(
        time * 0.00015,
      );

      ctx.strokeStyle =
        "rgba(0,180,180,0.2)";

      ctx.lineWidth = 1;

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        coreRadius * 1.05,
        -0.7,
        0.8,
      );

      ctx.stroke();

      ctx.strokeStyle =
        "rgba(255,215,0,0.13)";

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        coreRadius * 1.2,
        2.3,
        3.5,
      );

      ctx.stroke();

      ctx.restore();
    }

    function drawSparks(time: number) {
      const cx = width * 0.5;
      const cy = height * 0.5;

      for (const spark of sparks) {
        const radius =
          spark.radius +
          Math.sin(
            time * 0.001 +
              spark.phase,
          ) *
            20;

        const angle =
          spark.angle +
          time * spark.speed;

        const x =
          cx +
          Math.cos(angle) *
            radius;

        const y =
          cy +
          Math.sin(angle) *
            radius *
            0.78;

        const pulse =
          0.55 +
          Math.sin(
            time * 0.003 +
              spark.phase,
          ) *
            0.45;

        ctx.globalAlpha =
          spark.alpha *
          pulse;

        ctx.fillStyle =
          Math.random() > 0.78
            ? "#008080"
            : "#d9d5cc";

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          spark.size,
          0,
          TAU,
        );

        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    function drawVignette() {
      const cx = width * 0.5;
      const cy = height * 0.5;

      const vignette =
        ctx.createRadialGradient(
          cx,
          cy,
          Math.min(width, height) *
            0.18,
          cx,
          cy,
          Math.max(width, height) *
            0.75,
        );

      vignette.addColorStop(
        0,
        "rgba(0,0,0,0)",
      );

      vignette.addColorStop(
        0.58,
        "rgba(0,0,0,0.08)",
      );

      vignette.addColorStop(
        0.82,
        "rgba(0,0,0,0.48)",
      );

      vignette.addColorStop(
        1,
        "rgba(0,0,0,0.88)",
      );

      ctx.fillStyle = vignette;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );
    }

    function drawGrain() {
      const size = 160;

      ctx.save();

      ctx.globalAlpha = 0.025;

      for (
        let i = 0;
        i < 55;
        i++
      ) {
        const x =
          Math.random() * width;

        const y =
          Math.random() * height;

        ctx.fillStyle =
          Math.random() > 0.5
            ? "#fff"
            : "#000";

        ctx.fillRect(
          x,
          y,
          1,
          1,
        );
      }

      ctx.restore();
    }

    function render(now: number) {
      if (destroyed) return;

      const delta =
        Math.min(
          now - lastTime,
          32,
        );

      lastTime = now;

      if (
        document.visibilityState ===
        "visible"
      ) {
        elapsed +=
          reducedMotion
            ? delta * 0.08
            : delta;

        ctx.clearRect(
          0,
          0,
          width,
          height,
        );

        drawBackground();

        // Back-to-front sorting
        feathers.sort(
          (a, b) =>
            a.depth - b.depth,
        );

        // Dark / distant feathers
        for (
          const feather of feathers
        ) {
          if (
            feather.depth < 0.55
          ) {
            drawFeather(
              feather,
              elapsed,
            );
          }
        }

        // Main feathers
        for (
          const feather of feathers
        ) {
          if (
            feather.depth >= 0.55
          ) {
            drawFeather(
              feather,
              elapsed,
            );
          }
        }

        drawCore(elapsed);

        drawSparks(elapsed);

        drawVignette();

        drawGrain();
      }

      animationFrame =
        requestAnimationFrame(
          render,
        );
    }

    animationFrame =
      requestAnimationFrame(
        render,
      );

    return () => {
      destroyed = true;

      cancelAnimationFrame(
        animationFrame,
      );

      window.removeEventListener(
        "resize",
        resize,
      );
    };
  }, []);

  const isExit =
    stage === "exit";

  return (
    <div
      className={[
        "fixed inset-0 z-[999999]",
        "overflow-hidden",
        "bg-[#030506]",
        "text-white",
        "transition-[opacity,transform]",
        "duration-[700ms]",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",
        isExit
          ? "scale-[1.055] opacity-0"
          : "scale-100 opacity-100",
      ].join(" ")}
      aria-label="FeniX intro"
    >
      {/* =====================================================
          PROCEDURAL LIVING FEATHER VFX
          ===================================================== */}

      <canvas
        ref={canvasRef}
        className={[
          "absolute inset-0",
          "h-full w-full",
          "transition-[transform,opacity,filter]",
          "duration-[900ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          isExit
            ? "scale-[1.08] opacity-0 blur-[3px]"
            : "scale-100 opacity-100 blur-0",
        ].join(" ")}
        aria-hidden="true"
      />

      {/* Login matching atmospheric layer */}
      <div
        className={[
          "pointer-events-none absolute inset-0 z-10",
          "transition-opacity duration-[900ms]",
          isExit
            ? "opacity-0"
            : "opacity-100",
        ].join(" ")}
      >
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_50%_50%,rgba(0,128,128,0.10),transparent_34%)]
          "
        />

        <div
          className="
            absolute inset-0
            bg-[linear-gradient(180deg,rgba(3,5,6,0.12),transparent_35%,rgba(0,0,0,0.55))]
          "
        />
      </div>

      {/* =====================================================
          CINEMATIC FOCUS RINGS
          ===================================================== */}

      <div
        className={[
          "pointer-events-none absolute",
          "left-1/2 top-1/2 z-20",
          "h-[220px] w-[220px]",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full",
          "border border-[#008080]/10",
          "shadow-[0_0_80px_rgba(0,128,128,0.06)]",
          "transition-[transform,opacity]",
          "duration-[1000ms]",
          isExit
            ? "scale-[1.5] opacity-0"
            : "scale-100 opacity-100",
        ].join(" ")}
      />

      <div
        className={[
          "pointer-events-none absolute",
          "left-1/2 top-1/2 z-20",
          "h-[310px] w-[310px]",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full",
          "border border-white/[0.035]",
          "transition-[transform,opacity]",
          "duration-[1100ms]",
          isExit
            ? "scale-[1.35] opacity-0"
            : "scale-100 opacity-100",
        ].join(" ")}
      />

      {/* =====================================================
          FENIX BRAND
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute inset-0
          z-30
          flex items-center justify-center
        "
      >
        <div
          className={[
            "flex flex-col items-center",
            "transition-[opacity,transform,filter]",
            "duration-[850ms]",
            "ease-[cubic-bezier(0.22,1,0.36,1)]",
            isExit
              ? "translate-y-[-12px] scale-[1.18] opacity-0 blur-[7px]"
              : "translate-y-0 scale-100 opacity-100 blur-0",
          ].join(" ")}
        >
          {/* FX LOGO */}

          <div
            className={[
              "relative flex",
              "h-[88px] w-[88px]",
              "items-center justify-center",
              "rounded-[26px]",
              "border border-white/10",
              "bg-[#05070b]/45",
              "shadow-[0_0_100px_rgba(0,128,128,0.22)]",
              "backdrop-blur-xl",
              "transition-[transform,opacity]",
              "duration-[1000ms]",
              stage === "enter"
                ? "scale-[0.72] opacity-0"
                : "scale-100 opacity-100",
            ].join(" ")}
          >
            <div
              className="
                absolute inset-[7px]
                rounded-[20px]
                border border-[#008080]/25
              "
            />

            <div
              className="
                absolute inset-[15px]
                rounded-[15px]
                border border-white/[0.045]
              "
            />

            <div
              className="
                absolute
                left-1/2 top-1/2
                h-[46px] w-[46px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border border-[#008080]/15
                animate-[spin_9s_linear_infinite]
              "
            />

            <span
              className="
                relative
                text-[38px]
                font-black
                tracking-[-0.1em]
              "
            >
              F
              <span className="text-[#008080]">
                X
              </span>
            </span>

            <span
              className="
                absolute
                right-[5px]
                top-[5px]
                h-[5px]
                w-[5px]
                rounded-full
                bg-[#FFD700]
                shadow-[0_0_16px_rgba(255,215,0,0.8)]
              "
            />
          </div>

          {/* FeniX */}

          <div
            className={[
              "mt-6 text-center",
              "transition-[opacity,transform]",
              "duration-[1000ms]",
              "delay-[100ms]",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",
              stage === "enter"
                ? "translate-y-3 opacity-0"
                : "translate-y-0 opacity-100",
            ].join(" ")}
          >
            <h1
              className="
                text-[30px]
                font-black
                tracking-[-0.065em]
                sm:text-[38px]
              "
            >
              Feni
              <span className="text-[#008080]">
                X
              </span>
            </h1>

            <p
              className="
                mt-2
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.38em]
                text-white/35
                sm:text-[9px]
              "
            >
              Feni Business Ecosystem
            </p>
          </div>

          {/* Loading */}

          <div
            className={[
              "mt-8",
              "h-[2px] w-[112px]",
              "overflow-hidden rounded-full",
              "bg-white/[0.08]",
              "transition-opacity duration-700",
              stage === "enter"
                ? "opacity-0"
                : "opacity-100",
            ].join(" ")}
          >
            <div
              className="
                h-full w-full
                origin-left
                bg-gradient-to-r
                from-[#008080]/30
                via-white
                to-[#FFD700]/60
                animate-[fenixLoad_2.8s_cubic-bezier(0.22,1,0.36,1)_forwards]
              "
            />
          </div>

          <p
            className={[
              "mt-3",
              "text-[7px]",
              "font-medium",
              "uppercase",
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
          FINAL VIGNETTE
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute inset-0
          z-40
          bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.08)_42%,rgba(0,0,0,0.78)_100%)]
        "
      />

      {/* Grain */}

      <div
        className="
          pointer-events-none
          absolute inset-0
          z-50
          opacity-[0.025]
          [background-image:radial-gradient(rgba(255,255,255,0.8)_0.5px,transparent_0.5px)]
          [background-size:4px_4px]
        "
      />
    </div>
  );
}
