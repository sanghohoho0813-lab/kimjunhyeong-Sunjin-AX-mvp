import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: {
    default: "선진산업 Business AX",
    template: "%s · 선진산업 Business AX",
  },
  description:
    "피혁 거래·재고·영업·경영 의사결정 시스템 — 매출·재무·거래처·재고를 연결해 오늘 필요한 의사결정을 지원합니다.",
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
