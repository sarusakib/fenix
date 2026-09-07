"use client";

import { useEffect, useRef, useState } from "react";

type FenixIntroProps = {
  onComplete: () => void;
};

type Stage = "enter" | "hold" | "exit";

type QualityTier = "safe" | "balanced" | "high" | "ultra";

type FeatherColor = "silver" | "teal" | "gold" | "dark";

type Feather = {
  angle: number;
  radius: number;
  length: number;
  width: number;
  orbit: number;
  twist: number;
  phase: number;
  depth: number;
  alpha: number;
  scale: number;
  color: FeatherColor;
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

type QualityConfig = {
  feathers: number;
  sparks: number;
  dpr: number;
  barbDetail: number;
  spriteScale: number;
  backgroundQuality: number;
};

const INTRO_HOLD = 900;
const INTRO_EXIT_START = 3200;
const INTRO_COMPLETE = 3900;

const TAU = Math.PI * 2;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getNetworkScore(): number {
  if (typeof navigator === "undefined") return 2;

  const connection = (
    navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        downlink?: number;
        saveData?: boolean;
      };
    }
  ).connection;

  if (!connection) return 2;

  if (connection.saveData) return 0;

  const effectiveType = connection.effectiveType;

  if (effectiveType === "slow-2g") return 0;
  if (effectiveType === "2g") return 0;
  if (effectiveType === "3g") return 1;
  if (effectiveType === "4g") return 3;

  if (
    typeof connection.downlink === "number" &&
    connection.downlink >= 8
  ) {
    return 3;
  }

  if (
    typeof connection.downlink === "number" &&
    connection.downlink >= 2
  ) {
    return 2;
  }

  return 1;
}

function detectQuality(): QualityTier {
  if (typeof window === "undefined") {
    return "balanced";
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const area = width * height;

  const cores = navigator.hardwareConcurrency || 4;

  const memory =
    "deviceMemory" in navigator
      ? Number(
          (
            navigator as Navigator & {
              deviceMemory?: number;
            }
          ).deviceMemory || 4,
        )
      : 4;

  const touch =
    navigator.maxTouchPoints > 0;

  const networkScore = getNetworkScore();

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion) {
    return "safe";
  }

  if (cores <= 2 || memory <= 2) {
    return "safe";
  }

  if (networkScore === 0) {
    return cores <= 4 ? "safe" : "balanced";
  }

  if (touch && area < 450000) {
    return cores >= 6 && memory >= 4
      ? "balanced"
      : "safe";
  }

  if (cores >= 10 && memory >= 8 && area >= 1800000) {
    return "ultra";
  }

  if (cores >= 6 && memory >= 4) {
    return networkScore >= 2
      ? "high"
      : "balanced";
  }

  return "balanced";
}

function getConfig(
  tier: QualityTier,
): QualityConfig {
  switch (tier) {
    case "safe":
      return {
        feathers: 58,
        sparks: 10,
        dpr: 1,
        barbDetail: 0.42,
        spriteScale: 0.82,
        backgroundQuality: 0.7,
      };

    case "balanced":
      return {
        feathers: 92,
        sparks: 16,
        dpr: 1.15,
        barbDetail: 0.58,
        spriteScale: 0.92,
        backgroundQuality: 0.82,
      };

    case "high":
      return {
        feathers: 135,
        sparks: 24,
        dpr: 1.35,
        barbDetail: 0.76,
        spriteScale: 1,
        backgroundQuality: 0.94,
      };

    case "ultra":
      return {
        feathers: 175,
        sparks: 32,
        dpr: 1.55,
        barbDetail: 0.92,
        spriteScale: 1.05,
        backgroundQuality: 1,
      };
  }
}

