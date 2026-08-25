"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  FileText,
  Layers,
  PackageOpen,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getInventorySummary, getOverdueCustomers } from "@/lib/data/derived";
import { CASH_BY_YEAR, getRatios, getYear } from "@/lib/data/finance";
import { SEED_QUOTES } from "@/lib/data/seed";
import { formatKRW, formatPercent } from "@/lib/utils/format";
import { clsx } from "@/lib/utils/clsx";

/** 현금흐름 요약 카드 (시연용 추정 표기) */
export function CashflowCard({ year }: { year: number }) {
  const cash = CASH_BY_YEAR[year] ?? 0;
  const prevCash = CASH_BY_YEAR[year - 1];
  const delta = prevCash != null ? cash - prevCash : null;
  // 시연용 추정 배분: 순증감을 영업/투자/재무로 나눈다
  const rows =
    delta != null
      ? [
          { label: "영업활동 현금흐름", value: delta + 0.17 },
          { label: "투자활동 현금흐름", value: -0.05 },
          { label: "재무활동 현금흐름", value: -0.12 },
        ]
      : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.1 }}
      className="card flex h-full flex-col p-5"
      aria-label="현금흐름"
    >
      <h2 className="text-[1.02rem] font-bold text-navy-900">
        현금흐름 <span className="text-xs font-medium text-navy-400">(추정)</span>
      </h2>
      <p className="mt-3 text-[0.75rem] text-navy-400">기말 현금성 자산</p>
      <p className="text-[1.5rem] font-extrabold tabular-nums text-navy-900">
        {cash.toFixed(2)}
        <span className="text-sm font-bold text-navy-500">억원</span>
      </p>
      <ul className="mt-3 flex-1 space-y-2.5 border-t border-surface-line pt-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-2 text-[0.8rem]"
          >
            <span className="flex items-center gap-1.5 text-navy-500">
              {row.value >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-teal-500" aria-hidden />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-navy-300" aria-hidden />
              )}
              {row.label}
            </span>
            <span
              className={clsx(
                "font-bold tabular-nums",
                row.value >= 0 ? "text-teal-600" : "text-navy-500"
              )}
            >
              {row.value >= 0 ? "+" : ""}
              {row.value.toFixed(2)}억
            </span>
          </li>
        ))}
      </ul>
      {delta != null ? (
        <div className="mt-3 rounded-xl bg-teal-50 px-3.5 py-2.5 text-[0.78rem] font-semibold text-teal-700">
          연간 현금 순증감 {delta >= 0 ? "+" : ""}
          {delta.toFixed(2)}억원
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-navy-50 px-3.5 py-2.5 text-[0.78rem] text-navy-500">
          비교 연도 데이터가 없습니다.
        </div>
      )}
    </motion.section>
  );
}

/** 하단 요약 스트립 — 재무·재고·영업 연결 지표 */
export function BottomStrip({ year }: { year: number }) {
  const inv = getInventorySummary();
  const ratios = getRatios(year);
  const fin = getYear(year);
  const overdue = getOverdueCustomers();
  const activeQuotes = SEED_QUOTES.filter((q) =>
    ["작성중", "발송", "검토"].includes(q.status)
  );

  const items = [
    {
      icon: ShieldAlert,
      label: "자기자본비율",
      value: formatPercent(ratios.equityRatioPct, 1),
      note: fin.equity < 1 ? "자본 변동 모니터링 필요" : "안정 구간",
      warn: ratios.equityRatioPct < 30,
      href: "/analytics",
    },
    {
      icon: Layers,
      label: "재고자산",
      value: formatKRW(inv.totalValue),
      note: `${inv.itemCount}개 품목 · ${inv.totalQty.toLocaleString()}평`,
      warn: false,
      href: "/inventory",
    },
    {
      icon: PackageOpen,
      label: "장기재고",
      value: formatKRW(inv.longStockValue),
      note: `전체 재고의 ${Math.round((inv.longStockValue / inv.totalValue) * 100)}% · ${inv.longStockCount}건`,
      warn: inv.longStockCount > 0,
      href: "/inventory?status=장기재고",
    },
    {
      icon: FileText,
      label: "진행 중 견적",
      value: `${activeQuotes.length}건`,
      note: `예상 매출 ${formatKRW(
        activeQuotes.reduce(
          (s, q) => s + q.items.reduce((a, i) => a + i.qty * i.unitPrice, 0),
          0
        )
      )}`,
      warn: false,
      href: "/quotes",
    },
    {
      icon: Users,
      label: "재접촉 대상 거래처",
      value: `${overdue.length}곳`,
      note: "재구매 예상 시점 경과",
      warn: overdue.length > 0,
      href: "/customers?filter=재접촉 필요",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.2 }}
      className="card grid grid-cols-2 divide-surface-line sm:grid-cols-3 lg:grid-cols-5 lg:divide-x"
      aria-label="핵심 지표 요약"
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group flex flex-col gap-1 px-4 py-3.5 transition-colors hover:bg-surface-soft lg:px-5"
        >
          <span className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-navy-400">
            <item.icon
              className={clsx(
                "h-3.5 w-3.5",
                item.warn ? "text-amber-500" : "text-navy-300"
              )}
              aria-hidden
            />
            {item.label}
          </span>
          <span
            className={clsx(
              "text-[1.05rem] font-extrabold tabular-nums",
              item.warn ? "text-amber-600" : "text-navy-900"
            )}
          >
            {item.value}
          </span>
          <span className="flex items-center gap-0.5 text-[0.7rem] text-navy-400">
            {item.note}
            <ChevronRight
              className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </span>
        </Link>
      ))}
    </motion.section>
  );
}
