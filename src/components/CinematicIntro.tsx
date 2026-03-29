"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  photos: string[];
  onComplete: () => void;
  /** true: position:absolute (프리뷰 폰 프레임 내부용, 부모에 position:relative 필요) */
  contained?: boolean;
}

const PERFS_PER_FRAME = 5; // 프레임당 퍼포레이션 개수

function FilmStrip({
  photos,
  animDuration,
  reversed = false,
}: {
  photos: string[];
  animDuration: number;
  reversed?: boolean;
}) {
  // 최소 10프레임 확보 (사진이 적을 경우 반복)
  const MIN = 10;
  const reps = Math.max(1, Math.ceil(MIN / photos.length));
  const frames = Array.from({ length: reps }, () => photos).flat();
  const doubled = [...frames, ...frames]; // seamless loop용 2배

  const FRAME_W = 160;
  const PHOTO_H = 200; // 4:5 세로형 고정 (160×200)
  const PERF_H = 18;

  const perfHole = {
    width: 12,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#000",
    border: "0.5px solid #3e3e3e",
    boxShadow:
      "0 0 5px rgba(255,255,255,0.22), 0 0 2px rgba(255,215,90,0.14), inset 0 1px 2px rgba(255,255,255,0.07)",
  } as const;

  const perfBar = {
    height: PERF_H,
    backgroundColor: "#161616",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "0 10px",
    flexShrink: 0,
  } as const;

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        flexShrink: 0,
        backgroundColor: "#0c0c0c",
        borderTop: "1px solid #2e2e2e",
        borderBottom: "1px solid #2e2e2e",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          animation: `filmRollLeft ${animDuration}s linear infinite${reversed ? " reverse" : ""}`,
          willChange: "transform",
        }}
      >
        {doubled.map((photo, i) => (
          <div
            key={i}
            style={{
              width: FRAME_W,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              borderRight: "2px solid #050505",
            }}
          >
            {/* Kodak 에지 텍스트 + 위 퍼포레이션 */}
            <div style={perfBar}>
              <span
                style={{
                  position: "absolute",
                  fontSize: 7,
                  letterSpacing: "0.12em",
                  color: "rgba(255,210,80,0.65)",
                  fontFamily: "monospace",
                  userSelect: "none",
                  pointerEvents: "none",
                  textShadow: "0 0 6px rgba(255,200,60,0.4)",
                }}
              >
                KODAK 400TX ▲ {(i % frames.length) + 1}
              </span>
              {Array.from({ length: PERFS_PER_FRAME }).map((_, j) => (
                <div key={j} style={perfHole} />
              ))}
            </div>

            {/* 사진 */}
            <div
              style={{
                width: FRAME_W,
                height: PHOTO_H,
                overflow: "hidden",
                flexShrink: 0,
                backgroundColor: "#0a0a0a",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 25%",
                  display: "block",
                  filter: "brightness(0.85) contrast(1.1) saturate(0.8)",
                }}
              />
            </div>

            {/* 아래 퍼포레이션 */}
            <div style={perfBar}>
              {Array.from({ length: PERFS_PER_FRAME }).map((_, j) => (
                <div key={j} style={perfHole} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CinematicIntro({
  photos,
  onComplete,
  contained = false,
}: Props) {
  const [fading, setFading] = useState(false);

  const complete = useCallback(() => onComplete(), [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 5000);
    const t2 = setTimeout(() => complete(), 6200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [complete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={{
        position: contained ? "absolute" : "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#080808",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* 3줄 필름 스트립 — 가로 방향, 각기 다른 속도 */}
      <FilmStrip photos={photos} animDuration={20} />
      <div style={{ height: 8, backgroundColor: "#080808", flexShrink: 0 }} />
      <FilmStrip photos={[...photos].reverse()} animDuration={28} reversed />
      <div style={{ height: 8, backgroundColor: "#080808", flexShrink: 0 }} />
      <FilmStrip photos={photos} animDuration={16} />

      {/* 비네트 오버레이 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,0.92) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 필름 그레인 — 강화 (질감 강조, 깜빡임 없음) */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "110%",
          height: "110%",
          top: "-5%",
          left: "-5%",
          opacity: 0.22,
          pointerEvents: "none",
          mixBlendMode: "screen",
          animation: "filmGrainDrift 10s ease-in-out infinite",
        }}
      >
        <filter id="ci-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.58"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ci-grain)" />
      </svg>
    </motion.div>
  );
}
