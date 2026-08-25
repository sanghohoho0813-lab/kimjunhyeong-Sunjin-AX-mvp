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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
