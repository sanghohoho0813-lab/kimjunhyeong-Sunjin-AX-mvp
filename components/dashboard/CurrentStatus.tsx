"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarClock, Minus, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { clsx } from "@/lib/utils/clsx";
import { getCashDecision, getPerformanceDecisions } from "@/lib/insights/decisions";
import type { Decision } from "@/lib/insights/decisions";
import { getYtdComparison } from "@/lib/data/monthly";
import { getYear } from "@/lib/data/finance";
import {
  CURRENT_MONTH,
  CURRENT_YEAR,
  DEMO_TODAY,
  LAST_CLOSED_YEAR,
  formatDateKo,
} from "@/lib/utils/format";

const EASE = [0.22, 1, 0.36, 1] as const;

function Delta({ pct, goodWhenUp }: { pct: number | null; goodWhenUp: boolean }) {
  if (pct == null) {
    return (
      <span className="inline-flex items-center gap-1 text-[0.86rem] text-ink-400">
        <Minus className="h-3.5 w-3.5" aria-hidden />
        비교 없음
      </span>
    );
  }
  const up = pct >= 0;
  const good = goodWhenUp ? up : !up;
  const Icon = up ? TrendingUp : TrendingDown;
  const mag =
    Math.abs(pct) >= 100
      ? Math.round(Math.abs(pct)).toLocaleString()
      : Math.abs(pct).toFixed(1);
  return (
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
  );
}

