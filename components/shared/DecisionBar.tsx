"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarClock } from "lucide-react";
import Link from "next/link";
import { clsx } from "@/lib/utils/clsx";
import type { Decision, DecisionTone } from "@/lib/insights/decisions";
import { DEMO_TODAY, formatDateKo } from "@/lib/utils/format";

const TONE: Record<DecisionTone, { bar: string; chip: string; dot: string; text: string; label: string }> = {
  good: {
    bar: "from-teal-400 to-teal-500",
    chip: "bg-teal-50 text-teal-700",
    dot: "bg-teal-500",
    text: "text-teal-700",
    label: "양호",
  },
  watch: {
    bar: "from-gold-300 to-gold-400",
    chip: "bg-warning-soft text-warning",
    dot: "bg-warning",
    text: "text-warning",
    label: "확인 필요",
  },
  risk: {
    bar: "from-critical to-critical",
    chip: "bg-critical-soft text-critical",
    dot: "bg-critical",
    text: "text-critical",
    label: "조치 필요",
  },
  neutral: {
    bar: "from-ink-300 to-ink-400",
    chip: "bg-surface-sunken text-ink-500",
    dot: "bg-ink-300",
    text: "text-ink-600",
    label: "참고",
  },
};

/**
 * 목록 페이지 상단 판단 요약.
 *
 * 대시보드에서만 "현재 → 판단 → 행동"으로 읽히고 목록 페이지는 날 데이터만
 * 보여주면, 대표는 페이지를 옮길 때마다 해석을 다시 해야 한다.
 * 같은 결정 엔진을 재사용해 어느 화면에서든 같은 문장 구조로 읽히게 한다.
 */
export function DecisionBar({ decision }: { decision: Decision }) {
  const tone = TONE[decision.tone];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="card-data relative isolate mb-6 overflow-hidden p-5 lg:p-6"
      aria-label={`${decision.label} 현재 판단`}
    >
      <span
        aria-hidden
        className={clsx("absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r", tone.bar)}
      />

      {/* 고정폭으로 나누면 근거 칼럼이 눌려 2~3 단어마다 줄바꿈된다.
          비례 그리드로 두고 근거에 가장 넓은 폭을 준다. */}
      <div className="grid gap-5 lg:grid-cols-12 lg:gap-0">
        {/* 값 + 판정 */}
        <div className="min-w-0 lg:col-span-3 lg:pr-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-ink-400">
              <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
              {formatDateKo(DEMO_TODAY)} 기준
            </span>
            <span
              className={clsx(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-[0.85rem] font-bold",
                tone.chip
              )}
            >
              <span aria-hidden className={clsx("h-1.5 w-1.5 rounded-full", tone.dot)} />
              {tone.label}
            </span>
          </div>

          <p className="mt-3 flex items-baseline gap-1 tabular-nums">
            <span className="text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-ink-900">
              {decision.value}
            </span>
            {decision.unit ? (
              <span className="text-[1rem] font-bold text-ink-500">{decision.unit}</span>
            ) : null}
          </p>
          <p className="mt-1.5 text-[0.88rem] text-ink-400">{decision.comparedTo}</p>
          <p className={clsx("mt-3 text-[1rem] font-bold leading-snug", tone.text)}>
            {decision.verdict}
          </p>
        </div>

        {/* 근거 */}
        <div className="min-w-0 border-t border-surface-line pt-5 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-ink-400">
            판단 근거
          </p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-600">
            {decision.basis}
          </p>
        </div>

        {/* 권장 행동 */}
        <div className="min-w-0 border-t border-surface-line pt-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-brand-700">
            권장 행동
          </p>
          <p className="mt-2 text-[0.95rem] font-semibold leading-relaxed text-ink-800">
            {decision.action}
          </p>
          <Link
            href={decision.href}
            className="mt-3 inline-flex min-h-[2.5rem] items-center gap-1.5 text-[0.92rem] font-bold text-brand-600 transition-colors hover:text-brand-700"
          >
            {decision.actionLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
