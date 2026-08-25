"use client";

import { clsx } from "@/lib/utils/clsx";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHead({
  title,
  desc,
  right,
  className,
}: {
  title: ReactNode;
  desc?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx("mb-3.5 flex items-end justify-between gap-3", className)}
    >
      <div className="min-w-0">
        <h2 className="t-section">{title}</h2>
        {desc ? <p className="mt-1 t-caption">{desc}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/** 증감 표시 — 숫자 옆 보조 정보 */
export function Delta({
  value,
  suffix = "%",
  goodWhenUp = true,
  label,
  size = "md",
}: {
  value: number | null;
  suffix?: string;
  goodWhenUp?: boolean;
  label?: string;
  size?: "sm" | "md";
}) {
  if (value == null) {
    return (
      <span className="inline-flex items-center gap-1 text-[0.76rem] text-ink-400">
        <Minus className="h-3 w-3" aria-hidden /> 비교 없음
      </span>
    );
  }
  const up = value >= 0;
  const good = goodWhenUp ? up : !up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const magnitude =
    Math.abs(value) >= 100
      ? Math.round(Math.abs(value)).toLocaleString()
      : Math.abs(value).toFixed(1);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={clsx(
          "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-bold tabular-nums",
          size === "sm" ? "text-[0.82rem]" : "text-[0.76rem]",
          good
            ? "bg-positive-soft text-positive"
            : "bg-critical-soft text-critical"
        )}
      >
        <Icon className="h-3 w-3" aria-hidden />
        {up ? "+" : "−"}
        {magnitude}
        {suffix}
      </span>
      {label ? (
        <span className="text-[0.84rem] text-ink-400">{label}</span>
      ) : null}
    </span>
  );
}

const TONES: Record<string, string> = {
  // 거래처 상태
  안정: "bg-positive-soft text-positive",
  "재구매 예상": "bg-brand-50 text-brand-700",
  "재접촉 필요": "bg-warning-soft text-warning",
  "휴면 가능": "bg-ink-200/60 text-ink-500",
  신규: "bg-teal-50 text-teal-700",
  // 재고 상태
  정상: "bg-positive-soft text-positive",
  관심: "bg-warning-soft text-warning",
  장기재고: "bg-critical-soft text-critical",
  // 견적 상태
  작성중: "bg-ink-200/60 text-ink-500",
  발송: "bg-brand-50 text-brand-700",
  검토: "bg-warning-soft text-warning",
  승인: "bg-positive-soft text-positive",
  보류: "bg-critical-soft text-critical",
  // 우선순위
  긴급: "bg-critical-soft text-critical",
  높음: "bg-warning-soft text-warning",
  보통: "bg-ink-200/60 text-ink-500",
  // 재무 신호
  양호: "bg-positive-soft text-positive",
  관찰: "bg-ink-200/60 text-ink-500",
  주의: "bg-warning-soft text-warning",
};

export function Badge({
  children,
  tone,
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: string;
  className?: string;
  dot?: boolean;
}) {
  const key = typeof children === "string" ? children : "";
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[0.84rem] font-bold leading-none",
        TONES[tone ?? key] ?? "bg-ink-200/60 text-ink-500",
        className
      )}
    >
      {dot ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
        />
      ) : null}
      {children}
    </span>
  );
}

/** 점수 표시 — 재구매 가능성 / AX 매칭 */
export function Score({
  value,
  label,
  size = "md",
}: {
  value: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const tone =
    value >= 75
      ? "bg-brand-600 text-white"
      : value >= 55
        ? "bg-teal-500 text-white"
        : value >= 35
          ? "bg-warning-soft text-warning"
          : "bg-ink-200 text-ink-500";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={clsx(
          "inline-flex items-center justify-center rounded-xl font-extrabold tabular-nums",
          tone,
          size === "lg"
            ? "h-12 w-12 text-[1.05rem]"
            : size === "md"
              ? "h-9 w-9 text-[0.85rem]"
              : "h-7 w-7 text-[0.86rem]"
        )}
      >
        {value}
      </span>
      {label ? (
        <span className="text-[0.76rem] font-semibold text-ink-500">
          {label}
        </span>
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
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-surface-line-strong bg-surface-subtle px-6 py-12 text-center">
      <p className="text-[0.9rem] font-semibold text-ink-600">{message}</p>
      {hint ? <p className="t-caption">{hint}</p> : null}
    </div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-md border border-gold-200 bg-gold-100/70 px-2 py-0.5 text-[0.8rem] font-bold tracking-wide text-gold-600",
        className
      )}
      title="개별 거래·재고 데이터는 시연용 샘플입니다"
    >
      시연 데이터
    </span>
  );
}

/** 얇은 진행 바 — 랭킹/비중 표시 */
export function Meter({
  ratio,
  className,
  tone = "brand",
}: {
  ratio: number;
  className?: string;
  tone?: "brand" | "teal";
}) {
  return (
    <span
      className={clsx(
        "block h-1.5 overflow-hidden rounded-full bg-surface-sunken",
        className
      )}
    >
      <span
        className={clsx(
          "block h-full rounded-full",
          tone === "brand"
            ? "bg-gradient-to-r from-brand-500 to-brand-600"
            : "bg-gradient-to-r from-teal-400 to-teal-500"
        )}
        style={{ width: `${Math.max(2, Math.min(100, ratio * 100))}%` }}
      />
    </span>
  );
}
