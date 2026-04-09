"use client";

import React, { useRef, useState, useMemo, useEffect, useContext, createContext } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import { X, Copy, Check, ChevronDown, Phone } from "lucide-react";
import KakaoMap from "../KakaoMap";
// ── Types ─────────────────────────────────────────────────────────────────────

export interface AccountInfo {
  bank: string;
  number: string;
  holder: string;
}

export interface PersonAccount {
  bank: string;
  accountNumber: string;
  name: string;
}

export interface ParentInfo {
  fatherLastName?: string;
  fatherFirstName?: string;
  motherLastName?: string;
  motherFirstName?: string;
  isFatherDeceased?: boolean;
  isMotherDeceased?: boolean;
  fatherPhone?: string;
  motherPhone?: string;
}

export interface TransportInfo {
  subway?: string;
  bus?: string;
  car?: string;
}

export type SectionId = "greeting" | "couple" | "gallery" | "map" | "transport" | "accounts" | "guestbook";

export const DEFAULT_SECTIONS_ORDER: SectionId[] = [
  "greeting", "couple", "gallery", "map", "transport", "accounts", "guestbook",
];

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
  transport?: TransportInfo;
  mapEmbedUrl?: string;
  // Section visibility (undefined = true)
  showGreeting?: boolean;
  showCouple?: boolean;
  showGallery?: boolean;
  showMap?: boolean;
  showTransport?: boolean;
  showAccounts?: boolean;
  // Section render order
  sectionsOrder?: SectionId[];
  // Font selection
  fontFamily?: string;
  // Main background color
  mainBackgroundColor?: string;
  // Road address only (for navigation URLs, no floor/hall detail)
  roadAddress?: string;
  // Particle effect
  particleEffect?: "petals" | "snowflakes" | "none";
  // Contact phone numbers
  groomPhone?: string;
  bridePhone?: string;
  // GuestBook section visibility
  showGuestBook?: boolean;
  guestbookMode?: "tree" | "rose";
  // Hero SVG shape
  heroSvgShape?: "heart" | "ribbon" | "lace" | "lark";
  // Extended accounts (마음 전하실 곳)
  accounts?: {
    groom?: PersonAccount;
    groomFather?: PersonAccount;
    groomMother?: PersonAccount;
    bride?: PersonAccount;
    brideFather?: PersonAccount;
    brideMother?: PersonAccount;
  };
}

/** 성(optional) + 이름 합치기 */
export function fullName(lastName?: string, firstName?: string) {
  return `${lastName ?? ""}${firstName ?? ""}`.trim();
}

/** 혼주 한 줄 표시: "이창영 · 정경란의 아들" */
export function parentsLine(parents: ParentInfo, relation: "아들" | "딸") {
  const f = fullName(parents.fatherLastName, parents.fatherFirstName);
  const m = fullName(parents.motherLastName, parents.motherFirstName);
  const fp = parents.isFatherDeceased && f ? `故 ${f}` : f;
  const mp = parents.isMotherDeceased && m ? `故 ${m}` : m;
  const parts = [fp, mp].filter(Boolean);
  if (!parts.length) return "";
  return `${parts.join(" · ")}의 ${relation}`;
}

// ── Shared Atoms ──────────────────────────────────────────────────────────────

// ── Scroll-reset animation context ────────────────────────────────────────────
const AnimResetCtx = createContext(0);

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

function FilmGrain({ strong = false, dark = false }: { strong?: boolean; dark?: boolean }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: dark ? 0.42 : (strong ? 0.09 : 0.04),
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: dark ? "120px 120px" : "200px 200px",
          mixBlendMode: dark ? "soft-light" : "overlay",
        } as React.CSSProperties}
      />
      {dark && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.22,
            pointerEvents: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' /%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23g)'/%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
            mixBlendMode: "screen",
          } as React.CSSProperties}
        />
      )}
    </>
  );
}


