"use client";

import { ArrowRight, Globe } from "lucide-react";
import Link from "next/link";
import { clsx } from "@/lib/utils/clsx";

/**
 * 내부 AX → 고객용 B2B Front.
 *
 * 일반 사이드바 메뉴와 시각적으로 분리한다. 메뉴 하나가 더 늘어난 것이 아니라
 * "고객이 지금 보는 화면을 그대로 열어보는 미리보기"라는 성격이기 때문이다.
 * Blue → Teal 그라데이션과 은은한 글로우로 구분하되 네온까지는 가지 않는다.
 */
export function CustomerFrontCta({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={clsx(
        "group relative block overflow-hidden rounded-card border border-white/[0.12] p-3.5 transition-all duration-200 ease-premium",
        "bg-gradient-to-br from-[#1E3A8A]/55 via-[#12507A]/45 to-[#0F766E]/45",
        "hover:border-teal-400/45 hover:from-[#1E3A8A]/70 hover:via-[#12507A]/60 hover:to-[#0F766E]/60",
        "shadow-[0_0_0_1px_rgba(20,184,166,0.06),0_8px_24px_-16px_rgba(20,184,166,0.5)]",
        className
      )}
    >
      {/* 은은한 광택 — hover 시 살짝 밝아진다 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-white/[0.12] text-teal-200">
          <Globe className="h-[1.2rem] w-[1.2rem]" strokeWidth={2.1} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.95rem] font-extrabold text-white">
            고객용 B2B Front
          </span>
          <span className="mt-0.5 block truncate text-[0.82rem] text-navy-200">
            고객이 보는 화면 열기
          </span>
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-teal-200 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
