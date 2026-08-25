"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { clsx } from "@/lib/utils/clsx";
import { Delta } from "./ui";

const ACCENTS = {
  brand: {
    icon: "bg-brand-50 text-brand-600",
    rail: "from-brand-500 to-brand-600",
  },
  teal: {
    icon: "bg-teal-50 text-teal-600",
    rail: "from-teal-400 to-teal-500",
  },
  navy: {
    icon: "bg-navy-50 text-navy-700",
    rail: "from-navy-600 to-navy-800",
  },
  gold: {
    icon: "bg-gold-100 text-gold-500",
    rail: "from-gold-300 to-gold-400",
  },
} as const;

export type KpiAccent = keyof typeof ACCENTS;

/** 숫자 카운트업 (reduced-motion 시 즉시 표시) */
export function useCountUp(target: number, duration = 800): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, reduced]);

  return value;
}

/**
 * Hero KPI — 숫자가 카드의 주인공.
 * 시각 위계: Label → Value → Change (Icon은 보조)
 */
export function HeroKpi({
  icon: Icon,
  label,
  value,
  unit,
  decimals = 2,
  delta,
  deltaSuffix = "%",
  deltaGoodWhenUp = true,
  accent = "brand",
  note,
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  unit: ReactNode;
  decimals?: number;
  delta?: number | null;
  deltaSuffix?: string;
  deltaGoodWhenUp?: boolean;
  accent?: KpiAccent;
  note?: string;
  index?: number;
}) {
  const animated = useCountUp(value);
  const tone = ACCENTS[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="card-kpi px-5 py-5"
    >
      {/* 상단 accent rail */}
      <span
        aria-hidden
        className={clsx(
          "absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r opacity-90",
          tone.rail
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.82rem] font-semibold text-ink-500">{label}</p>
        <span
          className={clsx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]",
            tone.icon
          )}
        >
          <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={2} aria-hidden />
        </span>
      </div>

      <p className="mt-3 t-kpi">
        {animated.toFixed(decimals)}
        <span className="t-unit">{unit}</span>
      </p>

      <div className="mt-3">
        {delta !== undefined ? (
          <Delta
            value={delta}
            suffix={deltaSuffix}
            goodWhenUp={deltaGoodWhenUp}
            label="전년 대비"
          />
        ) : note ? (
          <span className="text-[0.86rem] text-ink-400">{note}</span>
        ) : null}
      </div>
    </motion.div>
  );
}

/** 모바일 / 밀집 영역용 소형 KPI */
export function MiniKpi({
  label,
  value,
  unit,
  decimals = 2,
  delta,
  accent = "brand",
  index = 0,
}: {
  label: string;
  value: number;
  unit: ReactNode;
  decimals?: number;
  delta?: number | null;
  accent?: KpiAccent;
  index?: number;
}) {
  const animated = useCountUp(value);
  const tone = ACCENTS[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="card-kpi min-w-0 px-3.5 py-3.5"
    >
      <span
        aria-hidden
        className={clsx(
          "absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r",
          tone.rail
        )}
      />
      <p className="truncate text-[0.86rem] font-semibold text-ink-500">
        {label}
      </p>
      <p className="mt-1.5 t-kpi-sm">
        {animated.toFixed(decimals)}
        <span className="t-unit">{unit}</span>
      </p>
      {delta != null ? (
        <p className="mt-1.5">
          <Delta value={delta} size="sm" />
        </p>
      ) : (
        <p className="mt-1.5 text-[0.82rem] text-ink-400">—</p>
      )}
    </motion.div>
  );
}
