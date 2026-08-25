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
export function FinancialTrendChart({
  height = 300,
  compact = false,
  fill = false,
}: {
  height?: number;
  compact?: boolean;
  /** true면 부모 높이를 채운다 (카드 하단 여백 방지) */
  fill?: boolean;
}) {
  const data = FINANCIALS.map((f) => ({
    year: f.year,
    매출액: f.revenue,
    영업이익: f.operatingProfit,
    당기순이익: f.netProfit,
  }));

  return (
    <div
      style={fill ? undefined : { height }}
      className={fill ? "h-full w-full" : "w-full"}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 8, bottom: 0, left: 0 }}
          barCategoryGap={compact ? "34%" : "42%"}
        >
          <defs>
            <linearGradient id="revBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B75F6" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0.82} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#E8ECF2"
            strokeDasharray="0"
            strokeWidth={1}
          />
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            dy={10}
            tick={{ fontSize: compact ? 11 : 12.5, fill: "#64748B", fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={compact ? 38 : 46}
            tickFormatter={(v: number) => `${v}억`}
            tick={{ fontSize: 11.5, fill: "#94A3B8" }}
          />
          <Tooltip content={<EokTooltip />} />
          <Legend
            verticalAlign="top"
            align="left"
            height={34}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="매출액"
            fill="url(#revBar)"
            radius={[7, 7, 0, 0]}
            maxBarSize={compact ? 40 : 58}
          />
          <Line
            type="monotone"
            dataKey="영업이익"
            stroke="#14B8A6"
            strokeWidth={2.6}
            dot={{ r: 4.5, fill: "#14B8A6", strokeWidth: 2.5, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 2.5, stroke: "#fff" }}
          />
          <Line
            type="monotone"
            dataKey="당기순이익"
            stroke="#D9A93F"
            strokeWidth={2.6}
            strokeDasharray="5 4"
            dot={{ r: 4.5, fill: "#D9A93F", strokeWidth: 2.5, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 2.5, stroke: "#fff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
