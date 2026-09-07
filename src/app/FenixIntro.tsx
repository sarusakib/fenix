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
  radiusBase: number;
  size: number;
  speed: number;
  orbit: number;
  twist: number;
  phase: number;
  depth: number;
  layer: number;
  alpha: number;
  flutter: number;
  spriteIndex: number;
  drift: number;
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
    sparkCount: 8,
    dpr: 1,
    barbDetail: 0.42,
    spriteScale: 0.9,
    maxPixelArea: 2_800_000,
  },

  balanced: {
    featherCount: 92,
    sparkCount: 14,
    dpr: 1.15,
    barbDetail: 0.58,
    spriteScale: 1,
    maxPixelArea: 4_500_000,
  },

  high: {
    featherCount: 135,
    sparkCount: 22,
    dpr: 1.35,
    barbDetail: 0.76,
    spriteScale: 1.08,
    maxPixelArea: 7_500_000,
  },

  ultra: {
    featherCount: 175,
    sparkCount: 30,
    dpr: 1.55,
    barbDetail: 0.92,
    spriteScale: 1.15,
    maxPixelArea: 11_000_000,
  },
};

/*
|--------------------------------------------------------------------------
| TIMING
|--------------------------------------------------------------------------
|
| 0ms       → intro begins
| 0–900ms   → feather vortex establishes
| 900–3200  → main cinematic hold
| 3200–3900 → logo / scene exits
| 3900ms    → Login navigation
|
*/

const INTRO_HOLD = 900;
const INTRO_EXIT_START = 3200;
const INTRO_COMPLETE = 3900;

const TAU = Math.PI * 2;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  t = clamp(t, 0, 1);
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number) {
  t = clamp(t, 0, 1);
  return t * t * t;
}

