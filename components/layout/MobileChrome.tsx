"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, MoreHorizontal } from "lucide-react";
import { clsx } from "@/lib/utils/clsx";
import { COMPANY } from "@/lib/data/seed";
import { generateBusinessAlerts } from "@/lib/insights/alerts";
import { useAppStore } from "@/lib/store";
import { SunjinMark } from "./BrandMark";
import { isActivePath, MOBILE_MORE_ITEMS, MOBILE_NAV } from "./nav";
import { DesktopModeButton } from "./ViewModeToggle";
import { Sheet } from "@/components/shared/Sheet";

export function MobileHeader() {
  const setAlertsOpen = useAppStore((s) => s.setAlertsOpen);
  const readAlertIds = useAppStore((s) => s.readAlertIds);
  const unread = generateBusinessAlerts().filter(
    (a) => !readAlertIds.includes(a.id)
  ).length;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[54px] items-center justify-between bg-navy-950 px-4 lg:hidden">
      <Link
        href="/dashboard"
        className="flex items-center gap-2"
        aria-label="선진산업 AX 홈"
      >
        <SunjinMark className="h-7 w-7" />
        <span className="text-[0.95rem] font-extrabold text-white">
          {COMPANY.productShort}
        </span>
      </Link>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setAlertsOpen(true)}
          aria-label={`알림 ${unread}건`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy-200 transition-colors hover:text-white"
        >
          <Bell className="h-5 w-5" aria-hidden />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[0.62rem] font-bold text-white">
              {unread}
            </span>
          ) : null}
        </button>
        <Link
          href="/settings"
          aria-label="설정 및 프로필"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-xs font-bold text-white"
        >
          손
        </Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const moreOpen = useAppStore((s) => s.moreOpen);
  const setMoreOpen = useAppStore((s) => s.setMoreOpen);
  const moreActive = MOBILE_MORE_ITEMS.some((i) => isActivePath(pathname, i.href));

  return (
    <>
      <nav
        aria-label="모바일 내비게이션"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-surface-line bg-white/95 pb-safe backdrop-blur lg:hidden"
      >
        <div className="grid h-[var(--bottom-nav-height)] grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex flex-col items-center justify-center gap-0.5 transition-colors",
                  active ? "text-brand-600" : "text-navy-400"
                )}
              >
                <Icon
                  className={clsx("h-[1.35rem] w-[1.35rem]", active && "scale-105")}
                  strokeWidth={active ? 2.4 : 2}
                  aria-hidden
                />
                <span
                  className={clsx(
                    "text-[0.66rem]",
                    active ? "font-bold" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            aria-label="더보기 메뉴"
            className={clsx(
              "flex flex-col items-center justify-center gap-0.5 transition-colors",
              moreActive ? "text-brand-600" : "text-navy-400"
            )}
          >
            <MoreHorizontal className="h-[1.35rem] w-[1.35rem]" aria-hidden />
            <span
              className={clsx(
                "text-[0.66rem]",
                moreActive ? "font-bold" : "font-medium"
              )}
            >
              더보기
            </span>
          </button>
        </div>
      </nav>

      <Sheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="더보기"
        side="bottom-only"
      >
        <div className="grid grid-cols-3 gap-3 pb-2">
          {MOBILE_MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-2 rounded-card border border-surface-line bg-surface-soft px-3 py-4 text-navy-700 transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                <Icon className="h-6 w-6 text-brand-600" aria-hidden />
                <span className="text-[0.8rem] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 border-t border-surface-line pt-4">
          <DesktopModeButton onSwitched={() => setMoreOpen(false)} />
          <p className="mt-2 text-center text-[0.7rem] leading-relaxed text-navy-400">
            휴대폰에서도 PC와 동일한 화면으로 볼 수 있습니다.
          </p>
        </div>
        <p className="mt-4 border-t border-surface-line pt-3 text-center text-[0.7rem] text-navy-400">
          {COMPANY.ceoTitle} · {COMPANY.credit}
        </p>
      </Sheet>
    </>
  );
}
