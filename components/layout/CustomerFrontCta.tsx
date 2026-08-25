"use client";

import { ArrowRight, Globe } from "lucide-react";
import Link from "next/link";
import { clsx } from "@/lib/utils/clsx";

/**
 * 내부 AX → 고객용 B2B Front.
 *
 * 일반 메뉴와 시각적으로 분리한다. 메뉴 하나가 더 늘어난 것이 아니라
 * "고객이 지금 보는 화면을 그대로 열어보는 미리보기"라는 성격이기 때문이다.
 *
 * variant
 *  - dark  : Deep Navy 사이드바 안 (데스크톱)
 *  - light : 밝은 배경의 더보기 시트 안 (모바일)
 *    사이드바는 lg 이상에서만 보이므로 모바일에서는 시트 쪽이 유일한 진입점이다.
 */
export function CustomerFrontCta({
  className,
  variant = "dark",
  onClick,
}: {
  className?: string;
  variant?: "dark" | "light";
  onClick?: () => void;
}) {
  const light = variant === "light";

  return (
    <Link
      href="/"
      onClick={onClick}
      className={clsx(
        "group relative block overflow-hidden rounded-card transition-all duration-200 ease-premium",
        light
          ? "border border-brand-200 bg-gradient-to-br from-brand-50 via-[#E8F4FA] to-teal-50 p-4 hover:border-teal-300 hover:shadow-card"
          : "border border-white/[0.12] bg-gradient-to-br from-[#1E3A8A]/55 via-[#12507A]/45 to-[#0F766E]/45 p-3.5 shadow-[0_0_0_1px_rgba(20,184,166,0.06),0_8px_24px_-16px_rgba(20,184,166,0.5)] hover:border-teal-400/45 hover:from-[#1E3A8A]/70 hover:via-[#12507A]/60 hover:to-[#0F766E]/60",
        className
      )}
    >
      {/* 은은한 광택 — hover 시 살짝 밝아진다 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {/* 좁은 폭에서 아이콘·화살표와 한 줄에 두면 문구가 잘린다.
          세로로 쌓아 텍스트가 카드 폭을 온전히 쓰게 한다. */}
      <span className="relative block">
        <span className="flex items-center justify-between gap-2">
          <span
            className={clsx(
              "flex shrink-0 items-center justify-center rounded-[10px]",
              light
                ? "h-11 w-11 bg-white text-brand-600 shadow-sm"
                : "h-9 w-9 bg-white/[0.12] text-teal-200"
            )}
          >
            <Globe
              className={light ? "h-[1.3rem] w-[1.3rem]" : "h-[1.1rem] w-[1.1rem]"}
              strokeWidth={2.1}
              aria-hidden
            />
          </span>
          <ArrowRight
            className={clsx(
              "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
              light ? "text-brand-500" : "text-teal-200"
            )}
            aria-hidden
          />
        </span>
        <span
          className={clsx(
            "mt-2.5 block font-extrabold leading-snug",
            light ? "text-[1.02rem] text-ink-900" : "text-[0.95rem] text-white"
          )}
        >
          고객용 B2B Front
        </span>
        <span
          className={clsx(
            "mt-0.5 block leading-snug",
            light ? "text-[0.88rem] text-ink-500" : "text-[0.82rem] text-navy-200"
          )}
        >
          고객이 보는 화면 열기
        </span>
      </span>
    </Link>
  );
}
