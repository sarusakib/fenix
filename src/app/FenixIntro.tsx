"use client";

import { useEffect, useRef, useState } from "react";

type FenixIntroProps = {
  onComplete: () => void;
};

type Stage = "enter" | "hold" | "exit";

type QualityName = "safe" | "balanced" | "high" | "ultra";

type QualityConfig = {
  featherCount: number;
  sparkCount: number;
  dpr: number;
  barbDetail: number;
  spriteScale: number;
  maxPixelArea: number;
};

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
  color: string;
  alpha: number;
  curve: number;
  flutter: number;
  spriteIndex: number;
};

type Spark = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  phase: number;
};

type Sprite = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};

const QUALITY_ORDER: QualityName[] = [
  "safe",
  "balanced",
  "high",
  "ultra",
];

const QUALITY_CONFIG: Record<QualityName, QualityConfig> = {
  safe: {
    featherCount: 58,
    sparkCount: 10,
    dpr: 1,
    barbDetail: 0.42,
    spriteScale: 0.9,
    maxPixelArea: 2_800_000,
  },

  balanced: {
    featherCount: 92,
    sparkCount: 16,
    dpr: 1.15,
    barbDetail: 0.58,
    spriteScale: 1,
    maxPixelArea: 4_500_000,
  },

  high: {
    featherCount: 135,
    sparkCount: 24,
    dpr: 1.35,
    barbDetail: 0.76,
    spriteScale: 1.08,
    maxPixelArea: 7_500_000,
  },

  ultra: {
    featherCount: 175,
    sparkCount: 32,
    dpr: 1.55,
    barbDetail: 0.92,
    spriteScale: 1.15,
    maxPixelArea: 11_000_000,
  },
};

const INTRO_HOLD = 900;
const INTRO_EXIT_START = 3200;
const INTRO_COMPLETE = 3900;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

function easeInOutCubic(t: number) {
  t = clamp(t, 0, 1);

  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothStep(t: number) {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
}

function getNetworkScore() {
  if (typeof navigator === "undefined") {
    return 1;
  }

  const connection = (
    navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        downlink?: number;
        saveData?: boolean;
      };
    }
  ).connection;

  if (!connection) {
    return 1;
  }

  if (connection.saveData) {
    return 0;
  }

  const effectiveType = connection.effectiveType;

  if (effectiveType === "slow-2g") {
    return 0;
  }

  if (effectiveType === "2g") {
    return 0.25;
  }

  if (effectiveType === "3g") {
    return 0.65;
  }

  if (
    typeof connection.downlink === "number" &&
    connection.downlink < 1
  ) {
    return 0.45;
  }

  return 1;
}

function detectQuality(): QualityName {
  if (typeof window === "undefined") {
    return "balanced";
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const area = width * height;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    connection?: {
      saveData?: boolean;
      effectiveType?: string;
    };
  };

  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const network = getNetworkScore();

  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  const isSmallScreen =
    Math.min(width, height) <= 600;

  const isTablet =
    Math.min(width, height) > 600 &&
    Math.min(width, height) <= 1024;

  if (
    nav.connection?.saveData ||
    network <= 0.25 ||
    cores <= 2 ||
    memory <= 2
  ) {
    return "safe";
  }

  if (isSmallScreen) {
    if (cores >= 8 && memory >= 8 && network >= 0.65) {
      return "balanced";
    }

    return "safe";
  }

  if (isTablet || isTouch) {
    if (cores >= 8 && memory >= 8 && network >= 0.65) {
      return "high";
    }

    return "balanced";
  }

  if (
    area >= 2_000_000 &&
    cores >= 8 &&
    memory >= 8 &&
    network >= 0.65
  ) {
    return "ultra";
  }

  if (cores >= 6 && memory >= 4) {
    return "high";
  }

  return "balanced";
}

