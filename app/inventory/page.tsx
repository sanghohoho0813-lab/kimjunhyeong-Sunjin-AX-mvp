"use client";

import { motion } from "framer-motion";
import { ChevronRight, Layers, PackageOpen, Search, Timer } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { DemoBadge, EmptyState, StatusBadge } from "@/components/shared/ui";
import { getInventorySummary, getProductStats } from "@/lib/data/derived";
import { PRODUCTS } from "@/lib/data/seed";
import { clsx } from "@/lib/utils/clsx";
import { formatKRW, formatNumber } from "@/lib/utils/format";
import type { InventoryStatus, LeatherMaterial } from "@/types";

const MATERIALS: Array<LeatherMaterial | "전체"> = [
  "전체",
  "Cow",
  "Lamb",
  "Goat",
  "Split",
];
const STATUSES: Array<InventoryStatus | "전체"> = [
  "전체",
  "정상",
  "관심",
  "장기재고",
];
const GRADES = ["전체", "Premium", "A", "B"] as const;

function InventoryContent() {
  const params = useSearchParams();
  const initialStatus = (params.get("status") as InventoryStatus | null) ?? "전체";
  const [status, setStatus] = useState<InventoryStatus | "전체">(
    STATUSES.includes(initialStatus) ? initialStatus : "전체"
  );
  const [material, setMaterial] = useState<LeatherMaterial | "전체">("전체");
  const [grade, setGrade] = useState<(typeof GRADES)[number]>("전체");
  const [query, setQuery] = useState("");

  const summary = getInventorySummary();

  const rows = useMemo(() => {
    return PRODUCTS.map((product) => ({
      product,
      stats: getProductStats(product.id),
    }))
      .filter((r) => (status === "전체" ? true : r.stats.status === status))
      .filter((r) => (material === "전체" ? true : r.product.material === material))
      .filter((r) => (grade === "전체" ? true : r.product.grade === grade))
      .filter((r) =>
        query.trim()
          ? `${r.product.name} ${r.product.code} ${r.product.color}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          : true
      )
      .sort((a, b) => b.stats.idleDays - a.stats.idleDays);
  }, [status, material, grade, query]);

  const summaryCards = [
    {
      icon: Layers,
      label: "재고자산 (매입가 기준)",
      value: formatKRW(summary.totalValue),
      note: `${summary.itemCount}개 품목 · ${formatNumber(summary.totalQty)}평`,
      tone: "text-brand-600 bg-brand-50",
    },
    {
      icon: PackageOpen,
      label: "장기재고 (120일 이상)",
      value: formatKRW(summary.longStockValue),
      note: `${summary.longStockCount}건 · 전체의 ${Math.round(
        (summary.longStockValue / summary.totalValue) * 100
      )}%`,
      tone: "text-rose-600 bg-rose-50",
      active: status === "장기재고",
      onClick: () => setStatus(status === "장기재고" ? "전체" : "장기재고"),
    },
    {
      icon: Timer,
      label: "관심 재고 (90일 이상)",
      value: `${summary.watchCount}건`,
      note: "장기화 전 조기 판매 대상",
      tone: "text-amber-600 bg-amber-50",
      active: status === "관심",
      onClick: () => setStatus(status === "관심" ? "전체" : "관심"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="피혁 / 재고"
        subtitle="보유 피혁의 상태를 파악하고, 오래 남은 재고를 판매 가능 거래처와 연결합니다."
        badge={<DemoBadge />}
      />

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <button
            key={card.label}
            onClick={card.onClick}
            disabled={!card.onClick}
            className={clsx(
              "card card-hover flex items-center gap-3.5 p-4 text-left",
              card.active && "ring-2 ring-brand-400"
            )}
          >
            <span
              className={clsx(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                card.tone
              )}
            >
              <card.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.72rem] font-semibold text-navy-400">
                {card.label}
              </span>
              <span className="block text-[1.15rem] font-extrabold tabular-nums text-navy-900">
                {card.value}
              </span>
              <span className="block text-[0.7rem] text-navy-400">{card.note}</span>
            </span>
          </button>
        ))}
      </div>

      {/* 검색 + 필터 */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제품명·코드·컬러 검색"
            aria-label="재고 검색"
            className="h-11 w-full rounded-btn border border-surface-line bg-white pl-10 pr-4 text-sm text-navy-800 placeholder:text-navy-300 focus:border-brand-400"
          />
        </div>
        <div className="no-scrollbar -mx-4 flex items-center gap-3 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterGroup
            label="상태"
            options={STATUSES}
            value={status}
            onChange={setStatus}
          />
          <FilterGroup
            label="소재"
            options={MATERIALS}
            value={material}
            onChange={setMaterial}
          />
          <FilterGroup
            label="등급"
            options={[...GRADES]}
            value={grade}
            onChange={(v) => setGrade(v as (typeof GRADES)[number])}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            message="조건에 맞는 재고가 없습니다."
            hint="필터를 변경하거나 검색어를 지워보세요."
          />
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="card mt-4 hidden overflow-hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-line bg-surface-soft text-[0.72rem] uppercase tracking-wide text-navy-400">
                  <th className="px-5 py-3 font-semibold">제품</th>
                  <th className="px-3 py-3 font-semibold">등급 / 가공</th>
                  <th className="px-3 py-3 text-right font-semibold">보유수량</th>
                  <th className="px-3 py-3 text-right font-semibold">재고금액</th>
                  <th className="px-3 py-3 text-right font-semibold">권장가</th>
                  <th className="px-3 py-3 text-right font-semibold">무출고</th>
                  <th className="px-3 py-3 font-semibold">상태</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ product, stats }, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: i * 0.015 }}
                    className="group border-b border-surface-line/70 transition-colors last:border-0 hover:bg-brand-50/30"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/inventory/${product.id}`}
                        className="flex items-center gap-3"
                      >
                        <LeatherSwatch color={product.color} className="h-9 w-9" />
                        <span className="min-w-0">
                          <span className="block font-bold text-navy-900 group-hover:text-brand-700">
                            {product.name}
                          </span>
                          <span className="block text-[0.7rem] text-navy-400">
                            {product.code}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-[0.8rem] text-navy-600">
                      {product.grade} · {product.finish}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-navy-700">
                      {formatNumber(product.stockQty)}평
                    </td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-navy-900">
                      {formatKRW(stats.stockValue)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-navy-600">
                      {formatNumber(product.listPricePerUnit)}원
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-navy-600">
                      {stats.idleDays}일
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={stats.status} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/inventory/${product.id}`}
                        aria-label={`${product.name} 상세 보기`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-navy-300 transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:hidden">
            {rows.map(({ product, stats }, i) => (
              <motion.li
                key={product.id}
                className="min-w-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
              >
                <Link
                  href={`/inventory/${product.id}`}
                  className="card card-hover flex gap-3 p-3.5"
                >
                  <LeatherSwatch color={product.color} className="h-14 w-14" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-[0.88rem] font-bold text-navy-900">
                          {product.name}
                        </span>
                        <span className="block text-[0.68rem] text-navy-400">
                          {product.code} · {product.grade} Grade
                        </span>
                      </span>
                      <StatusBadge status={stats.status} />
                    </span>
                    <span className="mt-2 flex items-center justify-between text-[0.75rem] text-navy-500">
                      <span className="tabular-nums">
                        {formatNumber(product.stockQty)}평 ·{" "}
                        {formatKRW(stats.stockValue)}
                      </span>
                      <span className="tabular-nums font-semibold text-navy-600">
                        {stats.idleDays}일 무출고
                      </span>
                    </span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="text-[0.7rem] font-bold text-navy-400">{label}</span>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={clsx(
              "h-8 whitespace-nowrap rounded-full border px-3 text-[0.75rem] font-semibold transition-colors",
              value === option
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-surface-line bg-white text-navy-500 hover:border-navy-200"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense>
      <InventoryContent />
    </Suspense>
  );
}
