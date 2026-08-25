"use client";

import { clsx } from "@/lib/utils/clsx";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { ReactNode } from "react";

export function SectionTitle({
  title,
  right,
  className,
}: {
  title: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mb-3 flex items-center justify-between gap-2", className)}>
      <h2 className="text-[1.02rem] font-bold text-navy-900">{title}</h2>
      {right}
    </div>
  );
}

/** 증감 표시 배지 */
export function DeltaBadge({
  value,
  suffix = "%",
  goodWhenUp = true,
  label = "전년 대비",
}: {
  value: number | null;
  suffix?: string;
  goodWhenUp?: boolean;
  label?: string;
}) {
  if (value == null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-navy-400">
        <Minus className="h-3 w-3" aria-hidden /> 비교 데이터 없음
      </span>
    );
  }
  const up = value >= 0;
  const good = goodWhenUp ? up : !up;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
        good ? "text-emerald-600" : "text-rose-600"
      )}
    >
      <span className="font-normal text-navy-400">{label}</span>
      {up ? (
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" aria-hidden />
      )}
      {up ? "+" : ""}
      {Math.abs(value) >= 100 ? Math.round(value).toLocaleString() : value.toFixed(1)}
      {suffix}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  // 거래처 상태
  안정: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "재구매 예상": "bg-brand-50 text-brand-700 border-brand-100",
  "재접촉 필요": "bg-amber-50 text-amber-700 border-amber-100",
  "휴면 가능": "bg-navy-50 text-navy-500 border-navy-100",
  신규: "bg-teal-50 text-teal-700 border-teal-100",
  // 재고 상태
  정상: "bg-emerald-50 text-emerald-700 border-emerald-100",
  관심: "bg-amber-50 text-amber-700 border-amber-100",
  장기재고: "bg-rose-50 text-rose-600 border-rose-100",
  // 견적 상태
  작성중: "bg-navy-50 text-navy-500 border-navy-100",
  발송: "bg-brand-50 text-brand-700 border-brand-100",
  검토: "bg-amber-50 text-amber-700 border-amber-100",
  승인: "bg-emerald-50 text-emerald-700 border-emerald-100",
  보류: "bg-rose-50 text-rose-600 border-rose-100",
  // 우선순위
  긴급: "bg-rose-50 text-rose-600 border-rose-100",
  높음: "bg-amber-50 text-amber-700 border-amber-100",
  보통: "bg-navy-50 text-navy-500 border-navy-100",
  // 재무 신호
  양호: "bg-emerald-50 text-emerald-700 border-emerald-100",
  관찰: "bg-navy-50 text-navy-500 border-navy-100",
  주의: "bg-amber-50 text-amber-700 border-amber-100",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status] ?? "bg-navy-50 text-navy-500 border-navy-100",
        className
      )}
    >
      {status}
    </span>
  );
}

/** 점수 배지 — 재구매 가능성 / AX 매칭 점수 */
export function ScoreBadge({
  score,
  label,
  size = "md",
}: {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const tone =
    score >= 75
      ? "bg-brand-600 text-white"
      : score >= 55
        ? "bg-teal-500 text-white"
        : score >= 35
          ? "bg-amber-100 text-amber-800"
          : "bg-navy-100 text-navy-500";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={clsx(
          "inline-flex items-center justify-center rounded-full font-bold tabular-nums",
          tone,
          size === "lg"
            ? "h-11 w-11 text-base"
            : size === "md"
              ? "h-9 w-9 text-sm"
              : "h-7 w-7 text-xs"
        )}
      >
        {score}
      </span>
      {label ? (
        <span className="text-xs font-semibold text-navy-500">{label}</span>
      ) : null}
    </span>
  );
}

export function EmptyState({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-card border border-dashed border-surface-line bg-surface-soft px-6 py-10 text-center">
      <p className="text-sm font-medium text-navy-500">{message}</p>
      {hint ? <p className="text-xs text-navy-400">{hint}</p> : null}
    </div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-gold-200 bg-gold-100/60 px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide text-gold-700",
        className
      )}
      title="개별 거래·재고 데이터는 시연용 샘플입니다"
    >
      시연 데이터
    </span>
  );
}