/** 연간 목표 대비 진도 바 — 지금이 앞선 건지 뒤처진 건지 한눈에 */
function PaceBar() {
  const cmp = getYtdComparison();
  const lastFull = getYear(LAST_CLOSED_YEAR);
  const pace = cmp.paceVsLastFullYear ?? 0;
  const elapsed = (CURRENT_MONTH / 12) * 100;
  const ahead = pace >= elapsed;

  return (
    <div className="rounded-card border border-surface-line bg-white px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[0.95rem] font-bold text-ink-700">
          전년 연간 실적 대비 진도
        </p>
        <p className="text-[0.88rem] text-ink-500">
          기준 {lastFull.revenue.toFixed(2)}억원 ({LAST_CLOSED_YEAR}년)
        </p>
      </div>

      <div className="relative mt-3.5 h-3 overflow-hidden rounded-full bg-surface-sunken">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, pace)}%` }}
          transition={{ duration: 0.7, ease: EASE }}
          className={clsx(
            "block h-full rounded-full",
            ahead
              ? "bg-gradient-to-r from-teal-400 to-teal-500"
              : "bg-gradient-to-r from-gold-300 to-gold-400"
          )}
        />
        {/* 지금쯤이면 여기 있어야 한다는 기준선 */}
        <span
          aria-hidden
          className="absolute inset-y-0 w-[2px] rounded-full bg-ink-900/45"
          style={{ left: `${elapsed}%` }}
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5 text-[0.88rem] text-ink-500">
          <span aria-hidden className="h-[2px] w-3 rounded-full bg-ink-900/45" />
          {CURRENT_MONTH}개월 경과 = {elapsed.toFixed(0)}%
        </span>
        <span
          className={clsx(
            "text-[0.95rem] font-extrabold tabular-nums",
            ahead ? "text-teal-700" : "text-warning"
          )}
        >
          현재 {pace.toFixed(0)}% · {ahead ? "앞서는 중" : "뒤처지는 중"}
        </span>
      </div>
    </div>
  );
}

/** 상단 지표 한 장 — 값 + 전년 동기 대비 + 판정 */
function StatCard({ d, index }: { d: Decision; index: number }) {
  const toneText =
    d.tone === "risk"
      ? "text-critical"
      : d.tone === "watch"
        ? "text-warning"
        : d.tone === "good"
          ? "text-teal-700"
          : "text-ink-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.05, ease: EASE }}
      className="card-kpi isolate flex min-w-0 flex-col px-4 py-4 sm:px-5 sm:py-5"
    >
      {/* 라벨은 한 줄을 온전히 쓴다. 좁은 폭에서 "추정" 칩과 경합하면
          "누적 / 매출"로 쪼개져 지표명이 읽히지 않는다. */}
      <p className="truncate whitespace-nowrap text-[0.88rem] font-bold text-ink-500 sm:text-[0.95rem]">
        {d.label}
      </p>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-1 gap-y-1.5 tabular-nums">
        <span className="text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-ink-900 sm:text-[2.1rem]">
          {d.value}
        </span>
        {d.unit ? (
          <span className="text-[0.9rem] font-bold text-ink-500 sm:text-[1rem]">{d.unit}</span>
        ) : null}
        {d.estimated ? (
          <span className="ml-0.5 shrink-0 whitespace-nowrap rounded-md bg-surface-sunken px-1.5 py-0.5 text-[0.75rem] font-bold text-ink-400 sm:px-2 sm:text-[0.78rem]">
            추정
          </span>
        ) : null}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Delta pct={d.deltaPct} goodWhenUp={d.goodWhenUp} />
        <span className="text-[0.84rem] text-ink-400 sm:text-[0.86rem]">
          {d.comparedTo}
        </span>
      </div>

      <p
        className={clsx(
          "mt-3 flex-1 text-[0.88rem] font-semibold leading-relaxed sm:mt-3.5 sm:text-[0.95rem]",
          toneText
        )}
      >
        {d.verdict}
      </p>
    </motion.div>
  );
}

/**
 * 현재 상황 섹션.
 *
 * 연간 확정 실적 대신 "지금 이 시점의 누적"을 앞세운다. 매일 봐야 하는 것은
 * 작년에 얼마 벌었는지가 아니라 올해 지금까지 어떻게 가고 있는지이기 때문이다.
 * 값 → 전년 동기 대비 → 판정 → (아래 결정 섹션의) 행동 순으로 읽히게 배치한다.
 */
export function CurrentStatus() {
  const perf = getPerformanceDecisions();
  const cash = getCashDecision();
  const cards = [...perf, cash];

  return (
    <section aria-label="현재 경영 상황">
      {/* 기준 시점 — 이 화면의 모든 숫자가 언제 기준인지 명확히 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2"
      >
        {/* 모바일 Hero가 이미 기준일을 말한다. 중복을 피해 데스크톱에서만 노출 */}
        <span className="hidden items-center gap-2 rounded-btn border border-surface-line bg-white px-3 py-1.5 text-[0.92rem] font-bold text-ink-700 lg:inline-flex">
          <CalendarClock className="h-4 w-4 text-brand-600" aria-hidden />
          {formatDateKo(DEMO_TODAY)} 기준
        </span>
        <span className="text-[0.9rem] text-ink-500">
          {CURRENT_YEAR}년 1~{CURRENT_MONTH}월 누적 · {LAST_CLOSED_YEAR}년 같은
          기간과 비교
        </span>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map((d, i) => (
          <StatCard key={d.id} d={d} index={i} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.2, ease: EASE }}
        className="mt-4"
      >
        <PaceBar />
      </motion.div>
    </section>
  );
}

/** 상단 지표에 대한 "그래서 무엇을" — 행동 2가지를 크게 */
export function TopActions() {
  // 상태가 양호해도 다음 할 일은 있다. 필터링하지 않고 조치가 급한 순으로만 정렬한다.
  const order: Record<string, number> = { risk: 0, watch: 1, neutral: 2, good: 3 };
  const items = [...getPerformanceDecisions(), getCashDecision()].sort(
    (a, b) => order[a.tone] - order[b.tone]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.slice(0, 4).map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: i * 0.05, ease: EASE }}
          className="min-w-0"
        >
          <Link
            href={d.href}
            className="card-action group flex h-full flex-col p-5 transition-all duration-200 ease-premium hover:-translate-y-[2px]"
          >
            <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-brand-700">
              {d.label} · 다음 할 일
            </p>
            <p className="mt-2 flex-1 text-[0.98rem] font-semibold leading-relaxed text-ink-800">
              {d.action}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[0.92rem] font-bold text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5">
              {d.actionLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