function createFeather(
  width: number,
  height: number,
  index: number,
  total: number,
): Feather {
  const maxRadius =
    Math.max(width, height) * 0.68;

  const distribution =
    Math.random();

  let radius: number;

  if (distribution < 0.18) {
    radius = rand(
      maxRadius * 0.14,
      maxRadius * 0.32,
    );
  } else if (distribution < 0.6) {
    radius = rand(
      maxRadius * 0.28,
      maxRadius * 0.62,
    );
  } else {
    radius = rand(
      maxRadius * 0.55,
      maxRadius,
    );
  }

  const layer = radius / maxRadius;

  const palette = Math.random();

  let color: FeatherColor;

  if (palette < 0.075) {
    color = "gold";
  } else if (palette < 0.28) {
    color = "teal";
  } else if (palette < 0.72) {
    color = "silver";
  } else {
    color = "dark";
  }

  return {
    angle:
      (index / Math.max(total, 1)) * TAU +
      rand(-0.14, 0.14),

    radius,

    length:
      rand(58, 190) *
      (1.12 - layer * 0.24),

    width:
      rand(16, 48) *
      (1.08 - layer * 0.18),

    orbit: rand(
      0.00018,
      0.00058,
    ) *
      (Math.random() > 0.5 ? 1 : -1),

    twist: rand(-0.3, 0.3),

    phase: rand(0, TAU),

    depth: rand(0.25, 1),

    alpha:
      color === "dark"
        ? rand(0.28, 0.62)
        : color === "gold"
          ? rand(0.42, 0.76)
          : rand(0.42, 0.86),

    scale: rand(0.68, 1.14),

    color,

    flutter: rand(0.35, 1),
  };
}

function createSpark(): Spark {
  return {
    angle: rand(0, TAU),
    radius: rand(90, 700),
    speed: rand(
      0.00015,
      0.00052,
    ),
    size: rand(0.45, 1.45),
    alpha: rand(0.15, 0.58),
    phase: rand(0, TAU),
  };
}

