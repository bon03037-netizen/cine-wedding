"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Copy, Check, X } from "lucide-react";
import { WeddingData, DEFAULT_SECTIONS_ORDER, SectionId, parentsLine, fullName } from "./FilmTheme";
import FilmGallery from "./sections/FilmGallery";
import KakaoMap from "../KakaoMap";
// ── Constants ─────────────────────────────────────────────────────────────────

const C = {
  bg: "#080808",
  surface: "#0e0e0e",
  text: "#F5F5F5",
  muted: "#707070",
  faint: "#303030",
  divider: "rgba(245,245,245,0.06)",
  serif: "var(--font-serif-kr), 'Times New Roman', serif",
  sans: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'Courier New', monospace",
} as const;

// ── FadeIn Wrapper ────────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  preview = false,
}: {
  children: React.ReactNode;
  delay?: number;
  preview?: boolean;
}) {
  if (preview) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.0, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Copy Button ───────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "7px 14px",
        border: `1px solid ${C.divider}`,
        borderRadius: 2,
        background: "none",
        color: copied ? "#86efac" : C.faint,
        fontSize: 10, cursor: "pointer",
        letterSpacing: "0.1em", flexShrink: 0,
        transition: "color 0.2s",
        fontFamily: C.mono,
      }}
    >
      {copied ? <><Check size={9} />복사됨</> : <><Copy size={9} />복사</>}
    </button>
  );
}

// ── Gallery Overlay ───────────────────────────────────────────────────────────

