"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CASH_BY_YEAR, getYear, RECEIVABLES_BY_YEAR } from "@/lib/data/finance";
import { getInventorySummary } from "@/lib/data/derived";
import { formatEok } from "@/lib/utils/format";

const COLORS = ["#2050e8", "#26bcb8", "#dfb548", "#92abd0"];

/** 자산 구성 도넛 (해당 연도, 단위: 억원) */
export function AssetCompositionChart({ year }: { year: number }) {
  const fin = getYear(year);
  const cash = CASH_BY_YEAR[year] ?? 0;
  const receivables = RECEIVABLES_BY_YEAR[year] ?? 0;
  // 재고자산: 2025년은 실제 재고 데이터에서 파생, 과거 연도는 추정 비중
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
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
      <div className="relative h-[172px] w-[172px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={82}
              paddingAngle={2}
              strokeWidth={0}
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
                border: "1px solid #e5eaf3",
                fontSize: "0.75rem",
                boxShadow: "0 12px 48px rgba(16,27,48,0.18)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[0.68rem] text-navy-400">총 자산</span>
          <span className="text-lg font-extrabold tabular-nums text-navy-900">
            {formatEok(fin.assets, "")}
            <span className="text-xs font-semibold text-navy-500">억원</span>
          </span>
        </div>
      </div>
      <ul className="w-full max-w-[220px] space-y-2">
        {data.map((d, i) => (
          <li
            key={d.name}
            className="flex items-center justify-between gap-3 text-[0.8rem]"
          >
            <span className="flex items-center gap-2 text-navy-500">
              <span
                className="h-2.5 w-2.5 rounded-[4px]"
                style={{ background: COLORS[i % COLORS.length] }}
                aria-hidden
              />
              {d.name}
            </span>
            <span className="font-bold tabular-nums text-navy-800">
              {d.value.toFixed(2)}억
              <span className="ml-1 font-medium text-navy-400">
                ({Math.round((d.value / fin.assets) * 100)}%)
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
