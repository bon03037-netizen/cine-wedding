import type { Metadata } from "next";
import { Noto_Serif_KR, Nanum_Myeongjo, Gowun_Dodum, Nanum_Gothic } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        {/* 카카오 JavaScript SDK — lazyOnload로 비동기 로드 */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCmbVXZbxeUKRNDg-Nmg22zePe10Fwt//Dkpsg1fE2uIeL1QZdBjIfXkE8O2P8n"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
