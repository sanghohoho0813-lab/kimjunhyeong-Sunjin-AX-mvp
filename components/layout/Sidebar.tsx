"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/utils/clsx";
import { COMPANY } from "@/lib/data/seed";
import { SunjinMark } from "./BrandMark";
import { isActivePath, NAV_ITEMS, NAV_TONES } from "./nav";
import { generateBusinessAlerts } from "@/lib/insights/alerts";
import { useAppStore } from "@/lib/store";

export function Sidebar() {
  const pathname = usePathname();
  const readAlertIds = useAppStore((s) => s.readAlertIds);
  const unread = generateBusinessAlerts().filter(
    (a) => !readAlertIds.includes(a.id)
  ).length;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-sidebar flex-col bg-navy-925 lg:flex">
      {/* 우측 경계 — 은은한 하이라이트 */}
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/[0.10] via-white/[0.04] to-transparent"
      />

      {/* 브랜드 */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-5 pb-6 pt-7"
        aria-label="선진산업 Business AX 홈"
      >
        <SunjinMark className="h-[38px] w-[38px] shrink-0" />
        <span className="min-w-0">
          <span className="block text-[1.06rem] font-extrabold leading-tight tracking-[-0.01em] text-white">
            선진산업
          </span>
          <span className="block text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-navy-300">
            Business AX
          </span>
        </span>
      </Link>

      {/* 내비게이션 */}
      <nav className="flex-1 overflow-y-auto px-3" aria-label="주요 메뉴">
        <p className="px-3 pb-2 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-navy-400">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            const tone = NAV_TONES[item.tone];
            const showBadge = item.href === "/insights" && unread > 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "nav-item group relative",
                    active
                      ? "bg-white/[0.09] font-semibold text-white shadow-inset"
                      : "text-navy-200 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute inset-y-[9px] left-0 w-[3px] rounded-r-full bg-teal-400"
                    />
                  ) : null}
                  <span
                    className={clsx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-200",
                      active ? tone.chipActive : tone.chip,
                      !active && "group-hover:brightness-125"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "h-[1.15rem] w-[1.15rem] transition-colors",
                        active ? tone.active : tone.idle
                      )}
                      strokeWidth={active ? 2.3 : 2}
                      aria-hidden
                    />
                  </span>
                  <span className="truncate">{item.label}</span>
                  {showBadge ? (
                    <span className="ml-auto inline-flex h-[1.3rem] min-w-[1.3rem] items-center justify-center rounded-full bg-teal-500 px-1.5 text-[0.8rem] font-bold text-navy-950">
                      {unread}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 회사 정보 */}
      <div className="mx-3 mb-3 rounded-card border border-white/[0.07] bg-white/[0.035] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_0_3px_rgba(45,197,180,0.18)]"
          />
          <p className="text-[0.86rem] font-bold text-white">{COMPANY.name}</p>
        </div>
        <dl className="mt-2.5 space-y-1.5 text-[0.84rem] leading-none text-navy-300">
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 whitespace-nowrap text-navy-400">대표자</dt>
            <dd className="text-navy-100">{COMPANY.ceo}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 whitespace-nowrap text-navy-400">업종</dt>
            <dd className="min-w-0 truncate text-navy-100">피혁 제조·도소매</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 whitespace-nowrap text-navy-400">지역</dt>
            <dd className="text-navy-100">경기 동두천</dd>
          </div>
        </dl>
      </div>

      {/* 사용자 + 제작 표기 */}
      <div className="border-t border-white/[0.07] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-[0.82rem] font-bold text-white">
            손
          </span>
          <div className="min-w-0">
            <p className="truncate text-[0.86rem] font-bold text-white">
              {COMPANY.ceoTitle}
            </p>
            <p className="truncate text-[0.82rem] text-navy-300">
              {COMPANY.credit}
            </p>
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-center rounded-btn bg-white/95 px-3 py-1.5">
          <Image
            src="/brand/mirae-ai-lab.jpg"
            alt="미래에이아이랩"
            width={414}
            height={125}
            className="h-[22px] w-auto"
          />
        </div>
      </div>
    </aside>
  );
}
