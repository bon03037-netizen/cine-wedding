"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  photos: string[];
  onComplete: () => void;
  /** true: position:absolute (프리뷰 폰 프레임 내부용) */
  contained?: boolean;
}

const PERFS_PER_FRAME = 5;

// ── 뮤직 플레이어 오버레이 ─────────────────────────────────────────────────────

function MusicPlayerOverlay({ scriptText }: { scriptText: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "10px 12px 12px",
        background:
          "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
      }}
    >
      {/* Heart outline — top-right */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 12,
        }}
      >
        <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
          <path
            d="M14 23.5C14 23.5 2 15.5 2 7.5C2 4.46 4.46 2 7.5 2C9.76 2 11.72 3.32 12.74 5.24C13.26 6.2 14.74 6.2 15.26 5.24C16.28 3.32 18.24 2 20.5 2C23.54 2 26 4.46 26 7.5C26 15.5 14 23.5 14 23.5Z"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Heartbeat line — middle */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <svg width="80%" height="20" viewBox="0 0 200 20" fill="none">
          <polyline
            points="0,10 30,10 40,2 50,18 60,2 70,14 80,10 110,10 120,5 130,15 140,10 200,10"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Script text */}
      <p
        style={{
          fontFamily: "'Dancing Script', 'Segoe Script', cursive",
          fontSize: 17,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.02em",
          marginBottom: 8,
          textShadow: "0 1px 8px rgba(0,0,0,0.6)",
          lineHeight: 1.2,
        }}
      >
        {scriptText}
      </p>

      {/* Progress bar */}
      <div
        style={{
          position: "relative",
          height: 2,
          background: "rgba(255,255,255,0.25)",
          borderRadius: 2,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: "38%",
            height: "100%",
            background: "rgba(255,255,255,0.9)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "38%",
            transform: "translate(-50%, -50%)",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 4px rgba(255,255,255,0.6)",
          }}
        />
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {/* Repeat */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        {/* Prev */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
          <polygon points="19,20 9,12 19,4" />
          <line x1="5" y1="19" x2="5" y2="5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Play/Pause circle */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        </div>
        {/* Next */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
          <polygon points="5,4 15,12 5,20" />
          <line x1="19" y1="5" x2="19" y2="19" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Shuffle */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
        </svg>
      </div>
    </div>
  );
}

// ── 필름 스트립 한 줄 ──────────────────────────────────────────────────────────

function FilmStrip({
  photos,
  animDuration,
  reversed = false,
  showOverlay = false,
}: {
  photos: string[];
  animDuration: number;
  reversed?: boolean;
  showOverlay?: boolean;
}) {
  const MIN = 8;
  const reps = Math.max(1, Math.ceil(MIN / photos.length));
  const frames = Array.from({ length: reps }, () => photos).flat();
  const doubled = [...frames, ...frames];

  const FRAME_W = 170;
  const PHOTO_H = 210;
  const PERF_H = 16;

  const perfHole = {
    width: 11,
    height: 7,
    borderRadius: 2,
    backgroundColor: "#000",
    border: "0.5px solid #3a3a3a",
    boxShadow:
      "0 0 4px rgba(255,255,255,0.18), inset 0 1px 2px rgba(255,255,255,0.06)",
  } as const;

  const perfBar = {
    height: PERF_H,
    backgroundColor: "#141414",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "0 8px",
    flexShrink: 0,
    position: "relative" as const,
  } as const;

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        flexShrink: 0,
        backgroundColor: "#0c0c0c",
        borderTop: "1px solid #282828",
        borderBottom: "1px solid #282828",
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
        {doubled.map((photo, i) => {
          const isOverlayFrame = showOverlay && i % 2 === 1;
          return (
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
                    letterSpacing: "0.1em",
                    color: "rgba(255,210,80,0.55)",
                    fontFamily: "monospace",
                    userSelect: "none",
                    pointerEvents: "none",
                    textShadow: "0 0 5px rgba(255,200,60,0.35)",
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
                  position: "relative",
                  borderRadius: isOverlayFrame ? "0 0 0 0" : 0,
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
                    filter: "brightness(0.82) contrast(1.08) saturate(0.78)",
                  }}
                />
                {/* Film grain */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.06,
                    pointerEvents: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' /%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    mixBlendMode: "overlay",
                  } as React.CSSProperties}
                />
                {/* 뮤직 플레이어 오버레이 */}
                {isOverlayFrame && (
                  <MusicPlayerOverlay scriptText="We are getting married!" />
                )}
              </div>

              {/* 아래 퍼포레이션 */}
              <div style={perfBar}>
                {Array.from({ length: PERFS_PER_FRAME }).map((_, j) => (
                  <div key={j} style={perfHole} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

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
      {/* 상단 라벨 바 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 32,
          backgroundColor: "#0a0a0a",
          borderBottom: "1px solid #222",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.18em",
          }}
        >
          21A
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.18em",
          }}
        >
          MONOFILM A601
        </span>
      </div>

      {/* 3줄 필름 스트립 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          paddingTop: 32,
          paddingBottom: 32,
        }}
      >
        <FilmStrip photos={photos} animDuration={22} showOverlay />
        <FilmStrip photos={[...photos].reverse()} animDuration={30} reversed showOverlay />
        <FilmStrip photos={photos} animDuration={18} showOverlay={false} />
      </div>

      {/* 하단 라벨 바 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 32,
          backgroundColor: "#0a0a0a",
          borderTop: "1px solid #222",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.22em",
          }}
        >
          ► 26
        </span>
      </div>

      {/* 비네트 오버레이 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.88) 100%)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* 필름 그레인 */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "110%",
          height: "110%",
          top: "-5%",
          left: "-5%",
          opacity: 0.2,
          pointerEvents: "none",
          mixBlendMode: "screen",
          animation: "filmGrainDrift 10s ease-in-out infinite",
          zIndex: 6,
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
