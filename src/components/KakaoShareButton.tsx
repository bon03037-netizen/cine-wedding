"use client";

import { useEffect, useRef } from "react";

// ── Kakao SDK 전역 타입 선언 ───────────────────────────────────────────────
declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (appKey: string) => void;
      Share: {
        sendDefault: (options: KakaoFeedOptions) => void;
      };
    };
  }
}

interface KakaoLink {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoFeedContent {
  title: string;
  description?: string;
  imageUrl?: string;
  link: KakaoLink;
}

interface KakaoFeedButton {
  title: string;
  link: KakaoLink;
}

interface KakaoFeedOptions {
  objectType: "feed";
  content: KakaoFeedContent;
  buttons?: KakaoFeedButton[];
}

// ── Props ─────────────────────────────────────────────────────────────────
export interface KakaoShareButtonProps {
  /** 카카오톡 메시지 제목 */
  title: string;
  /** 카카오톡 메시지 설명 */
  description?: string;
  /**
   * 썸네일 이미지 URL.
   * 상대 경로(/samples/...)가 들어와도 origin을 자동으로 붙여 절대 경로로 변환합니다.
   */
  imageUrl?: string;
  /**
   * 버튼 클릭 시 이동할 URL.
   * 상대 경로도 자동으로 절대 경로로 변환됩니다.
   */
  linkUrl: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// ── 상대 경로 → 절대 경로 변환 헬퍼 ─────────────────────────────────────
function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // 브라우저 환경에서만 origin 접근
  if (typeof window !== "undefined") {
    return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
  }
  return url;
}

// ── KakaoShareButton ──────────────────────────────────────────────────────
export default function KakaoShareButton({
  title,
  description,
  imageUrl,
  linkUrl,
  children,
  className,
  style,
}: KakaoShareButtonProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    const tryInit = () => {
      if (!window.Kakao) return false;
      if (window.Kakao.isInitialized()) {
        initializedRef.current = true;
        return true;
      }
      const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
      if (!key) {
        console.warn("[KakaoShareButton] NEXT_PUBLIC_KAKAO_JS_KEY 환경변수가 없습니다.");
        return false;
      }
      window.Kakao.init(key);
      initializedRef.current = true;
      return true;
    };

    // SDK가 이미 로드된 경우 즉시 초기화
    if (tryInit()) return;

    // lazyOnload 전략으로 SDK가 아직 없으면 폴링으로 대기
    const intervalId = setInterval(() => {
      if (tryInit()) clearInterval(intervalId);
    }, 200);

    return () => clearInterval(intervalId);
  }, []);

  const handleShare = () => {
    if (!window.Kakao?.Share) {
      alert("카카오 SDK가 아직 로드되지 않았습니다.\n잠시 후 다시 시도해 주세요.");
      return;
    }

    if (!window.Kakao.isInitialized()) {
      const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
      if (!key) {
        alert("카카오 앱 키가 설정되지 않았습니다.\n.env.local의 NEXT_PUBLIC_KAKAO_JS_KEY를 확인해 주세요.");
        return;
      }
      window.Kakao.init(key);
    }

    const absLink = toAbsoluteUrl(linkUrl);
    const link: KakaoLink = { mobileWebUrl: absLink, webUrl: absLink };

    const content: KakaoFeedContent = {
      title,
      description,
      link,
    };

    // 이미지가 있으면 절대 경로로 변환 후 포함
    const absImage = imageUrl ? toAbsoluteUrl(imageUrl) : undefined;
    if (absImage) content.imageUrl = absImage;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content,
      buttons: [
        {
          title: "청첩장 확인하기",
          link,
        },
      ],
    });
  };

  return (
    <button onClick={handleShare} className={className} style={style} type="button">
      {children}
    </button>
  );
}
