"use client";

import { useRef, useState, useMemo } from "react";
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

export type SectionId = "greeting" | "couple" | "gallery" | "map" | "transport" | "accounts";

export const DEFAULT_SECTIONS_ORDER: SectionId[] = [
  "greeting", "couple", "gallery", "map", "transport", "accounts",
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
        opacity: strong ? 0.08 : 0.04, // 농도를 확 낮춰서 은은하게!
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
        mixBlendMode: "overlay", // screen보다 훨씬 자연스러운 질감을 줍니다.
      } as React.CSSProperties}
    />
  );
}


function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }} // 45에서 80으로! 더 밑에서 올라옵니다.
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] }} // 시간을 1.3에서 1.8로 늘려 훨씬 우아하게!
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
  const isInView = useInView(ref, { once: false, amount: 0.2 });
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
      <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.35em", color: "#D4AF37", textTransform: "uppercase", marginBottom: 10 }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {contacts.map((c, i) => (
          <a
            key={i}
            href={`tel:${c.phone}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.09)",
              textDecoration: "none",
            }}
          >
            <div>
              <p style={{ fontFamily: mono, fontSize: 9, color: "#7a7a7a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>
                {c.role}
              </p>
              <p style={{ fontFamily: serif, fontSize: 16, color: "#d4d4d4", letterSpacing: "0.1em" }}>
                {c.name}
              </p>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(212,175,55,0.14)",
              border: "1px solid rgba(212,175,55,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Phone size={15} color="#D4AF37" />
            </div>
          </a>
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
              background: "#111111",
              borderRadius: "20px 20px 0 0",
              padding: "20px 20px 44px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            className="hide-scrollbar"
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ width: 36, height: 4, background: "#2e2e2e", borderRadius: 2 }} />
            </div>
            <p style={{
              fontFamily: mono, fontSize: 9, letterSpacing: "0.5em",
              color: "#505050", textAlign: "center", marginBottom: 24,
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
              height: preview ? 16 : 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              fontSize: preview ? 7 : 11,
              fontFamily: mono,
              fontWeight: isWedding ? 700 : 400,
              background: isWedding ? theme.accentColor : "transparent",
              color: isWedding
                ? (isLight ? "#fff" : "#050505")
                : (cell
                    ? (isSun ? "rgba(200,60,60,0.65)" : theme.textBody)
                    : "transparent"),
            }}>
              {cell ?? ""}
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

      {/* ── 예식 정보 요약 (히어로 직하단) ─────────────────────────────── */}
      <div style={{
        textAlign: "center",
        padding: preview ? "12px 18px" : "28px 28px",
        borderTop: `1px solid ${theme.sectionBorder}`,
        borderBottom: `1px solid ${theme.sectionBorder}`,
        margin: preview ? "0" : "0",
      }}>
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
        <div style={{ width: 16, height: 1, background: theme.flourishBg, margin: `${preview ? 6 : 10}px auto` }} />
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
                <>{parentsLine(data.groomParents, "아들")}{" "}</>
              )}
              {data.groomName}
            </p>

            {/* 신부 줄 */}
            <p style={{ fontFamily: serif, fontSize: preview ? 10 : 13, color: theme.parentColor, letterSpacing: "0.04em", lineHeight: preview ? 1.8 : 2.2, textAlign: "center" }}>
              {data.brideParents && parentsLine(data.brideParents, "딸") && (
                <>{parentsLine(data.brideParents, "딸")}{" "}</>
              )}
              {data.brideName}
            </p>
          </div>

          {/* 캘린더 + D-Day */}
          <WeddingCalendar
            dateStr={data.date}
            preview={preview}
            serif={serif}
            mono={mono}
            theme={theme}
            bgColor={bgColor}
          />

          {/* 연락하기 버튼 */}
          {!preview && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
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
                fontSize: preview ? 13 : 18,
                color: theme.accentColor,
                textShadow: theme.accentShadow,
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
                color: theme.textMuted,
                letterSpacing: "0.04em",
              }}
            >
              {data.address}
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
            <p style={{ ...slabel }}>오 시 는 길</p>
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
                        fontSize: preview ? 9 : 11,
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
                        fontSize: preview ? 12 : 15,
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
                        fontSize: preview ? 9 : 11,
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
                        fontSize: preview ? 12 : 15,
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
                        fontSize: preview ? 9 : 11,
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
                        fontSize: preview ? 12 : 15,
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
                fontSize: preview ? 12 : 22,
                letterSpacing: "0.18em",
                color: "#9a9a9a",
                marginBottom: preview ? 16 : 36,
              }}
            >
              마음 전하실 곳
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
                        신랑측 계좌번호
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
                        신부측 계좌번호
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
    </div>
  );
}