function easeInOutCubic(t: number) {
  t = clamp(t, 0, 1);

  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getNetworkScore() {
  if (typeof navigator === "undefined") {
    return 1;
  }

  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      saveData?: boolean;
    };
  };

  const connection = nav.connection;

  if (!connection) {
    return 1;
  }

  if (connection.saveData) {
    return 0;
  }

  if (connection.effectiveType === "slow-2g") {
    return 0;
  }

  if (connection.effectiveType === "2g") {
    return 0.25;
  }

  if (connection.effectiveType === "3g") {
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

  const smallestSide = Math.min(width, height);

  const isSmallScreen = smallestSide <= 600;

  const isTablet =
    smallestSide > 600 &&
    smallestSide <= 1024;

  if (
    nav.connection?.saveData ||
    network <= 0.25 ||
    cores <= 2 ||
    memory <= 2
  ) {
    return "safe";
  }

  if (isSmallScreen) {
    if (
      cores >= 8 &&
      memory >= 8 &&
      network >= 0.65
    ) {
      return "balanced";
    }

    return "safe";
  }

  if (isTablet || isTouch) {
    if (
      cores >= 8 &&
      memory >= 8 &&
      network >= 0.65
    ) {
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

  if (
    cores >= 6 &&
    memory >= 4
  ) {
    return "high";
  }

  return "balanced";
}

/*
|--------------------------------------------------------------------------
| Feather creation
|--------------------------------------------------------------------------
*/

function createFeather(
  index: number,
  count: number,
  width: number,
  height: number,
): Feather {
  const sceneRadius =
    Math.min(width, height) * 0.5;

  const normalized =
    index / Math.max(1, count - 1);

  /*
   * Multiple spiral bands create the
   * dense vortex appearance.
   */
  const band = index % 7;

  const layer =
    band <= 1
      ? 0
      : band <= 3
        ? 1
        : band <= 5
          ? 2
          : 3;

  const depth =
    0.18 +
    Math.pow(Math.random(), 0.7) * 0.82;

  /*
   * Large radius spread creates the
   * circular feather field.
   */
  const radiusBase =
    sceneRadius *
    (
      0.42 +
      normalized * 0.92 +
      (Math.random() - 0.5) * 0.18
    );

  /*
   * Long spiral progression.
   */
  const angle =
    normalized *
      TAU *
      6.7 +
    band * 0.72 +
    (Math.random() - 0.5) * 0.42;

  const size =
    (
      0.58 +
      depth * 0.78
    ) *
    (
      0.82 +
      Math.random() * 0.38
    );

  return {
    angle,

    radiusBase,

    size,

    speed:
      0.000028 +
      Math.random() * 0.000038,

    orbit:
      (
        0.000065 +
        Math.random() * 0.00011
      ) *
      (layer % 2 === 0 ? 1 : -1),

    twist:
      (
        Math.random() - 0.5
      ) *
      0.58,

    phase:
      Math.random() * TAU,

    depth,

    layer,

    alpha:
      0.22 +
      depth * 0.58,

    flutter:
      0.45 +
      Math.random() * 1.1,

    spriteIndex:
      Math.floor(
        Math.random() * 8,
      ),

    drift:
      (
        Math.random() - 0.5
      ) *
      0.0012,
  };
}

/*
|--------------------------------------------------------------------------
| Spark creation
|--------------------------------------------------------------------------
*/

function createSpark(
  width: number,
  height: number,
): Spark {
  const sceneRadius =
    Math.min(width, height) * 0.5;

  return {
    angle:
      Math.random() * TAU,

    radius:
      sceneRadius *
      (
        0.16 +
        Math.random() * 1.28
      ),

    speed:
      0.000055 +
      Math.random() * 0.00012,

    size:
      0.45 +
      Math.random() * 1.55,

    alpha:
      0.18 +
      Math.random() * 0.55,

    phase:
      Math.random() * TAU,
  };
}

/*
|--------------------------------------------------------------------------
| Feather sprite renderer
|--------------------------------------------------------------------------
|
| The detailed feather is rendered once into an offscreen canvas.
| The main animation then uses drawImage().
|
*/

function drawFeatherSprite(
  canvas: HTMLCanvasElement,
  color: string,
  detail: number,
  scale: number,
) {
  const size =
    Math.ceil(144 * scale);

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  ctx.clearRect(
    0,
    0,
    size,
    size,
  );

  const cx = size * 0.5;
  const cy = size * 0.5;

  const length =
    size * 0.86;

  const width =
    size * 0.22;

  ctx.save();

  ctx.translate(cx, cy);

  /*
   * Soft atmospheric body.
   */
  const bodyGradient =
    ctx.createLinearGradient(
      -length * 0.5,
      0,
      length * 0.5,
      0,
    );

  bodyGradient.addColorStop(
    0,
    "rgba(255,255,255,0)",
  );

  bodyGradient.addColorStop(
    0.10,
    color,
  );

  bodyGradient.addColorStop(
    0.48,
    color,
  );

  bodyGradient.addColorStop(
    0.76,
    "rgba(235,242,241,0.75)",
  );

  bodyGradient.addColorStop(
    0.92,
    "rgba(255,255,255,0.16)",
  );

  bodyGradient.addColorStop(
    1,
    "rgba(255,255,255,0)",
  );

  ctx.fillStyle =
    bodyGradient;

  ctx.globalAlpha = 0.72;

  /*
   * Curved feather body.
   */
  ctx.beginPath();

  ctx.moveTo(
    -length * 0.48,
    0,
  );

  ctx.bezierCurveTo(
    -length * 0.24,
    -width * 0.92,
    length * 0.13,
    -width * 0.96,
    length * 0.48,
    0,
  );

  ctx.bezierCurveTo(
    length * 0.18,
    width * 0.76,
    -length * 0.20,
    width * 0.94,
    -length * 0.48,
    0,
  );

  ctx.closePath();

  ctx.fill();

  ctx.globalAlpha = 1;

  /*
   * Dark underside.
   */
  const underside =
    ctx.createLinearGradient(
      -length * 0.2,
      0,
      length * 0.46,
      0,
    );

  underside.addColorStop(
    0,
    "rgba(0,0,0,0)",
  );

  underside.addColorStop(
    0.5,
    "rgba(0,0,0,0.18)",
  );

  underside.addColorStop(
    1,
    "rgba(0,0,0,0.42)",
  );

  ctx.fillStyle =
    underside;

  ctx.beginPath();

  ctx.moveTo(
    -length * 0.42,
    0,
  );

  ctx.bezierCurveTo(
    -length * 0.05,
    width * 0.12,
    length * 0.24,
    width * 0.4,
    length * 0.47,
    0,
  );

  ctx.bezierCurveTo(
    length * 0.18,
    width * 0.72,
    -length * 0.18,
    width * 0.72,
    -length * 0.42,
    0,
  );

  ctx.closePath();

  ctx.fill();

  /*
   * Central rachis.
   */
  const rachis =
    ctx.createLinearGradient(
      -length * 0.48,
      0,
      length * 0.48,
      0,
    );

  rachis.addColorStop(
    0,
    "rgba(255,255,255,0)",
  );

  rachis.addColorStop(
    0.16,
    "rgba(215,230,228,0.48)",
  );

  rachis.addColorStop(
    0.50,
    "rgba(255,255,255,0.9)",
  );

  rachis.addColorStop(
    0.80,
    "rgba(220,235,233,0.42)",
  );

  rachis.addColorStop(
    1,
    "rgba(255,255,255,0)",
  );

  ctx.strokeStyle =
    rachis;

  ctx.lineWidth =
    Math.max(
      0.7,
      size * 0.010,
    );

  ctx.beginPath();

  ctx.moveTo(
    -length * 0.48,
    0,
  );

  ctx.quadraticCurveTo(
    0,
    -size * 0.012,
    length * 0.48,
    0,
  );

  ctx.stroke();

  /*
   * Individual barbs.
   */
  const barbCount =
    Math.floor(
      8 + detail * 18,
    );

  for (
    let i = 0;
    i < barbCount;
    i++
  ) {
    const p =
      i /
      Math.max(
        1,
        barbCount - 1,
      );

    const x =
      lerp(
        -length * 0.35,
        length * 0.40,
        p,
      );

    const taper =
      Math.sin(
        p * Math.PI,
      );

    const barbLength =
      width *
      (
        0.34 +
        taper * 0.62
      );

    const side =
      i % 2 === 0
        ? -1
        : 1;

    const curve =
      barbLength * 0.26;

    ctx.strokeStyle =
      side < 0
        ? "rgba(255,255,255,0.25)"
        : "rgba(0,0,0,0.20)";

    ctx.lineWidth =
      Math.max(
        0.4,
        size * 0.0055,
      );

    ctx.beginPath();

    ctx.moveTo(
      x,
      0,
    );

    ctx.quadraticCurveTo(
      x + curve,
      side *
        barbLength *
        0.62,
      x +
        barbLength *
          0.17,
      side *
        barbLength,
    );

    ctx.stroke();
  }

  /*
   * Fine highlight along the upper edge.
   */
  const highlight =
    ctx.createLinearGradient(
      -length * 0.32,
      -width * 0.5,
      length * 0.42,
      -width * 0.05,
    );

  highlight.addColorStop(
    0,
    "rgba(255,255,255,0)",
  );

  highlight.addColorStop(
    0.42,
    "rgba(255,255,255,0.16)",
  );

  highlight.addColorStop(
    0.72,
    "rgba(255,255,255,0.32)",
  );

  highlight.addColorStop(
    1,
    "rgba(255,255,255,0)",
  );

  ctx.strokeStyle =
    highlight;

  ctx.lineWidth =
    Math.max(
      0.5,
      size * 0.006,
    );

  ctx.beginPath();

  ctx.moveTo(
    -length * 0.30,
    -width * 0.28,
  );

  ctx.quadraticCurveTo(
    length * 0.02,
    -width * 0.52,
    length * 0.38,
    -width * 0.05,
  );

  ctx.stroke();

  ctx.restore();
}

/*
|--------------------------------------------------------------------------
| Sprite cache
|--------------------------------------------------------------------------
*/

function buildSprites(
  detail: number,
  scale: number,
): Sprite[] {
  const sprites: Sprite[] = [];

  const colors = [
    "#edf1f0",
    "#d4d9da",
    "#aeb6b9",
    "#7c8589",
    "#515b5f",
    "#252d31",
    "#5d8586",
    "#aa936b",
  ];

  for (
    let i = 0;
    i < colors.length;
    i++
  ) {
    const canvas =
      document.createElement(
        "canvas",
      );

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

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function FenixIntro({
  onComplete,
}: FenixIntroProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null,
    );

  const frameRef =
    useRef<number | null>(null);

  const completeRef =
    useRef(false);

  /*
   * IMPORTANT:
   *
   * stageRef is intentionally NOT React state.
   * Changing animation stage must never restart
   * the canvas effect.
   */
  const stageRef =
    useRef<Stage>("enter");

  const [logoVisible, setLogoVisible] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const canvasElement =
      canvasRef.current;

    if (!canvasElement) {
      return;
    }

    /*
     * Stable non-null alias.
     *
     * This fixes:
     * "canvas is possibly null"
     */
    const canvas =
      canvasElement;

    const ctx =
      canvas.getContext("2d", {
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

    let quality =
      detectQuality();

    let config =
      QUALITY_CONFIG[quality];

    let feathers: Feather[] = [];

    let sparks: Spark[] = [];

    let sprites: Sprite[] = [];

    let elapsed = 0;

    let lastTime =
      performance.now();

    let slowFrames = 0;

    let fastFrames = 0;

    let lastQualityChange = 0;

    /*
    |--------------------------------------------------------------------------
    | Resize
    |--------------------------------------------------------------------------
    */

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
        Math.min(
          width,
          height,
        ) * 0.5;

      const nativeDpr =
        window.devicePixelRatio || 1;

      const pixelArea =
        width * height;

      let targetDpr =
        Math.min(
          nativeDpr,
          config.dpr,
        );

      /*
       * Prevent giant 4K/mobile canvas
       * memory allocations.
       */
      if (
        pixelArea >
        config.maxPixelArea
      ) {
        targetDpr *= 0.9;
      }

      /*
       * Conservative mobile ceiling.
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
        clamp(
          targetDpr,
          1,
          1.55,
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
    };

    /*
    |--------------------------------------------------------------------------
    | Scene creation
    |--------------------------------------------------------------------------
    */

    const rebuildScene = () => {
      if (destroyed) {
        return;
      }

      config =
        QUALITY_CONFIG[quality];

      sprites =
        buildSprites(
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
       * Stable depth order.
       * No sorting every frame.
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

    /*
    |--------------------------------------------------------------------------
    | Adaptive quality
    |--------------------------------------------------------------------------
    */

    const setQuality = (
      next: QualityName,
    ) => {
      if (
        destroyed ||
        next === quality
      ) {
        return;
      }

      quality = next;

      slowFrames = 0;
      fastFrames = 0;

      lastQualityChange =
        elapsed;

      rebuildScene();
    };

    const adaptQuality = (
      frameTime: number,
    ) => {
      /*
       * Don't constantly rebuild.
       */
      if (
        elapsed -
          lastQualityChange <
        1100
      ) {
        return;
      }

      if (frameTime > 28) {
        slowFrames++;
        fastFrames = 0;
      } else if (
        frameTime < 15
      ) {
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

      /*
       * Drop quality quickly if device struggles.
       */
      if (
        slowFrames >= 3 &&
        index > 0
      ) {
        setQuality(
          QUALITY_ORDER[
            index - 1
          ],
        );

        return;
      }

      /*
       * Increase quality slowly.
       */
      if (
        fastFrames >= 12 &&
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

    /*
    |--------------------------------------------------------------------------
    | Background
    |--------------------------------------------------------------------------
    */

    const drawBackground = (
      time: number,
      opacity: number,
    ) => {
      ctx.clearRect(
        0,
        0,
        width,
        height,
      );

      /*
       * Deep black base.
       */
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
        "#101718",
      );

      base.addColorStop(
        0.18,
        "#081011",
      );

      base.addColorStop(
        0.52,
        "#040809",
      );

      base.addColorStop(
        0.82,
        "#020405",
      );

      base.addColorStop(
        1,
        "#000101",
      );

      ctx.fillStyle = base;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );

      /*
       * Teal atmospheric core.
       */
      const pulse =
        0.5 +
        Math.sin(
          time * 0.00072,
        ) *
          0.08;

      const tealGlow =
        ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          sceneRadius * 0.82,
        );

      tealGlow.addColorStop(
        0,
        `rgba(0,160,160,${
          0.12 * pulse * opacity
        })`,
      );

      tealGlow.addColorStop(
        0.22,
        `rgba(0,128,128,${
          0.075 * opacity
        })`,
      );

      tealGlow.addColorStop(
        0.58,
        "rgba(0,80,82,0.025)",
      );

      tealGlow.addColorStop(
        1,
        "rgba(0,0,0,0)",
      );

      ctx.fillStyle =
        tealGlow;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );

      /*
       * Very subtle moving gold atmosphere.
       */
      const goldX =
        centerX +
        Math.cos(
          time * 0.00016,
        ) *
          sceneRadius *
          0.38;

      const goldY =
        centerY +
        Math.sin(
          time * 0.00019,
        ) *
          sceneRadius *
          0.25;

      const gold =
        ctx.createRadialGradient(
          goldX,
          goldY,
          0,
          centerX,
          centerY,
          sceneRadius,
        );

      gold.addColorStop(
        0,
        `rgba(170,125,64,${
          0.032 * opacity
        })`,
      );

      gold.addColorStop(
        0.48,
        `rgba(120,90,48,${
          0.012 * opacity
        })`,
      );

      gold.addColorStop(
        1,
        "rgba(0,0,0,0)",
      );

      ctx.fillStyle =
        gold;

      ctx.fillRect(
        0,
        0,
        width,
        height,
      );
    };

    /*
    |--------------------------------------------------------------------------
    | Vortex core
    |--------------------------------------------------------------------------
    */

    const drawCore = (
      time: number,
      opacity: number,
    ) => {
      const breathe =
        1 +
        Math.sin(
          time * 0.0012,
        ) *
          0.035;

      const radius =
        sceneRadius *
        0.14 *
        breathe;

      /*
       * Inner black optical center.
       */
      const darkCore =
        ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          radius * 2.6,
        );

      darkCore.addColorStop(
        0,
        `rgba(0,0,0,${
          0.95 * opacity
        })`,
      );

      darkCore.addColorStop(
        0.34,
        `rgba(0,6,7,${
          0.88 * opacity
        })`,
      );

      darkCore.addColorStop(
        0.72,
        "rgba(0,0,0,0.18)",
      );

      darkCore.addColorStop(
        1,
        "rgba(0,0,0,0)",
      );

      ctx.fillStyle =
        darkCore;

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        radius * 2.6,
        0,
        TAU,
      );

      ctx.fill();

      /*
       * Teal optical ring.
       */
      const ring =
        ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.15,
          centerX,
          centerY,
          radius * 2.2,
        );

      ring.addColorStop(
        0,
        `rgba(220,245,242,${
          0.10 * opacity
        })`,
      );

      ring.addColorStop(
        0.15,
        `rgba(0,170,170,${
          0.14 * opacity
        })`,
      );

      ring.addColorStop(
        0.38,
        `rgba(0,128,128,${
          0.07 * opacity
        })`,
      );

      ring.addColorStop(
        0.72,
        "rgba(0,0,0,0)",
      );

      ctx.fillStyle =
        ring;

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        radius * 2.2,
        0,
        TAU,
      );

      ctx.fill();

      /*
       * Thin inner optical line.
       */
      ctx.strokeStyle =
        `rgba(180,225,223,${
          0.07 * opacity
        })`;

      ctx.lineWidth = 0.7;

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        radius * 0.82,
        0,
        TAU,
      );

      ctx.stroke();
    };

    /*
    |--------------------------------------------------------------------------
    | Feather rendering
    |--------------------------------------------------------------------------
    */

    const drawFeather = (
      feather: Feather,
      time: number,
      opacity: number,
    ) => {
      if (
        sprites.length === 0
      ) {
        return;
      }

      const sprite =
        sprites[
          feather.spriteIndex %
            sprites.length
        ];

      if (!sprite) {
        return;
      }

      /*
       * Orbital movement.
       */
      const orbitAngle =
        feather.angle +
        time *
          feather.orbit;

      /*
       * Natural feather flutter.
       */
      const flutter =
        Math.sin(
          time *
            0.0016 *
            feather.flutter +
            feather.phase,
        );

      /*
       * Slow radial breathing.
       */
      const breathing =
        Math.sin(
          time *
            0.00055 +
            feather.phase,
        ) *
        sceneRadius *
        0.014;

      /*
       * Slight drift.
       */
      const drift =
        Math.sin(
          time *
            0.00032 +
            feather.phase,
        ) *
        sceneRadius *
        feather.drift;

      const radius =
        feather.radiusBase +
        breathing +
        flutter *
          sceneRadius *
          0.006 +
        drift;

      /*
       * Elliptical vortex.
       */
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
          0.78;

      /*
       * Tangent orientation.
       */
      const tangent =
        orbitAngle +
        Math.PI * 0.5 +
        feather.twist +
        flutter * 0.08;

      /*
       * Perspective.
       */
      const perspective =
        0.52 +
        feather.depth *
          0.70;

      /*
       * More distant feathers are
       * slightly dimmer.
       */
      const distanceFade =
        clamp(
          1 -
            Math.abs(
              radius -
                sceneRadius *
                  0.68,
            ) /
              (
                sceneRadius *
                1.15
              ),
          0.26,
          1,
        );

      /*
       * Depth scale.
       */
      const finalScale =
        feather.size *
        perspective *
        0.80;

      const finalAlpha =
        clamp(
          feather.alpha *
            distanceFade *
            opacity,
          0,
          0.94,
        );

      /*
       * Exit motion:
       * feathers subtly collapse
       * into the center as logo exits.
       */
      let exitScale = 1;

      if (
        elapsed >=
        INTRO_EXIT_START
      ) {
        const exitProgress =
          easeInOutCubic(
            (
              elapsed -
                INTRO_EXIT_START
            ) /
              (
                INTRO_COMPLETE -
                INTRO_EXIT_START
              ),
          );

        exitScale =
          lerp(
            1,
            0.55,
            exitProgress,
          );
      }

      ctx.save();

      ctx.translate(
        Math.round(x),
        Math.round(y),
      );

      ctx.rotate(
        tangent,
      );

      ctx.globalAlpha =
        finalAlpha;

      ctx.globalCompositeOperation =
        feather.layer >= 3
          ? "screen"
          : "source-over";

      const drawScale =
        finalScale *
        exitScale;

      /*
       * Cached sprite.
       */
      const drawWidth =
        sprite.width *
        drawScale /
        config.spriteScale;

      const drawHeight =
        sprite.height *
        drawScale /
        config.spriteScale;

      ctx.drawImage(
        sprite.canvas,
        -drawWidth * 0.5,
        -drawHeight * 0.5,
        drawWidth,
        drawHeight,
      );

      ctx.restore();
    };

    /*
    |--------------------------------------------------------------------------
    | Sparks
    |--------------------------------------------------------------------------
    */

    const drawSparks = (
      time: number,
      opacity: number,
    ) => {
      if (
        quality === "safe"
      ) {
        return;
      }

      ctx.save();

      ctx.globalCompositeOperation =
        "screen";

      for (
        let i = 0;
        i < sparks.length;
        i++
      ) {
        const spark =
          sparks[i];

        const angle =
          spark.angle +
          time *
            spark.speed;

        const pulse =
          0.62 +
          Math.sin(
            time * 0.0027 +
              spark.phase,
          ) *
            0.38;

        const radius =
          spark.radius *
          (
            0.95 +
            Math.sin(
              time *
                0.00072 +
                spark.phase,
            ) *
              0.045
          );

        const x =
          centerX +
          Math.cos(angle) *
            radius;

        const y =
          centerY +
          Math.sin(angle) *
            radius *
            0.78;

        ctx.globalAlpha =
          clamp(
            spark.alpha *
              pulse *
              opacity,
            0,
            0.8,
          );

        ctx.fillStyle =
          i % 5 === 0
            ? "#d4b879"
            : "#d9f4f2";

        ctx.beginPath();

        ctx.arc(
          Math.round(x),
          Math.round(y),
          spark.size,
          0,
          TAU,
        );

        ctx.fill();
      }

      ctx.restore();
    };

    /*
    |--------------------------------------------------------------------------
    | Vignette
    |--------------------------------------------------------------------------
    */

    const drawVignette = (
      opacity: number,
    ) => {
      const vignette =
        ctx.createRadialGradient(
          centerX,
          centerY,
          sceneRadius * 0.18,
          centerX,
          centerY,
          sceneRadius * 1.10,
        );

      vignette.addColorStop(
        0,
        "rgba(0,0,0,0)",
      );

      vignette.addColorStop(
        0.48,
        "rgba(0,0,0,0.035)",
      );

      vignette.addColorStop(
        0.76,
        `rgba(0,0,0,${
          0.34 * opacity
        })`,
      );

      vignette.addColorStop(
        1,
        `rgba(0,0,0,${
          0.92 * opacity
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

    /*
    |--------------------------------------------------------------------------
    | Grain
    |--------------------------------------------------------------------------
    */

    const drawGrain = (
      time: number,
      opacity: number,
    ) => {
      if (
        quality === "safe"
      ) {
        return;
      }

      const amount =
        quality === "ultra"
          ? 85
          : quality === "high"
            ? 60
            : 34;

      ctx.save();

      ctx.globalAlpha =
        0.014 * opacity;

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
                time *
                  0.00008,
            ),
          ) *
          width;

        const y =
          Math.abs(
            Math.sin(
              i * 47.31 +
                time *
                  0.00006,
            ),
          ) *
          height;

        ctx.fillRect(
          Math.floor(x),
          Math.floor(y),
          1,
          1,
        );
      }

      ctx.restore();
    };

    /*
    |--------------------------------------------------------------------------
    | Render loop
    |--------------------------------------------------------------------------
    */

    const render = (
      now: number,
    ) => {
      if (destroyed) {
        return;
      }

      /*
       * Delta-time based animation.
       * Prevents high refresh-rate devices
       * from running the scene faster.
       */
      const frameTime =
        Math.min(
          50,
          Math.max(
            0,
            now - lastTime,
          ),
        );

      lastTime = now;

      elapsed += frameTime;

      adaptQuality(
        frameTime,
      );

      /*
       * Initial fade-in.
       */
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

      /*
       * Exit fade.
       */
      let exitOpacity = 1;

      if (
        elapsed >=
        INTRO_EXIT_START
      ) {
        exitOpacity =
          1 -
          easeInOutCubic(
            (
              elapsed -
                INTRO_EXIT_START
            ) /
              (
                INTRO_COMPLETE -
                INTRO_EXIT_START
              ),
          );
      }

      /*
       * Stage changes are refs,
       * NOT effect dependencies.
       */
      if (
        elapsed >=
        INTRO_EXIT_START
      ) {
        if (
          stageRef.current !==
          "exit"
        ) {
          stageRef.current =
            "exit";

          /*
           * React state is used only
           * for the one-time visual logo
           * transition.
           */
          setLogoVisible(false);
        }
      } else if (
        elapsed >=
        INTRO_HOLD
      ) {
        stageRef.current =
          "hold";
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
       * Feather vortex.
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

      /*
       * Optical center.
       */
      drawCore(
        elapsed,
        visualOpacity,
      );

      /*
       * Tiny atmospheric particles.
       */
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

      /*
       * Complete intro.
       */
      if (
        elapsed >=
        INTRO_COMPLETE
      ) {
        if (
          !completeRef.current
        ) {
          completeRef.current =
            true;

          if (
            frameRef.current !==
            null
          ) {
            cancelAnimationFrame(
              frameRef.current,
            );

            frameRef.current =
              null;
          }

          /*
           * Clear expensive canvas
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

    /*
    |--------------------------------------------------------------------------
    | Visibility handling
    |--------------------------------------------------------------------------
    */

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

            frameRef.current =
              null;
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

    /*
    |--------------------------------------------------------------------------
    | Resize handling
    |--------------------------------------------------------------------------
    */

    const handleResize = () => {
      resize();
    };

    /*
    |--------------------------------------------------------------------------
    | Initial setup
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    return () => {
      destroyed = true;

      if (
        frameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          frameRef.current,
        );

        frameRef.current =
          null;
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

    /*
     * VERY IMPORTANT:
     *
     * Do NOT add stage or logoVisible here.
     *
     * Otherwise React would restart the entire
     * canvas animation when the logo fades.
     */
  }, [onComplete]);

  /*
  |--------------------------------------------------------------------------
  | JSX
  |--------------------------------------------------------------------------
  */

  const isExiting =
    stageRef.current ===
    "exit";

  return (
    <main
      aria-label="FeniX introduction"
      className="fixed inset-0 z-[999999] h-[100dvh] w-full overflow-hidden bg-[#030506]"
      style={{
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/*
      ------------------------------------------------------------------------
      CANVAS
      ------------------------------------------------------------------------
      */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full"
      />

      {/*
      ------------------------------------------------------------------------
      ATMOSPHERIC OVERLAY
      ------------------------------------------------------------------------
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,128,128,0.045) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.48) 100%)",
        }}
      />

      {/*
      ------------------------------------------------------------------------
      OUTER OPTICAL RING
      ------------------------------------------------------------------------
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width:
            "min(34vw, 340px)",
          height:
            "min(34vw, 340px)",
          minWidth: 180,
          minHeight: 180,
          transform:
            "translate(-50%, -50%)",
          borderRadius: "50%",
          border:
            "1px solid rgba(0,128,128,0.13)",
          boxShadow:
            "0 0 55px rgba(0,128,128,0.075), inset 0 0 45px rgba(0,0,0,0.58)",
          opacity:
            isExiting ? 0 : 1,
          transition:
            "opacity 650ms cubic-bezier(.22,.61,.36,1)",
        }}
      />

      {/*
      ------------------------------------------------------------------------
      INNER FX RING
      ------------------------------------------------------------------------
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width:
            "min(20vw, 210px)",
          height:
            "min(20vw, 210px)",
          minWidth: 115,
          minHeight: 115,
          transform:
            "translate(-50%, -50%)",
          borderRadius: "50%",
          border:
            "1px solid rgba(0,128,128,0.20)",
          boxShadow:
            "0 0 30px rgba(0,128,128,0.075)",
          opacity:
            isExiting ? 0 : 0.92,
          transition:
            "opacity 520ms cubic-bezier(.22,.61,.36,1)",
        }}
      />

      {/*
      ------------------------------------------------------------------------
      LOGO
      ------------------------------------------------------------------------
      */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center"
        style={{
          opacity:
            logoVisible ? 1 : 0,

          transform:
            `translate(-50%, -50%) scale(${
              logoVisible ? 1 : 0.80
            })`,

          transition:
            "opacity 650ms cubic-bezier(.22,.61,.36,1), transform 800ms cubic-bezier(.22,.61,.36,1)",
        }}
      >
        {/*
        ----------------------------------------------------------------------
        FX SYMBOL
        ----------------------------------------------------------------------
        */}
        <div
          aria-hidden="true"
          style={{
            width:
              "clamp(76px, 11vw, 142px)",

            height:
              "clamp(76px, 11vw, 142px)",

            borderRadius:
              "50%",

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            border:
              "1px solid rgba(214,225,223,0.30)",

            background:
              "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.12), rgba(0,0,0,0.38) 56%, rgba(0,128,128,0.09))",

            boxShadow:
              "0 0 38px rgba(0,128,128,0.13), inset 0 0 25px rgba(255,255,255,0.035)",

            backdropFilter:
              "blur(3px)",

            WebkitBackdropFilter:
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

              color:
                "#eef4f3",

              textShadow:
                "0 0 18px rgba(190,240,235,0.20)",

              transform:
                "translateX(-2px)",
            }}
          >
            FX
          </span>
        </div>

        {/*
        ----------------------------------------------------------------------
        FeniX WORDMARK
        ----------------------------------------------------------------------
        */}
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

            color:
              "#f1f4f3",

            textShadow:
              "0 0 24px rgba(255,255,255,0.10)",

            whiteSpace:
              "nowrap",
          }}
        >
          FeniX
        </div>

        {/*
        ----------------------------------------------------------------------
        TAGLINE
        ----------------------------------------------------------------------
        */}
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

            textAlign:
              "center",

            whiteSpace:
              "nowrap",
          }}
        >
          FEARLESS ENERGY NAVIGATES INFINITE X-FACTORS
        </div>
      </div>

      {/*
      ------------------------------------------------------------------------
      INITIALIZATION BAR
      ------------------------------------------------------------------------
      */}
      <div
        className="pointer-events-none absolute left-1/2 bottom-[9vh] -translate-x-1/2"
        style={{
          width:
            "min(220px, 58vw)",

          opacity:
            loading &&
            !isExiting
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

            overflow:
              "hidden",
          }}
        >
          <div
            style={{
              height:
                "100%",

              width:
                "42%",

              background:
                "linear-gradient(90deg, transparent, #008080, #d4b879, transparent)",

              animation:
                "fenixIntroLoading 1.45s ease-in-out infinite",

              willChange:
                "transform",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 9,

            textAlign:
              "center",

            fontFamily:
              "Arial, Helvetica, sans-serif",

            fontSize: 9,

            letterSpacing:
              "0.30em",

            color:
              "rgba(194,207,206,0.50)",
          }}
        >
          INITIALIZING
        </div>
      </div>

      {/*
      ------------------------------------------------------------------------
      FINAL BLACK FADE
      ------------------------------------------------------------------------
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "#000",

          opacity:
            isExiting ? 1 : 0,

          transition:
            "opacity 700ms cubic-bezier(.22,.61,.36,1)",

          willChange:
            "opacity",
        }}
      />

      {/*
      ------------------------------------------------------------------------
      LOCAL ANIMATION
      ------------------------------------------------------------------------
      */}
      <style jsx>{`
        @keyframes fenixIntroLoading {
          0% {
            transform: translate3d(-130%, 0, 0);
          }

          50% {
            transform: translate3d(110%, 0, 0);
          }

          100% {
            transform: translate3d(280%, 0, 0);
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
