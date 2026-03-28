"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
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

// ── Film Perforations ─────────────────────────────────────────────────────────

function Perforations() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 6px",
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 5,
            background: "#111",
            border: "0.5px solid #2a2a2a",
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// ── Film Card ─────────────────────────────────────────────────────────────────

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
        background: "#0c0c0c",
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 0 1px #1f1f1f, 0 16px 60px rgba(0,0,0,0.95)",
      }}
    >
      <Perforations />

      {/* Photo — 3:4 */}
      <div
        style={{
          flex: 1,
          margin: "0 8px",
          background: "#1a1a1a",
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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e2e2e" strokeWidth="1.2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "#2e2e2e" }}>
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      <Perforations />

      <div
        style={{
          padding: "0 8px 5px",
          textAlign: "right",
          fontFamily: "monospace",
          fontSize: 8,
          color: "#252525",
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
}

// ── Film Album (3D Drum) ──────────────────────────────────────────────────────

function FilmAlbum({ photos, onClose }: { photos: string[]; onClose: () => void }) {
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
          padding: "16px 20px",
          borderBottom: "1px solid #181818",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            letterSpacing: "0.35em",
            color: "#3a3a3a",
            textTransform: "uppercase",
          }}
        >
          Our Story
        </span>
        <button
          onClick={onClose}
          style={{ color: "#444", background: "none", border: "none", cursor: "pointer", display: "flex" }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable container */}
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
            {/* 3D Drum */}
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

            {/* Scroll hint */}
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
                color: "#2e2e2e",
                pointerEvents: "none",
              }}
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <ChevronDown size={15} />
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

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        border: "1px solid #252525",
        borderRadius: 999,
        background: "none",
        color: copied ? "#6ee7b7" : "#555",
        cursor: "pointer",
        fontSize: 11,
        flexShrink: 0,
        transition: "color 0.2s",
      }}
    >
      {copied ? (
        <><Check size={10} /> 복사됨</>
      ) : (
        <><Copy size={10} /> 복사</>
      )}
    </button>
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

  const divider: React.CSSProperties = { borderTop: "1px solid #181818" };
  const sectionPad: React.CSSProperties = {
    padding: preview ? "20px 20px" : "56px 28px",
  };
  const sectionLabel: React.CSSProperties = {
    fontSize: 9,
    letterSpacing: "0.35em",
    color: "#303030",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: preview ? 14 : 28,
    fontFamily: mono,
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
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          height: preview ? 260 : "100svh",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* BG */}
        {data.mainImage ? (
          <img
            src={data.mainImage}
            alt=""
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.5,
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(155deg, #181818 0%, #0c0c0c 55%, #111 100%)",
            }}
          />
        )}
        {/* Vignette */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.8) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative", zIndex: 1,
            textAlign: "center",
            padding: preview ? "0 16px 20px" : "0 28px 90px",
          }}
        >
          <p style={{ fontSize: 9, letterSpacing: "0.45em", color: "#3a3a3a", textTransform: "uppercase", marginBottom: 14, fontFamily: mono }}>
            Wedding Invitation
          </p>
          <h1
            style={{
              fontSize: preview ? 20 : 34,
              fontWeight: 300,
              letterSpacing: "0.18em",
              color: "#efefef",
              fontFamily: serif,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {data.groomName || "신랑"}
            <span style={{ color: "#3a3a3a", margin: "0 10px", fontWeight: 200 }}>&</span>
            {data.brideName || "신부"}
          </h1>
          <p style={{ fontSize: preview ? 10 : 12, color: "#555", marginTop: 12, letterSpacing: "0.2em" }}>
            {data.date}
          </p>
          <p style={{ fontSize: preview ? 9 : 11, color: "#383838", marginTop: 4, letterSpacing: "0.12em" }}>
            {data.venue}
          </p>

          {photos.length > 0 && !preview && (
            <motion.button
              onClick={() => setAlbumOpen(true)}
              whileHover={{ scale: 1.04, borderColor: "#666", color: "#bbb" }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginTop: 32,
                padding: "10px 26px",
                border: "1px solid #2e2e2e",
                borderRadius: 999,
                background: "none",
                color: "#888",
                fontSize: 12,
                letterSpacing: "0.2em",
                cursor: "pointer",
                fontFamily: sans,
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              우리들의 이야기
            </motion.button>
          )}
        </div>

        {/* Scroll arrow */}
        {!preview && (
          <motion.div
            style={{ position: "absolute", bottom: 28, left: "50%", x: "-50%", color: "#2e2e2e" }}
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown size={16} />
          </motion.div>
        )}
      </section>

      {/* ── GREETING ─────────────────────────────────────────── */}
      <section style={{ ...divider, ...sectionPad, textAlign: "center" }}>
        <p
          style={{
            fontSize: preview ? 11 : 14,
            lineHeight: 2.4,
            color: "#888",
            whiteSpace: "pre-line",
            fontFamily: serif,
            fontWeight: 300,
          }}
        >
          {data.greeting || "두 사람이 하나가 되는 날,\n소중한 자리에 함께해 주세요."}
        </p>
      </section>

      {/* ── COUPLE INFO ──────────────────────────────────────── */}
      <section style={{ ...divider, ...sectionPad }}>
        <p style={sectionLabel}>The Couple</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "center" }}>
          {(["groom", "bride"] as const).map((side) => {
            const name = side === "groom" ? data.groomName : data.brideName;
            const parents = side === "groom" ? data.groomParents : data.brideParents;
            const relation = side === "groom" ? "아들" : "딸";
            return (
              <div key={side}>
                <p style={{ fontSize: 9, color: "#383838", marginBottom: 5, letterSpacing: "0.1em", fontFamily: mono }}>
                  {side === "groom" ? "신랑" : "신부"}
                </p>
                <p
                  style={{
                    fontSize: preview ? 14 : 18,
                    fontWeight: 300,
                    fontFamily: serif,
                    letterSpacing: "0.12em",
                    color: "#d0d0d0",
                  }}
                >
                  {name}
                </p>
                {parents && (
                  <div style={{ marginTop: 8 }}>
                    {parents.fatherName && (
                      <p style={{ fontSize: 10, color: "#404040", lineHeight: 1.9 }}>
                        {parents.isFatherDeceased && <span style={{ color: "#505050", marginRight: 3 }}>故</span>}
                        {parents.fatherName}의 {relation}
                      </p>
                    )}
                    {parents.motherName && (
                      <p style={{ fontSize: 10, color: "#404040", lineHeight: 1.9 }}>
                        {parents.isMotherDeceased && <span style={{ color: "#505050", marginRight: 3 }}>故</span>}
                        {parents.motherName}의 {relation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── VENUE ────────────────────────────────────────────── */}
      <section style={{ ...divider, ...sectionPad }}>
        <p style={sectionLabel}>Venue</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Calendar size={13} color="#383838" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, color: "#c0c0c0" }}>{data.date}</p>
              <p style={{ fontSize: 11, color: "#505050", marginTop: 3 }}>{data.time}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <MapPin size={13} color="#383838" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, color: "#c0c0c0" }}>{data.venue}</p>
              <p style={{ fontSize: 11, color: "#505050", marginTop: 3 }}>{data.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP ──────────────────────────────────────────────── */}
      <section style={divider}>
        <p style={{ ...sectionLabel, padding: preview ? "16px 0 12px" : "40px 0 20px", marginBottom: 0 }}>
          오시는 길
        </p>
        {data.mapEmbedUrl ? (
          <iframe
            src={data.mapEmbedUrl}
            style={{
              width: "100%",
              height: preview ? 130 : 220,
              border: "none",
              display: "block",
              filter: "grayscale(1) invert(0.9) brightness(0.85)",
            }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              margin: "0 20px",
              marginBottom: preview ? 16 : 32,
              height: preview ? 110 : 180,
              background: "#111",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2a2a2a",
              fontSize: 11,
              fontFamily: mono,
              letterSpacing: "0.1em",
            }}
          >
            지도 미등록
          </div>
        )}
      </section>

      {/* ── TRANSPORT ────────────────────────────────────────── */}
      {(data.transport?.bus || data.transport?.car) && (
        <section style={{ ...divider, ...sectionPad }}>
          <p style={sectionLabel}>오시는 방법</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.transport.bus && (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🚌</span>
                <p style={{ fontSize: 12, color: "#606060", lineHeight: 1.8 }}>{data.transport.bus}</p>
              </div>
            )}
            {data.transport.car && (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🚗</span>
                <p style={{ fontSize: 12, color: "#606060", lineHeight: 1.8 }}>{data.transport.car}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── ACCOUNTS ─────────────────────────────────────────── */}
      {(data.groomAccount || data.brideAccount) && (
        <section style={{ ...divider, ...sectionPad }}>
          <p style={sectionLabel}>마음 전하기</p>
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#111",
                      borderRadius: 12,
                      padding: "12px 14px",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 9, color: "#383838", marginBottom: 4, fontFamily: mono, letterSpacing: "0.1em" }}>
                        {label}
                      </p>
                      <p style={{ fontSize: 12, color: "#b0b0b0" }}>
                        {account.bank} {account.number}
                      </p>
                      <p style={{ fontSize: 10, color: "#454545", marginTop: 3 }}>{account.holder}</p>
                    </div>
                    <CopyButton text={account.number} />
                  </div>
                )
            )}
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ ...divider, padding: "28px 0", textAlign: "center" }}>
        <p style={{ fontSize: 9, color: "#202020", letterSpacing: "0.45em", textTransform: "uppercase", fontFamily: mono }}>
          Toast Wedding
        </p>
      </footer>

      {/* ── FILM ALBUM MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {albumOpen && (
          <FilmAlbum photos={photos} onClose={() => setAlbumOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
