"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useInView,
} from "framer-motion";
import { X, Copy, Check, MapPin, Calendar, ChevronDown } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AccountInfo {
  bank: string;
  number: string;
  holder: string;
}

export interface ParentInfo {
  fatherName?: string;
  motherName?: string;
  isFatherDeceased?: boolean;
  isMotherDeceased?: boolean;
}

export interface TransportInfo {
  subway?: string;
  bus?: string;
  car?: string;
}

export interface WeddingData {
  groomName: string;
  brideName: string;
  groomParents?: ParentInfo;
  brideParents?: ParentInfo;
  date: string;
  time: string;
  venue: string;
  address: string;
  greeting: string;
  mainImage?: string;
  photos?: string[];
  groomAccount?: AccountInfo;
  brideAccount?: AccountInfo;
  mapEmbedUrl?: string;
  transport?: TransportInfo;
}

// ── Shared Atoms ──────────────────────────────────────────────────────────────

function Perforations({ count = 10 }: { count?: number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 8px",
        background: "#090909",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 9,
            height: 6,
            background: "#141414",
            border: "0.5px solid #1e1e1e",
            borderRadius: 1.5,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function FilmGrain() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.11,
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
        mixBlendMode: "screen",
      }}
    />
  );
}

function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.18 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "7px 13px",
        border: "1px solid #262626",
        borderRadius: 999,
        background: "none",
        color: copied ? "#6ee7b7" : "#555",
        cursor: "pointer",
        fontSize: 11,
        flexShrink: 0,
        transition: "color 0.2s",
        fontFamily: "monospace",
        letterSpacing: "0.04em",
      }}
    >
      {copied ? (
        <>
          <Check size={10} /> 복사됨
        </>
      ) : (
        <>
          <Copy size={10} /> 복사
        </>
      )}
    </button>
  );
}

// ── Film Card (for 3D drum modal) ─────────────────────────────────────────────

