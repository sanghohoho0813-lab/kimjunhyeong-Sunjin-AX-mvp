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
import {
  getInventorySummary,
  getOverdueCustomers,
  getProduct,
  getProductStats,
} from "@/lib/data/derived";
import { CASH_BY_YEAR, getRatios, getYear } from "@/lib/data/finance";
import { SEED_QUOTES } from "@/lib/data/seed";
import { formatKRW, formatNumber, formatPercent } from "@/lib/utils/format";
import { clsx } from "@/lib/utils/clsx";
import { Badge } from "@/components/shared/ui";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";

/** 현금흐름 요약 (시연용 추정) */
export function CashflowCard({ year }: { year: number }) {
  const cash = CASH_BY_YEAR[year] ?? 0;
  const prevCash = CASH_BY_YEAR[year - 1];
  const delta = prevCash != null ? cash - prevCash : null;
  const rows =
    delta != null
      ? [
          { label: "영업활동", value: delta + 0.17 },
          { label: "투자활동", value: -0.05 },
          { label: "재무활동", value: -0.12 },
        ]
      : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="card-data flex h-full flex-col p-6"
      aria-label="현금흐름"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="t-section">현금흐름</h2>
          <p className="mt-1 t-caption">기말 현금성 자산 · 추정</p>
        </div>
      </div>

      <p className="mt-4 t-kpi-sm">
        {cash.toFixed(2)}
        <span className="t-unit">억원</span>
      </p>

      <ul className="mt-5 flex-1 space-y-3 border-t border-surface-line pt-4">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 text-[0.84rem]"
          >
            <span className="flex items-center gap-2 text-ink-500">
              {row.value >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-teal-500" aria-hidden />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-ink-300" aria-hidden />
              )}
              {row.label}
            </span>
            <span
              className={clsx(
                "font-bold tabular-nums",
                row.value >= 0 ? "text-teal-700" : "text-ink-500"
              )}
            >
              {row.value >= 0 ? "+" : ""}
              {row.value.toFixed(2)}억
            </span>
          </li>
        ))}
      </ul>

      {delta != null ? (
        <div className="mt-4 rounded-card bg-teal-50 px-4 py-3">
          <p className="text-[0.7rem] font-semibold text-teal-700">
            연간 현금 순증감
          </p>
          <p className="mt-0.5 text-[1rem] font-extrabold tabular-nums text-teal-700">
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(2)}억원
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-card bg-surface-sunken px-4 py-3 text-[0.8rem] text-ink-500">
          비교 연도 데이터가 없습니다.
        </div>
      )}
    </motion.section>
  );
}

/** 재고 현황 스냅샷 — 장기 보유 품목을 Material Swatch와 함께 표시 */
export function InventorySnapshot() {
  const inv = getInventorySummary();
  const items = [...inv.longStockIds, ...inv.watchIds]
    .map((id) => ({ product: getProduct(id), stats: getProductStats(id) }))
    .filter((x) => x.product)
    .sort((a, b) => b.stats.idleDays - a.stats.idleDays)
    .slice(0, 4);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
      className="card-data flex h-full flex-col p-6"
      aria-label="주의가 필요한 재고"
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="t-section">주의가 필요한 재고</h2>
          <p className="mt-1 t-caption">
            장기재고 {inv.longStockCount}건 · 관심 {inv.watchCount}건
          </p>
        </div>
        <Link
          href="/inventory"
          className="inline-flex items-center gap-0.5 text-[0.78rem] font-bold text-brand-600 transition-colors hover:text-brand-700"
        >
          전체 <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <ul className="flex-1 space-y-2">
        {items.map(({ product, stats }) => {
          if (!product) return null;
          return (
            <li key={product.id}>
              <Link
                href={`/inventory/${product.id}`}
                className="card-action tap group flex items-center gap-3 p-3"
              >
                <LeatherSwatch
                  color={product.color}
                  finish={product.finish}
                  className="h-11 w-11"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[0.85rem] font-bold text-ink-900">
                      {product.material} · {product.color}
                    </span>
                    <Badge>{stats.status}</Badge>
                  </span>
                  <span className="mt-0.5 block truncate text-[0.73rem] tabular-nums text-ink-400">
                    {product.thicknessMm}mm · {product.grade} Grade ·{" "}
                    {formatNumber(product.stockQty)}평
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[0.84rem] font-extrabold tabular-nums text-ink-900">
                    {stats.idleDays}일
                  </span>
                  <span className="block text-[0.68rem] text-ink-400">무출고</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}

/** 하단 요약 스트립 — 재무·재고·영업 연결 지표 */
export function MetricStrip({ year }: { year: number }) {
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
      note: fin.equity < 1 ? "자본 변동 모니터링" : "안정 구간",
      warn: ratios.equityRatioPct < 30,
      href: "/analytics",
    },
    {
      icon: Layers,
      label: "재고자산",
      value: formatKRW(inv.totalValue),
      note: `${inv.itemCount}개 품목`,
      warn: false,
      href: "/inventory",
    },
    {
      icon: PackageOpen,
      label: "장기재고",
      value: formatKRW(inv.longStockValue),
      note: `전체의 ${Math.round((inv.longStockValue / inv.totalValue) * 100)}% · ${inv.longStockCount}건`,
      warn: inv.longStockCount > 0,
      href: "/inventory?status=장기재고",
    },
    {
      icon: FileText,
      label: "진행 중 견적",
      value: `${activeQuotes.length}건`,
      note: `예상 ${formatKRW(
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
      label: "재접촉 대상",
      value: `${overdue.length}곳`,
      note: "재구매 시점 경과",
      warn: overdue.length > 0,
      href: "/customers?filter=재접촉 필요",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="card grid grid-cols-2 overflow-hidden sm:grid-cols-3 lg:grid-cols-5"
      aria-label="핵심 지표 요약"
    >
      {items.map((item, i) => (
        <Link
          key={item.label}
          href={item.href}
          className={clsx(
            "group flex flex-col gap-1.5 px-5 py-4 transition-colors duration-200 hover:bg-surface-subtle",
            i > 0 && "lg:border-l lg:border-surface-line",
            i % 2 === 1 && "border-l border-surface-line sm:border-l-0",
            i >= 2 && "border-t border-surface-line lg:border-t-0",
            i === 1 && "sm:border-l sm:border-surface-line",
            i === 2 && "sm:border-l sm:border-surface-line sm:border-t-0"
          )}
        >
          <span className="flex items-center gap-1.5 text-[0.74rem] font-semibold text-ink-400">
            <item.icon
              className={clsx(
                "h-3.5 w-3.5",
                item.warn ? "text-warning" : "text-ink-300"
              )}
              aria-hidden
            />
            {item.label}
          </span>
          <span
            className={clsx(
              "text-[1.08rem] font-extrabold tabular-nums tracking-[-0.02em]",
              item.warn ? "text-warning" : "text-ink-900"
            )}
          >
            {item.value}
          </span>
          <span className="flex items-center gap-0.5 text-[0.72rem] text-ink-400">
            {item.note}
            <ChevronRight
              className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden
            />
          </span>
        </Link>
      ))}
    </motion.section>
  );
}
