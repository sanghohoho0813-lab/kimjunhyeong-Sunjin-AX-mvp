import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { InternalRouteGuard } from "@/components/layout/InternalRouteGuard";

export const metadata: Metadata = {
  title: {
    default: "선진산업 Business AX",
    template: "%s · 선진산업 Business AX",
  },
};

/** 내부 운영 시스템 — 대표·직원용. 고객 계정은 진입할 수 없다. */
export default function InternalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <InternalRouteGuard>
      <AppShell>{children}</AppShell>
    </InternalRouteGuard>
  );
}
