"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/utils/clsx";
import { COMPANY } from "@/lib/data/seed";
import { SunjinLogo } from "./BrandMark";
import { isActivePath, NAV_ITEMS, NAV_TONES } from "./nav";
import { generateBusinessAlerts } from "@/lib/insights/alerts";
import { CustomerFrontCta } from "./CustomerFrontCta";
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
      {/* 로고 워드마크가 Deep Navy라 남색 위에서는 읽히지 않는다. 흰 판 위에 올린다.
          아래 영문 라인은 좁은 사이드바에서도 잘리지 않도록 대문자 자간을 쓰지 않는다. */}
      <Link
        href="/dashboard"
        className="block px-5 pb-4 pt-5"
        aria-label="선진산업 Leather Business AX 홈"
      >
        <SunjinLogo plate className="h-[26px]" plateClassName="px-2.5 py-1.5" />
        <span className="mt-2 block text-[0.86rem] font-semibold leading-snug tracking-[0.01em] text-navy-200">
          {COMPANY.industryEn} Business AX
        </span>
      </Link>

      {/* 내비게이션 */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3" aria-label="주요 메뉴">
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

      {/* 고객용 B2B Front — 일반 메뉴와 구분되는 CTA */}
      <div className="px-3 pb-3 pt-2">
        <CustomerFrontCta />
      </div>

      {/* 회사 정보 */}
      <div className="mx-3 mb-3 rounded-card border border-white/[0.07] bg-white/[0.035] px-4 py-3 [@media(max-height:820px)]:hidden">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_0_3px_rgba(45,197,180,0.18)]"
          />
          <p className="text-[0.86rem] font-bold text-white">{COMPANY.name}</p>
        </div>
        <dl className="mt-2.5 space-y-1.5 text-[0.84rem] leading-none text-navy-300">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 whitespace-nowrap text-navy-400">대표자</dt>
            <dd className="min-w-0 truncate text-right text-navy-100">
              {COMPANY.ceo}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 whitespace-nowrap text-navy-400">업종</dt>
            <dd className="min-w-0 truncate text-right text-navy-100">
              피혁 제조·도소매
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 whitespace-nowrap text-navy-400">지역</dt>
            <dd className="min-w-0 truncate text-right text-navy-100">
              경기 동두천
            </dd>
          </div>
        </dl>
      </div>

      {/* 사용자 + 제작 표기 */}
      <div className="border-t border-white/[0.07] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-[0.82rem] font-bold text-white">
            손
          </span>
          <p className="min-w-0 truncate text-[0.86rem] font-bold text-white">
            {COMPANY.ceoTitle}
          </p>
        </div>
        {/* 좁은 사이드바라 한 줄로 고정하면 잘린다. 라벨과 이름을 줄로 나눈다. */}
        <p className="mt-2 text-[0.8rem] font-semibold leading-snug tracking-[0.01em] text-navy-400">
          {COMPANY.creditRole}
        </p>
        <p className="mt-0.5 text-[0.84rem] leading-snug text-navy-200">
          {COMPANY.credit}
        </p>
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