function createFeather(
  index: number,
  count: number,
  width: number,
  height: number,
): Feather {
  const center = Math.min(width, height) * 0.5;

  const band = index % 5;

  const normalized = index / Math.max(1, count - 1);

  const layer =
    band === 0
      ? 0
      : band === 1
        ? 1
        : band === 2
          ? 2
          : band === 3
            ? 3
            : 4;

  const depth =
    0.35 +
    Math.random() * 0.65;

  const radiusBase =
    center *
    (0.62 + normalized * 0.72) *
    (0.85 + Math.random() * 0.3);

  const angle =
    normalized * Math.PI * 13.5 +
    band * 0.42 +
    (Math.random() - 0.5) * 0.5;

  const size =
    (0.58 + depth * 0.8) *
    (0.78 + Math.random() * 0.42);

  const colors = [
    "#e8ecec",
    "#c8ced0",
    "#9ba3a7",
    "#6f777b",
    "#3d4549",
    "#20272b",
    "#d6d8d3",
    "#6e8587",
    "#3c7779",
    "#9d8b68",
  ];

  const color =
    colors[Math.floor(Math.random() * colors.length)];

  return {
    angle,
    radius: radiusBase,
    radiusBase,

    size,

    length:
      (26 + Math.random() * 48) *
      size,

    width:
      (8 + Math.random() * 13) *
      size,

    speed:
      (0.045 + Math.random() * 0.055) *
      (0.7 + depth * 0.6),

    orbit:
      (0.00014 + Math.random() * 0.00024) *
      (layer % 2 === 0 ? 1 : -1),

    twist:
      (Math.random() - 0.5) * 0.8,

    phase:
      Math.random() * Math.PI * 2,

    depth,

    layer,

    color,

    alpha:
      0.28 +
      depth * 0.58,

    curve:
      (Math.random() - 0.5) * 0.6,

    flutter:
      0.4 + Math.random() * 1.1,

    spriteIndex:
      Math.floor(Math.random() * 8),
  };
}

function createSpark(
  width: number,
  height: number,
): Spark {
  const center = Math.min(width, height) * 0.5;

  return {
    angle:
      Math.random() * Math.PI * 2,

    radius:
      center *
      (0.2 + Math.random() * 1.25),

    speed:
      0.00012 +
      Math.random() * 0.00028,

    size:
      0.5 +
      Math.random() * 1.8,

    alpha:
      0.25 +
      Math.random() * 0.65,

    phase:
      Math.random() * Math.PI * 2,
  };
}

