"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CASH_BY_YEAR, getYear, RECEIVABLES_BY_YEAR } from "@/lib/data/finance";
import { getInventorySummary } from "@/lib/data/derived";

const COLORS = ["#2563EB", "#14B8A6", "#D9A93F", "#AFC0DA"];

/** 자산 구성 도넛 (단위: 억원) */
export function AssetCompositionChart({
  year,
  size = 178,
}: {
  year: number;
  size?: number;
}) {
  const fin = getYear(year);
  const cash = CASH_BY_YEAR[year] ?? 0;
  const receivables = RECEIVABLES_BY_YEAR[year] ?? 0;
  const inventoryEok =
    year === 2025
      ? getInventorySummary().totalValue / 100_000_000
      : Math.max(0.2, fin.assets * 0.12);
  const others = Math.max(0, fin.assets - cash - receivables - inventoryEok);

  const data = [
    { name: "현금성 자산", value: round2(cash) },
    { name: "매출채권", value: round2(receivables) },
    { name: "재고자산", value: round2(inventoryEok) },
    { name: "기타 자산", value: round2(others) },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-9">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="63%"
              outerRadius="94%"
              paddingAngle={2.5}
              strokeWidth={0}
              cornerRadius={4}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | string) => [`${value}억원`, ""]}
              separator=""
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E8ECF2",
                fontSize: "0.76rem",
                fontWeight: 600,
                padding: "8px 12px",
                boxShadow: "0 16px 56px rgba(7,26,51,0.2)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[0.8rem] font-semibold text-ink-400">총 자산</span>
          <span className="mt-0.5 text-[1.32rem] font-extrabold leading-none tabular-nums tracking-[-0.02em] text-ink-900">
            {fin.assets.toFixed(2)}
            <span className="ml-0.5 text-[0.82rem] font-bold text-ink-500">억</span>
          </span>
        </div>
      </div>

      <ul className="grid w-full min-w-0 flex-1 grid-cols-1 gap-x-8 gap-y-3.5 xs:grid-cols-2 lg:grid-cols-4">
        {data.map((d, i) => (
          <li
            key={d.name}
            className="flex items-center justify-between gap-3 border-b border-surface-line pb-3 lg:flex-col lg:items-start lg:gap-1.5 lg:border-b-0 lg:border-l lg:border-surface-line lg:pb-0 lg:pl-4"
          >
            <span className="flex min-w-0 items-center gap-2 text-[0.82rem] text-ink-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ background: COLORS[i % COLORS.length] }}
                aria-hidden
              />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="shrink-0 text-[0.84rem] font-bold tabular-nums text-ink-900">
              {d.value.toFixed(2)}억
              <span className="ml-1.5 text-[0.86rem] font-semibold text-ink-400">
                {Math.round((d.value / fin.assets) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