function GalleryOverlay({
  photos,
  onClose,
}: {
  photos: string[];
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#080808",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px",
          borderBottom: `1px solid ${C.divider}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span
            style={{
              fontFamily: C.mono, fontSize: 9,
              letterSpacing: "0.45em", color: C.faint,
              textTransform: "uppercase",
            }}
          >
            Gallery
          </span>
          <span style={{ fontFamily: C.mono, fontSize: 8, color: "#222", letterSpacing: "0.2em" }}>
            {String(photos.length).padStart(2, "0")} Frames
          </span>
        </div>

        <motion.button
          onClick={onClose}
          whileHover={{ color: "#aaa", rotate: 90 }}
          transition={{ duration: 0.25 }}
          style={{
            color: "#444", background: "none", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center",
          }}
        >
          <X size={18} />
        </motion.button>
      </div>

      {/* ── Scrollable film stream ── */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "scroll", paddingTop: 48, paddingBottom: 96 }}
      >
        <FilmGallery
          photos={photos}
          preview={false}
          scrollContainerRef={scrollRef as any}
        />
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  data: WeddingData;
  preview?: boolean;
}

export default function CinematicTheme({ data, preview = false }: Props) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { scrollY } = useScroll();
  const sectionOrder = data.sectionsOrder ?? DEFAULT_SECTIONS_ORDER;
  const orderOf = (id: SectionId) => sectionOrder.indexOf(id);

  // Parallax — bg moves slow (-42), text moves slightly faster (-68)
  const bgY    = useTransform(scrollY, [0, 900], [0, preview ? 0 : -42]);
  const textY  = useTransform(scrollY, [0, 900], [0, preview ? 0 : -68]);
  const heroOp = useTransform(scrollY, [0, 480], [1, preview ? 1 : 0]);

  // Body scroll lock while gallery is open
  useEffect(() => {
    if (preview) return;
    document.body.style.overflow = galleryOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [galleryOpen, preview]);

  const S = {
    section: {
      borderTop: `1px solid ${C.divider}`,
      padding: preview ? "24px 22px" : "88px 48px",
    } as React.CSSProperties,
    label: {
      fontSize: 9, letterSpacing: "0.48em",
      color: C.faint, textTransform: "uppercase" as const,
      textAlign: "center" as const,
      marginBottom: preview ? 16 : 44,
      fontFamily: C.mono,
    } as React.CSSProperties,
  };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: C.sans, minHeight: "100%" }}>

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          height: preview ? 280 : "100svh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background — slow zoom + parallax */}
        <motion.div
          style={{ position: "absolute", inset: "-10%", y: bgY }}
          initial={{ scale: 1 }}
          animate={{ scale: preview ? 1 : 1.05 }}
          transition={{ duration: preview ? 0 : 20, ease: "linear" }}
        >
          {data.mainImage ? (
            <img
              src={data.mainImage}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.42 }}
            />
          ) : (
            <div
              style={{
                width: "100%", height: "100%",
                background: "radial-gradient(ellipse at 50% 60%, #161616 0%, #080808 70%)",
              }}
            />
          )}
        </motion.div>

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            background:
              "linear-gradient(to bottom, rgba(8,8,8,0.4) 0%, transparent 25%, transparent 55%, rgba(8,8,8,0.95) 100%)",
          }}
        />

        {/* 히어로: 텍스트 없음 — 사진만 온전히 표시 */}

        {/* Scroll line indicator */}
        {!preview && (
          <motion.div
            style={{
              position: "absolute", bottom: 48, left: "50%", x: "-50%",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 1.2 }}
          >
            <motion.div
              style={{ width: 1, height: 52, background: "rgba(245,245,245,0.12)", originY: 0 }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", repeatDelay: 0.4 }}
            />
            <span style={{ fontFamily: C.mono, fontSize: 8, letterSpacing: "0.45em", color: "#2e2e2e" }}>
              SCROLL
            </span>
          </motion.div>
        )}
      </section>

      {/* ── 섹션 컨테이너 (순서 + 가시성) ─────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── 2. GREETING ──────────────────────────────────────────────────── */}
      {data.showGreeting !== false && (
      <div style={{ order: orderOf("greeting") }}>
      <FadeIn preview={preview}>
        <section style={S.section}>
          <p style={S.label}>Invitation</p>
          <p
            style={{
              fontSize: preview ? 11 : 15, lineHeight: preview ? 2.1 : 2.8,
              color: "#8a8a8a", whiteSpace: "pre-line", textAlign: "center",
              fontFamily: C.serif, fontWeight: 300,
              maxWidth: 520, margin: "0 auto",
            }}
          >
            {data.greeting}
          </p>
        </section>
      </FadeIn>
      </div>
      )}

      {/* ── 3. CEREMONY (Date + Venue) ────────────────────────────────────── */}
      {data.showMap !== false && (
      <div style={{ order: orderOf("map") }}>
      <FadeIn preview={preview}>
        <section style={S.section}>
          <p style={S.label}>Ceremony</p>
          <div style={{ maxWidth: 380, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <Calendar size={12} color={C.faint} style={{ marginTop: 4, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: preview ? 13 : 16, color: C.text, fontFamily: C.serif, fontWeight: 100, letterSpacing: "0.12em", lineHeight: 1.4 }}>
                  {data.date}
                </p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 5, letterSpacing: "0.12em" }}>{data.time}</p>
              </div>
            </div>
            <div style={{ height: 1, background: C.divider }} />
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <MapPin size={12} color={C.faint} style={{ marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: preview ? 13 : 16, color: C.text, fontFamily: C.serif, fontWeight: 100, letterSpacing: "0.12em", lineHeight: 1.4 }}>
                  {data.venue}
                </p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>{data.address}</p>

                {/* Kakao Map */}
                {!preview && data.address && (
                  <div style={{ marginTop: 16 }}>
                    <KakaoMap address={data.address} />
                  </div>
                )}

                {/* Naver + Kakao map buttons */}
                {!preview && (
                  <div style={{ display: "flex", gap: 8, marginTop: 0 }}>
                    <a
                      href={`https://map.naver.com/v5/search/${encodeURIComponent(data.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 6, padding: "10px 0",
                        background: "#03C75A", borderRadius: 8,
                        color: "#fff", fontSize: 12, fontFamily: C.sans,
                        textDecoration: "none", letterSpacing: "0.04em", fontWeight: 600,
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      네이버 지도
                    </a>
                    <a
                      href={`https://map.kakao.com/link/search/${encodeURIComponent(data.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 6, padding: "10px 0",
                        background: "#FEE500", borderRadius: 8,
                        color: "#3C1E1E", fontSize: 12, fontFamily: C.sans,
                        textDecoration: "none", letterSpacing: "0.04em", fontWeight: 600,
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#3C1E1E">
                        <path d="M12 3C6.48 3 2 6.92 2 11.77c0 3.1 1.73 5.83 4.37 7.49-.19.65-.68 2.34-.78 2.7-.12.44.16.44.34.32.14-.1 1.89-1.24 2.66-1.74.78.1 1.58.16 2.41.16 5.52 0 10-3.92 10-8.77C22 6.92 17.52 3 12 3z" />
                      </svg>
                      카카오내비
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
      </div>
      )}

      {/* ── 4. GALLERY BUTTON ────────────────────────────────────────────── */}
      {data.showGallery !== false && (
      <div style={{ order: orderOf("gallery") }}>
      <FadeIn preview={preview}>
        <section
          style={{
            borderTop: `1px solid ${C.divider}`,
            padding: preview ? "28px 22px" : "88px 48px",
            textAlign: "center",
          }}
        >
          <motion.button
            onClick={() => !preview && setGalleryOpen(true)}
            whileHover={preview ? {} : {
              borderColor: "rgba(245,245,245,0.26)",
              background: "rgba(245,245,245,0.04)",
            }}
            whileTap={preview ? {} : { scale: 0.985 }}
            transition={{ duration: 0.35 }}
            style={{
              background: "rgba(245,245,245,0.025)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(245,245,245,0.1)",
              padding: preview ? "14px 30px" : "22px 60px",
              color: "#b0b0b0",
              fontFamily: C.mono,
              cursor: preview ? "default" : "pointer",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: preview ? 5 : 8,
            }}
          >
            <span
              style={{
                fontSize: preview ? 9 : 11,
                letterSpacing: preview ? "0.18em" : "0.3em",
                textTransform: "uppercase",
              }}
            >
              우리의 여정 더 보기
            </span>
            <span
              style={{
                fontSize: preview ? 7 : 9,
                letterSpacing: preview ? "0.1em" : "0.22em",
                color: "rgba(245,245,245,0.28)",
                textTransform: "uppercase",
              }}
            >
              View Full Gallery
            </span>
          </motion.button>

          {!preview && (
            <p
              style={{
                marginTop: 18,
                fontSize: 10,
                color: "#252525",
                fontFamily: C.mono,
                letterSpacing: "0.14em",
              }}
            >
              버튼을 누르면 새로운 갤러리 창이 열립니다
            </p>
          )}
        </section>
      </FadeIn>
      </div>
      )}

      {/* ── 5. THE COUPLE ────────────────────────────────────────────────── */}
      {data.showCouple !== false && (
      <div style={{ order: orderOf("couple") }}>
      <FadeIn preview={preview}>
        <section style={S.section}>
          <p style={S.label}>The Couple</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "start",
              gap: preview ? 10 : 40,
              textAlign: "center",
            }}
          >
            {(["groom", "bride"] as const).map((side) => {
              const name = side === "groom" ? data.groomName : data.brideName;
              const parents = side === "groom" ? data.groomParents : data.brideParents;
              const relation = side === "groom" ? "아들" as const : "딸" as const;
              const line = parents ? parentsLine(parents, relation) : "";
              return (
                <div key={side}>
                  <p style={{ fontSize: 8, color: C.faint, marginBottom: 10, letterSpacing: "0.2em", fontFamily: C.mono }}>
                    {side === "groom" ? "신랑" : "신부"}
                  </p>
                  <p style={{ fontSize: preview ? 15 : 26, fontWeight: 100, fontFamily: C.serif, color: C.text, letterSpacing: "0.16em", lineHeight: 1.2 }}>
                    {name}
                  </p>
                  {line && (
                    <p style={{ fontSize: 10, color: "#484848", lineHeight: 2.2, marginTop: 8 }}>
                      {line}
                    </p>
                  )}
                </div>
              );
            })}
            <div style={{ width: 1, height: preview ? 64 : 120, background: C.divider, margin: "18px auto 0" }} />
          </div>
        </section>
      </FadeIn>
      </div>
      )}

      {/* ── 6. MAP / 오시는 길 ───────────────────────────────────────────── */}
      {data.showTransport !== false && (
      <div style={{ order: orderOf("transport") }}>
      <FadeIn preview={preview}>
        <section style={{ borderTop: `1px solid ${C.divider}` }}>
          <p style={{ ...S.label, padding: preview ? "20px 0 14px" : "72px 0 36px" }}>오시는 길</p>
          {(data.transport?.bus || data.transport?.car) && (
            <div style={{ padding: preview ? "14px 22px 18px" : "32px 48px 52px", display: "flex", flexDirection: "column", gap: 12 }}>
              {data.transport.bus && (
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>🚌</span>
                  <p style={{ fontSize: 11, color: "#505050", lineHeight: 2 }}>{data.transport.bus}</p>
                </div>
              )}
              {data.transport.car && (
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>🚗</span>
                  <p style={{ fontSize: 11, color: "#505050", lineHeight: 2 }}>{data.transport.car}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </FadeIn>
      </div>
      )}

      {/* ── 7. ACCOUNTS ──────────────────────────────────────────────────── */}
      {data.showAccounts !== false && (data.groomAccount || data.brideAccount) && (
      <div style={{ order: orderOf("accounts") }}>
        <FadeIn preview={preview}>
          <section style={S.section}>
            <p style={S.label}>마음 전하기</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420, margin: "0 auto" }}>
              {[
                { account: data.groomAccount, label: "신랑측" },
                { account: data.brideAccount, label: "신부측" },
              ].map(({ account, label }) =>
                account ? (
                  <div
                    key={label}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: C.surface, border: `1px solid ${C.divider}`, padding: "14px 16px",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 8, color: C.faint, marginBottom: 6, fontFamily: C.mono, letterSpacing: "0.2em" }}>{label}</p>
                      <p style={{ fontSize: 12, color: "#a0a0a0", letterSpacing: "0.08em" }}>{account.bank} {account.number}</p>
                      <p style={{ fontSize: 10, color: "#4a4a4a", marginTop: 4 }}>{account.holder}</p>
                    </div>
                    <CopyBtn text={account.number} />
                  </div>
                ) : null
              )}
            </div>
          </section>
        </FadeIn>
      </div>
      )}

      </div>{/* end 섹션 컨테이너 */}

      {/* ── 8. FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.divider}`, padding: preview ? "20px 0" : "52px 0", textAlign: "center" }}>
        <p style={{ fontFamily: C.mono, fontSize: 8, color: "#1c1c1c", letterSpacing: "0.5em", textTransform: "uppercase" }}>
          Toast Wedding
        </p>
      </footer>

      {/* ── GALLERY OVERLAY ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {galleryOpen && (
          <GalleryOverlay
            photos={data.photos ?? []}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