function drawFeatherSprite(
  canvas: HTMLCanvasElement,
  color: string,
  detail: number,
  scale: number,
) {
  const size = 128 * scale;

  canvas.width = Math.ceil(size);
  canvas.height = Math.ceil(size);

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, size, size);

  const cx = size * 0.5;
  const cy = size * 0.5;

  const length = size * 0.82;
  const width = size * 0.19;

  ctx.save();

  ctx.translate(cx, cy);

  const bodyGradient = ctx.createLinearGradient(
    -length * 0.45,
    0,
    length * 0.45,
    0,
  );

  bodyGradient.addColorStop(0, "rgba(255,255,255,0)");
  bodyGradient.addColorStop(0.12, color);
  bodyGradient.addColorStop(0.55, color);
  bodyGradient.addColorStop(0.82, "rgba(255,255,255,0.58)");
  bodyGradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = bodyGradient;

  ctx.beginPath();

  ctx.moveTo(-length * 0.48, 0);

  ctx.bezierCurveTo(
    -length * 0.16,
    -width,
    length * 0.16,
    -width * 0.86,
    length * 0.48,
    0,
  );

  ctx.bezierCurveTo(
    length * 0.17,
    width * 0.78,
    -length * 0.18,
    width,
    -length * 0.48,
    0,
  );

  ctx.closePath();

  ctx.globalAlpha = 0.76;

  ctx.fill();

  ctx.globalAlpha = 1;

  const rachisGradient = ctx.createLinearGradient(
    -length * 0.48,
    0,
    length * 0.48,
    0,
  );

  rachisGradient.addColorStop(0, "rgba(255,255,255,0)");
  rachisGradient.addColorStop(0.2, "rgba(235,242,241,0.65)");
  rachisGradient.addColorStop(0.55, "rgba(255,255,255,0.9)");
  rachisGradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.strokeStyle = rachisGradient;
  ctx.lineWidth = Math.max(0.7, size * 0.011);

  ctx.beginPath();

  ctx.moveTo(-length * 0.48, 0);
  ctx.quadraticCurveTo(
    0,
    -size * 0.015,
    length * 0.48,
    0,
  );

  ctx.stroke();

  const barbCount = Math.floor(
    7 + detail * 15,
  );

  for (let i = 0; i < barbCount; i++) {
    const p = i / Math.max(1, barbCount - 1);

    const x =
      lerp(
        -length * 0.34,
        length * 0.38,
        p,
      );

    const taper =
      Math.sin(p * Math.PI);

    const barbLength =
      width *
      (0.42 + taper * 0.55);

    const side =
      i % 2 === 0 ? -1 : 1;

    const curve =
      barbLength * 0.25;

    ctx.strokeStyle =
      side < 0
        ? "rgba(255,255,255,0.22)"
        : "rgba(0,0,0,0.22)";

    ctx.lineWidth =
      Math.max(0.45, size * 0.006);

    ctx.beginPath();

    ctx.moveTo(x, 0);

    ctx.quadraticCurveTo(
      x + curve,
      side * barbLength * 0.65,
      x + barbLength * 0.18,
      side * barbLength,
    );

    ctx.stroke();
  }

  ctx.restore();
}

function buildSprites(
  detail: number,
  scale: number,
): Sprite[] {
  const sprites: Sprite[] = [];

  const colors = [
    "#e8ecec",
    "#c8ced0",
    "#9ba3a7",
    "#697276",
    "#3d4549",
    "#242b2f",
    "#6f8889",
    "#a79672",
  ];

  for (let i = 0; i < colors.length; i++) {
    const canvas = document.createElement("canvas");

    drawFeatherSprite(
      canvas,
      colors[i],
      detail,
      scale,
    );

    sprites.push({
      canvas,
      width: canvas.width,
      height: canvas.height,
    });
  }

  return sprites;
}

