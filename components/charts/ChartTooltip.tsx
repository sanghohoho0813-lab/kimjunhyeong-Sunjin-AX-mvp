"use client";

import type { TooltipProps } from "recharts";

/** 억원 단위 커스텀 툴팁 — Premium styling */
export function EokTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-surface-line bg-white/95 px-4 py-3 shadow-modal backdrop-blur-sm">
      <p className="mb-2 text-[0.86rem] font-bold text-ink-900">{label}년</p>
      <ul className="space-y-1.5">
        {payload.map((entry) => (
          <li
            key={entry.dataKey as string}
            className="flex items-center justify-between gap-6 text-[0.76rem]"
          >
            <span className="flex items-center gap-2 text-ink-500">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: entry.color }}
                aria-hidden
              />
              {entry.name}
            </span>
            <span className="font-bold tabular-nums text-ink-900">
              {typeof entry.value === "number"
                ? entry.value.toFixed(2)
                : entry.value}
              <span className="ml-0.5 text-[0.8rem] font-semibold text-ink-400">
                억
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
