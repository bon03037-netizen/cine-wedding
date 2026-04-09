import type { Metadata } from "next";
import { Noto_Serif_KR, Nanum_Myeongjo, Gowun_Dodum, Nanum_Gothic } from "next/font/google";
import "./globals.css";
import KakaoInit from "@/components/KakaoInit";

const notoSerifKR = Noto_Serif_KR({
  weight: ["300", "400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif-kr",
});

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nanum",
});

const gowunDodum = Gowun_Dodum({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gowun",
});

const nanumGothic = Nanum_Gothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nanum-gothic",
});

export const metadata: Metadata = {
  title: "Cine Wedding",
  description: "아름다운 모바일 청첩장을 간편하게",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body
        className={`${notoSerifKR.variable} ${nanumMyeongjo.variable} ${gowunDodum.variable} ${nanumGothic.variable} antialiased`}
      >
        {children}
        {/* Kakao SDK: afterInteractive 로드 후 onLoad에서 단 한 번 init */}
        <KakaoInit />
      </body>
    </html>
  );
}
