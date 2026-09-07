"use client";

import { useEffect, useRef, useState } from "react";

type FenixIntroProps = {
  onComplete: () => void;
};

type IntroStage = "enter" | "hold" | "exit";

type FeatherColor = "silver" | "teal" | "gold" | "dark";

type Feather = {
  angle: number;
  radius: number;
  size: number;
  length: number;
  width: number;
  speed: number;
  orbit: number;
  twist: number;
  phase: number;
  depth: number;
  color: FeatherColor;
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

const INTRO_ENTER = 850;
const INTRO_EXIT_START = 3200;
const INTRO_COMPLETE = 4050;

const TAU = Math.PI * 2;

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.max(min, Math.min(max, value));
}

function createFeather(
  width: number,
  height: number,
  mobile: boolean,
  index: number,
  total: number,
): Feather {
  const maxRadius =
    Math.max(width, height) *
    (mobile ? 0.64 : 0.76);

  const distribution = Math.random();

  let radius: number;

  if (distribution < 0.2) {
    radius = random(
      maxRadius * 0.13,
      maxRadius * 0.29,
    );
  } else if (distribution < 0.62) {
    radius = random(
      maxRadius * 0.27,
      maxRadius * 0.62,
    );
  } else {
    radius = random(
      maxRadius * 0.55,
      maxRadius,
    );
  }

  const colorRoll = Math.random();

  let color: FeatherColor;

  if (colorRoll < 0.075) {
    color = "gold";
  } else if (colorRoll < 0.25) {
    color = "teal";
  } else if (colorRoll < 0.72) {
    color = "silver";
  } else {
    color = "dark";
  }

  const normalizedRadius =
    radius / maxRadius;

  const baseAngle =
    (index / Math.max(total, 1)) *
    TAU *
    2.4;

  return {
    angle:
      baseAngle +
      random(-0.17, 0.17),

    radius,

    size:
      random(
        mobile ? 0.62 : 0.7,
        mobile ? 1.04 : 1.24,
      ) *
      (1.08 - normalizedRadius * 0.18),

    length:
      random(
        mobile ? 55 : 65,
        mobile ? 122 : 205,
      ) *
      (1.08 - normalizedRadius * 0.22),

    width:
      random(
        mobile ? 15 : 18,
        mobile ? 36 : 52,
      ) *
      (1.1 - normalizedRadius * 0.15),

    speed:
      random(0.000018, 0.000055) *
      (Math.random() > 0.5 ? 1 : -1),

    orbit: random(
      0.00022,
      0.00066,
    ),

    twist: random(
      -0.32,
      0.32,
    ),

    phase: random(0, TAU),

    depth: random(
      0.3,
      1,
    ),

    color,

    alpha:
      color === "dark"
        ? random(0.25, 0.58)
        : color === "gold"
          ? random(0.42, 0.76)
          : random(0.43, 0.88),

    curve: random(
      -0.35,
      0.35,
    ),

    flutter: random(
      0.25,
      1,
    ),
  };
}

function createSpark(): Spark {
  return {
    angle: random(0, TAU),
    radius: random(70, 760),
    speed: random(0.00016, 0.00055),
    size: random(0.35, 1.65),
    alpha: random(0.12, 0.55),
    phase: random(0, TAU),
  };
}

