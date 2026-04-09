"use client";

// window.Kakao 타입 선언
declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (options: object) => void;
      };
    };
  }
}

export interface KakaoShareButtonProps {
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  venue: string;
  /** 썸네일. 상대경로(/samples/...)도 자동으로 절대 경로로 변환됩니다. */
  imageUrl?: string;
}

/** 상대 경로를 현재 origin 기준 절대 URL로 변환 */
function toAbsolute(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function KakaoShareButton({
  groomName,
  brideName,
  date,
  time,
  venue,
  imageUrl,
}: KakaoShareButtonProps) {
  const handleShare = () => {
    if (!window.Kakao?.Share) {
      alert("카카오 공유 기능을 불러오는 중입니다.\n잠시 후 다시 시도해 주세요.");
      return;
    }

    const linkUrl = window.location.href;
    const absImage = imageUrl ? toAbsolute(imageUrl) : undefined;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${groomName} ♥ ${brideName} 결혼합니다`,
        description: `${date} ${time}\n${venue}`,
        ...(absImage ? { imageUrl: absImage } : {}),
        link: { mobileWebUrl: linkUrl, webUrl: linkUrl },
      },
      buttons: [
        {
          title: "청첩장 확인하기",
          link: { mobileWebUrl: linkUrl, webUrl: linkUrl },
        },
      ],
    });
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        padding: "15px 0",
        background: "#FEE500",
        border: "none",
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 700,
        color: "#3C1E1E",
        cursor: "pointer",
        letterSpacing: "0.03em",
        boxShadow: "0 2px 12px rgba(254,229,0,0.35)",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {/* KakaoTalk bubble icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#3C1E1E" aria-hidden>
        <path d="M12 3C6.48 3 2 6.92 2 11.77c0 3.1 1.73 5.83 4.37 7.49-.19.65-.68 2.34-.78 2.7-.12.44.16.44.34.32.14-.1 1.89-1.24 2.66-1.74.78.1 1.58.16 2.41.16 5.52 0 10-3.92 10-8.77C22 6.92 17.52 3 12 3z" />
      </svg>
      카카오톡으로 공유하기
    </button>
  );
}
