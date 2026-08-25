"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { clsx } from "@/lib/utils/clsx";
import { DeltaBadge } from "./ui";

const TONES = {
  blue: "bg-brand-50 text-brand-600",
  teal: "bg-teal-50 text-teal-600",
  violet: "bg-indigo-50 text-indigo-600",
  gold: "bg-gold-100 text-gold-600",
  navy: "bg-navy-50 text-navy-600",
} as const;

export type KpiTone = keyof typeof TONES;

/** 숫자 카운트업 (reduced-motion 시 즉시 표시) */
export function useCountUp(target: number, duration = 700): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, reduced]);

  return value;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  decimals = 2,
  delta,
  deltaSuffix = "%",
  deltaGoodWhenUp = true,
  tone = "blue",
  footnote,
  compact = false,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  unit: ReactNode;
  decimals?: number;
  delta?: number | null;
  deltaSuffix?: string;
  deltaGoodWhenUp?: boolean;
  tone?: KpiTone;
  footnote?: string;
  compact?: boolean;
}) {
  const animated = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className={clsx("card card-hover", compact ? "p-3.5" : "p-4 lg:p-5")}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={clsx(
            "text-[0.78rem] font-semibold text-navy-500",
            compact && "text-[0.72rem]"
          )}
        >
          {label}
        </span>
        <span
          className={clsx(
            "flex items-center justify-center rounded-[10px]",
            TONES[tone],
            compact ? "h-7 w-7" : "h-8 w-8"
          )}
        >
          <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
        </span>
      </div>
      <p
        className={clsx(
          "mt-1.5 font-extrabold tabular-nums leading-none text-navy-900",
          compact ? "text-[1.3rem]" : "text-[1.55rem] lg:text-[1.8rem]"
        )}
      >
        {animated.toFixed(decimals)}
        <span
          className={clsx(
            "ml-0.5 font-bold text-navy-500",
            compact ? "text-[0.8rem]" : "text-[0.95rem]"
          )}
        >
          {unit}
        </span>
      </p>
      <div className={clsx("mt-2", compact && "mt-1.5")}>
        {delta !== undefined ? (
          <DeltaBadge
            value={delta}
            suffix={deltaSuffix}
            goodWhenUp={deltaGoodWhenUp}
          />
        ) : footnote ? (
          <span className="text-xs text-navy-400">{footnote}</span>
        ) : null}
      </div>
    </motion.div>
  );
}
