import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  weight: ["300", "400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif-kr",
});

export const metadata: Metadata = {
  title: "Toast Wedding",
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
      <body className={`${notoSerifKR.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
