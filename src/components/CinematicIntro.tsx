"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  photos: string[];
  onComplete: () => void;
  /** true: position:absolute (프리뷰 폰 프레임 내부용, 부모에 position:relative 필요) */
  contained?: boolean;
}

const PERFS = 3; // 프레임당 퍼포레이션 개수

function FilmStrip({
  photos,
  animDuration,
}: {
  photos: string[];
  animDuration: number;
}) {
  // 최소 8프레임 확보 (사진이 적을 경우 반복)
  const MIN = 8;
  const reps = Math.max(1, Math.ceil(MIN / photos.length));
  const frames = Array.from({ length: reps }, () => photos).flat();
  const doubled = [...frames, ...frames]; // seamless loop용 2배

  const PHOTO_W = 130;
  const PHOTO_H = 105;
  const PERF_W = 13;

  return (
    <div
      style={{
        width: PHOTO_W + PERF_W * 2,
        flexShrink: 0,
        overflow: "hidden",
        backgroundColor: "#111",
      }}
    >
      <div
        style={{
          animation: `filmRollUp ${animDuration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((photo, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              borderBottom: "2px solid #000",
            }}
          >
            {/* 왼쪽 퍼포레이션 */}
            <div
              style={{
                width: PERF_W,
                flexShrink: 0,
                height: PHOTO_H,
                backgroundColor: "#1c1c1c",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "6px 0",
              }}
            >
              {Array.from({ length: PERFS }).map((_, j) => (
                <div
                  key={j}
                  style={{
                    width: 7,
                    height: 6,
                    borderRadius: 1.5,
                    backgroundColor: "#000",
                    boxShadow: "inset 0 0 2px rgba(255,255,255,0.06)",
                  }}
                />
              ))}
            </div>

            {/* 사진 */}
            <div
              style={{
                width: PHOTO_W,
                height: PHOTO_H,
                overflow: "hidden",
                backgroundColor: "#0a0a0a",
                flexShrink: 0,
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
                  display: "block",
                }}
              />
            </div>

            {/* 오른쪽 퍼포레이션 */}
            <div
              style={{
                width: PERF_W,
                flexShrink: 0,
                height: PHOTO_H,
                backgroundColor: "#1c1c1c",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "6px 0",
              }}
            >
              {Array.from({ length: PERFS }).map((_, j) => (
                <div
                  key={j}
                  style={{
                    width: 7,
                    height: 6,
                    borderRadius: 1.5,
                    backgroundColor: "#000",
                    boxShadow: "inset 0 0 2px rgba(255,255,255,0.06)",
                  }}
                />
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
    const t1 = setTimeout(() => setFading(true), 2600);
    const t2 = setTimeout(() => complete(), 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [complete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: contained ? "absolute" : "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* 3줄 필름 스트립 — 각기 다른 속도로 위로 스크롤 */}
      <FilmStrip photos={photos} animDuration={1.0} />
      <FilmStrip photos={[...photos].reverse()} animDuration={1.4} />
      <FilmStrip photos={photos} animDuration={0.85} />

      {/* 비네트 오버레이 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 필름 그레인 */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.06,
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }}
      >
        <filter id="ci-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#ci-grain)" />
      </svg>
    </motion.div>
  );
}
