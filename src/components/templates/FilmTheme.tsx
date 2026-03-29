"use client";

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import { X, Copy, Check, ChevronDown } from "lucide-react";

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

function FilmGrain({ strong = false }: { strong?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: strong ? 0.22 : 0.11,
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
        mixBlendMode: "screen",
        animationName: "filmGrainAnim",
        animationDuration: "0.45s",
        animationTimingFunction: "steps(1)",
        animationIterationCount: "infinite",
      } as React.CSSProperties}
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
      initial={{ opacity: 0, y: 45 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.3, delay, ease: [0.22, 1, 0.36, 1] }}
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
        boxShadow: "0 0 0 1px #2a2a2a, 0 0 18px rgba(255,255,255,0.05), 0 0 40px rgba(212,175,55,0.08), 0 18px 70px rgba(0,0,0,0.97)",
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
  const N = Math.max(photos.length, 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
          borderBottom: "1px solid #1c1c1c",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              letterSpacing: "0.45em",
              color: "#505050",
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
              color: "#A0A0A0",
              letterSpacing: "0.18em",
            }}
          >
            {groom} · {bride}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            color: "#888",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid #2a2a2a",
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

      {/* Horizontal swipe gallery */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          overflowX: "scroll",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
          scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"],
          padding: "0 calc(50% - 120px)",
          gap: 20,
        } as React.CSSProperties}
      >
        {Array.from({ length: N }).map((_, i) => (
          <div
            key={i}
            style={{ scrollSnapAlign: "center", flexShrink: 0 }}
          >
            <FilmCard src={photos[i]} index={i} total={N} />
          </div>
        ))}
      </div>

      {/* Swipe hint */}
      <div
        style={{
          textAlign: "center",
          padding: "12px 0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          color: "#383838",
        }}
      >
        <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.3em" }}>← SWIPE →</span>
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

  const serif = "var(--font-nanum), var(--font-serif-kr), 'Apple SD Gothic Neo', serif";
  const sans = "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
  const mono = "monospace";

  const divider: React.CSSProperties = { borderTop: "1px solid #161616" };
  const sp: React.CSSProperties = { padding: preview ? "20px 18px" : "56px 28px" };
  const slabel: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: "0.5em",
    color: "#585858",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: preview ? 14 : 30,
  };

  return (
    <div
      style={{
        background: "#0c0c0c",
        color: "#F0F0F0",
        fontFamily: sans,
        minHeight: "100%",
        position: "relative",
        lineHeight: 1.85,
        letterSpacing: "0.035em",
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
              opacity: 0.9,
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

        {/* Vignette — 세련된 빈티지 비네팅 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.48) 100%)",
          }}
        />
        {/* Bottom gradient for text readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 45%, transparent 65%)",
          }}
        />

        {/* Film grain — Hero에서는 강한 노이즈 적용 */}
        <FilmGrain strong />

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
          {/* Subtle label */}
          <p
            style={{
              fontFamily: mono,
              fontSize: preview ? 7 : 9,
              letterSpacing: "0.65em",
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              marginBottom: preview ? 12 : 22,
            }}
          >
            Wedding Invitation
          </p>

          {/* Gold decorative line */}
          <div
            style={{
              width: 32,
              height: 1,
              background: "rgba(212,175,55,0.5)",
              margin: preview ? "0 auto 10px" : "0 auto 18px",
            }}
          />

          {/* Date — 이름 대신 날짜로 사진 몰입감 강조 */}
          <p
            style={{
              fontFamily: serif,
              fontSize: preview ? 12 : 16,
              fontWeight: 400,
              color: "rgba(240,230,200,0.85)",
              letterSpacing: "0.28em",
              lineHeight: 1.6,
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

      {/* ── § 2  GREETING ────────────────────────────────────────────────── */}
      <section style={{ ...divider, ...sp, textAlign: "center" }}>
        <FadeIn>
          <div style={{
            background: "rgba(20,20,20,0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 14,
            padding: preview ? "14px 16px" : "32px 28px",
            border: "1px solid rgba(255,255,255,0.04)",
          } as React.CSSProperties}>
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
              fontSize: preview ? 12 : 16,
              lineHeight: preview ? 2.3 : 2.8,
              color: "#C8C8C8",
              whiteSpace: "pre-line",
              fontWeight: 400,
              letterSpacing: "0.06em",
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
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: "rgba(184,146,42,0.25)" }} />
            <span style={{ color: "rgba(184,146,42,0.5)", fontSize: preview ? 10 : 13 }}>✦</span>
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: "rgba(184,146,42,0.25)" }} />
          </div>
          </div>
        </FadeIn>
      </section>

      {/* ── § 3  COUPLE INFO (혼주소개) ──────────────────────────────────── */}
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
                  color: "#505050",
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
                  fontSize: preview ? 15 : 22,
                  fontWeight: 400,
                  letterSpacing: "0.2em",
                  color: "#D4AF37",
                  textShadow: "0 0 16px rgba(212,175,55,0.22)",
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
                        fontSize: preview ? 10 : 12,
                        color: "#686868",
                        lineHeight: preview ? 2.0 : 2.3,
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
                        fontSize: preview ? 10 : 12,
                        color: "#686868",
                        lineHeight: preview ? 2.0 : 2.3,
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
                  color: "#505050",
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
                  fontSize: preview ? 15 : 22,
                  fontWeight: 400,
                  letterSpacing: "0.2em",
                  color: "#D4AF37",
                  textShadow: "0 0 16px rgba(212,175,55,0.22)",
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
                        fontSize: preview ? 10 : 12,
                        color: "#686868",
                        lineHeight: preview ? 2.0 : 2.3,
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
                        fontSize: preview ? 10 : 12,
                        color: "#686868",
                        lineHeight: preview ? 2.0 : 2.3,
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

      {/* ── § 4  GALLERY (우리들의 이야기) ──────────────────────────────── */}
      <section style={{ ...divider, ...sp, textAlign: "center" }}>
        <FadeIn>
          <p style={slabel}>Our Story</p>

          {/* Mini film strip — horizontal infinite scroll */}
          {photos.length > 0 && (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: preview ? 110 : 150,
                marginBottom: preview ? 14 : 22,
                overflow: "hidden",
                border: "1px solid #222",
                boxShadow: "0 0 20px rgba(255,255,255,0.03), 0 0 40px rgba(212,175,55,0.05)",
              }}
            >
              {/* Left/right fade mask */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to right, #0c0c0c 0%, transparent 12%, transparent 88%, #0c0c0c 100%)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
              {/* Scrolling film strip wrapper — horizontal */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  height: "100%",
                  ...(
                    !preview
                      ? {
                          animationName: "filmStripScroll",
                          animationDuration: `${Math.max(photos.length * 5, 10)}s`,
                          animationTimingFunction: "linear",
                          animationIterationCount: "infinite",
                        }
                      : {}
                  ),
                } as React.CSSProperties}
              >
                {(preview ? photos.slice(0, 4) : [...photos, ...photos]).map((src, i) => (
                  <div
                    key={i}
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      width: preview ? 72 : 96,
                      height: "100%",
                    }}
                  >
                    <Perforations count={preview ? 4 : 5} />
                    <div
                      style={{
                        position: "relative",
                        flex: 1,
                        margin: "0 4px",
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
                          bottom: 3,
                          right: 4,
                          fontFamily: mono,
                          fontSize: 6,
                          color: "rgba(255,255,255,0.22)",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {String((i % photos.length) + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <Perforations count={preview ? 4 : 5} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* "우리들의 이야기" button / preview badge */}
          {!preview ? (
            <motion.button
              onClick={() => setAlbumOpen(true)}
              whileHover={{ scale: 1.03, borderColor: "#444", color: "#c0c0c0" }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "13px 30px",
                border: "1px solid #383838",
                borderRadius: 999,
                background: "rgba(20,20,20,0.5)",
                color: "#A0A0A0",
                fontSize: 14,
                letterSpacing: "0.22em",
                cursor: "pointer",
                fontFamily: serif,
                fontWeight: 400,
                transition: "border-color 0.25s, color 0.25s",
              }}
            >
              우리들의 이야기
            </motion.button>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 14px",
                border: "1px solid #1e1e1e",
                borderRadius: 999,
                background: "#0f0f0f",
              }}
            >
              <span style={{ fontFamily: mono, fontSize: 8, color: "#606060", letterSpacing: "0.18em" }}>
                🎞
              </span>
              <span
                style={{
                  fontFamily: serif,
                  fontSize: 10,
                  color: "#707070",
                  letterSpacing: "0.18em",
                }}
              >
                {photos.length > 0 ? `우리들의 이야기 · ${photos.length}장` : "우리들의 이야기"}
              </span>
            </div>
          )}
        </FadeIn>
      </section>

      {/* ── § 5  네이버 / 카카오 지도 ─────────────────────────────────────── */}
      <section style={{ ...divider, ...sp }}>
        <FadeIn>
          <p style={slabel}>Ceremony</p>

          {/* Date + Time + Venue big display */}
          <div
            style={{
              textAlign: "center",
              marginBottom: preview ? 14 : 28,
              background: "rgba(20,20,20,0.6)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: 14,
              padding: preview ? "14px 16px" : "28px 24px",
              border: "1px solid rgba(255,255,255,0.04)",
            } as React.CSSProperties}
          >
            <p
              style={{
                fontFamily: serif,
                fontSize: preview ? 13 : 19,
                color: "#D4AF37",
                textShadow: "0 0 16px rgba(212,175,55,0.2)",
                letterSpacing: "0.14em",
                fontWeight: 400,
                marginBottom: 4,
              }}
            >
              {data.date}
            </p>
            <p
              style={{
                fontFamily: serif,
                fontSize: preview ? 11 : 14,
                color: "#888888",
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
                background: "rgba(212,175,55,0.4)",
                margin: "0 auto",
                marginBottom: preview ? 10 : 20,
              }}
            />

            <p
              style={{
                fontFamily: serif,
                fontSize: preview ? 13 : 18,
                color: "#D4AF37",
                textShadow: "0 0 12px rgba(212,175,55,0.15)",
                letterSpacing: "0.12em",
                fontWeight: 400,
                marginBottom: 5,
              }}
            >
              {data.venue}
            </p>
            <p
              style={{
                fontFamily: sans,
                fontSize: preview ? 10 : 12,
                color: "#777777",
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
                  fontWeight: 600,
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
                  fontWeight: 600,
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

      {/* ── § 6  오시는 길 (교통안내) ─────────────────────────────────────── */}
      {(data.transport?.subway || data.transport?.bus || data.transport?.car) && (
        <section style={{ ...divider, ...sp }}>
          <FadeIn>
            <p style={slabel}>오 시 는 길</p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: preview ? 10 : 16,
                background: "rgba(20,20,20,0.6)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: 14,
                padding: preview ? "14px 16px" : "24px 22px",
                border: "1px solid rgba(255,255,255,0.04)",
              } as React.CSSProperties}
            >
              {data.transport?.subway && (
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: preview ? 28 : 36,
                      height: preview ? 28 : 36,
                      flexShrink: 0,
                      background: "#141414",
                      border: "1px solid #282828",
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
                        color: "#505050",
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
                        fontSize: preview ? 11 : 13,
                        color: "#ABABAB",
                        lineHeight: 2.0,
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
                      background: "#141414",
                      border: "1px solid #282828",
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
                        color: "#505050",
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
                        fontSize: preview ? 11 : 13,
                        color: "#ABABAB",
                        lineHeight: 2.0,
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
                      background: "#141414",
                      border: "1px solid #282828",
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
                        color: "#505050",
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
                        fontSize: preview ? 11 : 13,
                        color: "#ABABAB",
                        lineHeight: 2.0,
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

      {/* ── § 7  축의금 안내 — Accounts ─────────────────────────────────── */}
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
                        background: "rgba(18,18,18,0.85)",
                        borderRadius: 12,
                        border: "1px solid #242424",
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
                              color: "#505050",
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
                              color: "#C8C8C8",
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
                              color: "#A0A0A0",
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
                              color: "#666666",
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
            color: "#404040",
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
              color: "#404040",
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
