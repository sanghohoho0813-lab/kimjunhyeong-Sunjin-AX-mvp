"use client";

import { motion } from "framer-motion";
import { ChevronRight, Layers, PackageOpen, Search, Timer } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { DemoBadge, EmptyState, Badge } from "@/components/shared/ui";
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
      short: "재고자산",
      value: formatKRW(summary.totalValue),
      note: `${summary.itemCount}개 품목 · ${formatNumber(summary.totalQty)}평`,
      tone: "text-brand-600 bg-brand-50",
    },
    {
      icon: PackageOpen,
      label: "장기재고 (120일 이상)",
      short: "장기재고",
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
      short: "관심 재고",
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
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {summaryCards.map((card) => (
          <button
            key={card.label}
            onClick={card.onClick}
            disabled={!card.onClick}
            className={clsx(
              "card-kpi flex items-center gap-0 px-3.5 py-3.5 text-left transition-all duration-200 ease-premium sm:gap-4 sm:px-5 sm:py-4",
              card.onClick && "hover:-translate-y-[3px] hover:shadow-card-hover",
              card.active && "border-brand-400 ring-2 ring-brand-100"
            )}
          >
            <span
              className={clsx(
                "hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex",
                card.tone
              )}
            >
              <card.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.84rem] font-semibold text-ink-500 sm:text-[0.86rem]">
                <span className="sm:hidden">{card.short}</span>
                <span className="hidden sm:inline">{card.label}</span>
              </span>
              <span className="mt-1 block truncate text-[1.05rem] font-extrabold tabular-nums tracking-[-0.02em] text-ink-900 sm:text-[1.28rem]">
                {card.value}
              </span>
              <span className="mt-0.5 hidden text-[0.84rem] text-ink-400 sm:block">
                {card.note}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* 검색 + 필터 */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제품명·코드·컬러 검색"
            aria-label="재고 검색"
            className="input pl-10"
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
          <div className="card mt-5 hidden overflow-x-auto lg:block">
            <table className="tbl min-w-[52rem]">
              <thead>
                <tr>
                  <th className="pl-6">제품</th>
                  <th className="text-right">보유수량</th>
                  <th className="text-right">재고금액</th>
                  <th className="text-right">권장가</th>
                  <th className="text-right">무출고</th>
                  <th>상태</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ product, stats }, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: i * 0.015 }}
                    className="group"
                  >
                    <td className="pl-6">
                      <Link
                        href={`/inventory/${product.id}`}
                        className="flex items-center gap-3"
                      >
                        <LeatherSwatch
                          color={product.color}
                          finish={product.finish}
                          className="h-12 w-12"
                        />
                        <span className="min-w-0">
                          <span className="block whitespace-nowrap font-bold text-ink-900 group-hover:text-brand-700">
                            {product.name}
                          </span>
                          <span className="mt-0.5 block whitespace-nowrap text-[0.82rem] text-ink-400">
                            {product.code} · {product.grade} · {product.finish}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap text-right tabular-nums text-ink-700">
                      {formatNumber(product.stockQty)}평
                    </td>
                    <td className="whitespace-nowrap text-right font-bold tabular-nums text-ink-900">
                      {formatKRW(stats.stockValue)}
                    </td>
                    <td className="whitespace-nowrap text-right tabular-nums text-ink-600">
                      {formatNumber(product.listPricePerUnit)}원
                    </td>
                    <td className="whitespace-nowrap text-right tabular-nums text-ink-600">
                      {stats.idleDays}일
                    </td>
                    <td className="">
                      <Badge>{stats.status}</Badge>
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/inventory/${product.id}`}
                        aria-label={`${product.name} 상세 보기`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-brand-50 hover:text-brand-600"
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
                  className="card-interactive tap block h-full p-4"
                >
                  <span className="flex items-start gap-3.5">
                    <LeatherSwatch
                      color={product.color}
                      finish={product.finish}
                      className="h-16 w-16"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="block truncate text-[0.94rem] font-bold tracking-[-0.01em] text-ink-900">
                            {product.material} Leather
                          </span>
                          <span className="mt-0.5 block truncate text-[0.82rem] font-semibold uppercase tracking-[0.07em] text-ink-400">
                            {product.color} · {product.thicknessMm}mm ·{" "}
                            {product.grade} Grade
                          </span>
                        </span>
                        <Badge>{stats.status}</Badge>
                      </span>
                    </span>
                  </span>

                  <span className="mt-3.5 flex items-end justify-between gap-3 border-t border-surface-line pt-3">
                    <span className="flex gap-5">
                      <span>
                        <span className="block text-[0.8rem] text-ink-400">
                          보유
                        </span>
                        <span className="block text-[0.92rem] font-extrabold tabular-nums text-ink-900">
                          {formatNumber(product.stockQty)}
                          <span className="ml-0.5 text-[0.82rem] font-bold text-ink-400">
                            평
                          </span>
                        </span>
                      </span>
                      <span>
                        <span className="block text-[0.8rem] text-ink-400">
                          무출고
                        </span>
                        <span
                          className={clsx(
                            "block text-[0.92rem] font-extrabold tabular-nums",
                            stats.status === "정상" ? "text-ink-900" : "text-warning"
                          )}
                        >
                          {stats.idleDays}
                          <span className="ml-0.5 text-[0.82rem] font-bold text-ink-400">
                            일
                          </span>
                        </span>
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[0.8rem] font-bold text-brand-600">
                      판매처 찾기
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
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
      <span className="text-[0.82rem] font-bold text-ink-400">{label}</span>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={clsx(
              "chip !min-h-[36px] !px-3 !text-[0.75rem]",
              value === option && "chip-on"
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
