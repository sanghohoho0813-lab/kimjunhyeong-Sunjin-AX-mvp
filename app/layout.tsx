import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "선진산업 — 제품에 맞는 최적의 피혁",
    template: "%s · 선진산업",
  },
  description:
    "소재·색상·두께·등급으로 피혁을 빠르게 찾고 샘플과 견적을 요청하세요. 선진산업의 안정적 품질과 납기로 공급합니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1426",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        {/* 웹폰트 — React가 head로 hoist한다 (CSS @import 체인 대신 병렬 로드) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          precedence="default"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {children}
      </body>
    </html>
  );
}
