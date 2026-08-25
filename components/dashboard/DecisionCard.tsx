"use client";

import { motion } from "framer-motion";
import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { clsx } from "@/lib/utils/clsx";
import type { Decision, DecisionTone } from "@/lib/insights/decisions";

const TONE: Record<
  DecisionTone,
  { rail: string; chip: string; dot: string; verdict: string; label: string }
> = {
  good: {
    rail: "from-teal-400 to-teal-500",
    chip: "bg-teal-50 text-teal-700",
    dot: "bg-teal-500",
    verdict: "text-teal-700",
    label: "양호",
  },
  watch: {
    rail: "from-gold-300 to-gold-400",
    chip: "bg-warning-soft text-warning",
    dot: "bg-warning",
    verdict: "text-warning",
    label: "확인 필요",
  },
  risk: {
    rail: "from-critical to-critical",
    chip: "bg-critical-soft text-critical",
    dot: "bg-critical",
    verdict: "text-critical",
    label: "조치 필요",
  },
  neutral: {
    rail: "from-ink-300 to-ink-400",
    chip: "bg-surface-sunken text-ink-500",
    dot: "bg-ink-300",
    verdict: "text-ink-600",
    label: "비교 불가",
  },
};

/** 전년 동기 대비 증감 — 방향과 좋고 나쁨을 함께 보여준다 */
function DeltaRow({ d }: { d: Decision }) {
  if (d.deltaPct == null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[0.9rem] text-ink-400">
        <Minus className="h-4 w-4 shrink-0" aria-hidden />
        {d.comparedTo}
      </span>
    );
  }
  const up = d.deltaPct >= 0;
  const good = d.goodWhenUp ? up : !up;
  const Icon = up ? TrendingUp : TrendingDown;
  const mag =
    Math.abs(d.deltaPct) >= 100
      ? Math.round(Math.abs(d.deltaPct)).toLocaleString()
      : Math.abs(d.deltaPct).toFixed(1);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span
        className={clsx(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.92rem] font-extrabold tabular-nums",
          good ? "bg-positive-soft text-positive" : "bg-critical-soft text-critical"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden />
        {up ? "+" : "−"}
        {mag}%
      </span>
      <span className="text-[0.88rem] text-ink-400">{d.comparedTo} 대비</span>
    </span>
  );
}

/**
 * 의사결정 카드 — 숫자 하나가 아니라 "지금 상태 → 왜 → 무엇을" 한 덩어리로 읽힌다.
 * 대표가 카드 하나만 봐도 다음 행동이 정해지도록 구성한다.
 */
export function DecisionCard({
  decision,
  index = 0,
  compact = false,
}: {
  decision: Decision;
  index?: number;
  compact?: boolean;
}) {
  const tone = TONE[decision.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0"
    >
      <Link
        href={decision.href}
        className="card-data group isolate flex h-full flex-col overflow-hidden p-5 transition-all duration-200 ease-premium hover:-translate-y-[3px] hover:shadow-card-hover lg:p-6"
      >
        <span
          aria-hidden
          className={clsx(
            "absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r",
            tone.rail
          )}
        />

        {/* 지표명 + 판정 배지 */}
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[0.95rem] font-bold text-ink-500">
              {decision.label}
            </span>
            {decision.estimated ? (
              <span className="mt-1 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-ink-400">
                <span aria-hidden className="h-1 w-1 rounded-full bg-ink-300" />
                추정치
              </span>
            ) : null}
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

        {/* 현재 값 */}
        <p className="mt-3 flex items-baseline gap-1 tabular-nums">
          <span className="text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-ink-900">
            {decision.value}
          </span>
          {decision.unit ? (
            <span className="text-[1rem] font-bold text-ink-500">{decision.unit}</span>
          ) : null}
        </p>

        {/* 전년 동기 대비 */}
        <div className="mt-3">
          <DeltaRow d={decision} />
        </div>

        {/* 판정 한 줄 */}
        <p
          className={clsx(
            "mt-4 text-[1rem] font-bold leading-snug tracking-[-0.01em]",
            tone.verdict
          )}
        >
          {decision.verdict}
        </p>

        {!compact ? (
          <>
            {/* 근거 */}
            <div className="mt-3 rounded-card bg-surface-sunken px-4 py-3">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-ink-400">
                판단 근거
              </p>
              <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-600">
                {decision.basis}
              </p>
            </div>

            {/* 권장 행동 */}
            <div className="mt-3 flex-1 rounded-card border border-brand-100 bg-brand-50/60 px-4 py-3">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-brand-700">
                권장 행동
              </p>
              <p className="mt-1.5 text-[0.94rem] font-semibold leading-relaxed text-ink-800">
                {decision.action}
              </p>
            </div>
          </>
        ) : (
          <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-ink-600">
            {decision.action}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-1 text-[0.92rem] font-bold text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5">
          {decision.actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </Link>
    </motion.div>
  );
}
