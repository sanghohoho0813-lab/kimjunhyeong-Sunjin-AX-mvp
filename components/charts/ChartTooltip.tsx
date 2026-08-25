"use client";

import type { TooltipProps } from "recharts";

/** 공용 커스텀 툴팁 — 억원 단위 */
export function EokTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-surface-line bg-white/95 px-3.5 py-2.5 shadow-modal backdrop-blur">
      <p className="mb-1.5 text-xs font-bold text-navy-900">{label}년</p>
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li
            key={entry.dataKey as string}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-1.5 text-navy-500">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: entry.color }}
                aria-hidden
              />
              {entry.name}
            </span>
            <span className="font-bold tabular-nums text-navy-900">
              {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
              억
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