function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const resetKey = useContext(AnimResetCtx);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const [shown, setShown] = useState(false);

  // When user reaches top, resetKey increments → hide all until re-entered
  useEffect(() => {
    setShown(false);
  }, [resetKey]);

  // When element enters viewport, show it (don't hide on exit)
  useEffect(() => {
    if (isInView) setShown(true);
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyButton({ text, borderColor = "#262626", textColor = "#555" }: { text: string; borderColor?: string; textColor?: string }) {
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
        border: `1px solid ${borderColor}`,
        borderRadius: 999,
        background: "none",
        color: copied ? "#6ee7b7" : textColor,
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

// ── Account Row ───────────────────────────────────────────────────────────────

function AccountRow({
  role, bank, accountNumber, name, preview, serif, mono, theme,
}: {
  role: string;
  bank: string;
  accountNumber: string;
  name: string;
  preview: boolean;
  serif: string;
  mono: string;
  theme: SectionTheme;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: preview ? "8px 0" : "12px 0",
        borderBottom: `1px solid ${theme.accountRowBorder}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: mono,
            fontSize: preview ? 8 : 10,
            color: theme.textMuted,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 5,
          }}
        >
          {role}
        </p>
        <p
          style={{
            fontFamily: serif,
            fontSize: preview ? 11 : 16,
            color: theme.textBody,
            letterSpacing: "0.06em",
            marginBottom: 3,
          }}
        >
          {bank}
        </p>
        <p
          style={{
            fontFamily: mono,
            fontSize: preview ? 10 : 15,
            color: theme.textBody,
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}
        >
          {accountNumber}
        </p>
        <p
          style={{
            fontFamily: serif,
            fontSize: preview ? 9 : 13,
            color: theme.textMuted,
          }}
        >
          {name}
        </p>
      </div>
      {!preview && <CopyButton text={accountNumber} borderColor={theme.copyBtnBorder} textColor={theme.copyBtnColor} />}
    </div>
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
  const perfHole = {
    width: 11,
    height: 7,
    background: "#050505",
    border: "0.5px solid #1a1a1a",
    borderRadius: 1.5,
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8), 0 0 3px rgba(255,255,255,0.04)",
    flexShrink: 0,
  } as const;

  return (
    <div
      style={{
        width: 230,
        background: "#090909",
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow:
          "0 0 0 1px #1a1a1a, 0 0 0 2px #080808, 0 20px 60px rgba(0,0,0,0.98), 0 0 30px rgba(212,175,55,0.04)",
      }}
    >
      {/* Top sprocket strip */}
      <div style={{
        height: 22,
        background: "#050505",
        borderBottom: "0.5px solid #1e1e1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
      }}>
        {Array.from({ length: 7 }).map((_, i) => <div key={i} style={perfHole} />)}
      </div>

      {/* Kodak orange stripe */}
      <div style={{ height: 3, background: "rgba(255,140,0,0.08)" }} />

      {/* Photo area */}
      <div
        style={{
          height: 310,
          margin: "0 10px",
          background: "#111",
          overflow: "hidden",
          position: "relative",
          borderLeft: "0.5px solid #1c1c1c",
          borderRight: "0.5px solid #1c1c1c",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={`photo ${index + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%", display: "block" }}
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
        <FilmGrain strong />
        {/* Corner darkening */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Kodak orange stripe bottom */}
      <div style={{ height: 3, background: "rgba(255,140,0,0.08)" }} />

      {/* Bottom sprocket strip */}
      <div style={{
        height: 22,
        background: "#050505",
        borderTop: "0.5px solid #1e1e1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
      }}>
        {Array.from({ length: 7 }).map((_, i) => <div key={i} style={perfHole} />)}
      </div>

      {/* Kodak edge text */}
      <div
        style={{
          padding: "3px 10px 5px",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "monospace",
          fontSize: 7,
          color: "rgba(255,140,0,0.22)",
          letterSpacing: "0.15em",
          background: "#050505",
        }}
      >
        <span>○ {String(index + 1).padStart(2, "0")}</span>
        <span>KODAK 400TX ▲</span>
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
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
          scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"],
          padding: "0 calc(50% - 115px)",
          gap: 28,
        } as React.CSSProperties}
        className="hide-scrollbar"
      >
        {Array.from({ length: N }).map((_, i) => (
          <div
            key={i}
            style={{ scrollSnapAlign: "center", scrollSnapStop: "always", flexShrink: 0 }}
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

// ── Falling Particles ─────────────────────────────────────────────────────────

function FallingParticles({ type, preview = false }: { type: "petals" | "snowflakes"; preview?: boolean }) {
  const count = preview ? 8 : 22;
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 3 + ((i * 89 / count + Math.sin(i * 2.1) * 11) % 94),
      delay: (i * 13 % 11) / 2,
      duration: 7 + (i * 7 % 8),
      size: type === "petals" ? 8 + (i * 3 % 10) : 7 + (i * 5 % 8),
      opacity: 0.22 + (i % 5) * 0.06,
      rotateEnd: (i % 2 === 0 ? 1 : -1) * (180 + (i * 47 % 200)),
      driftX: (i % 2 === 0 ? 1 : -1) * (10 + (i * 13 % 38)),
      repeatDelay: 0.5 + (i * 11 % 6) / 2,
    })), [count, type]
  );

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "-60px", x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: 3600,
            x: [0, p.driftX * 0.4, p.driftX],
            rotate: p.rotateEnd,
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: p.repeatDelay,
            ease: "linear",
          }}
          style={{ position: "absolute", top: 0, left: `${p.x}%` }}
        >
          {type === "petals" ? (
            <div style={{
              width: p.size,
              height: p.size * 1.5,
              background: "linear-gradient(135deg, rgba(255,192,210,0.85) 0%, rgba(240,140,160,0.65) 100%)",
              borderRadius: "50% 40% 60% 40% / 60% 50% 50% 40%",
            }} />
          ) : (
            <svg width={p.size} height={p.size} viewBox="0 0 20 20" fill="none">
              <line x1="10" y1="2" x2="10" y2="18" stroke="rgba(195,225,255,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="10" x2="18" y2="10" stroke="rgba(195,225,255,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="4" y1="4" x2="16" y2="16" stroke="rgba(195,225,255,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="16" y1="4" x2="4" y2="16" stroke="rgba(195,225,255,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ── Staggered Greeting ─────────────────────────────────────────────────────────

function StaggeredGreeting({
  text, serif, textColor, preview,
}: {
  text: string;
  serif: string;
  textColor: string;
  preview: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const lines = text.split("\n");

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const lineVariants = {
    hidden: { opacity: 0, y: preview ? 6 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: preview ? 0.4 : 0.85, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{ textAlign: "center" }}
    >
      {lines.map((line, i) => (
        <motion.p
          key={i}
          variants={lineVariants}
          style={{
            fontFamily: serif,
            fontSize: preview ? 12 : 16,
            lineHeight: preview ? 1.6 : 1.85,
            color: textColor,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            minHeight: line === "" ? (preview ? 6 : 12) : undefined,
          }}
        >
          {line || "\u00A0"}
        </motion.p>
      ))}
    </motion.div>
  );
}

// ── Contact Group ──────────────────────────────────────────────────────────────

function ContactGroup({
  title, contacts, serif, mono,
}: {
  title: string;
  contacts: { role: string; name: string; phone: string }[];
  serif: string;
  mono: string;
}) {
  return (
    <div>
      <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.35em", color: "#6b4c2a", textTransform: "uppercase", marginBottom: 10 }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {contacts.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.72)",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            <div>
              <p style={{ fontFamily: mono, fontSize: 9, color: "#9a9490", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>
                {c.role}
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: "#3a2f28", letterSpacing: "0.1em" }}>
                {c.name}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={`sms:${c.phone}`}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(107,76,42,0.08)",
                  border: "1px solid rgba(107,76,42,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b4c2a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </a>
              <a
                href={`tel:${c.phone}`}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(107,76,42,0.08)",
                  border: "1px solid rgba(107,76,42,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <Phone size={15} color="#6b4c2a" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Contact Modal (bottom sheet) ───────────────────────────────────────────────

function ContactModal({
  open, onClose, data, serif, mono,
}: {
  open: boolean;
  onClose: () => void;
  data: WeddingData;
  serif: string;
  mono: string;
}) {
  const groomContacts = [
    data.groomPhone ? { role: "신랑", name: data.groomName, phone: data.groomPhone } : null,
    data.groomParents?.fatherPhone ? {
      role: "신랑 아버지",
      name: fullName(data.groomParents.fatherLastName, data.groomParents.fatherFirstName),
      phone: data.groomParents.fatherPhone,
    } : null,
    data.groomParents?.motherPhone ? {
      role: "신랑 어머니",
      name: fullName(data.groomParents.motherLastName, data.groomParents.motherFirstName),
      phone: data.groomParents.motherPhone,
    } : null,
  ].filter(Boolean) as { role: string; name: string; phone: string }[];

  const brideContacts = [
    data.bridePhone ? { role: "신부", name: data.brideName, phone: data.bridePhone } : null,
    data.brideParents?.fatherPhone ? {
      role: "신부 아버지",
      name: fullName(data.brideParents.fatherLastName, data.brideParents.fatherFirstName),
      phone: data.brideParents.fatherPhone,
    } : null,
    data.brideParents?.motherPhone ? {
      role: "신부 어머니",
      name: fullName(data.brideParents.motherLastName, data.brideParents.motherFirstName),
      phone: data.brideParents.motherPhone,
    } : null,
  ].filter(Boolean) as { role: string; name: string; phone: string }[];

  const hasAny = groomContacts.length > 0 || brideContacts.length > 0;
  if (!hasAny) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300 }}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301,
              background: "#f8f8f4",
              borderRadius: "20px 20px 0 0",
              padding: "20px 20px 44px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            className="hide-scrollbar"
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ width: 36, height: 4, background: "#d0c8c0", borderRadius: 2 }} />
            </div>
            <p style={{
              fontFamily: mono, fontSize: 9, letterSpacing: "0.5em",
              color: "#9a9490", textAlign: "center", marginBottom: 24,
              textTransform: "uppercase",
            }}>
              연락하기
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {groomContacts.length > 0 && (
                <ContactGroup title="신랑측" contacts={groomContacts} serif={serif} mono={mono} />
              )}
              {brideContacts.length > 0 && (
                <ContactGroup title="신부측" contacts={brideContacts} serif={serif} mono={mono} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Guest Book ────────────────────────────────────────────────────────────────

interface GuestMsg {
  id: number;
  name: string;
  message: string;
  at: string;
  pw: string;
}

const MOCK_MSGS: GuestMsg[] = [
  { id: 1, name: "김민준", message: "축하해요! 행복한 가정 이루세요 ♥", at: "2026.04.05", pw: "" },
  { id: 2, name: "이서연", message: "항상 사랑하고 행복하게 살아요!", at: "2026.04.06", pw: "" },
  { id: 3, name: "박지호", message: "두 분의 새 출발을 진심으로 축하합니다", at: "2026.04.06", pw: "" },
  { id: 4, name: "최유나", message: "오래오래 행복하세요 :)", at: "2026.04.07", pw: "" },
  { id: 5, name: "정태영", message: "멋진 결혼 축하드려요!", at: "2026.04.07", pw: "" },
  { id: 6, name: "한소희", message: "평생 함께 웃으며 살아요", at: "2026.04.08", pw: "" },
];

// ── Memo anchor positions on tree (SVG 300×320 viewBox) ──────────────────────
const MEMO_ANCHORS = [
  { x: 150, y: 50,  rot: -6  },
  { x: 68,  y: 105, rot: -18 },
  { x: 232, y: 100, rot: 16  },
  { x: 42,  y: 75,  rot: -24 },
  { x: 258, y: 70,  rot: 20  },
  { x: 110, y: 60,  rot: -10 },
  { x: 190, y: 56,  rot: 12  },
  { x: 78,  y: 168, rot: -28 },
  { x: 222, y: 163, rot: 24  },
];


function LushTreeSVG() {
  const tr1 = "#4e2810";
  const tr2 = "#6e3c1c";
  const tr3 = "#9a6030";
  const br1 = "#5e3015";
  const br2 = "#7a4820";
  const br3 = "#9a6235";
  const gdk = "#173d22";
  const gd2 = "#235c34";
  const gmd = "#317848";
  const glt = "#469460";
  const ghi = "#5fb07a";
  const gvl = "#80cc96";

  return (
    <svg viewBox="0 0 300 340" style={{ width: "100%", height: "100%" }} fill="none">
      {/* Roots */}
      <path d="M 150 340 C 138 334 122 332 110 337" stroke={tr1} strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M 150 340 C 162 334 178 332 190 338" stroke={tr1} strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M 150 340 C 143 336 130 338 120 340" stroke={tr1} strokeWidth="3" strokeLinecap="round"/>
      <path d="M 150 340 C 157 336 170 338 180 340" stroke={tr1} strokeWidth="3" strokeLinecap="round"/>

      {/* Trunk – layered for texture */}
      <path d="M 140 340 C 136 312 138 282 140 252 C 142 222 140 202 142 182" stroke={tr1} strokeWidth="18" strokeLinecap="round"/>
      <path d="M 158 340 C 162 312 160 282 158 252 C 156 222 158 202 158 182" stroke={tr1} strokeWidth="14" strokeLinecap="round"/>
      <path d="M 148 340 C 145 312 146 282 149 252 C 152 222 149 202 151 182" stroke={tr2} strokeWidth="11" strokeLinecap="round"/>
      <path d="M 151 336 C 150 308 150 280 151 250 C 152 220 151 200 152 180" stroke={tr3} strokeWidth="3.5" strokeLinecap="round" opacity="0.4"/>

      {/* Main branches */}
      <path d="M 144 196 C 122 182 96 166 68 152" stroke={br1} strokeWidth="10" strokeLinecap="round"/>
      <path d="M 154 192 C 178 178 204 164 232 150" stroke={br1} strokeWidth="10" strokeLinecap="round"/>
      <path d="M 146 174 C 128 158 108 142 84 128" stroke={br1} strokeWidth="8" strokeLinecap="round"/>
      <path d="M 154 170 C 172 154 192 140 216 126" stroke={br1} strokeWidth="8" strokeLinecap="round"/>
      <path d="M 150 180 C 150 155 150 128 150 104" stroke={br1} strokeWidth="7" strokeLinecap="round"/>

      {/* Sub-branches far left */}
      <path d="M 68 152 C 54 136 42 122 34 106" stroke={br2} strokeWidth="5" strokeLinecap="round"/>
      <path d="M 68 152 C 60 134 54 116 46 100" stroke={br2} strokeWidth="4" strokeLinecap="round"/>
      <path d="M 88 136 C 80 118 74 98 70 80" stroke={br2} strokeWidth="4" strokeLinecap="round"/>
      <path d="M 88 136 C 96 118 100 98 102 78" stroke={br2} strokeWidth="3.5" strokeLinecap="round"/>

      {/* Sub-branches far right */}
      <path d="M 232 150 C 246 134 258 120 266 104" stroke={br2} strokeWidth="5" strokeLinecap="round"/>
      <path d="M 232 150 C 240 132 246 114 254 98" stroke={br2} strokeWidth="4" strokeLinecap="round"/>
      <path d="M 212 134 C 220 116 226 96 228 78" stroke={br2} strokeWidth="4" strokeLinecap="round"/>
      <path d="M 212 134 C 204 116 200 98 198 78" stroke={br2} strokeWidth="3.5" strokeLinecap="round"/>

      {/* Sub-branches center */}
      <path d="M 150 104 C 140 86 132 68 126 52" stroke={br2} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M 150 104 C 160 86 168 68 174 52" stroke={br2} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M 150 104 C 150 84 150 64 150 46" stroke={br2} strokeWidth="3" strokeLinecap="round"/>

      {/* Sub-branches mid */}
      <path d="M 84 128 C 74 110 66 90 60 72" stroke={br2} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M 84 128 C 92 110 98 90 102 70" stroke={br2} strokeWidth="3.2" strokeLinecap="round"/>
      <path d="M 216 126 C 226 108 234 88 240 70" stroke={br2} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M 216 126 C 208 108 202 90 198 70" stroke={br2} strokeWidth="3.2" strokeLinecap="round"/>

      {/* Twigs */}
      <path d="M 34 106 C 28 92 24 78 22 64" stroke={br3} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M 34 106 C 40 92 44 76 44 62" stroke={br3} strokeWidth="2" strokeLinecap="round"/>
      <path d="M 46 100 C 42 86 40 70 42 56" stroke={br3} strokeWidth="2" strokeLinecap="round"/>
      <path d="M 266 104 C 272 90 276 76 278 62" stroke={br3} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M 266 104 C 260 90 256 76 256 62" stroke={br3} strokeWidth="2" strokeLinecap="round"/>
      <path d="M 254 98 C 258 84 260 68 258 54" stroke={br3} strokeWidth="2" strokeLinecap="round"/>
      <path d="M 70 80 C 64 66 62 50 64 36" stroke={br3} strokeWidth="2" strokeLinecap="round"/>
      <path d="M 102 78 C 106 62 108 46 106 32" stroke={br3} strokeWidth="2" strokeLinecap="round"/>
      <path d="M 228 78 C 234 62 236 46 234 34" stroke={br3} strokeWidth="2" strokeLinecap="round"/>
      <path d="M 198 78 C 194 62 192 46 194 32" stroke={br3} strokeWidth="2" strokeLinecap="round"/>
      <path d="M 126 52 C 120 38 118 24 120 12" stroke={br3} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 174 52 C 180 38 182 24 180 12" stroke={br3} strokeWidth="1.8" strokeLinecap="round"/>

      {/* Back foliage (darkest) */}
      <ellipse cx="150" cy="28"  rx="72" ry="56" fill={gdk} opacity="0.70"/>
      <ellipse cx="42"  cy="84"  rx="52" ry="44" fill={gdk} opacity="0.68"/>
      <ellipse cx="258" cy="82"  rx="52" ry="44" fill={gdk} opacity="0.68"/>
      <ellipse cx="90"  cy="54"  rx="44" ry="38" fill={gdk} opacity="0.66"/>
      <ellipse cx="210" cy="52"  rx="44" ry="36" fill={gdk} opacity="0.66"/>
      <ellipse cx="36"  cy="58"  rx="30" ry="26" fill={gdk} opacity="0.70"/>
      <ellipse cx="264" cy="56"  rx="30" ry="26" fill={gdk} opacity="0.70"/>
      <ellipse cx="150" cy="166" rx="32" ry="28" fill={gdk} opacity="0.62"/>
      <ellipse cx="80"  cy="162" rx="26" ry="24" fill={gdk} opacity="0.60"/>
      <ellipse cx="220" cy="160" rx="26" ry="24" fill={gdk} opacity="0.60"/>

      {/* Mid-dark foliage */}
      <ellipse cx="150" cy="14"  rx="60" ry="48" fill={gd2} opacity="0.84"/>
      <ellipse cx="44"  cy="72"  rx="42" ry="36" fill={gd2} opacity="0.82"/>
      <ellipse cx="256" cy="70"  rx="42" ry="36" fill={gd2} opacity="0.82"/>
      <ellipse cx="90"  cy="40"  rx="36" ry="32" fill={gd2} opacity="0.80"/>
      <ellipse cx="210" cy="38"  rx="36" ry="30" fill={gd2} opacity="0.80"/>
      <ellipse cx="124" cy="36"  rx="32" ry="28" fill={gd2} opacity="0.78"/>
      <ellipse cx="176" cy="34"  rx="32" ry="27" fill={gd2} opacity="0.78"/>
      <ellipse cx="64"  cy="98"  rx="34" ry="28" fill={gd2} opacity="0.76"/>
      <ellipse cx="236" cy="96"  rx="34" ry="28" fill={gd2} opacity="0.76"/>
      <ellipse cx="150" cy="154" rx="26" ry="22" fill={gd2} opacity="0.70"/>

      {/* Main foliage */}
      <ellipse cx="150" cy="18"  rx="50" ry="40" fill={gmd} opacity="0.88"/>
      <ellipse cx="46"  cy="66"  rx="36" ry="32" fill={gmd} opacity="0.86"/>
      <ellipse cx="254" cy="64"  rx="36" ry="32" fill={gmd} opacity="0.86"/>
      <ellipse cx="90"  cy="32"  rx="32" ry="28" fill={gmd} opacity="0.84"/>
      <ellipse cx="210" cy="30"  rx="32" ry="26" fill={gmd} opacity="0.84"/>
      <ellipse cx="76"  cy="86"  rx="28" ry="24" fill={gmd} opacity="0.82"/>
      <ellipse cx="224" cy="84"  rx="28" ry="24" fill={gmd} opacity="0.82"/>
      <ellipse cx="128" cy="48"  rx="28" ry="24" fill={gmd} opacity="0.80"/>
      <ellipse cx="172" cy="46"  rx="28" ry="23" fill={gmd} opacity="0.80"/>
      <ellipse cx="50"  cy="48"  rx="26" ry="22" fill={gmd} opacity="0.80"/>
      <ellipse cx="250" cy="46"  rx="26" ry="22" fill={gmd} opacity="0.80"/>
      <ellipse cx="150" cy="144" rx="28" ry="22" fill={gmd} opacity="0.72"/>
      <ellipse cx="84"  cy="148" rx="22" ry="20" fill={gmd} opacity="0.70"/>
      <ellipse cx="216" cy="146" rx="22" ry="20" fill={gmd} opacity="0.70"/>

      {/* Light foliage */}
      <ellipse cx="150" cy="6"   rx="40" ry="32" fill={glt} opacity="0.82"/>
      <ellipse cx="42"  cy="56"  rx="28" ry="25" fill={glt} opacity="0.80"/>
      <ellipse cx="258" cy="54"  rx="28" ry="25" fill={glt} opacity="0.80"/>
      <ellipse cx="88"  cy="22"  rx="26" ry="22" fill={glt} opacity="0.78"/>
      <ellipse cx="212" cy="20"  rx="26" ry="21" fill={glt} opacity="0.78"/>
      <ellipse cx="124" cy="28"  rx="24" ry="20" fill={glt} opacity="0.76"/>
      <ellipse cx="176" cy="26"  rx="24" ry="19" fill={glt} opacity="0.76"/>
      <ellipse cx="66"  cy="70"  rx="22" ry="19" fill={glt} opacity="0.74"/>
      <ellipse cx="234" cy="68"  rx="22" ry="19" fill={glt} opacity="0.74"/>
      <ellipse cx="52"  cy="36"  rx="20" ry="17" fill={glt} opacity="0.72"/>
      <ellipse cx="248" cy="34"  rx="20" ry="17" fill={glt} opacity="0.72"/>
      <ellipse cx="150" cy="135" rx="22" ry="18" fill={glt} opacity="0.65"/>

      {/* Highlight foliage */}
      <ellipse cx="136" cy="6"   rx="30" ry="22" fill={ghi} opacity="0.55"/>
      <ellipse cx="36"  cy="54"  rx="20" ry="17" fill={ghi} opacity="0.52"/>
      <ellipse cx="264" cy="52"  rx="20" ry="17" fill={ghi} opacity="0.52"/>
      <ellipse cx="84"  cy="14"  rx="18" ry="15" fill={ghi} opacity="0.50"/>
      <ellipse cx="216" cy="12"  rx="18" ry="15" fill={ghi} opacity="0.50"/>
      <ellipse cx="60"  cy="62"  rx="16" ry="14" fill={ghi} opacity="0.48"/>
      <ellipse cx="240" cy="60"  rx="16" ry="14" fill={ghi} opacity="0.48"/>
      <ellipse cx="150" cy="126" rx="18" ry="14" fill={ghi} opacity="0.42"/>

      {/* Very light tips */}
      <ellipse cx="132" cy="2"   rx="20" ry="12" fill={gvl} opacity="0.28"/>
      <ellipse cx="82"  cy="8"   rx="14" ry="10" fill={gvl} opacity="0.26"/>
      <ellipse cx="218" cy="6"   rx="14" ry="10" fill={gvl} opacity="0.26"/>
      <ellipse cx="38"  cy="48"  rx="12" ry="9"  fill={gvl} opacity="0.26"/>
      <ellipse cx="262" cy="46"  rx="12" ry="9"  fill={gvl} opacity="0.26"/>
    </svg>
  );
}

// ── Rose positions on vine background image (% units) ────────────────────────
const ROSE_POSITIONS = [
  { x: 14, y: 18 },
  { x: 72, y: 12 },
  { x: 42, y: 7  },
  { x: 88, y: 28 },
  { x: 8,  y: 44 },
  { x: 58, y: 34 },
  { x: 82, y: 52 },
  { x: 26, y: 62 },
  { x: 50, y: 50 },
  { x: 10, y: 76 },
  { x: 66, y: 68 },
  { x: 90, y: 74 },
  { x: 32, y: 86 },
  { x: 76, y: 88 },
  { x: 54, y: 80 },
  { x: 22, y: 32 },
  { x: 94, y: 46 },
  { x: 44, y: 72 },
];

function RoseFlower({
  idx,
  xPct,
  yPct,
  preview,
}: {
  idx: number;
  xPct: number;
  yPct: number;
  preview: boolean;
}) {
  const size = preview ? 20 : 34;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        damping: 8,
        stiffness: 155,
        delay: idx * 0.12,
        opacity: { duration: 0.25 },
      } as any}
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        cursor: "default",
        zIndex: 2,
        pointerEvents: "none",
        filter: preview
          ? "drop-shadow(0 1px 2px rgba(120,0,20,0.45))"
          : "drop-shadow(0 0 5px rgba(200,20,40,0.70)) drop-shadow(0 0 12px rgba(180,0,30,0.40))",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/samples/rose-icon.png"
        alt=""
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    </motion.div>
  );
}

function GuestBook({
  preview, serif, mono, theme, mode,
}: {
  preview: boolean;
  serif: string;
  mono: string;
  theme: SectionTheme;
  mode: "tree" | "rose";
}) {
  const [msgs, setMsgs] = useState<GuestMsg[]>(MOCK_MSGS);
  // tree/rose mode: open full list viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputMsg, setInputMsg] = useState("");
  const [inputPw, setInputPw] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletePw, setDeletePw] = useState("");
  const [deleteErr, setDeleteErr] = useState(false);

  const handleAdd = () => {
    const trimName = inputName.trim();
    const trimMsg = inputMsg.trim();
    if (!trimName || !trimMsg) return;
    const now = new Date();
    const at = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
    setMsgs((prev) => [...prev, { id: Date.now(), name: trimName, message: trimMsg, at, pw: inputPw.trim() }]);
    setInputName("");
    setInputMsg("");
    setInputPw("");
  };

  const handleDelete = (id: number) => {
    const m = msgs.find((x) => x.id === id);
    if (!m) return;
    if (m.pw && m.pw !== deletePw) { setDeleteErr(true); return; }
    setMsgs((prev) => prev.filter((x) => x.id !== id));
    setDeleteId(null);
    setDeletePw("");
    setDeleteErr(false);
  };

  // Memo card dimensions (tree mode)
  const mw = preview ? 30 : 46;
  const mh = mw * 1.4;

  const inputStyle = {
    fontFamily: serif,
    fontSize: 13,
    color: theme.textBody,
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: 8,
    padding: "9px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  return (
    <div>
      {/* ── Tree illustration ── */}
      {mode === "tree" && (
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "300 / 340",
            cursor: preview ? "default" : "pointer",
          }}
          onClick={() => !preview && msgs.length > 0 && setViewerOpen(true)}
        >
          <LushTreeSVG />

          {/* Memo cards */}
          {msgs.slice(0, MEMO_ANCHORS.length).map((m, i) => {
            const { x, y, rot } = MEMO_ANCHORS[i];
            const hangY = y + (preview ? 16 : 24);
            return (
              <React.Fragment key={m.id}>
                <svg
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                  viewBox="0 0 300 320"
                >
                  <line x1={x} y1={y + 3} x2={x} y2={hangY - 1} stroke="#a0886a" strokeWidth={preview ? "0.8" : "1"} opacity="0.6"/>
                </svg>
                <div
                  style={{
                    position: "absolute",
                    left: `${(x / 300) * 100}%`,
                    top: `${(hangY / 320) * 100}%`,
                    transform: `translate(-50%, 0) rotate(${rot}deg)`,
                    width: mw,
                    height: mh,
                    background: "linear-gradient(160deg, #fffef9 0%, #fdf8ee 100%)",
                    borderRadius: preview ? 2 : 3,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(180,160,100,0.2)",
                    padding: preview ? "3px" : "5px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    pointerEvents: "none",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ height: preview ? 3 : 5, background: "rgba(212,175,55,0.4)", borderRadius: 1, flexShrink: 0 }}/>
                  <p style={{
                    fontFamily: mono,
                    fontSize: preview ? 4 : 6,
                    color: "#8a7a5a",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: preview ? 2 : 3,
                    WebkitBoxOrient: "vertical",
                  } as React.CSSProperties}>
                    {m.message}
                  </p>
                  <p style={{ fontFamily: mono, fontSize: preview ? 3.5 : 5, color: "#b0a88a", marginTop: "auto" }}>
                    {m.name}
                  </p>
                </div>
              </React.Fragment>
            );
          })}

          {!preview && msgs.length > 0 && (
            <div style={{
              position: "absolute", bottom: 6, right: 8,
              fontFamily: mono, fontSize: 7, color: theme.textMuted,
              letterSpacing: "0.18em", pointerEvents: "none",
            }}>
              TAP TO READ
            </div>
          )}
        </div>
      )}

      {/* ── Rose vine illustration (image background + blooming roses) ── */}
      {mode === "rose" && (
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            borderRadius: 12,
            background: "#0e1a0e",
            cursor: preview ? "default" : "pointer",
          }}
          onClick={() => !preview && msgs.length > 0 && setViewerOpen(true)}
        >
          {/* Background vine image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/samples/vine-bg.png"
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
          />

          {/* Blooming roses */}
          {msgs.map((m, i) => {
            const pos = i < ROSE_POSITIONS.length
              ? ROSE_POSITIONS[i]
              : { x: ((i * 37 + 13) % 68) + 16, y: ((i * 53 + 23) % 68) + 16 };
            return (
              <RoseFlower
                key={m.id}
                idx={i}
                xPct={pos.x}
                yPct={pos.y}
                preview={preview}
              />
            );
          })}

          {/* Prompt when no roses */}
          {msgs.length === 0 && !preview && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}>
              <p style={{
                fontFamily: mono, fontSize: 10, color: "rgba(255,255,255,0.50)",
                letterSpacing: "0.3em", textTransform: "uppercase", textAlign: "center",
                padding: "0 24px",
              }}>
                장미를 피워주세요 🌹
              </p>
            </div>
          )}

          {/* TAP TO VIEW ALL hint */}
          {!preview && msgs.length > 0 && (
            <div style={{
              position: "absolute", bottom: 6, right: 8,
              fontFamily: mono, fontSize: 7, color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.18em", pointerEvents: "none",
            }}>
              TAP TO READ
            </div>
          )}
        </div>
      )}

      {/* ── Input form ── */}
      {!preview && (
        <div style={{
          background: theme.sectionBg,
          border: `1px solid ${theme.sectionBorder}`,
          borderRadius: 12,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 16,
        }}>
          <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.4em", color: theme.textMuted, textTransform: "uppercase" }}>
            {mode === "rose" ? "장미를 꽃피워주세요 🌹" : "방명록 남기기"}
          </p>
          <input value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="이름" style={inputStyle} />
          <textarea
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="축하 메시지를 남겨주세요"
            rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.65 } as React.CSSProperties}
          />
          <input
            value={inputPw}
            onChange={(e) => setInputPw(e.target.value)}
            placeholder="삭제용 비밀번호 (선택)"
            type="password"
            style={{ ...inputStyle, fontSize: 12 }}
          />
          <button
            onClick={handleAdd}
            style={{
              fontFamily: mono, fontSize: 11, letterSpacing: "0.25em",
              color: theme.accentColor, background: "none",
              border: `1px solid ${theme.accentColor}`, borderRadius: 999,
              padding: "9px 0", cursor: "pointer", textTransform: "uppercase",
            }}
          >
            {mode === "rose" ? "장미 한 송이 피우기 🌹" : "남기기"}
          </button>
        </div>
      )}

      {/* ── Full list viewer (bottom sheet) — tree & rose ── */}
      <AnimatePresence>
        {viewerOpen && (
          <>
            <motion.div
              key="gb-bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setViewerOpen(false); setDeleteId(null); setDeletePw(""); setDeleteErr(false); }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 400 }}
            />
            <motion.div
              key="gb-modal"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 401,
                background: "#f8f8f4", borderRadius: "20px 20px 0 0",
                maxHeight: "88vh", display: "flex", flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 12px", flexShrink: 0 }}>
                <div>
                  <div style={{ width: 36, height: 4, background: "#d0c8c0", borderRadius: 2, margin: "0 auto 12px" }} />
                  <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.45em", color: "#9a9490", textTransform: "uppercase" }}>
                    방명록 · {msgs.length}개
                  </p>
                </div>
                <button
                  onClick={() => { setViewerOpen(false); setDeleteId(null); setDeletePw(""); setDeleteErr(false); }}
                  style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <X size={14} color="#666" />
                </button>
              </div>
              <div style={{ overflowY: "auto", padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 14 }} className="hide-scrollbar">
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: "linear-gradient(135deg, #fffef5 0%, #fdf5e0 100%)",
                      borderRadius: 6,
                      padding: "20px 18px 16px",
                      boxShadow: "2px 3px 14px rgba(0,0,0,0.14), 0 0 0 5px rgba(210,185,110,0.07)",
                      border: "1px solid #e0ccaa",
                      position: "relative" as const,
                    }}
                  >
                    <div style={{ position: "absolute", top: 14, right: 14, width: 26, height: 32, border: "1px solid #c8b882", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, opacity: 0.7 }}>
                      💌
                    </div>
                    <div style={{ borderBottom: "1px dashed #d4c4a0", marginBottom: 12, paddingBottom: 8, paddingRight: 36 }}>
                      <p style={{ fontFamily: mono, fontSize: 9, color: "#b09870", letterSpacing: "0.2em", textTransform: "uppercase" as const }}>
                        {m.at} · {m.name}
                      </p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <p style={{ fontFamily: serif, fontSize: 14, color: "#3a3a3a", lineHeight: 1.75, letterSpacing: "0.02em", flex: 1 }}>
                        {m.message}
                      </p>
                      {m.pw !== undefined && (
                        <button
                          onClick={() => { setDeleteId(deleteId === m.id ? null : m.id); setDeletePw(""); setDeleteErr(false); }}
                          style={{ fontSize: 11, color: "#ccc", background: "none", border: "none", cursor: "pointer", padding: "4px 6px", flexShrink: 0 }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    {deleteId === m.id && (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          value={deletePw}
                          onChange={(e) => { setDeletePw(e.target.value); setDeleteErr(false); }}
                          placeholder={m.pw ? "비밀번호 입력" : "비밀번호 없이 삭제됩니다"}
                          type="password"
                          style={{ flex: 1, fontFamily: mono, fontSize: 11, padding: "6px 10px", border: `1px solid ${deleteErr ? "#e53e3e" : "#ddd"}`, borderRadius: 6, outline: "none", color: "#333" }}
                        />
                        <button
                          onClick={() => handleDelete(m.id)}
                          style={{ fontFamily: mono, fontSize: 10, padding: "6px 12px", background: "#e53e3e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                    {deleteErr && <p style={{ fontFamily: mono, fontSize: 10, color: "#e53e3e", marginTop: 4 }}>비밀번호가 맞지 않습니다.</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

const GALLERY_SAMPLES = [
  "/samples/gallery-1.jpg",
  "/samples/gallery-2.jpg",
  "/samples/gallery-3.jpg",
];

// ── Wedding Calendar + D-Day ───────────────────────────────────────────────────

function WeddingCalendar({
  dateStr, preview, serif, mono, theme, bgColor,
}: {
  dateStr: string;
  preview: boolean;
  serif: string;
  mono: string;
  theme: SectionTheme;
  bgColor: string;
}) {
  const match = dateStr.match(/(\d+)년\s*(\d+)월\s*(\d+)일/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);

  const firstDow = new Date(y, m - 1, 1).getDay(); // 0=일
  const daysInMonth = new Date(y, m, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weddingDate = new Date(y, m - 1, d);
  const diffDays = Math.round((weddingDate.getTime() - today.getTime()) / 86400000);
  const dday = diffDays === 0 ? "D-Day" : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;

  const cells: (number | null)[] = Array.from({ length: firstDow }, () => null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const DOW_KR = ["일", "월", "화", "수", "목", "금", "토"];
  const isLight = LIGHT_BG_SET.has(bgColor.toLowerCase());

  return (
    <div style={{ width: "100%", marginTop: preview ? 14 : 28 }}>
      {/* Year.Month */}
      <p style={{
        fontFamily: mono,
        fontSize: preview ? 8 : 11,
        letterSpacing: "0.4em",
        color: theme.textMuted,
        textAlign: "center",
        marginBottom: preview ? 8 : 16,
        textTransform: "uppercase",
      }}>
        {y}.{String(m).padStart(2, "0")}
      </p>

      {/* DOW header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: preview ? 1 : 4, marginBottom: preview ? 3 : 6 }}>
        {DOW_KR.map((label, i) => (
          <div key={label} style={{
            textAlign: "center",
            fontFamily: mono,
            fontSize: preview ? 6 : 9,
            color: i === 0 ? "rgba(200,60,60,0.55)" : theme.textMuted,
            letterSpacing: "0.05em",
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: preview ? 1 : 3 }}>
        {cells.map((cell, i) => {
          const isWedding = cell === d;
          const isSun = i % 7 === 0;
          return (
            <div key={i} style={{
              position: "relative",
              height: preview ? 16 : 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {isWedding && (
                <svg viewBox="0 0 24 24" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <path d="M12 20C12 20 3 14 3 8C3 5.2 5.2 3 8 3C9.6 3 11 3.8 12 5C13 3.8 14.4 3 16 3C18.8 3 21 5.2 21 8C21 14 12 20 12 20Z" fill="#ffb6c1"/>
                </svg>
              )}
              <span style={{
                position: "relative",
                zIndex: 1,
                fontSize: preview ? 7 : 11,
                fontFamily: mono,
                fontWeight: isWedding ? 700 : 400,
                color: isWedding
                  ? "#b5405a"
                  : (cell ? (isSun ? "rgba(200,60,60,0.65)" : theme.textBody) : "transparent"),
              }}>
                {cell ?? ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* D-Day */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: preview ? 8 : 14, marginTop: preview ? 10 : 20 }}>
        <div style={{ flex: 1, maxWidth: preview ? 28 : 48, height: 1, background: theme.flourishBg }} />
        <span style={{ fontFamily: mono, fontSize: preview ? 9 : 14, letterSpacing: "0.35em", color: theme.accentColor }}>
          {dday}
        </span>
        <div style={{ flex: 1, maxWidth: preview ? 28 : 48, height: 1, background: theme.flourishBg }} />
      </div>
    </div>
  );
}

const FONT_MAP: Record<string, string> = {
  "nanum-myeongjo": "var(--font-nanum), 'Nanum Myeongjo', serif",
  "noto-serif-kr": "var(--font-serif-kr), 'Noto Serif KR', serif",
  "gowun-dodum": "var(--font-gowun), 'Gowun Dodum', sans-serif",
  "nanum-gothic": "var(--font-nanum-gothic), 'Nanum Gothic', sans-serif",
};

const LIGHT_BG_SET = new Set(["#ffffff", "#f8f8f4", "#fffaf0", "#fff0f5"]);

interface SectionTheme {
  rootColor: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  sectionBg: string;
  sectionBorder: string;
  textPrimary: string;
  textBody: string;
  textMuted: string;
  textLabel: string;
  accentColor: string;
  accentShadow: string;
  flourishBg: string;
  flourishAccent: string;
  coupleDividerBg: string;
  coupleSymbolColor: string;
  parentColor: string;
  iconBg: string;
  iconBorder: string;
  accountRowBorder: string;
  copyBtnBorder: string;
  copyBtnColor: string;
}

function getTheme(bgColor: string): SectionTheme {
  if (LIGHT_BG_SET.has(bgColor.toLowerCase())) {
    return {
      rootColor: "#2a2420",
      cardBg: "rgba(255,255,255,0.78)",
      cardBorder: "rgba(0,0,0,0.07)",
      cardShadow: "0 2px 20px rgba(0,0,0,0.07)",
      sectionBg: "rgba(0,0,0,0.04)",
      sectionBorder: "rgba(0,0,0,0.07)",
      textPrimary: "#3a2f28",
      textBody: "#4a4440",
      textMuted: "#9a9490",
      textLabel: "#b0a898",
      accentColor: "#6b4c2a",
      accentShadow: "0 0 14px rgba(107,76,42,0.10)",
      flourishBg: "rgba(107,76,42,0.2)",
      flourishAccent: "rgba(107,76,42,0.45)",
      coupleDividerBg: "#e0d8d0",
      coupleSymbolColor: "#c8beb0",
      parentColor: "#9a8e82",
      iconBg: "rgba(0,0,0,0.04)",
      iconBorder: "rgba(0,0,0,0.08)",
      accountRowBorder: "rgba(0,0,0,0.08)",
      copyBtnBorder: "#d0c8c0",
      copyBtnColor: "#888",
    };
  }
  return {
    rootColor: "#F0F0F0",
    cardBg: "rgba(20,20,20,0.6)",
    cardBorder: "rgba(255,255,255,0.04)",
    cardShadow: "none",
    sectionBg: "rgba(255,255,255,0.04)",
    sectionBorder: "rgba(255,255,255,0.08)",
    textPrimary: "#D4AF37",
    textBody: "#C8C8C8",
    textMuted: "#888888",
    textLabel: "#585858",
    accentColor: "#D4AF37",
    accentShadow: "0 0 16px rgba(212,175,55,0.22)",
    flourishBg: "rgba(184,146,42,0.2)",
    flourishAccent: "rgba(184,146,42,0.45)",
    coupleDividerBg: "#1e1e1e",
    coupleSymbolColor: "#303030",
    parentColor: "#686868",
    iconBg: "rgba(255,255,255,0.06)",
    iconBorder: "rgba(255,255,255,0.1)",
    accountRowBorder: "rgba(255,255,255,0.07)",
    copyBtnBorder: "#262626",
    copyBtnColor: "#555",
  };
}

export default function FilmTheme({ data, preview = false }: FilmThemeProps) {
  const [albumOpen, setAlbumOpen] = useState(false);
  const [groomAccOpen, setGroomAccOpen] = useState(false);
  const [brideAccOpen, setBrideAccOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // ── Scroll-reset: when user reaches page top, re-arm all FadeIn animations
  const [animResetKey, setAnimResetKey] = useState(0);
  useEffect(() => {
    if (preview) return;
    let wasAtTop = true;
    const onScroll = () => {
      const atTop = window.scrollY < 80;
      if (atTop && !wasAtTop) {
        setAnimResetKey((k) => k + 1);
      }
      wasAtTop = atTop;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [preview]);
  const photos = data.photos ?? [];
  // 업로드 사진이 없으면 샘플 이미지로 필름롤 표시
  const galleryPhotos = photos.length > 0 ? photos : GALLERY_SAMPLES;

  const serif = (data.fontFamily && FONT_MAP[data.fontFamily])
    ? FONT_MAP[data.fontFamily]
    : "var(--font-nanum), var(--font-serif-kr), 'Apple SD Gothic Neo', serif";
  const sans = "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
  const mono = "monospace";

  const bgColor = data.mainBackgroundColor || "#0c0c0c";
  const theme = getTheme(bgColor);

  const divider: React.CSSProperties = {};
  const sp: React.CSSProperties = { padding: preview ? "20px 18px" : "56px 28px" };
  const slabel: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: "0.5em",
    color: theme.textLabel,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: preview ? 14 : 30,
  };
  // Sermo 이탤릭 장식 타이틀 (GALLERY, LOCATION)
  const sTitle: React.CSSProperties = {
    fontFamily: "'Sermo', serif",
    fontStyle: "italic",
    fontSize: preview ? 18 : 36,
    letterSpacing: "0.06em",
    color: theme.textBody,
    textAlign: "center",
    marginBottom: preview ? 14 : 28,
    lineHeight: 1,
  };

  const sectionOrder = data.sectionsOrder ?? DEFAULT_SECTIONS_ORDER;
  const orderOf = (id: SectionId) => sectionOrder.indexOf(id);

  return (
    <AnimResetCtx.Provider value={animResetKey}>
    <div
      style={{
        background: bgColor,
        color: theme.rootColor,
        fontFamily: serif,
        minHeight: "100%",
        position: "relative",
        overflow: "hidden",
        lineHeight: 1.85,
        letterSpacing: "0.035em",
      }}
    >
      {/* ── § 1  HERO ────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          ...(preview ? { aspectRatio: "3/4" } : { height: "100svh" }),
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

        {/* Background — 업로드 전엔 /samples/main-sample.jpg 표시 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.mainImage || "/samples/main-sample.jpg"}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        {/* Vignette — 세련된 빈티지 비네팅 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.48) 100%)",
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

        {/* Hero: 텍스트 없음 — 사진만 온전히 표시 */}

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

      {/* ── 예식 정보 요약 (히어로 직하단) */}
      <div style={{
        textAlign: "center",
        padding: preview ? "14px 18px" : "32px 28px",
        borderTop: `1px solid ${theme.sectionBorder}`,
        borderBottom: `1px solid ${theme.sectionBorder}`,
      }}>
        {/* 인트로 장식 이미지 (페이드인) */}
        {(() => {
          const shape = data.heroSvgShape || "heart";
          const decoImages: Record<string, string> = {
            heart:  "/samples/deco-heart.png",
            ribbon: "/samples/deco-ribbon.png",
            lace:   "/samples/deco-lace.png",
            lark:   "/samples/deco-lark.png",
          };
          return (
            <div style={{ margin: `0 auto ${preview ? 8 : 16}px`, width: preview ? 56 : 88, height: preview ? 18 : 28, position: "relative" }}>
              <motion.img
                src={decoImages[shape] ?? decoImages.heart}
                alt=""
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          );
        })()}

        <p style={{
          fontFamily: serif,
          fontSize: preview ? 10 : 15,
          color: theme.textBody,
          letterSpacing: "0.1em",
          lineHeight: 1.8,
          whiteSpace: "nowrap",
        }}>
          {data.date} · {data.time}
        </p>
        <div style={{ width: 16, height: 1, background: theme.flourishBg, margin: `${preview ? 5 : 9}px auto` }} />
        <p style={{
          fontFamily: serif,
          fontSize: preview ? 10 : 14,
          color: theme.textMuted,
          letterSpacing: "0.08em",
          lineHeight: 1.7,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {data.venue}
        </p>
        {data.address && (
          <p style={{
            fontFamily: "Pretendard, -apple-system, sans-serif",
            fontSize: preview ? 9 : 12,
            color: theme.textLabel,
            letterSpacing: "0.03em",
            lineHeight: 1.6,
            marginTop: preview ? 3 : 5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {data.address}
          </p>
        )}
      </div>

      {/* ── 섹션 컨테이너 (순서 + 가시성) ─────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── § 2  GREETING ────────────────────────────────────────────────── */}
      {data.showGreeting !== false && (
      <div style={{ order: orderOf("greeting") }}>
      <section style={{ ...sp, textAlign: "center" }}>
        <FadeIn>
          <div style={{
            background: theme.cardBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 14,
            padding: preview ? "14px 12px" : "32px 16px",
            border: `1px solid ${theme.cardBorder}`,
            boxShadow: theme.cardShadow,
          } as React.CSSProperties}>
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
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: theme.flourishBg }} />
            <span style={{ color: theme.flourishAccent, fontSize: preview ? 10 : 13 }}>✦</span>
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: theme.flourishBg }} />
          </div>

          <div style={{ padding: preview ? "0 4px" : "0 8px" }}>
            <StaggeredGreeting
              text={data.greeting || "두 사람이 하나가 되는 날,\n소중한 자리에 함께해 주세요."}
              serif={serif}
              textColor={theme.textBody}
              preview={preview}
            />
          </div>

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
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: theme.flourishBg }} />
            <span style={{ color: theme.flourishAccent, fontSize: preview ? 10 : 13 }}>✦</span>
            <div style={{ flex: 1, maxWidth: 48, height: 1, background: theme.flourishBg }} />
          </div>
          </div>
        </FadeIn>
      </section>
      </div>
      )}

      {/* ── § 3  COUPLE INFO (혼주소개) ──────────────────────────────────── */}
      {data.showCouple !== false && (
      <div style={{ order: orderOf("couple") }}>
      <section style={{ ...sp, textAlign: "center" }}>
        <FadeIn>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: preview ? 10 : 18 }}>

            {/* 신랑 줄 */}
            <p style={{ fontFamily: serif, fontSize: preview ? 10 : 13, color: theme.parentColor, letterSpacing: "0.04em", lineHeight: preview ? 1.8 : 2.2, textAlign: "center" }}>
              {data.groomParents && parentsLine(data.groomParents, "아들") && (
                <span style={{ fontWeight: 400 }}>{parentsLine(data.groomParents, "아들")}{" "}</span>
              )}
              <span style={{ fontSize: preview ? 12 : 16, fontWeight: 700, color: theme.textBody }}>{data.groomName}</span>
            </p>

            {/* 신부 줄 */}
            <p style={{ fontFamily: serif, fontSize: preview ? 10 : 13, color: theme.parentColor, letterSpacing: "0.04em", lineHeight: preview ? 1.8 : 2.2, textAlign: "center" }}>
              {data.brideParents && parentsLine(data.brideParents, "딸") && (
                <span style={{ fontWeight: 400 }}>{parentsLine(data.brideParents, "딸")}{" "}</span>
              )}
              <span style={{ fontSize: preview ? 12 : 16, fontWeight: 700, color: theme.textBody }}>{data.brideName}</span>
            </p>
          </div>

          {/* 연락하기 버튼 */}
          {!preview && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: preview ? 14 : 28 }}>
              <motion.button
                onClick={() => setContactOpen(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "11px 26px",
                  border: `1px solid ${theme.sectionBorder}`,
                  borderRadius: 999,
                  background: theme.sectionBg,
                  color: theme.textMuted,
                  fontSize: 13, letterSpacing: "0.16em",
                  cursor: "pointer", fontFamily: serif, fontWeight: 400,
                }}
              >
                <Phone size={13} color={theme.accentColor} />
                연락하기
              </motion.button>
            </div>
          )}

          {/* 구분선 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginTop: preview ? 12 : 24 }}>
            <div style={{ flex: 1, maxWidth: preview ? 32 : 56, height: 1, background: theme.flourishBg }} />
            <span style={{ color: theme.flourishAccent, fontSize: preview ? 8 : 11 }}>✦</span>
            <div style={{ flex: 1, maxWidth: preview ? 32 : 56, height: 1, background: theme.flourishBg }} />
          </div>

          {/* 날짜 텍스트 */}
          <p style={{
            fontFamily: serif,
            fontSize: preview ? 10 : 14,
            color: theme.textBody,
            letterSpacing: "0.1em",
            textAlign: "center",
            marginTop: preview ? 8 : 16,
          }}>
            {data.date}
          </p>

          {/* 캘린더 + D-Day */}
          <WeddingCalendar
            dateStr={data.date}
            preview={preview}
            serif={serif}
            mono={mono}
            theme={theme}
            bgColor={bgColor}
          />
        </FadeIn>
      </section>
      </div>
      )}

      {/* ── § 4  GALLERY (우리들의 이야기) ──────────────────────────────── */}
      {data.showGallery !== false && (
      <div style={{ order: orderOf("gallery") }}>
      <section style={{ ...sp, textAlign: "center" }}>
        <FadeIn>
          <p style={sTitle}>GALLERY</p>

          {/* Mini film strip — 사진 없으면 샘플로 표시, 있으면 클릭 가능 */}
          {(() => {
            const hasSamples = photos.length === 0;
            return (
            <div
              onClick={() => !preview && !hasSamples && setAlbumOpen(true)}
              style={{
                position: "relative",
                width: "100%",
                height: preview ? 110 : 150,
                marginBottom: preview ? 14 : 22,
                overflow: "hidden",
                background: "#000",
                border: "1px solid #222",
                boxShadow: "0 0 20px rgba(255,255,255,0.03), 0 0 40px rgba(212,175,55,0.05)",
                cursor: (!preview && !hasSamples) ? "pointer" : "default",
              }}
            >
              {/* Left/right fade mask */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(to right, ${bgColor} 0%, transparent 12%, transparent 88%, ${bgColor} 100%)`,
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
                          animationDuration: `${Math.max(galleryPhotos.length * 2.5, 5)}s`,
                          animationTimingFunction: "linear",
                          animationIterationCount: "infinite",
                        }
                      : {}
                  ),
                } as React.CSSProperties}
              >
                {(preview ? galleryPhotos.slice(0, 4) : [...galleryPhotos, ...galleryPhotos]).map((src, i) => (
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
                        {String((i % galleryPhotos.length) + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <Perforations count={preview ? 4 : 5} />
                  </div>
                ))}
              </div>
              {/* 클릭 힌트 (실제 사진이 있을 때만) */}
              {!preview && photos.length > 0 && (
                <div style={{
                  position: "absolute",
                  bottom: 6,
                  right: 8,
                  zIndex: 3,
                  fontFamily: mono,
                  fontSize: 7,
                  color: "rgba(255,255,255,0.28)",
                  letterSpacing: "0.18em",
                  pointerEvents: "none",
                }}>
                  TAP TO VIEW ALL
                </div>
              )}
            </div>
            );
          })()}
        </FadeIn>
      </section>
      </div>
      )}

      {/* ── § 5  네이버 / 카카오 지도 ─────────────────────────────────────── */}
      {data.showMap !== false && (
      <div style={{ order: orderOf("map") }}>
      <section style={{ ...sp }}>
        <FadeIn>
          <p style={sTitle}>LOCATION</p>

          {/* Venue display (날짜 제거, 예식장만 표시) */}
          <div
            style={{
              textAlign: "center",
              marginBottom: preview ? 14 : 28,
              background: theme.cardBg,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: 14,
              padding: preview ? "14px 16px" : "28px 24px",
              border: `1px solid ${theme.cardBorder}`,
              boxShadow: theme.cardShadow,
            } as React.CSSProperties}
          >
            <p
              style={{
                fontFamily: serif,
                fontSize: data.venue.length > 14 ? (preview ? 11 : 15) : (preview ? 13 : 18),
                color: theme.accentColor,
                textShadow: theme.accentShadow,
                letterSpacing: "0.12em",
                fontWeight: 400,
                marginBottom: 4,
                wordBreak: "keep-all" as React.CSSProperties["wordBreak"],
                lineHeight: 1.5,
              }}
            >
              {data.venue}
              {(() => {
                const detail = data.address.slice((data.roadAddress || "").length).trim().replace(/^[, ]+/, "");
                return detail ? <span style={{ fontSize: preview ? 9 : 12, color: theme.textMuted, fontWeight: 400, marginLeft: 5 }}>({detail})</span> : null;
              })()}
            </p>
            <p
              style={{
                fontFamily: "Pretendard, -apple-system, sans-serif",
                fontSize: preview ? 10 : 12,
                color: theme.textMuted,
                letterSpacing: "0.04em",
              }}
            >
              {data.roadAddress || data.address}
            </p>
          </div>

          {/* Kakao Map */}
          {!preview && data.address && (
            <KakaoMap address={data.address} />
          )}

          {/* Naver + Kakao navigation buttons */}
          {!preview && (
            <div style={{ display: "flex", gap: 9, marginTop: preview ? 10 : 18 }}>
              <a
                href={`https://map.naver.com/v5/search/${encodeURIComponent(data.roadAddress || data.address)}`}
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
                href={`https://map.kakao.com/link/search/${encodeURIComponent(data.roadAddress || data.address)}`}
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
      </div>
      )}

      {/* ── § 6  오시는 길 (교통안내) ─────────────────────────────────────── */}
      {data.showTransport !== false && (data.transport?.subway || data.transport?.bus || data.transport?.car) && (
      <div style={{ order: orderOf("transport") }}>
        <section style={{ ...sp }}>
          <FadeIn>
            <p style={{ ...slabel, fontSize: preview ? 18 : 36 }}>오시는 길</p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: preview ? 10 : 20,
                background: theme.sectionBg,
                borderRadius: 14,
                padding: preview ? "14px 16px" : "28px 24px",
                border: `1px solid ${theme.sectionBorder}`,
                boxShadow: theme.cardShadow,
              } as React.CSSProperties}
            >
              {data.transport?.subway && (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: preview ? 32 : 44,
                      height: preview ? 32 : 44,
                      flexShrink: 0,
                      background: theme.iconBg,
                      border: `1px solid ${theme.iconBorder}`,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: preview ? 14 : 20,
                    }}
                  >
                    🚇
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: mono,
                        fontSize: preview ? 8 : 10,
                        color: theme.textMuted,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 5,
                        fontWeight: 600,
                      }}
                    >
                      지하철
                    </p>
                    <p
                      style={{
                        fontFamily: serif,
                        fontSize: preview ? 11 : 13,
                        color: theme.textBody,
                        lineHeight: 1.9,
                      }}
                    >
                      {data.transport.subway}
                    </p>
                  </div>
                </div>
              )}

              {data.transport?.bus && (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: preview ? 32 : 44,
                      height: preview ? 32 : 44,
                      flexShrink: 0,
                      background: theme.iconBg,
                      border: `1px solid ${theme.iconBorder}`,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: preview ? 14 : 20,
                    }}
                  >
                    🚌
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: mono,
                        fontSize: preview ? 8 : 10,
                        color: theme.textMuted,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 5,
                        fontWeight: 600,
                      }}
                    >
                      버스
                    </p>
                    <p
                      style={{
                        fontFamily: serif,
                        fontSize: preview ? 11 : 13,
                        color: theme.textBody,
                        lineHeight: 1.9,
                      }}
                    >
                      {data.transport.bus}
                    </p>
                  </div>
                </div>
              )}

              {data.transport?.car && (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: preview ? 32 : 44,
                      height: preview ? 32 : 44,
                      flexShrink: 0,
                      background: theme.iconBg,
                      border: `1px solid ${theme.iconBorder}`,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: preview ? 14 : 20,
                    }}
                  >
                    🚗
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: mono,
                        fontSize: preview ? 8 : 10,
                        color: theme.textMuted,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 5,
                        fontWeight: 600,
                      }}
                    >
                      자가용
                    </p>
                    <p
                      style={{
                        fontFamily: serif,
                        fontSize: preview ? 11 : 13,
                        color: theme.textBody,
                        lineHeight: 1.9,
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
      </div>
      )}

      {/* ── § 7  마음 전하실 곳 — Accounts Accordion ───────────────────── */}
      {data.showAccounts !== false && (
        data.accounts?.groom || data.accounts?.groomFather || data.accounts?.groomMother ||
        data.accounts?.bride || data.accounts?.brideFather || data.accounts?.brideMother ||
        data.groomAccount || data.brideAccount
      ) && (
      <div style={{ order: orderOf("accounts") }}>
        <section style={{ ...sp }}>
          <FadeIn>
            <p
              style={{
                ...slabel,
                fontSize: preview ? 18 : 36,
                letterSpacing: "0.18em",
                color: theme.textMuted,
                marginBottom: preview ? 4 : 8,
              }}
            >
              마음 전하실 곳
            </p>
            <p style={{
              fontFamily: serif,
              fontSize: preview ? 8 : 11,
              color: theme.textLabel,
              textAlign: "center",
              letterSpacing: "0.03em",
              lineHeight: 1.7,
              marginBottom: preview ? 12 : 24,
              whiteSpace: "pre-line",
            }}>
              멀리서도 축하의 마음을{"\n"}전하고 싶으신 분들을 위해{"\n"}계좌번호를 안내드립니다.{"\n\n"}소중한 축하를 보내주셔서 감사드리며,{"\n"}따뜻한 마음에 깊이 감사드립니다.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: preview ? 8 : 12 }}>

              {/* 신랑측 아코디언 */}
              {(data.accounts?.groom || data.accounts?.groomFather || data.accounts?.groomMother || data.groomAccount) && (
                <div
                  style={{
                    background: theme.sectionBg,
                    borderRadius: 14,
                    border: `1px solid ${theme.sectionBorder}`,
                    boxShadow: theme.cardShadow,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => !preview && setGroomAccOpen((v) => !v)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: preview ? "11px 14px" : "18px 22px",
                      background: "none",
                      border: "none",
                      cursor: preview ? "default" : "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: preview ? 14 : 18 }}>💌</span>
                      <p
                        style={{
                          fontFamily: serif,
                          fontSize: preview ? 12 : 17,
                          color: theme.textBody,
                          letterSpacing: "0.12em",
                          fontWeight: 400,
                        }}
                      >
                        신랑측에게
                      </p>
                    </div>
                    {!preview && (
                      <motion.div
                        animate={{ rotate: groomAccOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown size={18} color={theme.textMuted} />
                      </motion.div>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {(groomAccOpen || preview) && (
                      <motion.div
                        key="groom-acc"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                            padding: preview ? "10px 14px 12px" : "18px 22px 22px",
                            display: "flex",
                            flexDirection: "column",
                            gap: preview ? 10 : 16,
                          }}
                        >
                          {/* 신랑 본인 */}
                          {(data.accounts?.groom || data.groomAccount) && (() => {
                            const acc = data.accounts?.groom;
                            const legacy = data.groomAccount;
                            const bank = acc?.bank ?? legacy?.bank ?? "";
                            const accountNumber = acc?.accountNumber ?? legacy?.number ?? "";
                            const name = acc?.name ?? legacy?.holder ?? "";
                            return bank || accountNumber ? (
                              <AccountRow
                                role="신랑"
                                bank={bank}
                                accountNumber={accountNumber}
                                name={name}
                                preview={preview}
                                serif={serif}
                                mono={mono}
                                theme={theme}
                              />
                            ) : null;
                          })()}
                          {/* 신랑 부친 */}
                          {data.accounts?.groomFather && (data.accounts.groomFather.bank || data.accounts.groomFather.accountNumber) && (
                            <AccountRow
                              role="부친"
                              bank={data.accounts.groomFather.bank}
                              accountNumber={data.accounts.groomFather.accountNumber}
                              name={data.accounts.groomFather.name}
                              preview={preview}
                              serif={serif}
                              mono={mono}
                              theme={theme}
                            />
                          )}
                          {/* 신랑 모친 */}
                          {data.accounts?.groomMother && (data.accounts.groomMother.bank || data.accounts.groomMother.accountNumber) && (
                            <AccountRow
                              role="모친"
                              bank={data.accounts.groomMother.bank}
                              accountNumber={data.accounts.groomMother.accountNumber}
                              name={data.accounts.groomMother.name}
                              preview={preview}
                              serif={serif}
                              mono={mono}
                              theme={theme}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 신부측 아코디언 */}
              {(data.accounts?.bride || data.accounts?.brideFather || data.accounts?.brideMother || data.brideAccount) && (
                <div
                  style={{
                    background: theme.sectionBg,
                    borderRadius: 14,
                    border: `1px solid ${theme.sectionBorder}`,
                    boxShadow: theme.cardShadow,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => !preview && setBrideAccOpen((v) => !v)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: preview ? "11px 14px" : "18px 22px",
                      background: "none",
                      border: "none",
                      cursor: preview ? "default" : "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: preview ? 14 : 18 }}>💌</span>
                      <p
                        style={{
                          fontFamily: serif,
                          fontSize: preview ? 12 : 17,
                          color: theme.textBody,
                          letterSpacing: "0.12em",
                          fontWeight: 400,
                        }}
                      >
                        신부측에게
                      </p>
                    </div>
                    {!preview && (
                      <motion.div
                        animate={{ rotate: brideAccOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown size={18} color={theme.textMuted} />
                      </motion.div>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {(brideAccOpen || preview) && (
                      <motion.div
                        key="bride-acc"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                            padding: preview ? "10px 14px 12px" : "18px 22px 22px",
                            display: "flex",
                            flexDirection: "column",
                            gap: preview ? 10 : 16,
                          }}
                        >
                          {/* 신부 본인 */}
                          {(data.accounts?.bride || data.brideAccount) && (() => {
                            const acc = data.accounts?.bride;
                            const legacy = data.brideAccount;
                            const bank = acc?.bank ?? legacy?.bank ?? "";
                            const accountNumber = acc?.accountNumber ?? legacy?.number ?? "";
                            const name = acc?.name ?? legacy?.holder ?? "";
                            return bank || accountNumber ? (
                              <AccountRow
                                role="신부"
                                bank={bank}
                                accountNumber={accountNumber}
                                name={name}
                                preview={preview}
                                serif={serif}
                                mono={mono}
                                theme={theme}
                              />
                            ) : null;
                          })()}
                          {/* 신부 부친 */}
                          {data.accounts?.brideFather && (data.accounts.brideFather.bank || data.accounts.brideFather.accountNumber) && (
                            <AccountRow
                              role="부친"
                              bank={data.accounts.brideFather.bank}
                              accountNumber={data.accounts.brideFather.accountNumber}
                              name={data.accounts.brideFather.name}
                              preview={preview}
                              serif={serif}
                              mono={mono}
                              theme={theme}
                            />
                          )}
                          {/* 신부 모친 */}
                          {data.accounts?.brideMother && (data.accounts.brideMother.bank || data.accounts.brideMother.accountNumber) && (
                            <AccountRow
                              role="모친"
                              bank={data.accounts.brideMother.bank}
                              accountNumber={data.accounts.brideMother.accountNumber}
                              name={data.accounts.brideMother.name}
                              preview={preview}
                              serif={serif}
                              mono={mono}
                              theme={theme}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </FadeIn>
        </section>
      </div>
      )}

      {/* ── § 8  방명록 ───────────────────────────────────────────────────── */}
      {data.showGuestBook !== false && (
      <div style={{ order: orderOf("guestbook") }}>
        <section style={{ ...sp }}>
          <FadeIn>
            <p style={{ ...slabel, marginBottom: preview ? 6 : 14 }}>방 명 록</p>
            <GuestBook preview={preview} serif={serif} mono={mono} theme={theme} mode={data.guestbookMode || "tree"} />
          </FadeIn>
        </section>
      </div>
      )}

      </div>{/* end 섹션 컨테이너 */}

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: preview ? "18px 0" : "36px 0",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: mono,
            fontSize: 8,
            color: theme.textLabel,
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

      {/* ── CONTACT MODAL ──────────────────────────────────────────────────── */}
      {!preview && (
        <ContactModal
          open={contactOpen}
          onClose={() => setContactOpen(false)}
          data={data}
          serif={serif}
          mono={mono}
        />
      )}

      {/* ── FALLING PARTICLES ──────────────────────────────────────────────── */}
      {data.particleEffect && data.particleEffect !== "none" && (
        <FallingParticles type={data.particleEffect} preview={preview} />
      )}

      {/* ── DARK BG GRAIN OVERLAY ──────────────────────────────────────────── */}
      {!LIGHT_BG_SET.has(bgColor.toLowerCase()) && <FilmGrain dark />}
    </div>
    </AnimResetCtx.Provider>
  );
}
