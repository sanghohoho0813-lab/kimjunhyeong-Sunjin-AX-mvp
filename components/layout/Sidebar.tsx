"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/utils/clsx";
import { COMPANY } from "@/lib/data/seed";
import { SunjinMark } from "./BrandMark";
import { isActivePath, NAV_ITEMS } from "./nav";
import { generateBusinessAlerts } from "@/lib/insights/alerts";
import { useAppStore } from "@/lib/store";

export function Sidebar() {
  const pathname = usePathname();
  const readAlertIds = useAppStore((s) => s.readAlertIds);
  const unread = generateBusinessAlerts().filter(
    (a) => !readAlertIds.includes(a.id)
  ).length;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col bg-navy-950 lg:flex">
      {/* 브랜드 */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-5 pb-5 pt-6"
        aria-label="선진산업 Business AX 홈"
      >
        <SunjinMark className="h-9 w-9 shrink-0" />
        <span className="min-w-0">
          <span className="block text-[1.05rem] font-extrabold leading-tight text-white">
            선진산업
          </span>
          <span className="block text-[0.7rem] font-medium tracking-wide text-navy-300">
            Business AX
          </span>
        </span>
      </Link>

      {/* 내비게이션 */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="주요 메뉴">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          const showBadge = item.href === "/insights" && unread > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "group flex items-center gap-3 rounded-btn px-3 py-2.5 text-[0.9rem] font-medium transition-colors duration-200",
                active
                  ? "bg-brand-600/90 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-navy-200 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <Icon
                className={clsx(
                  "h-[1.1rem] w-[1.1rem] shrink-0 transition-colors",
                  active ? "text-white" : "text-navy-300 group-hover:text-white"
                )}
                aria-hidden
              />
              <span className="truncate">{item.label}</span>
              {showBadge ? (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1.5 text-[0.68rem] font-bold text-navy-950">
                  {unread}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* 회사 정보 카드 */}
      <div className="mx-3 mb-3 rounded-card border border-white/[0.07] bg-white/[0.04] px-4 py-3.5">
        <p className="text-sm font-bold text-white">{COMPANY.name}</p>
        <dl className="mt-2 space-y-1 text-[0.72rem] leading-relaxed text-navy-300">
          <div className="flex gap-2">
            <dt className="w-9 shrink-0 text-navy-400">대표자</dt>
            <dd>{COMPANY.ceo}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-9 shrink-0 text-navy-400">업종</dt>
            <dd className="min-w-0">모피 및 가죽 제조업</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-9 shrink-0 text-navy-400">지역</dt>
            <dd>{COMPANY.region}</dd>
          </div>
        </dl>
      </div>

      {/* 사용자 + 제작 표기 */}
      <div className="border-t border-white/[0.07] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-sm font-bold text-white">
            손
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {COMPANY.ceoTitle}
            </p>
            <p className="truncate text-[0.7rem] text-navy-300">
              {COMPANY.credit}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center rounded-lg bg-white/95 px-3 py-1.5">
          <Image
            src="/brand/mirae-ai-lab.jpg"
            alt="미래에이아이랩"
            width={414}
            height={125}
            className="h-6 w-auto"
            priority={false}
          />
        </div>
      </div>
    </aside>
  );
}