function createFeatherSprite(
  color: FeatherColor,
  scale: number,
  barbDetail: number,
): HTMLCanvasElement {
  const canvas =
    document.createElement("canvas");

  const width =
    Math.round(220 * scale);

  const height =
    Math.round(90 * scale);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return canvas;
  }

  const cx = 8 * scale;
  const cy = height / 2;

  const length =
    190 * scale;

  const featherWidth =
    42 * scale;

  let gradient =
    ctx.createLinearGradient(
      0,
      0,
      length,
      0,
    );

  if (color === "silver") {
    gradient.addColorStop(
      0,
      "#111617",
    );

    gradient.addColorStop(
      0.24,
      "#515a59",
    );

    gradient.addColorStop(
      0.52,
      "#aaa9a1",
    );

    gradient.addColorStop(
      0.78,
      "#ece8df",
    );

    gradient.addColorStop(
      1,
      "#7e8583",
    );
  }

  if (color === "teal") {
    gradient.addColorStop(
      0,
      "#061719",
    );

    gradient.addColorStop(
      0.3,
      "#155458",
    );

    gradient.addColorStop(
      0.58,
      "#238688",
    );

    gradient.addColorStop(
      0.8,
      "#83b7b4",
    );

    gradient.addColorStop(
      1,
      "#315e60",
    );
  }

  if (color === "gold") {
    gradient.addColorStop(
      0,
      "#2b2118",
    );

    gradient.addColorStop(
      0.3,
      "#80532f",
    );

    gradient.addColorStop(
      0.62,
      "#cb9653",
    );

    gradient.addColorStop(
      0.82,
      "#efc887",
    );

    gradient.addColorStop(
      1,
      "#754c29",
    );
  }

  if (color === "dark") {
    gradient.addColorStop(
      0,
      "#050707",
    );

    gradient.addColorStop(
      0.38,
      "#151a1a",
    );

    gradient.addColorStop(
      0.7,
      "#3d4544",
    );

    gradient.addColorStop(
      1,
      "#121717",
    );
  }

  ctx.save();

  ctx.translate(
    0,
    0,
  );

  ctx.beginPath();

  ctx.moveTo(
    cx,
    cy,
  );

  ctx.bezierCurveTo(
    length * 0.22,
    cy - featherWidth * 0.52,
    length * 0.58,
    cy - featherWidth * 0.6,
    length,
    cy,
  );

  ctx.bezierCurveTo(
    length * 0.62,
    cy + featherWidth * 0.5,
    length * 0.2,
    cy + featherWidth * 0.36,
    cx,
    cy,
  );

  ctx.closePath();

  ctx.fillStyle = gradient;

  ctx.fill();

  /*
   * Central rachis
   */
  const shaft =
    ctx.createLinearGradient(
      0,
      cy,
      length,
      cy,
    );

  shaft.addColorStop(
    0,
    "rgba(15,18,18,0.75)",
  );

  shaft.addColorStop(
    0.4,
    "rgba(245,242,232,0.62)",
  );

  shaft.addColorStop(
    0.72,
    "rgba(255,255,255,0.88)",
  );

  shaft.addColorStop(
    1,
    "rgba(255,255,255,0)",
  );

  ctx.beginPath();

  ctx.moveTo(
    cx,
    cy,
  );

  ctx.quadraticCurveTo(
    length * 0.5,
    cy - featherWidth * 0.04,
    length,
    cy - featherWidth * 0.025,
  );

  ctx.strokeStyle = shaft;

  ctx.lineWidth =
    Math.max(
      0.7,
      1.25 * scale,
    );

  ctx.stroke();

  /*
   * Barb details
   *
   * Generated ONCE.
   * Never regenerated every frame.
   */
  const barbCount = Math.max(
    5,
    Math.floor(
      20 * barbDetail,
    ),
  );

  ctx.globalAlpha = 0.58;

  for (
    let i = 2;
    i < barbCount;
    i++
  ) {
    const t =
      i / barbCount;

    const x =
      length * t;

    const envelope =
      Math.sin(
        Math.PI * t,
      );

    const barb =
      featherWidth *
      envelope *
      0.48;

    const side =
      i % 2 === 0
        ? -1
        : 1;

    const endX =
      x -
      length * 0.09;

    const endY =
      cy +
      side * barb;

    ctx.beginPath();

    ctx.moveTo(
      x,
      cy,
    );

    ctx.quadraticCurveTo(
      x - length * 0.035,
      cy + side * barb * 0.28,
      endX,
      endY,
    );

    if (color === "teal") {
      ctx.strokeStyle =
        "rgba(210,245,242,0.3)";
    } else if (color === "gold") {
      ctx.strokeStyle =
        "rgba(255,224,170,0.3)";
    } else {
      ctx.strokeStyle =
        "rgba(255,255,255,0.24)";
    }

    ctx.lineWidth =
      Math.max(
        0.4,
        0.85 * scale,
      );

    ctx.stroke();
  }

  /*
   * Controlled highlight
   */
  ctx.globalAlpha = 0.55;

  const shine =
    ctx.createLinearGradient(
      length * 0.15,
      cy - featherWidth * 0.18,
      length * 0.85,
      cy,
    );

  shine.addColorStop(
    0,
    "rgba(255,255,255,0)",
  );

  shine.addColorStop(
    0.55,
    "rgba(255,255,255,0.25)",
  );

  shine.addColorStop(
    0.68,
    "rgba(255,255,255,0.62)",
  );

  shine.addColorStop(
    0.74,
    "rgba(255,255,255,0)",
  );

  ctx.beginPath();

  ctx.moveTo(
    length * 0.16,
    cy - featherWidth * 0.13,
  );

  ctx.quadraticCurveTo(
    length * 0.5,
    cy - featherWidth * 0.22,
    length * 0.82,
    cy,
  );

  ctx.strokeStyle = shine;

  ctx.lineWidth =
    Math.max(
      0.7,
      2 * scale,
    );

  ctx.stroke();

  ctx.restore();

  return canvas;
}

