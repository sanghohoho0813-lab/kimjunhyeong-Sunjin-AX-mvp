"use client";

import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Sheet } from "@/components/shared/Sheet";
import { EmptyState } from "@/components/shared/ui";
import { generateBusinessAlerts } from "@/lib/insights/alerts";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils/format";
import { clsx } from "@/lib/utils/clsx";

const CATEGORY_TONE: Record<string, string> = {
  재고: "bg-amber-50 text-amber-700",
  거래처: "bg-brand-50 text-brand-700",
  견적: "bg-teal-50 text-teal-700",
  재무: "bg-rose-50 text-rose-600",
};

export function AlertDrawer() {
  const open = useAppStore((s) => s.alertsOpen);
  const setOpen = useAppStore((s) => s.setAlertsOpen);
  const markAlertsRead = useAppStore((s) => s.markAlertsRead);
  const alerts = generateBusinessAlerts();

  // 드로어를 열면 읽음 처리
  useEffect(() => {
    if (open && alerts.length) {
      const timer = setTimeout(
        () => markAlertsRead(alerts.map((a) => a.id)),
        800
      );
      return () => clearTimeout(timer);
    }
  }, [open, alerts, markAlertsRead]);

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title={
        <span className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-brand-600" aria-hidden />
          알림 센터
        </span>
      }
    >
      {alerts.length === 0 ? (
        <EmptyState message="새로운 알림이 없습니다." />
      ) : (
        <ul className="space-y-2.5">
          {alerts.map((alert) => {
            const inner = (
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[0.66rem] font-bold",
                        CATEGORY_TONE[alert.category] ?? "bg-navy-50 text-navy-500"
                      )}
                    >
                      {alert.category}
                    </span>
                    <span className="text-[0.68rem] text-navy-400">
                      {formatDate(alert.date)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold leading-snug text-navy-900">
                    {alert.title}
                  </p>
                  <p className="mt-1 text-[0.8rem] leading-relaxed text-navy-500">
                    {alert.body}
                  </p>
                </div>
                {alert.href ? (
                  <ChevronRight
                    className="mt-1 h-4 w-4 shrink-0 text-navy-300"
                    aria-hidden
                  />
                ) : null}
              </div>
            );
            return (
              <li key={alert.id}>
                {alert.href ? (
                  <Link
                    href={alert.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-card border border-surface-line bg-white p-3.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="rounded-card border border-surface-line bg-white p-3.5">
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
