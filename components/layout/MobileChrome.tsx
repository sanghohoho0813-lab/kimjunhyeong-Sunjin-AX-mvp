"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, MoreHorizontal, Sparkles } from "lucide-react";
import { clsx } from "@/lib/utils/clsx";
import { COMPANY } from "@/lib/data/seed";
import { generateBusinessAlerts } from "@/lib/insights/alerts";
import { useAppStore } from "@/lib/store";
import { SunjinMark } from "./BrandMark";
import {
  isActivePath,
  MOBILE_MORE_ITEMS,
  MOBILE_NAV,
  MOBILE_TONES,
  NAV_TONES,
} from "./nav";
import { DesktopModeButton } from "./ViewModeToggle";
import { Sheet } from "@/components/shared/Sheet";

/** 더보기 시트(밝은 배경)용 아이콘 색조 */
const MOBILE_SHEET_TONES: Record<string, string> = {
  violet: "text-indigo-500",
  sky: "text-sky-500",
  slate: "text-ink-500",
};

/** 모바일 헤더 — Content보다 눈에 띄지 않도록 낮고 차분하게 */
export function MobileHeader() {
  const setAlertsOpen = useAppStore((s) => s.setAlertsOpen);
  const readAlertIds = useAppStore((s) => s.readAlertIds);
  const unread = generateBusinessAlerts().filter(
    (a) => !readAlertIds.includes(a.id)
  ).length;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--mobile-header-height)] items-center justify-between bg-navy-925 px-4 lg:hidden">
      <Link
        href="/dashboard"
        className="flex min-w-0 items-center gap-2"
        aria-label="선진산업 AX 홈"
      >
        <SunjinMark className="h-8 w-8" />
        <span className="truncate text-[1.02rem] font-extrabold tracking-[-0.01em] text-white">
          선진산업
          <span className="ml-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-navy-300">
            AX
          </span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-0.5">
        <Link
          href="/intent"
          aria-label="기획의도 보기"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-teal-300"
        >
          <span
            aria-hidden
            className="absolute h-8 w-8 rounded-full bg-teal-400/16 blur-[6px]"
            style={{ animation: "intent-glow-dot 4.2s ease-in-out infinite" }}
          />
          <Sparkles className="relative h-[1.15rem] w-[1.15rem]" strokeWidth={2.1} aria-hidden />
        </Link>
        <button
          onClick={() => setAlertsOpen(true)}
          aria-label={`알림 ${unread}건`}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-navy-200 transition-colors active:text-white"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.9} aria-hidden />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-[1rem] min-w-[1rem] items-center justify-center rounded-full bg-critical px-1 text-[0.6rem] font-bold text-white">
              {unread}
            </span>
          ) : null}
        </button>
        <Link
          href="/settings"
          aria-label="설정 및 프로필"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-[0.8rem] font-bold text-white"
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
        className="fixed inset-x-0 bottom-0 z-50 border-t border-surface-line bg-white pb-safe shadow-[0_-6px_20px_-12px_rgba(11,33,69,0.18)] lg:hidden"
      >
        <div className="grid h-[var(--bottom-nav-height)] grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            const toneClass = MOBILE_TONES[item.tone] ?? "text-brand-600";
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-[3px]"
              >
                {active ? (
                  <span
                    aria-hidden
                    className={clsx("absolute top-0 h-[3px] w-10 rounded-b-full bg-current", toneClass)}
                  />
                ) : null}
                <Icon
                  className={clsx(
                    "h-[1.45rem] w-[1.45rem] transition-colors duration-200",
                    active ? toneClass : "text-ink-400"
                  )}
                  strokeWidth={active ? 2.3 : 1.9}
                  aria-hidden
                />
                <span
                  className={clsx(
                    "text-[0.78rem] leading-none transition-colors duration-200",
                    active ? clsx("font-bold", toneClass) : "font-medium text-ink-500"
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
            className="relative flex flex-col items-center justify-center gap-[3px]"
          >
            {moreActive ? (
              <span
                aria-hidden
                className="absolute top-0 h-[3px] w-10 rounded-b-full bg-brand-600"
              />
            ) : null}
            <MoreHorizontal
              className={clsx(
                "h-[1.45rem] w-[1.45rem]",
                moreActive ? "text-brand-600" : "text-ink-400"
              )}
              strokeWidth={moreActive ? 2.3 : 1.9}
              aria-hidden
            />
            <span
              className={clsx(
                "text-[0.78rem] leading-none",
                moreActive ? "font-bold text-brand-600" : "font-medium text-ink-500"
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
        <div className="grid grid-cols-3 gap-2.5">
          {MOBILE_MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const tone = NAV_TONES[item.tone];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="card-action tap flex flex-col items-center gap-2 px-3 py-4"
              >
                <span
                  className={clsx(
                    "flex h-11 w-11 items-center justify-center rounded-[12px]",
                    tone.chipActive
                  )}
                >
                  <Icon
                    className={clsx("h-[1.3rem] w-[1.3rem]", MOBILE_SHEET_TONES[item.tone])}
                    aria-hidden
                  />
                </span>
                <span className="text-[0.92rem] font-bold text-ink-800">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 border-t border-surface-line pt-5">
          <DesktopModeButton onSwitched={() => setMoreOpen(false)} />
          <p className="mt-2.5 text-center text-[0.72rem] leading-relaxed text-ink-400">
            휴대폰에서도 PC와 동일한 화면으로 볼 수 있습니다.
          </p>
        </div>
        <p className="mt-5 border-t border-surface-line pt-4 text-center text-[0.72rem] text-ink-400">
          {COMPANY.ceoTitle} · {COMPANY.credit}
        </p>
      </Sheet>
    </>
  );
}
