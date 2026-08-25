"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FINANCIALS } from "@/lib/data/finance";
import { EokTooltip } from "./ChartTooltip";

/** 재무 성과 추이 — 매출 Bar + 이익 Line 콤보 */
export function FinancialTrendChart({ height = 260 }: { height?: number }) {
  const data = FINANCIALS.map((f) => ({
    year: f.year,
    매출액: f.revenue,
    영업이익: f.operatingProfit,
    당기순이익: f.netProfit,
  }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
        >
          <defs>
            <linearGradient id="revBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3366ff" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#2050e8" stopOpacity={0.75} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#e5eaf3"
            strokeDasharray="3 6"
          />
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => `${v}억`}
          />
          <Tooltip content={<EokTooltip />} />
          <Legend
            verticalAlign="top"
            align="left"
            height={32}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="매출액"
            fill="url(#revBar)"
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
          />
          <Line
            type="monotone"
            dataKey="영업이익"
            stroke="#26bcb8"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#26bcb8", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="당기순이익"
            stroke="#dfb548"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#dfb548", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