function FilmCard({
  src,
  index,
  total,
}: {
  src?: string;
  index: number;
  total: number;
}) {
  return (
    <div
      style={{
        width: 240,
        height: 340,
        background: "#0a0a0a",
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 0 1px #1e1e1e, 0 18px 70px rgba(0,0,0,0.97)",
      }}
    >
      <Perforations count={8} />
      <div
        style={{
          flex: 1,
          margin: "0 8px",
          background: "#111",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={`photo ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.1">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span style={{ fontFamily: "monospace", fontSize: 8, color: "#252525" }}>
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
        <FilmGrain />
      </div>
      <Perforations count={8} />
      {/* Kodak edge */}
      <div
        style={{
          padding: "0 9px 4px",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "monospace",
          fontSize: 7,
          color: "rgba(255,160,0,0.18)",
          letterSpacing: "0.15em",
        }}
      >
        <span>○ {String(index + 1).padStart(2, "0")}</span>
        <span>KODAK 400TX</span>
        <span>{String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")} ▷</span>
      </div>
    </div>
  );
}

// ── Film Album Modal (3D Drum) ─────────────────────────────────────────────────

function FilmAlbum({
  photos,
  groom,
  bride,
  onClose,
}: {
  photos: string[];
  groom: string;
  bride: string;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const N = Math.max(photos.length, 1);
  const ANGLE_PER = 360 / N;
  const RADIUS = 310;

  const { scrollYProgress } = useScroll({ container: containerRef });
  const drumRotateX = useTransform(scrollYProgress, [0, 1], [0, -(N - 1) * ANGLE_PER]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 22px",
          borderBottom: "1px solid #141414",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              letterSpacing: "0.45em",
              color: "#2e2e2e",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Our Story
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif-kr), serif",
              fontSize: 12,
              color: "#303030",
              letterSpacing: "0.18em",
            }}
          >
            {groom} · {bride}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            color: "#444",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid #1e1e1e",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* 3D Drum scroll */}
      <div ref={containerRef} style={{ flex: 1, overflowY: "scroll", position: "relative" }}>
        <div style={{ height: `${N * 720}px` }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "100dvh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              perspective: "1100px",
              perspectiveOrigin: "50% 50%",
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                rotateX: drumRotateX,
                transformStyle: "preserve-3d",
                width: 240,
                height: 340,
                position: "relative",
              }}
            >
              {Array.from({ length: N }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: `rotateX(${i * ANGLE_PER}deg) translateZ(${RADIUS}px)`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  } as React.CSSProperties}
                >
                  <FilmCard src={photos[i]} index={i} total={N} />
                </div>
              ))}
            </motion.div>

            <motion.div
              style={{
                position: "absolute",
                bottom: 28,
                left: "50%",
                x: "-50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                color: "#242424",
                pointerEvents: "none",
              }}
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <ChevronDown size={14} />
              <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.35em" }}>
                SCROLL
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface FilmThemeProps {
  data: WeddingData;
  preview?: boolean;
}

export default function FilmTheme({ data, preview = false }: FilmThemeProps) {
  const [albumOpen, setAlbumOpen] = useState(false);
  const photos = data.photos ?? [];

  const serif = "var(--font-serif-kr), 'Apple SD Gothic Neo', serif";
  const sans = "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
  const mono = "monospace";

  const divider: React.CSSProperties = { borderTop: "1px solid #161616" };
  const sp: React.CSSProperties = { padding: preview ? "20px 18px" : "56px 28px" };
  const slabel: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: "0.45em",
    color: "#282828",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: preview ? 12 : 26,
  };

  return (
    <div
      style={{
        background: "#0c0c0c",
        color: "#d8d8d8",
        fontFamily: sans,
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* ── § 1  HERO ────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          height: preview ? 260 : "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Film perforations — top */}
        {!preview && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3 }}>
            <Perforations count={12} />
          </div>
        )}

        {/* Background */}
        {data.mainImage ? (
          <img
            src={data.mainImage}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.52,
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(158deg, #1a1a18 0%, #0c0c0a 55%, #111 100%)",
            }}
          />
        )}

        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 18%, rgba(0,0,0,0.84) 100%)",
          }}
        />

        {/* Film grain */}
        <FilmGrain />

        {/* Film edge numbers */}
        {!preview && (
          <>
            <div
              style={{
                position: "absolute",
                top: 36,
                left: 18,
                zIndex: 2,
                fontFamily: mono,
                fontSize: 8,
                color: "#1e1e1e",
                letterSpacing: "0.22em",
              }}
            >
              KODAK · 400TX
            </div>
            <div
              style={{
                position: "absolute",
                top: 36,
                right: 18,
                zIndex: 2,
                fontFamily: mono,
                fontSize: 8,
                color: "#1e1e1e",
                letterSpacing: "0.22em",
              }}
            >
              ▷ 01
            </div>
          </>
        )}

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: preview ? "0 16px 20px" : "0 28px 88px",
            width: "100%",
          }}
        >
          <p
            style={{
              fontFamily: mono,
              fontSize: 8,
              letterSpacing: "0.55em",
              color: "#242424",
              textTransform: "uppercase",
              marginBottom: preview ? 10 : 18,
            }}
          >
            Wedding Invitation
          </p>
          <h1
            style={{
              fontFamily: serif,
              fontSize: preview ? 21 : 38,
              fontWeight: 300,
              letterSpacing: "0.2em",
              color: "#f0f0f0",
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            {data.groomName || "신랑"}
            <span
              style={{
                color: "#282828",
                margin: "0 8px",
                fontSize: "0.72em",
                fontWeight: 200,
              }}
            >
              ·
            </span>
            {data.brideName || "신부"}
          </h1>

          {/* Gold line */}
          <div
            style={{
              width: 26,
              height: 1,
              background: "rgba(184,146,42,0.45)",
              margin: preview ? "9px auto" : "16px auto",
            }}
          />

          <p
            style={{
              fontFamily: serif,
              fontSize: preview ? 10 : 13,
              color: "#484848",
              letterSpacing: "0.2em",
            }}
          >
            {data.date}
          </p>
        </div>

        {/* Film perforations — bottom */}
        {!preview && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3 }}>
            <Perforations count={12} />
          </div>
        )}

        {/* Scroll hint */}
        {!preview && (
          <motion.div
            style={{
              position: "absolute",
              bottom: 30,
              left: "50%",
              x: "-50%",
              color: "#242424",
              zIndex: 4,
            }}
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown size={16} />
          </motion.div>
        )}
      </section>

      {/* ── § 2  BRIEF INTRO ────────────────────────────────────────────── */}
      <section
        style={{
          ...divider,
          padding: preview ? "16px 18px" : "44px 28px",
          textAlign: "center",
        }}
      >
        <FadeIn>
          <p style={slabel}>Date & Venue</p>
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              gap: preview ? 7 : 12,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Calendar size={preview ? 10 : 12} color="#323232" />
              <span
                style={{
                  fontFamily: serif,
                  fontSize: preview ? 11 : 14,
                  color: "#c0c0c0",
                  letterSpacing: "0.1em",
                }}
              >
                {data.date}&nbsp;&nbsp;{data.time}
              </span>
            </div>
            <div style={{ width: 1, height: preview ? 8 : 14, background: "#1e1e1e" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <MapPin size={preview ? 10 : 12} color="#323232" />
              <span
                style={{
                  fontFamily: serif,
                  fontSize: preview ? 11 : 14,
                  color: "#787878",
                  letterSpacing: "0.08em",
                }}
              >
                {data.venue}
              </span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── § 3  GREETING ────────────────────────────────────────────────── */}
      <section style={{ ...divider, ...sp, textAlign: "center" }}>
        <FadeIn>
          <p style={slabel}>Greeting</p>
          {/* Decorative top flourish */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "center",
              marginBottom: preview ? 12 : 22,
            }}
          >
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: "rgba(184,146,42,0.2)" }} />
            <span style={{ color: "rgba(184,146,42,0.4)", fontSize: preview ? 10 : 13 }}>✦</span>
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: "rgba(184,146,42,0.2)" }} />
          </div>

          <p
            style={{
              fontFamily: serif,
              fontSize: preview ? 11 : 15,
              lineHeight: preview ? 2.2 : 2.6,
              color: "#747474",
              whiteSpace: "pre-line",
              fontWeight: 300,
              letterSpacing: "0.05em",
            }}
          >
            {data.greeting || "두 사람이 하나가 되는 날,\n소중한 자리에 함께해 주세요."}
          </p>

          {/* Decorative bottom flourish */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "center",
              marginTop: preview ? 12 : 22,
            }}
          >
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: "rgba(184,146,42,0.2)" }} />
            <span style={{ color: "rgba(184,146,42,0.4)", fontSize: preview ? 10 : 13 }}>✦</span>
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: "rgba(184,146,42,0.2)" }} />
          </div>
        </FadeIn>
      </section>

      {/* ── § 4  COUPLE INFO ─────────────────────────────────────────────── */}
      <section style={{ ...divider, ...sp }}>
        <FadeIn>
          <p style={slabel}>The Couple</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 0,
              alignItems: "start",
            }}
          >
            {/* Groom */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 8,
                  color: "#242424",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: preview ? 5 : 8,
                }}
              >
                신랑
              </p>
              <p
                style={{
                  fontFamily: serif,
                  fontSize: preview ? 14 : 20,
                  fontWeight: 300,
                  letterSpacing: "0.18em",
                  color: "#d4d4d4",
                  marginBottom: preview ? 5 : 10,
                }}
              >
                {data.groomName}
              </p>
              {data.groomParents && (
                <div>
                  {data.groomParents.fatherName && (
                    <p
                      style={{
                        fontFamily: serif,
                        fontSize: preview ? 9 : 11,
                        color: "#333",
                        lineHeight: preview ? 1.8 : 2.1,
                      }}
                    >
                      {data.groomParents.isFatherDeceased && (
                        <span style={{ color: "#383838" }}>故 </span>
                      )}
                      {data.groomParents.fatherName}의 아들
                    </p>
                  )}
                  {data.groomParents.motherName && (
                    <p
                      style={{
                        fontFamily: serif,
                        fontSize: preview ? 9 : 11,
                        color: "#333",
                        lineHeight: preview ? 1.8 : 2.1,
                      }}
                    >
                      {data.groomParents.isMotherDeceased && (
                        <span style={{ color: "#383838" }}>故 </span>
                      )}
                      {data.groomParents.motherName}의 아들
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Center divider */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: `${preview ? 14 : 22}px 14px 0`,
              }}
            >
              <div style={{ width: 1, height: preview ? 18 : 26, background: "#1e1e1e" }} />
              <span
                style={{
                  fontFamily: serif,
                  color: "#303030",
                  fontSize: preview ? 13 : 18,
                  margin: "5px 0",
                }}
              >
                ∞
              </span>
              <div style={{ width: 1, height: preview ? 18 : 26, background: "#1e1e1e" }} />
            </div>

            {/* Bride */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 8,
                  color: "#242424",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: preview ? 5 : 8,
                }}
              >
                신부
              </p>
              <p
                style={{
                  fontFamily: serif,
                  fontSize: preview ? 14 : 20,
                  fontWeight: 300,
                  letterSpacing: "0.18em",
                  color: "#d4d4d4",
                  marginBottom: preview ? 5 : 10,
                }}
              >
                {data.brideName}
              </p>
              {data.brideParents && (
                <div>
                  {data.brideParents.fatherName && (
                    <p
                      style={{
                        fontFamily: serif,
                        fontSize: preview ? 9 : 11,
                        color: "#333",
                        lineHeight: preview ? 1.8 : 2.1,
                      }}
                    >
                      {data.brideParents.isFatherDeceased && (
                        <span style={{ color: "#383838" }}>故 </span>
                      )}
                      {data.brideParents.fatherName}의 딸
                    </p>
                  )}
                  {data.brideParents.motherName && (
                    <p
                      style={{
                        fontFamily: serif,
                        fontSize: preview ? 9 : 11,
                        color: "#333",
                        lineHeight: preview ? 1.8 : 2.1,
                      }}
                    >
                      {data.brideParents.isMotherDeceased && (
                        <span style={{ color: "#383838" }}>故 </span>
                      )}
                      {data.brideParents.motherName}의 딸
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── § 5  VENUE & MAP ──────────────────────────────────────────────── */}
      <section style={{ ...divider, ...sp }}>
        <FadeIn>
          <p style={slabel}>Ceremony</p>

          {/* Date + Time + Venue big display */}
          <div
            style={{
              textAlign: "center",
              marginBottom: preview ? 14 : 28,
            }}
          >
            <p
              style={{
                fontFamily: serif,
                fontSize: preview ? 13 : 19,
                color: "#c4c4c4",
                letterSpacing: "0.14em",
                fontWeight: 300,
                marginBottom: 4,
              }}
            >
              {data.date}
            </p>
            <p
              style={{
                fontFamily: serif,
                fontSize: preview ? 11 : 14,
                color: "#4e4e4e",
                letterSpacing: "0.12em",
                marginBottom: preview ? 10 : 20,
              }}
            >
              {data.time}
            </p>

            {/* Gold rule */}
            <div
              style={{
                width: 24,
                height: 1,
                background: "rgba(184,146,42,0.35)",
                margin: "0 auto",
                marginBottom: preview ? 10 : 20,
              }}
            />

            <p
              style={{
                fontFamily: serif,
                fontSize: preview ? 13 : 18,
                color: "#b0b0b0",
                letterSpacing: "0.12em",
                marginBottom: 5,
              }}
            >
              {data.venue}
            </p>
            <p
              style={{
                fontFamily: sans,
                fontSize: preview ? 10 : 12,
                color: "#3a3a3a",
                letterSpacing: "0.04em",
              }}
            >
              {data.address}
            </p>
          </div>

          {/* Map embed or placeholder */}
          {data.mapEmbedUrl ? (
            <iframe
              src={data.mapEmbedUrl}
              style={{
                width: "100%",
                height: preview ? 120 : 200,
                border: "none",
                display: "block",
                borderRadius: 8,
                filter: "grayscale(1) invert(0.88) brightness(0.78)",
              }}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                height: preview ? 90 : 160,
                background: "#0f0f0f",
                borderRadius: 8,
                border: "1px solid #181818",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1e1e1e",
                fontSize: 10,
                fontFamily: mono,
                letterSpacing: "0.14em",
              }}
            >
              지도 미등록
            </div>
          )}

          {/* Naver + Kakao navigation buttons */}
          {!preview && (
            <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
              <a
                href={`https://map.naver.com/v5/search/${encodeURIComponent(
                  data.venue || data.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "12px 0",
                  background: "#03C75A",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: sans,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  fontWeight: 500,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                네이버 지도
              </a>
              <a
                href={`https://map.kakao.com/?q=${encodeURIComponent(
                  data.venue || data.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "12px 0",
                  background: "#FEE500",
                  borderRadius: 10,
                  color: "#3C1E1E",
                  fontSize: 13,
                  fontFamily: sans,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  fontWeight: 500,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 3C6.48 3 2 6.92 2 11.77c0 3.1 1.73 5.83 4.37 7.49-.19.65-.68 2.34-.78 2.7-.12.44.16.44.34.32.14-.1 1.89-1.24 2.66-1.74.78.1 1.58.16 2.41.16 5.52 0 10-3.92 10-8.77C22 6.92 17.52 3 12 3z" />
                </svg>
                카카오내비
              </a>
            </div>
          )}
        </FadeIn>
      </section>

      {/* ── § 6  TRANSPORT ───────────────────────────────────────────────── */}
      {(data.transport?.subway || data.transport?.bus || data.transport?.car) && (
        <section style={{ ...divider, ...sp }}>
          <FadeIn>
            <p style={slabel}>오 시 는 길</p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: preview ? 10 : 16,
              }}
            >
              {data.transport?.subway && (
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: preview ? 28 : 36,
                      height: preview ? 28 : 36,
                      flexShrink: 0,
                      background: "#0f0f0f",
                      border: "1px solid #1c1c1c",
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: preview ? 13 : 17,
                    }}
                  >
                    🚇
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: mono,
                        fontSize: 8,
                        color: "#262626",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 5,
                      }}
                    >
                      지하철
                    </p>
                    <p
                      style={{
                        fontFamily: sans,
                        fontSize: preview ? 10 : 12,
                        color: "#525252",
                        lineHeight: 1.85,
                      }}
                    >
                      {data.transport.subway}
                    </p>
                  </div>
                </div>
              )}

              {data.transport?.bus && (
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: preview ? 28 : 36,
                      height: preview ? 28 : 36,
                      flexShrink: 0,
                      background: "#0f0f0f",
                      border: "1px solid #1c1c1c",
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: preview ? 13 : 17,
                    }}
                  >
                    🚌
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: mono,
                        fontSize: 8,
                        color: "#262626",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 5,
                      }}
                    >
                      버스
                    </p>
                    <p
                      style={{
                        fontFamily: sans,
                        fontSize: preview ? 10 : 12,
                        color: "#525252",
                        lineHeight: 1.85,
                      }}
                    >
                      {data.transport.bus}
                    </p>
                  </div>
                </div>
              )}

              {data.transport?.car && (
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: preview ? 28 : 36,
                      height: preview ? 28 : 36,
                      flexShrink: 0,
                      background: "#0f0f0f",
                      border: "1px solid #1c1c1c",
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: preview ? 13 : 17,
                    }}
                  >
                    🚗
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: mono,
                        fontSize: 8,
                        color: "#262626",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 5,
                      }}
                    >
                      자가용
                    </p>
                    <p
                      style={{
                        fontFamily: sans,
                        fontSize: preview ? 10 : 12,
                        color: "#525252",
                        lineHeight: 1.85,
                      }}
                    >
                      {data.transport.car}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </section>
      )}

      {/* ── § 7  GALLERY ─────────────────────────────────────────────────── */}
      <section style={{ ...divider, ...sp, textAlign: "center" }}>
        <FadeIn>
          <p style={slabel}>Our Story</p>

          {/* Mini film strip preview (full mode only) */}
          {!preview && photos.length > 0 && (
            <div
              style={{
                position: "relative",
                width: 170,
                margin: "0 auto",
                marginBottom: 22,
                overflow: "hidden",
                border: "1px solid #191919",
              }}
            >
              {/* Top/bottom fade mask */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, #0c0c0c 0%, transparent 22%, transparent 78%, #0c0c0c 100%)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
              {photos.slice(0, 3).map((src, i) => (
                <div key={i}>
                  <Perforations count={6} />
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      margin: "0 7px",
                      overflow: "hidden",
                      background: "#111",
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <FilmGrain />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 4,
                        right: 6,
                        fontFamily: mono,
                        fontSize: 7,
                        color: "rgba(255,255,255,0.22)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <Perforations count={6} />
                </div>
              ))}
            </div>
          )}

          {/* "우리들의 이야기" button */}
          {!preview ? (
            <motion.button
              onClick={() => setAlbumOpen(true)}
              whileHover={{ scale: 1.03, borderColor: "#444", color: "#c0c0c0" }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "13px 30px",
                border: "1px solid #282828",
                borderRadius: 999,
                background: "none",
                color: "#707070",
                fontSize: 13,
                letterSpacing: "0.22em",
                cursor: "pointer",
                fontFamily: serif,
                transition: "border-color 0.25s, color 0.25s",
              }}
            >
              우리들의 이야기
            </motion.button>
          ) : (
            <p
              style={{
                fontFamily: serif,
                fontSize: 11,
                color: "#282828",
                letterSpacing: "0.18em",
              }}
            >
              {photos.length > 0 ? `${photos.length}장의 이야기` : "— 사진을 추가해 주세요 —"}
            </p>
          )}
        </FadeIn>
      </section>

      {/* ── § 8  ACCOUNTS ────────────────────────────────────────────────── */}
      {(data.groomAccount || data.brideAccount) && (
        <section style={{ ...divider, ...sp }}>
          <FadeIn>
            <p style={slabel}>마음 전하실 곳</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { account: data.groomAccount, label: "신랑측" },
                { account: data.brideAccount, label: "신부측" },
              ].map(
                ({ account, label }) =>
                  account && (
                    <div
                      key={label}
                      style={{
                        background: "#0f0f0f",
                        borderRadius: 12,
                        border: "1px solid #181818",
                        padding: preview ? "12px 14px" : "16px 18px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontFamily: mono,
                              fontSize: 8,
                              color: "#242424",
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                              marginBottom: 6,
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontFamily: serif,
                              fontSize: preview ? 11 : 14,
                              color: "#a8a8a8",
                              letterSpacing: "0.06em",
                              marginBottom: 3,
                            }}
                          >
                            {account.bank}
                          </p>
                          <p
                            style={{
                              fontFamily: mono,
                              fontSize: preview ? 10 : 13,
                              color: "#787878",
                              letterSpacing: "0.05em",
                              marginBottom: 3,
                            }}
                          >
                            {account.number}
                          </p>
                          <p
                            style={{
                              fontFamily: serif,
                              fontSize: preview ? 9 : 11,
                              color: "#383838",
                            }}
                          >
                            {account.holder}
                          </p>
                        </div>
                        {!preview && <CopyButton text={account.number} />}
                      </div>
                    </div>
                  )
              )}
            </div>
          </FadeIn>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          ...divider,
          padding: preview ? "18px 0" : "36px 0",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: mono,
            fontSize: 8,
            color: "#1a1a1a",
            letterSpacing: "0.55em",
            textTransform: "uppercase",
          }}
        >
          Toast Wedding
        </p>
        {!preview && (
          <p
            style={{
              fontFamily: serif,
              fontSize: 11,
              color: "#1e1e1e",
              letterSpacing: "0.12em",
              marginTop: 7,
            }}
          >
            {data.groomName} · {data.brideName}
          </p>
        )}
      </footer>

      {/* ── FILM ALBUM MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {albumOpen && (
          <FilmAlbum
            photos={photos}
            groom={data.groomName}
            bride={data.brideName}
            onClose={() => setAlbumOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