export default function FenixIntro({
  onComplete,
}: FenixIntroProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null,
    );

  const [stage, setStage] =
    useState<IntroStage>("enter");

  useEffect(() => {
    const holdTimer =
      window.setTimeout(() => {
        setStage("hold");
      }, INTRO_ENTER);

    const exitTimer =
      window.setTimeout(() => {
        setStage("exit");
      }, INTRO_EXIT_START);

    const completeTimer =
      window.setTimeout(() => {
        onComplete();
      }, INTRO_COMPLETE);

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
    const canvasElement =
      canvasRef.current;

    if (!canvasElement) {
      return;
    }

    const canvas = canvasElement;

    const context =
      canvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });

    if (!context) {
      return;
    }

    const ctx = context;

    let width = 0;
    let height = 0;
    let dpr = 1;

    let animationFrame = 0;
    let destroyed = false;

    let feathers: Feather[] = [];
    let sparks: Spark[] = [];

    let lastTime =
      performance.now();

    let elapsed = 0;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    let isMobile =
      window.innerWidth <= 600 ||
      navigator.maxTouchPoints > 1;

    const resize = () => {
      width =
        window.innerWidth;

      height =
        window.innerHeight;

      isMobile =
        width <= 600 ||
        navigator.maxTouchPoints > 1;

      dpr = Math.min(
        window.devicePixelRatio || 1,
        isMobile ? 1.5 : 2,
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

      const area =
        width * height;

      let featherCount = 180;

      if (area < 300000) {
        featherCount = 105;
      } else if (area < 600000) {
        featherCount = 135;
      } else if (area < 1200000) {
        featherCount = 185;
      } else if (
        area < 2200000
      ) {
        featherCount = 245;
      } else {
        featherCount = 315;
      }

      feathers =
        Array.from(
          {
            length:
              featherCount,
          },
          (_, index) =>
            createFeather(
              width,
              height,
              isMobile,
              index,
              featherCount,
            ),
        );

      sparks =
        Array.from(
          {
            length: isMobile
              ? 20
              : 44,
          },
          () => createSpark(),
        );
    };

    resize();

    window.addEventListener(
      "resize",
      resize,
      { passive: true },
    );

    const drawBackground =
      () => {
        const centerX =
          width * 0.5;

        const centerY =
          height * 0.5;

        const outerRadius =
          Math.max(
            width,
            height,
          ) * 0.76;

        const backgroundGradient =
          ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            outerRadius,
          );

        backgroundGradient.addColorStop(
          0,
          "#111617",
        );

        backgroundGradient.addColorStop(
          0.13,
          "#202625",
        );

        backgroundGradient.addColorStop(
          0.28,
          "#474b48",
        );

        backgroundGradient.addColorStop(
          0.48,
          "#222728",
        );

        backgroundGradient.addColorStop(
          0.72,
          "#0a0c0d",
        );

        backgroundGradient.addColorStop(
          1,
          "#010202",
        );

        ctx.fillStyle =
          backgroundGradient;

        ctx.fillRect(
          0,
          0,
          width,
          height,
        );

        const tealGlow =
          ctx.createRadialGradient(
            centerX -
              width * 0.055,
            centerY -
              height * 0.03,
            0,
            centerX -
              width * 0.055,
            centerY -
              height * 0.03,
            Math.max(
              width,
              height,
            ) * 0.48,
          );

        tealGlow.addColorStop(
          0,
          "rgba(0,128,128,0.17)",
        );

        tealGlow.addColorStop(
          0.36,
          "rgba(0,128,128,0.045)",
        );

        tealGlow.addColorStop(
          1,
          "rgba(0,128,128,0)",
        );

        ctx.fillStyle =
          tealGlow;

        ctx.fillRect(
          0,
          0,
          width,
          height,
        );

        const warmGlow =
          ctx.createRadialGradient(
            width * 0.76,
            height * 0.3,
            0,
            width * 0.76,
            height * 0.3,
            Math.max(
              width,
              height,
            ) * 0.4,
          );

        warmGlow.addColorStop(
          0,
          "rgba(214,158,83,0.075)",
        );

        warmGlow.addColorStop(
          1,
          "rgba(214,158,83,0)",
        );

        ctx.fillStyle =
          warmGlow;

        ctx.fillRect(
          0,
          0,
          width,
          height,
        );
      };

    const drawFeather = (
      feather: Feather,
      time: number,
    ) => {
      const centerX =
        width * 0.5;

      const centerY =
        height * 0.5;

      const flutterWave =
        Math.sin(
          time *
            0.0011 *
            feather.flutter +
            feather.phase,
        ) * 0.07;

      const breathing =
        Math.sin(
          time * 0.00045 +
            feather.phase,
        ) *
        (10 +
          feather.depth * 17);

      const radius =
        feather.radius +
        breathing;

      const angle =
        feather.angle +
        time * feather.orbit +
        flutterWave;

      const depthWave =
        Math.sin(
          time * 0.00034 +
            feather.phase,
        );

      const depth =
        clamp(
          0.56 +
            depthWave * 0.35,
          0.18,
          1,
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

      const tangent =
        angle +
        Math.PI / 2;

      const inwardMovement =
        Math.sin(
          time * 0.00029 +
            feather.phase,
        ) * 0.1;

      const rotation =
        tangent +
        feather.twist +
        inwardMovement;

      const perspective =
        0.68 +
        depth * 0.5;

      const length =
        feather.length *
        feather.size *
        perspective;

      const featherWidth =
        feather.width *
        feather.size *
        perspective;

      ctx.save();

      ctx.translate(
        x,
        y,
      );

      ctx.rotate(
        rotation,
      );

      const shear =
        Math.sin(
          time * 0.0013 +
            feather.phase,
        ) *
        feather.flutter *
        0.1;

      ctx.transform(
        1,
        shear,
        0,
        1,
        0,
        0,
      );

      ctx.globalAlpha =
        feather.alpha *
        (0.48 + depth * 0.52);

      if (depth < 0.3) {
        ctx.filter =
          "blur(2px)";
      } else if (
        depth < 0.56
      ) {
        ctx.filter =
          "blur(1px)";
      } else if (
        depth > 0.84
      ) {
        ctx.filter =
          "blur(0.2px)";
      } else {
        ctx.filter = "none";
      }

      const bodyGradient =
        ctx.createLinearGradient(
          0,
          0,
          length,
          0,
        );

      if (
        feather.color ===
        "silver"
      ) {
        bodyGradient.addColorStop(
          0,
          "#111515",
        );

        bodyGradient.addColorStop(
          0.18,
          "#424949",
        );

        bodyGradient.addColorStop(
          0.42,
          "#858986",
        );

        bodyGradient.addColorStop(
          0.67,
          "#d2cec4",
        );

        bodyGradient.addColorStop(
          0.85,
          "#eee9df",
        );

        bodyGradient.addColorStop(
          1,
          "#858b88",
        );
      } else if (
        feather.color ===
        "teal"
      ) {
        bodyGradient.addColorStop(
          0,
          "#051011",
        );

        bodyGradient.addColorStop(
          0.25,
          "#12484b",
        );

        bodyGradient.addColorStop(
          0.5,
          "#147779",
        );

        bodyGradient.addColorStop(
          0.74,
          "#75aaa8",
        );

        bodyGradient.addColorStop(
          0.9,
          "#9cc0bd",
        );

        bodyGradient.addColorStop(
          1,
          "#31595b",
        );
      } else if (
        feather.color ===
        "gold"
      ) {
        bodyGradient.addColorStop(
          0,
          "#2f2117",
        );

        bodyGradient.addColorStop(
          0.26,
          "#744a2a",
        );

        bodyGradient.addColorStop(
          0.55,
          "#aa7038",
        );

        bodyGradient.addColorStop(
          0.76,
          "#e2ae69",
        );

        bodyGradient.addColorStop(
          0.9,
          "#f3cd8d",
        );

        bodyGradient.addColorStop(
          1,
          "#83572e",
        );
      } else {
        bodyGradient.addColorStop(
          0,
          "#050707",
        );

        bodyGradient.addColorStop(
          0.3,
          "#121718",
        );

        bodyGradient.addColorStop(
          0.68,
          "#303737",
        );

        bodyGradient.addColorStop(
          1,
          "#181d1d",
        );
      }

      ctx.shadowColor =
        feather.color === "teal"
          ? "rgba(0,128,128,0.12)"
          : feather.color === "gold"
            ? "rgba(218,157,80,0.1)"
            : "rgba(0,0,0,0.62)";

      ctx.shadowBlur =
        depth > 0.65
          ? 10
          : 15;

      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 7;

      /*
       * MAIN FEATHER BODY
       */

      ctx.beginPath();

      ctx.moveTo(
        0,
        0,
      );

      ctx.bezierCurveTo(
        length * 0.18,
        -featherWidth * 0.42,
        length * 0.52,
        -featherWidth * 0.62,
        length,
        0,
      );

      ctx.bezierCurveTo(
        length * 0.68,
        featherWidth * 0.49,
        length * 0.28,
        featherWidth * 0.42,
        0,
        0,
      );

      ctx.closePath();

      ctx.fillStyle =
        bodyGradient;

      ctx.fill();

      ctx.shadowColor =
        "transparent";

      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      /*
       * CENTRAL SHAFT
       */

      const shaftGradient =
        ctx.createLinearGradient(
          0,
          0,
          length,
          0,
        );

      shaftGradient.addColorStop(
        0,
        "rgba(10,12,12,0.7)",
      );

      shaftGradient.addColorStop(
        0.26,
        "rgba(169,171,167,0.62)",
      );

      shaftGradient.addColorStop(
        0.62,
        "rgba(255,255,255,0.84)",
      );

      shaftGradient.addColorStop(
        0.86,
        "rgba(255,255,255,0.3)",
      );

      shaftGradient.addColorStop(
        1,
        "rgba(255,255,255,0)",
      );

      ctx.beginPath();

      ctx.moveTo(
        0,
        0,
      );

      ctx.quadraticCurveTo(
        length * 0.42,
        feather.curve *
          featherWidth,
        length,
        -featherWidth *
          0.025,
      );

      ctx.strokeStyle =
        shaftGradient;

      ctx.lineWidth =
        Math.max(
          0.6,
          featherWidth * 0.034,
        );

      ctx.stroke();

      /*
       * FINE BARBS
       */

      const barbCount =
        Math.floor(
          clamp(
            length / 8.5,
            8,
            24,
          ),
        );

      ctx.globalAlpha *=
        0.65;

      for (
        let i = 2;
        i < barbCount;
        i += 1
      ) {
        const t =
          i / barbCount;

        const barbX =
          length * t;

        const envelope =
          Math.sin(
            Math.PI * t,
          );

        const barbHeight =
          featherWidth *
          envelope *
          0.56;

        const side =
          i % 2 === 0
            ? -1
            : 1;

        const curve =
          side *
          barbHeight *
          (0.74 +
            Math.sin(
              time *
                0.001 +
                feather.phase +
                i,
            ) *
              0.06);

        ctx.beginPath();

        ctx.moveTo(
          barbX,
          0,
        );

        ctx.quadraticCurveTo(
          barbX -
            length * 0.05,
          curve * 0.35,
          barbX -
            length * 0.11,
          curve,
        );

        if (
          feather.color ===
          "teal"
        ) {
          ctx.strokeStyle =
            "rgba(188,232,230,0.34)";
        } else if (
          feather.color ===
          "gold"
        ) {
          ctx.strokeStyle =
            "rgba(255,220,162,0.35)";
        } else {
          ctx.strokeStyle =
            "rgba(255,255,255,0.25)";
        }

        ctx.lineWidth =
          Math.max(
            0.42,
            featherWidth * 0.017,
          );

        ctx.stroke();
      }

      /*
       * SPECULAR LIGHT
       */

      if (
        depth > 0.68
      ) {
        const shineGradient =
          ctx.createLinearGradient(
            length * 0.12,
            -featherWidth * 0.2,
            length * 0.86,
            0,
          );

        shineGradient.addColorStop(
          0,
          "rgba(255,255,255,0)",
        );

        shineGradient.addColorStop(
          0.46,
          "rgba(255,255,255,0.02)",
        );

        shineGradient.addColorStop(
          0.57,
          "rgba(255,255,255,0.26)",
        );

        shineGradient.addColorStop(
          0.65,
          "rgba(255,255,255,0.62)",
        );

        shineGradient.addColorStop(
          0.72,
          "rgba(255,255,255,0)",
        );

        ctx.beginPath();

        ctx.moveTo(
          length * 0.18,
          -featherWidth * 0.12,
        );

        ctx.quadraticCurveTo(
          length * 0.52,
          -featherWidth * 0.25,
          length * 0.83,
          -featherWidth * 0.015,
        );

        ctx.strokeStyle =
          shineGradient;

        ctx.lineWidth =
          Math.max(
            0.7,
            featherWidth * 0.05,
          );

        ctx.stroke();
      }

      ctx.restore();
    };

    const drawCore = (
      time: number,
    ) => {
      const centerX =
        width * 0.5;

      const centerY =
        height * 0.5;

      const coreRadius =
        Math.min(
          width,
          height,
        ) * 0.11;

      const aura =
        ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          coreRadius * 3.5,
        );

      aura.addColorStop(
        0,
        "rgba(0,128,128,0.12)",
      );

      aura.addColorStop(
        0.32,
        "rgba(0,128,128,0.045)",
      );

      aura.addColorStop(
        1,
        "rgba(0,128,128,0)",
      );

      ctx.fillStyle = aura;

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        coreRadius * 3.5,
        0,
        TAU,
      );

      ctx.fill();

      const coreGradient =
        ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          coreRadius * 1.9,
        );

      coreGradient.addColorStop(
        0,
        "rgba(1,3,3,0.995)",
      );

      coreGradient.addColorStop(
        0.42,
        "rgba(3,8,8,0.98)",
      );

      coreGradient.addColorStop(
        0.7,
        "rgba(8,17,17,0.7)",
      );

      coreGradient.addColorStop(
        1,
        "rgba(8,13,13,0)",
      );

      ctx.fillStyle =
        coreGradient;

      ctx.beginPath();

      ctx.arc(
        centerX,
        centerY,
        coreRadius * 1.9,
        0,
        TAU,
      );

      ctx.fill();

      /*
       * INNER ENERGY RING
       */

      ctx.save();

      ctx.translate(
        centerX,
        centerY,
      );

      ctx.rotate(
        time * 0.00014,
      );

      ctx.strokeStyle =
        "rgba(0,179,179,0.19)";

      ctx.lineWidth = 1;

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        coreRadius * 1.02,
        -0.72,
        0.84,
      );

      ctx.stroke();

      ctx.strokeStyle =
        "rgba(255,215,0,0.115)";

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        coreRadius * 1.17,
        2.25,
        3.55,
      );

      ctx.stroke();

      ctx.restore();
    };

    const drawSparks = (
      time: number,
    ) => {
      const centerX =
        width * 0.5;

      const centerY =
        height * 0.5;

      for (
        const spark of sparks
      ) {
        const radius =
          spark.radius +
          Math.sin(
            time * 0.001 +
              spark.phase,
          ) *
            18;

        const angle =
          spark.angle +
          time * spark.speed;

        const x =
          centerX +
          Math.cos(angle) *
            radius;

        const y =
          centerY +
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
          spark.phase % 2 >
          1.2
            ? "#008080"
            : "#d9d6cd";

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
    };

    const drawLightSweep =
      (time: number) => {
        const centerX =
          width * 0.5;

        const centerY =
          height * 0.5;

        const sweep =
          (time * 0.00008) %
          TAU;

        const startX =
          centerX +
          Math.cos(sweep) *
            Math.max(
              width,
              height,
            );

        const startY =
          centerY +
          Math.sin(sweep) *
            Math.max(
              width,
              height,
            );

        const gradient =
          ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            startX,
            startY,
            Math.max(
              width,
              height,
            ) * 0.38,
          );

        gradient.addColorStop(
          0,
          "rgba(255,255,255,0.018)",
        );

        gradient.addColorStop(
          1,
          "rgba(255,255,255,0)",
        );

        ctx.fillStyle =
          gradient;

        ctx.fillRect(
          0,
          0,
          width,
          height,
        );
      };

    const drawVignette =
      () => {
        const centerX =
          width * 0.5;

        const centerY =
          height * 0.5;

        const vignette =
          ctx.createRadialGradient(
            centerX,
            centerY,
            Math.min(
              width,
              height,
            ) * 0.16,
            centerX,
            centerY,
            Math.max(
              width,
              height,
            ) * 0.78,
          );

        vignette.addColorStop(
          0,
          "rgba(0,0,0,0)",
        );

        vignette.addColorStop(
          0.53,
          "rgba(0,0,0,0.06)",
        );

        vignette.addColorStop(
          0.78,
          "rgba(0,0,0,0.47)",
        );

        vignette.addColorStop(
          1,
          "rgba(0,0,0,0.91)",
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
      () => {
        ctx.save();

        ctx.globalAlpha =
          0.024;

        for (
          let i = 0;
          i < 58;
          i += 1
        ) {
          const x =
            Math.random() *
            width;

          const y =
            Math.random() *
            height;

          ctx.fillStyle =
            Math.random() >
            0.5
              ? "#ffffff"
              : "#000000";

          ctx.fillRect(
            x,
            y,
            1,
            1,
          );
        }

        ctx.restore();
      };

    const render = (
      currentTime: number,
    ) => {
      if (destroyed) {
        return;
      }

      const delta =
        Math.min(
          currentTime -
            lastTime,
          32,
        );

      lastTime =
        currentTime;

      if (
        document.visibilityState ===
        "visible"
      ) {
        elapsed +=
          reducedMotion
            ? delta * 0.06
            : delta;

        ctx.clearRect(
          0,
          0,
          width,
          height,
        );

        drawBackground();

        feathers.sort(
          (a, b) =>
            a.depth - b.depth,
        );

        for (
          const feather of feathers
        ) {
          if (
            feather.depth <
            0.52
          ) {
            drawFeather(
              feather,
              elapsed,
            );
          }
        }

        for (
          const feather of feathers
        ) {
          if (
            feather.depth >=
            0.52
          ) {
            drawFeather(
              feather,
              elapsed,
            );
          }
        }

        drawCore(elapsed);

        drawSparks(elapsed);

        drawLightSweep(
          elapsed,
        );

        drawVignette();

        drawGrain();
      }

      animationFrame =
        window.requestAnimationFrame(
          render,
        );
    };

    animationFrame =
      window.requestAnimationFrame(
        render,
      );

    return () => {
      destroyed = true;

      window.cancelAnimationFrame(
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

  const isEntered =
    stage !== "enter";

  return (
    <div
      className={[
        "fixed inset-0 z-[999999]",
        "min-h-screen overflow-hidden",
        "bg-[#030506] text-white",
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
          PROCEDURAL FEATHER VFX
          ===================================================== */}

      <canvas
        ref={canvasRef}
        className={[
          "absolute inset-0",
          "h-full w-full",
          "transition-[opacity,transform,filter]",
          "duration-[900ms]",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          isExit
            ? "scale-[1.075] opacity-0 blur-[3px]"
            : "scale-100 opacity-100 blur-0",
        ].join(" ")}
        aria-hidden="true"
      />

      {/* =====================================================
          ATMOSPHERE
          ===================================================== */}

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
            bg-[radial-gradient(circle_at_50%_46%,rgba(0,128,128,0.11),transparent_36%)]
          "
        />

        <div
          className="
            absolute inset-0
            bg-[linear-gradient(180deg,rgba(3,5,6,0.08),transparent_36%,rgba(0,0,0,0.62))]
          "
        />
      </div>

      {/* =====================================================
          RINGS
          ===================================================== */}

      <div
        className={[
          "pointer-events-none absolute",
          "left-1/2 top-1/2 z-20",
          "h-[220px] w-[220px]",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full",
          "border border-[#008080]/10",
          "shadow-[0_0_90px_rgba(0,128,128,0.05)]",
          "animate-[spin_11s_linear_infinite]",
          "transition-[opacity,transform]",
          "duration-[900ms]",
          isExit
            ? "scale-[1.48] opacity-0"
            : "scale-100 opacity-100",
          "sm:h-[320px] sm:w-[320px]",
          "md:h-[380px] md:w-[380px]",
        ].join(" ")}
      />

      <div
        className={[
          "pointer-events-none absolute",
          "left-1/2 top-1/2 z-20",
          "h-[160px] w-[160px]",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full",
          "border border-white/[0.035]",
          "animate-[spin_8s_linear_infinite_reverse]",
          "transition-[opacity,transform]",
          "duration-[900ms]",
          isExit
            ? "scale-[1.34] opacity-0"
            : "scale-100 opacity-100",
          "sm:h-[240px] sm:w-[240px]",
          "md:h-[290px] md:w-[290px]",
        ].join(" ")}
      />

      {/* =====================================================
          BRAND
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
          {/* FX MARK */}

          <div
            className={[
              "relative flex",
              "h-[82px] w-[82px]",
              "items-center justify-center",
              "rounded-[25px]",
              "border border-white/10",
              "bg-[#05070b]/48",
              "backdrop-blur-xl",
              "shadow-[0_0_100px_rgba(0,128,128,0.22)]",
              "transition-[opacity,transform]",
              "duration-[900ms]",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",
              isEntered
                ? "scale-100 opacity-100"
                : "scale-[0.72] opacity-0",
              "sm:h-[94px] sm:w-[94px]",
              "md:h-[104px] md:w-[104px]",
            ].join(" ")}
          >
            <div
              className="
                absolute inset-[7px]
                rounded-[20px]
                border border-[#008080]/22
              "
            />

            <div
              className="
                absolute inset-[14px]
                rounded-[16px]
                border border-white/[0.045]
              "
            />

            <div
              className="
                absolute
                left-1/2 top-1/2
                h-[44px] w-[44px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border border-[#008080]/15
                animate-[spin_10s_linear_infinite]
                sm:h-[52px] sm:w-[52px]
              "
            />

            <span
              className="
                relative
                text-[35px]
                font-black
                tracking-[-0.11em]
                sm:text-[42px]
                md:text-[46px]
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

          {/* NAME */}

          <div
            className={[
              "mt-6 text-center",
              "transition-[opacity,transform]",
              "duration-[1050ms]",
              "delay-[100ms]",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",
              isEntered
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0",
            ].join(" ")}
          >
            <h1
              className="
                text-[29px]
                font-black
                tracking-[-0.065em]
                sm:text-[36px]
                md:text-[40px]
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

          {/* LOADING */}

          <div
            className={[
              "mt-8",
              "h-[2px] w-[108px]",
              "overflow-hidden rounded-full",
              "bg-white/[0.08]",
              "transition-opacity duration-700",
              isEntered
                ? "opacity-100"
                : "opacity-0",
            ].join(" ")}
          >
            <div
              className="
                h-full w-full
                origin-left
                bg-gradient-to-r
                from-[#008080]/25
                via-white
                to-[#FFD700]/60
                animate-[fenixLoad_3s_cubic-bezier(0.22,1,0.36,1)_forwards]
              "
            />
          </div>

          <p
            className={[
              "mt-3",
              "text-[7px]",
              "font-medium",
              "uppercase",
              "tracking-[0.52em]",
              "text-white/24",
              "transition-opacity duration-700",
              isEntered
                ? "opacity-100"
                : "opacity-0",
            ].join(" ")}
          >
            Loading
          </p>
        </div>
      </div>

      {/* =====================================================
          VIGNETTE
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute inset-0
          z-40
          bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.10)_44%,rgba(0,0,0,0.80)_100%)]
        "
      />

      {/* =====================================================
          GRAIN
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute inset-0
          z-50
          opacity-[0.024]
          [background-image:radial-gradient(rgba(255,255,255,0.8)_0.5px,transparent_0.5px)]
          [background-size:4px_4px]
        "
      />
    </div>
  );
}