export default function FenixIntro({
  onComplete,
}: FenixIntroProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const frameRef =
    useRef<number | null>(null);

  const completeRef =
    useRef(false);

  const qualityRef =
    useRef<QualityName>("balanced");

  const [stage, setStage] =
    useState<Stage>("enter");

  const [logoVisible, setLogoVisible] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    /*
     * IMPORTANT:
     * Keep this stable non-null alias.
     * This prevents the TypeScript:
     * "canvas is possibly null"
     * error inside nested functions.
     */
    const canvas = canvasElement;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) {
      return;
    }

    let destroyed = false;

    let width = 1;
    let height = 1;

    let dpr = 1;

    let centerX = 0;
    let centerY = 0;

    let sceneRadius = 0;

    let quality: QualityName =
      detectQuality();

    qualityRef.current = quality;

    let config =
      QUALITY_CONFIG[quality];

    let feathers: Feather[] = [];
    let sparks: Spark[] = [];

    let sprites: Sprite[] = [];

    let lastTime = performance.now();

    let elapsed = 0;

    let slowFrames = 0;
    let fastFrames = 0;

    let lastQualityChange = 0;

    const resize = () => {
      if (destroyed) {
        return;
      }

      const rect =
        canvas.getBoundingClientRect();

      width =
        Math.max(
          1,
          Math.floor(rect.width),
        );

      height =
        Math.max(
          1,
          Math.floor(rect.height),
        );

      centerX =
        width * 0.5;

      centerY =
        height * 0.5;

      sceneRadius =
        Math.min(width, height) * 0.5;

      const pixelArea =
        width * height;

      let targetDpr =
        config.dpr;

      const nativeDpr =
        window.devicePixelRatio || 1;

      targetDpr =
        Math.min(
          nativeDpr,
          targetDpr,
        );

      if (
        pixelArea >
        config.maxPixelArea
      ) {
        targetDpr *= 0.9;
      }

      /*
       * Keep iOS / mobile canvas memory
       * under control.
       */
      if (
        width <= 600 ||
        height <= 600
      ) {
        targetDpr =
          Math.min(
            targetDpr,
            1.35,
          );
      }

      dpr =
        Math.max(
          1,
          targetDpr,
        );

      canvas.width =
        Math.max(
          1,
          Math.floor(width * dpr),
        );

      canvas.height =
        Math.max(
          1,
          Math.floor(height * dpr),
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
    };

    const rebuildScene = () => {
      if (destroyed) {
        return;
      }

      config =
        QUALITY_CONFIG[quality];

      sprites = buildSprites(
        config.barbDetail,
        config.spriteScale,
      );

      feathers = [];

      for (
        let i = 0;
        i < config.featherCount;
        i++
      ) {
        feathers.push(
          createFeather(
            i,
            config.featherCount,
            width,
            height,
          ),
        );
      }

      /*
       * Stable depth ordering.
       * We sort only when scene is rebuilt,
       * never every animation frame.
       */
      feathers.sort(
        (a, b) =>
          a.depth - b.depth,
      );

      sparks = [];

      for (
        let i = 0;
        i < config.sparkCount;
        i++
      ) {
        sparks.push(
          createSpark(
            width,
            height,
          ),
        );
      }
    };

    const setQuality =
      (next: QualityName) => {
        if (
          destroyed ||
          next === quality
        ) {
          return;
        }

        quality = next;

        qualityRef.current =
          next;

        slowFrames = 0;
        fastFrames = 0;

        lastQualityChange =
          performance.now();

        rebuildScene();
      };

    const adaptQuality =
      (frameTime: number) => {
        if (
          elapsed -
            lastQualityChange <
          900
        ) {
          return;
        }

        if (frameTime > 27) {
          slowFrames++;
          fastFrames = 0;
        } else if (frameTime < 17) {
          fastFrames++;
          slowFrames = 0;
        } else {
          slowFrames = 0;
          fastFrames = 0;
        }

        const index =
          QUALITY_ORDER.indexOf(
            quality,
          );

        if (
          slowFrames >= 2 &&
          index > 0
        ) {
          setQuality(
            QUALITY_ORDER[
              index - 1
            ],
          );

          return;
        }

        if (
          fastFrames >= 8 &&
          index <
            QUALITY_ORDER.length - 1
        ) {
          setQuality(
            QUALITY_ORDER[
              index + 1
            ],
          );
        }
      };

    const drawBackground = (
      time: number,
      introProgress: number,
    ) => {
      ctx.clearRect(
        0,
        0,
        width,
        height,
      );

      const base =
        ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          sceneRadius * 1.55,
        );

      base.addColorStop(
        0,
        "#101719",
      );

      base.addColorStop(
        0.22,
        "#081011",
      );

      base.addColorStop(
        0.58,
        "#040809",
      );

      base.addColorStop(
        1,
        "#010203",
      );

      ctx.fillStyle = base;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );

      const glow =
        ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          sceneRadius * 0.7,
        );

      const pulse =
        0.5 +
        Math.sin(time * 0.0007) *
          0.08;

      glow.addColorStop(
        0,
        `rgba(0,128,128,${
          0.13 * pulse
        })`,
      );

      glow.addColorStop(
        0.34,
        "rgba(0,86,88,0.065)",
      );

      glow.addColorStop(
        0.72,
        "rgba(0,0,0,0)",
      );

      ctx.fillStyle = glow;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );

      /*
       * Very subtle cinematic gold
       * atmospheric light.
       */
      const gold =
        ctx.createRadialGradient(
          centerX +
            Math.cos(time * 0.00016) *
              sceneRadius *
              0.35,
          centerY +
            Math.sin(time * 0.00019) *
              sceneRadius *
              0.22,
          0,
          centerX,
          centerY,
          sceneRadius,
        );

      gold.addColorStop(
        0,
        "rgba(170,125,64,0.025)",
      );

      gold.addColorStop(
        0.55,
        "rgba(120,90,48,0.01)",
      );

      gold.addColorStop(
        1,
        "rgba(0,0,0,0)",
      );

      ctx.fillStyle = gold;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );

      if (introProgress > 0) {
        ctx.globalAlpha =
          0.08 *
          (1 - introProgress);

        ctx.fillStyle =
          "#ffffff";

        ctx.fillRect(
          0,
          0,
          width,
          height,
        );

        ctx.globalAlpha = 1;
      }
    };

    const drawCore =
      (
        time: number,
        opacity: number,
      ) => {
        const corePulse =
          1 +
          Math.sin(
            time * 0.0021,
          ) *
            0.035;

        const radius =
          sceneRadius *
          0.145 *
          corePulse;

        const core =
          ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            radius * 1.9,
          );

        core.addColorStop(
          0,
          `rgba(240,248,246,${
            0.13 * opacity
          })`,
        );

        core.addColorStop(
          0.12,
          `rgba(0,160,160,${
            0.15 * opacity
          })`,
        );

        core.addColorStop(
          0.35,
          `rgba(0,128,128,${
            0.08 * opacity
          })`,
        );

        core.addColorStop(
          0.7,
          "rgba(0,0,0,0)",
        );

        ctx.fillStyle = core;

        ctx.beginPath();

        ctx.arc(
          centerX,
          centerY,
          radius * 1.9,
          0,
          Math.PI * 2,
        );

        ctx.fill();

        /*
         * Fine inner optical ring.
         */
        ctx.strokeStyle =
          `rgba(180,225,223,${
            0.08 * opacity
          })`;

        ctx.lineWidth = 0.7;

        ctx.beginPath();

        ctx.arc(
          centerX,
          centerY,
          radius * 0.75,
          0,
          Math.PI * 2,
        );

        ctx.stroke();
      };

    const drawFeather =
      (
        feather: Feather,
        time: number,
        opacity: number,
      ) => {
        const sprite =
          sprites[
            feather.spriteIndex %
              sprites.length
          ];

        if (!sprite) {
          return;
        }

        const orbitAngle =
          feather.angle +
          time *
            feather.orbit;

        const flutter =
          Math.sin(
            time * 0.0017 *
              feather.flutter +
              feather.phase,
          ) *
          feather.flutter;

        /*
         * Spiral compression toward center.
         * This creates the vortex structure.
         */
        const breathing =
          Math.sin(
            time * 0.00065 +
              feather.phase,
          ) *
          sceneRadius *
          0.012;

        const radius =
          feather.radiusBase +
          breathing +
          flutter *
            sceneRadius *
            0.006;

        const x =
          centerX +
          Math.cos(
            orbitAngle,
          ) *
            radius;

        const y =
          centerY +
          Math.sin(
            orbitAngle,
          ) *
            radius *
            0.82;

        const tangent =
          orbitAngle +
          Math.PI * 0.5 +
          feather.twist +
          Math.sin(
            time * 0.001 +
              feather.phase,
          ) *
            0.08;

        const perspective =
          0.58 +
          feather.depth * 0.62;

        const size =
          feather.size *
          perspective;

        const fadeByDistance =
          clamp(
            1 -
              Math.abs(
                radius -
                  sceneRadius *
                    0.66,
              ) /
                (sceneRadius *
                  1.15),
            0.28,
            1,
          );

        const finalAlpha =
          feather.alpha *
          fadeByDistance *
          opacity;

        ctx.save();

        ctx.translate(
          Math.round(x),
          Math.round(y),
        );

        ctx.rotate(tangent);

        const scale =
          size *
          0.78;

        ctx.globalAlpha =
          clamp(
            finalAlpha,
            0,
            0.95,
          );

        /*
         * No per-frame shadowBlur/filter.
         * Feather detail is already baked
         * into the sprite.
         */
        ctx.globalCompositeOperation =
          feather.layer >= 3
            ? "screen"
            : "source-over";

        ctx.drawImage(
          sprite.canvas,
          -sprite.width *
            0.5 *
            scale /
            config.spriteScale,
          -sprite.height *
            0.5 *
            scale /
            config.spriteScale,
          sprite.width *
            scale /
            config.spriteScale,
          sprite.height *
            scale /
            config.spriteScale,
        );

        ctx.restore();
      };

    const drawSparks =
      (
        time: number,
        opacity: number,
      ) => {
        ctx.save();

        ctx.globalCompositeOperation =
          "screen";

        for (const spark of sparks) {
          const angle =
            spark.angle +
            time *
              spark.speed;

          const pulse =
            0.65 +
            Math.sin(
              time * 0.003 +
                spark.phase,
            ) *
              0.35;

          const radius =
            spark.radius *
            (0.94 +
              Math.sin(
                time * 0.0008 +
                  spark.phase,
              ) *
                0.04);

          const x =
            centerX +
            Math.cos(angle) *
              radius;

          const y =
            centerY +
            Math.sin(angle) *
              radius *
              0.82;

          ctx.globalAlpha =
            spark.alpha *
            pulse *
            opacity;

          ctx.fillStyle =
            spark.phase % 2 >
            1
              ? "#d9f4f2"
              : "#d4b879";

          ctx.beginPath();

          ctx.arc(
            x,
            y,
            spark.size,
            0,
            Math.PI * 2,
          );

          ctx.fill();
        }

        ctx.restore();
      };

    const drawVignette =
      (opacity: number) => {
        const vignette =
          ctx.createRadialGradient(
            centerX,
            centerY,
            sceneRadius * 0.18,
            centerX,
            centerY,
            sceneRadius * 1.08,
          );

        vignette.addColorStop(
          0,
          "rgba(0,0,0,0)",
        );

        vignette.addColorStop(
          0.54,
          "rgba(0,0,0,0.06)",
        );

        vignette.addColorStop(
          0.82,
          `rgba(0,0,0,${
            0.4 * opacity
          })`,
        );

        vignette.addColorStop(
          1,
          `rgba(0,0,0,${
            0.9 * opacity
          })`,
        );

        ctx.fillStyle =
          vignette;

        ctx.fillRect(
          0,
          0,
          width,
          height,
        );
      };

    const drawGrain =
      (
        time: number,
        opacity: number,
      ) => {
        /*
         * Very cheap procedural grain:
         * tiny sparse points rather than
         * expensive image filtering.
         */
        if (quality === "safe") {
          return;
        }

        const amount =
          quality === "ultra"
            ? 95
            : quality === "high"
              ? 65
              : 38;

        ctx.save();

        ctx.globalAlpha =
          0.018 * opacity;

        ctx.fillStyle =
          "#ffffff";

        for (
          let i = 0;
          i < amount;
          i++
        ) {
          const x =
            Math.abs(
              Math.sin(
                i * 91.17 +
                  time * 0.00008,
              ),
            ) * width;

          const y =
            Math.abs(
              Math.sin(
                i * 47.31 +
                  time * 0.00006,
              ),
            ) * height;

          ctx.fillRect(
            Math.floor(x),
            Math.floor(y),
            1,
            1,
          );
        }

        ctx.restore();
      };

    const render =
      (
        now: number,
      ) => {
        if (destroyed) {
          return;
        }

        const frameTime =
          Math.min(
            50,
            now - lastTime,
          );

        lastTime = now;

        elapsed += frameTime;

        adaptQuality(
          frameTime,
        );

        let introOpacity = 1;

        if (
          elapsed <
          INTRO_HOLD
        ) {
          introOpacity =
            easeOutCubic(
              elapsed /
                INTRO_HOLD,
            );
        }

        let exitOpacity = 1;

        if (
          elapsed >=
          INTRO_EXIT_START
        ) {
          exitOpacity =
            1 -
            easeInOutCubic(
              (elapsed -
                INTRO_EXIT_START) /
                (INTRO_COMPLETE -
                  INTRO_EXIT_START),
            );
        }

        if (
          elapsed >=
          INTRO_EXIT_START
        ) {
          if (stage !== "exit") {
            setStage("exit");
          }

          setLogoVisible(false);
        } else if (
          elapsed >=
          INTRO_HOLD
        ) {
          if (stage !== "hold") {
            setStage("hold");
          }
        }

        const visualOpacity =
          clamp(
            introOpacity *
              exitOpacity,
            0,
            1,
          );

        drawBackground(
          now,
          visualOpacity,
        );

        /*
         * Depth-layered feather field.
         */
        for (
          let i = 0;
          i < feathers.length;
          i++
        ) {
          drawFeather(
            feathers[i],
            elapsed,
            visualOpacity,
          );
        }

        drawCore(
          elapsed,
          visualOpacity,
        );

        drawSparks(
          elapsed,
          visualOpacity,
        );

        drawVignette(
          visualOpacity,
        );

        drawGrain(
          elapsed,
          visualOpacity,
        );

        if (
          elapsed >=
          INTRO_COMPLETE
        ) {
          if (!completeRef.current) {
            completeRef.current = true;

            if (
              frameRef.current !==
              null
            ) {
              cancelAnimationFrame(
                frameRef.current,
              );

              frameRef.current = null;
            }

            /*
             * Stop all expensive rendering
             * before navigation.
             */
            ctx.clearRect(
              0,
              0,
              width,
              height,
            );

            setLoading(false);

            onComplete();

            return;
          }
        }

        frameRef.current =
          requestAnimationFrame(
            render,
          );
      };

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "hidden"
        ) {
          if (
            frameRef.current !==
            null
          ) {
            cancelAnimationFrame(
              frameRef.current,
            );

            frameRef.current = null;
          }

          return;
        }

        if (
          !destroyed &&
          !completeRef.current &&
          frameRef.current ===
            null
        ) {
          lastTime =
            performance.now();

          frameRef.current =
            requestAnimationFrame(
              render,
            );
        }
      };

    const handleResize =
      () => {
        resize();
      };

    resize();

    document.addEventListener(
      "visibilitychange",
      handleVisibility,
    );

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "orientationchange",
      handleResize,
      {
        passive: true,
      },
    );

    frameRef.current =
      requestAnimationFrame(
        render,
      );

    return () => {
      destroyed = true;

      if (
        frameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          frameRef.current,
        );

        frameRef.current = null;
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      window.removeEventListener(
        "orientationchange",
        handleResize,
      );

      /*
       * Release canvas memory.
       */
      canvas.width = 1;
      canvas.height = 1;

      feathers = [];
      sparks = [];
      sprites = [];
    };
  }, [onComplete, stage]);

  return (
    <main
      aria-label="FeniX introduction"
      className="fixed inset-0 z-[999999] h-[100dvh] w-full overflow-hidden bg-[#030506]"
      style={{
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full"
      />

      {/* Cinematic atmospheric layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,128,128,0.055) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Central focus */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width: "min(34vw, 340px)",
          height: "min(34vw, 340px)",
          minWidth: 180,
          minHeight: 180,
          transform:
            "translate(-50%, -50%)",
          borderRadius: "50%",
          border:
            "1px solid rgba(0,128,128,0.14)",
          boxShadow:
            "0 0 55px rgba(0,128,128,0.08), inset 0 0 45px rgba(0,0,0,0.55)",
          opacity:
            stage === "exit"
              ? 0
              : 1,
          transition:
            "opacity 650ms ease",
        }}
      />

      {/* FX rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width: "min(20vw, 210px)",
          height: "min(20vw, 210px)",
          minWidth: 115,
          minHeight: 115,
          transform:
            "translate(-50%, -50%)",
          borderRadius: "50%",
          border:
            "1px solid rgba(0,128,128,0.2)",
          boxShadow:
            "0 0 28px rgba(0,128,128,0.07)",
          opacity:
            stage === "exit"
              ? 0
              : 0.9,
          transition:
            "opacity 500ms ease",
        }}
      />

      {/* Logo */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center"
        style={{
          opacity: logoVisible ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${
            logoVisible ? 1 : 0.82
          })`,
          transition:
            "opacity 650ms cubic-bezier(.22,.61,.36,1), transform 800ms cubic-bezier(.22,.61,.36,1)",
        }}
      >
        {/* FX symbol */}
        <div
          aria-hidden="true"
          style={{
            width:
              "clamp(76px, 11vw, 142px)",
            height:
              "clamp(76px, 11vw, 142px)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border:
              "1px solid rgba(214,225,223,0.28)",
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.36) 58%, rgba(0,128,128,0.08))",
            boxShadow:
              "0 0 35px rgba(0,128,128,0.12), inset 0 0 24px rgba(255,255,255,0.035)",
            backdropFilter:
              "blur(3px)",
          }}
        >
          <span
            style={{
              fontFamily:
                "Arial, Helvetica, sans-serif",
              fontSize:
                "clamp(28px, 4vw, 52px)",
              fontWeight: 800,
              letterSpacing:
                "-0.09em",
              color: "#eef4f3",
              textShadow:
                "0 0 18px rgba(190,240,235,0.18)",
              transform:
                "translateX(-2px)",
            }}
          >
            FX
          </span>
        </div>

        {/* FeniX */}
        <div
          style={{
            marginTop:
              "clamp(14px, 2vw, 24px)",
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize:
              "clamp(27px, 4.5vw, 58px)",
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing:
              "0.18em",
            color: "#f1f4f3",
            textTransform:
              "none",
            textShadow:
              "0 0 24px rgba(255,255,255,0.1)",
          }}
        >
          FeniX
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop:
              "clamp(9px, 1.2vw, 15px)",
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize:
              "clamp(8px, 1.15vw, 13px)",
            letterSpacing:
              "0.24em",
            color:
              "rgba(196,211,210,0.72)",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          FEARLESS ENERGY NAVIGATES INFINITE X-FACTORS
        </div>
      </div>

      {/* Loading indicator */}
      <div
        className="pointer-events-none absolute left-1/2 bottom-[9vh] -translate-x-1/2"
        style={{
          width:
            "min(220px, 58vw)",
          opacity:
            loading &&
            stage !== "exit"
              ? 1
              : 0,
          transition:
            "opacity 500ms ease",
        }}
      >
        <div
          style={{
            height: 1,
            width: "100%",
            background:
              "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "42%",
              background:
                "linear-gradient(90deg, transparent, #008080, #d4b879, transparent)",
              animation:
                "fenixIntroLoading 1.45s ease-in-out infinite",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 9,
            textAlign: "center",
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize: 9,
            letterSpacing:
              "0.3em",
            color:
              "rgba(194,207,206,0.5)",
          }}
        >
          INITIALIZING
        </div>
      </div>

      {/* Final fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "#000",
          opacity:
            stage === "exit"
              ? 1
              : 0,
          transition:
            "opacity 700ms ease",
        }}
      />

      <style jsx>{`
        @keyframes fenixIntroLoading {
          0% {
            transform: translateX(-130%);
          }

          50% {
            transform: translateX(110%);
          }

          100% {
            transform: translateX(280%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}