export default function FenixIntro({
  onComplete,
}: FenixIntroProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null,
    );

  const [stage, setStage] =
    useState<Stage>("enter");

  useEffect(() => {
    const holdTimer =
      window.setTimeout(
        () => setStage("hold"),
        INTRO_HOLD,
      );

    const exitTimer =
      window.setTimeout(
        () => setStage("exit"),
        INTRO_EXIT_START,
      );

    const completeTimer =
      window.setTimeout(
        () => onComplete(),
        INTRO_COMPLETE,
      );

    return () => {
      window.clearTimeout(
        holdTimer,
      );

      window.clearTimeout(
        exitTimer,
      );

      window.clearTimeout(
        completeTimer,
      );
    };
  }, [onComplete]);

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });

    if (!ctx) return;

    let destroyed = false;

    let animationFrame = 0;

    let width = 0;
    let height = 0;

    let dpr = 1;

    let elapsed = 0;

    let lastTime =
      performance.now();

    let lastQualityCheck =
      performance.now();

    let slowFrames = 0;
    let goodFrames = 0;

    let tier =
      detectQuality();

    let config =
      getConfig(tier);

    let feathers: Feather[] = [];

    let sparks: Spark[] = [];

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    /*
     * Feather sprites.
     *
     * Created once per quality setup.
     */
    let sprites:
      Record<
        FeatherColor,
        HTMLCanvasElement
      > = {} as Record<
        FeatherColor,
        HTMLCanvasElement
      >;

    function buildSprites() {
      sprites = {
        silver:
          createFeatherSprite(
            "silver",
            config.spriteScale,
            config.barbDetail,
          ),

        teal:
          createFeatherSprite(
            "teal",
            config.spriteScale,
            config.barbDetail,
          ),

        gold:
          createFeatherSprite(
            "gold",
            config.spriteScale,
            config.barbDetail,
          ),

        dark:
          createFeatherSprite(
            "dark",
            config.spriteScale,
            config.barbDetail,
          ),
      };
    }

    function rebuildScene() {
      feathers = Array.from(
        {
          length:
            config.feathers,
        },
        (_, index) =>
          createFeather(
            width,
            height,
            index,
            config.feathers,
          ),
      );

      sparks = Array.from(
        {
          length:
            config.sparks,
        },
        createSpark,
      );

      buildSprites();
    }

    function resize() {
      width =
        window.innerWidth;

      height =
        window.innerHeight;

      const screenArea =
        width * height;

      /*
       * DPR is adaptive.
       *
       * Never blindly use native DPR.
       */
      const maxDpr =
        screenArea > 2500000
          ? 1.65
          : screenArea > 1200000
            ? 1.45
            : 1.25;

      dpr = Math.min(
        window.devicePixelRatio ||
          1,
        config.dpr,
        maxDpr,
      );

      canvas.width =
        Math.max(
          1,
          Math.floor(
            width * dpr,
          ),
        );

      canvas.height =
        Math.max(
          1,
          Math.floor(
            height * dpr,
          ),
        );

      canvas.style.width =
        `${width}px`;

      canvas.style.height =
        `${height}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );

      rebuildScene();
    }

    resize();

    let resizeTimer = 0;

    const handleResize = () => {
      window.clearTimeout(
        resizeTimer,
      );

      resizeTimer =
        window.setTimeout(
          resize,
          120,
        );
    };

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive: true,
      },
    );

    function drawBackground() {
      const cx =
        width * 0.5;

      const cy =
        height * 0.5;

      const radius =
        Math.max(
          width,
          height,
        ) * 0.72;

      const bg =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          radius,
        );

      bg.addColorStop(
        0,
        "#101617",
      );

      bg.addColorStop(
        0.16,
        "#1b2424",
      );

      bg.addColorStop(
        0.32,
        "#303637",
      );

      bg.addColorStop(
        0.54,
        "#141919",
      );

      bg.addColorStop(
        0.8,
        "#07090a",
      );

      bg.addColorStop(
        1,
        "#010202",
      );

      ctx.fillStyle = bg;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );

      const glow =
        ctx.createRadialGradient(
          cx - width * 0.04,
          cy - height * 0.04,
          0,
          cx - width * 0.04,
          cy - height * 0.04,
          Math.max(
            width,
            height,
          ) * 0.52,
        );

      glow.addColorStop(
        0,
        "rgba(0,128,128,0.16)",
      );

      glow.addColorStop(
        0.35,
        "rgba(0,128,128,0.05)",
      );

      glow.addColorStop(
        1,
        "rgba(0,128,128,0)",
      );

      ctx.fillStyle = glow;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );

      const warm =
        ctx.createRadialGradient(
          width * 0.72,
          height * 0.32,
          0,
          width * 0.72,
          height * 0.32,
          Math.max(
            width,
            height,
          ) * 0.4,
        );

      warm.addColorStop(
        0,
        "rgba(210,155,80,0.065)",
      );

      warm.addColorStop(
        1,
        "rgba(210,155,80,0)",
      );

      ctx.fillStyle = warm;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );
    }

    function drawFeather(
      feather: Feather,
      time: number,
    ) {
      const sprite =
        sprites[feather.color];

      if (!sprite) return;

      const cx =
        width * 0.5;

      const cy =
        height * 0.5;

      const wave =
        Math.sin(
          time * 0.001 *
            feather.flutter +
            feather.phase,
        ) * 0.045;

      const radius =
        feather.radius +
        Math.sin(
          time * 0.00042 +
            feather.phase,
        ) *
          (10 +
            feather.depth * 22);

      const angle =
        feather.angle +
        time * feather.orbit +
        wave;

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

      const flutter =
        Math.sin(
          time * 0.0017 +
            feather.phase,
        ) *
        feather.flutter *
        0.07;

      const rotation =
        tangent +
        feather.twist +
        flutter;

      const perspective =
        0.72 +
        feather.depth *
          0.48;

      const scale =
        feather.scale *
        perspective;

      /*
       * Skip extremely tiny distant
       * feathers on weaker quality tiers.
       */
      if (
        tier === "safe" &&
        feather.depth < 0.28
      ) {
        return;
      }

      ctx.save();

      ctx.translate(
        x,
        y,
      );

      ctx.rotate(
        rotation,
      );

      ctx.globalAlpha =
        feather.alpha *
        (0.5 +
          feather.depth *
            0.5);

      ctx.drawImage(
        sprite,
        0,
        -sprite.height / 2,
        sprite.width * scale,
        sprite.height * scale,
      );

      ctx.restore();
    }

    function drawCore(
      time: number,
    ) {
      const cx =
        width * 0.5;

      const cy =
        height * 0.5;

      const coreRadius =
        Math.min(
          width,
          height,
        ) * 0.115;

      const aura =
        ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          coreRadius * 3,
        );

      aura.addColorStop(
        0,
        "rgba(0,128,128,0.12)",
      );

      aura.addColorStop(
        0.35,
        "rgba(0,128,128,0.045)",
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
        coreRadius * 3,
        0,
        TAU,
      );

      ctx.fill();

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
        "rgba(5,10,10,0.94)",
      );

      core.addColorStop(
        0.7,
        "rgba(10,21,21,0.7)",
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

      if (tier !== "safe") {
        ctx.save();

        ctx.translate(
          cx,
          cy,
        );

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
          "rgba(255,215,0,0.12)";

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
    }

    function drawSparks(
      time: number,
    ) {
      if (
        tier === "safe"
      ) {
        return;
      }

      const cx =
        width * 0.5;

      const cy =
        height * 0.5;

      ctx.save();

      for (const spark of sparks) {
        const radius =
          spark.radius +
          Math.sin(
            time * 0.001 +
              spark.phase,
          ) * 18;

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
            time * 0.0025 +
              spark.phase,
          ) *
            0.45;

        ctx.globalAlpha =
          spark.alpha *
          pulse;

        ctx.fillStyle =
          spark.phase % 2 >
          1
            ? "#008080"
            : "#d9d5cc";

        ctx.fillRect(
          x,
          y,
          spark.size,
          spark.size,
        );
      }

      ctx.restore();
    }

    function drawVignette() {
      const cx =
        width * 0.5;

      const cy =
        height * 0.5;

      const vignette =
        ctx.createRadialGradient(
          cx,
          cy,
          Math.min(
            width,
            height,
          ) * 0.18,
          cx,
          cy,
          Math.max(
            width,
            height,
          ) * 0.75,
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
        "rgba(0,0,0,0.46)",
      );

      vignette.addColorStop(
        1,
        "rgba(0,0,0,0.88)",
      );

      ctx.fillStyle =
        vignette;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );
    }

    /*
     * Performance monitor.
     *
     * The intro watches actual frame time.
     * If the device struggles, quality drops.
     */
    function adaptQuality(
      frameTime: number,
    ) {
      if (
        reducedMotion ||
        performance.now() -
          lastQualityCheck <
          500
      ) {
        return;
      }

      lastQualityCheck =
        performance.now();

      if (frameTime > 27) {
        slowFrames += 1;
        goodFrames = 0;
      } else if (
        frameTime < 17
      ) {
        goodFrames += 1;
        slowFrames = 0;
      } else {
        slowFrames = 0;
        goodFrames = 0;
      }

      /*
       * Drop one tier quickly if
       * the device is struggling.
       */
      if (
        slowFrames >= 2
      ) {
        const next =
          tier === "ultra"
            ? "high"
            : tier === "high"
              ? "balanced"
              : "safe";

        if (next !== tier) {
          tier = next;
          config =
            getConfig(tier);

          rebuildScene();
        }

        slowFrames = 0;

        return;
      }

      /*
       * Upgrade only after sustained
       * good performance.
       */
      if (
        goodFrames >= 5
      ) {
        const next =
          tier === "safe"
            ? "balanced"
            : tier === "balanced"
              ? "high"
              : tier === "high"
                ? "ultra"
                : "ultra";

        if (next !== tier) {
          tier = next;
          config =
            getConfig(tier);

          rebuildScene();
        }

        goodFrames = 0;
      }
    }

    function render(
      now: number,
    ) {
      if (destroyed) {
        return;
      }

      const delta =
        Math.min(
          now - lastTime,
          34,
        );

      lastTime = now;

      if (
        document.visibilityState !==
        "visible"
      ) {
        animationFrame =
          requestAnimationFrame(
            render,
          );

        return;
      }

      elapsed +=
        reducedMotion
          ? delta * 0.08
          : delta;

      const frameStart =
        performance.now();

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );

      ctx.globalAlpha = 1;

      ctx.clearRect(
        0,
        0,
        width,
        height,
      );

      drawBackground();

      /*
       * No per-frame sort.
       *
       * Feathers are generated with
       * random depth and don't need
       * expensive sorting every frame.
       */
      for (
        const feather of feathers
      ) {
        drawFeather(
          feather,
          elapsed,
        );
      }

      drawCore(
        elapsed,
      );

      drawSparks(
        elapsed,
      );

      drawVignette();

      const frameTime =
        performance.now() -
        frameStart;

      adaptQuality(
        frameTime,
      );

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

      window.clearTimeout(
        resizeTimer,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      /*
       * Release canvas backing store.
       */
      canvas.width = 1;
      canvas.height = 1;

      feathers = [];
      sparks = [];
      sprites = {} as Record<
        FeatherColor,
        HTMLCanvasElement
      >;
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

      <div
        className="
          pointer-events-none
          absolute inset-0
          z-40
          bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.08)_42%,rgba(0,0,0,0.78)_100%)]
        "
      />

      <div
        className="
          pointer-events-none
          absolute inset-0
          z-50
          opacity-[0.018]
          [background-image:radial-gradient(rgba(255,255,255,0.8)_0.5px,transparent_0.5px)]
          [background-size:4px_4px]
        "
      />
    </div>
  );
}
