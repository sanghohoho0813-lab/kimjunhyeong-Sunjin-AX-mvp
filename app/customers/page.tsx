"use client";

import { motion } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoBadge, EmptyState, ScoreBadge, StatusBadge } from "@/components/shared/ui";
import {
  getCustomerStats,
  getCustomerStatus,
} from "@/lib/data/derived";
import { CUSTOMERS } from "@/lib/data/seed";
import { calculateRepurchaseScore } from "@/lib/scoring/repurchase";
import { clsx } from "@/lib/utils/clsx";
import { formatDate, formatKRW } from "@/lib/utils/format";
import type { CustomerStatus } from "@/types";

const FILTERS: Array<CustomerStatus | "전체"> = [
  "전체",
  "안정",
  "재구매 예상",
  "재접촉 필요",
  "휴면 가능",
  "신규",
];

function CustomersContent() {
  const params = useSearchParams();
  const initial = (params.get("filter") as CustomerStatus | null) ?? "전체";
  const [filter, setFilter] = useState<CustomerStatus | "전체">(
    FILTERS.includes(initial) ? initial : "전체"
  );
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return CUSTOMERS.map((customer) => ({
      customer,
      stats: getCustomerStats(customer.id),
      status: getCustomerStatus(customer.id),
      score: calculateRepurchaseScore(customer.id),
    }))
      .filter((row) => (filter === "전체" ? true : row.status === filter))
      .filter((row) =>
        query.trim()
          ? row.customer.name.includes(query.trim()) ||
            row.customer.contactName.includes(query.trim()) ||
            row.customer.segment.includes(query.trim())
          : true
      )
      .sort((a, b) => b.score.score - a.score.score);
  }, [filter, query]);

  return (
    <div>
      <PageHeader
        title="거래처 / 영업"
        subtitle="구매 패턴과 재구매 가능성을 기준으로 오늘 접촉할 거래처를 결정합니다."
        badge={<DemoBadge />}
      />

      {/* 검색 + 필터 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="거래처명·담당자·업종 검색"
            aria-label="거래처 검색"
            className="h-11 w-full rounded-btn border border-surface-line bg-white pl-10 pr-4 text-sm text-navy-800 placeholder:text-navy-300 focus:border-brand-400"
          />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[0.8rem] font-semibold transition-colors",
                filter === f
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-surface-line bg-white text-navy-500 hover:border-navy-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            message="조건에 맞는 거래처가 없습니다."
            hint="검색어나 필터를 변경해보세요."
          />
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="card mt-4 hidden overflow-hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-line bg-surface-soft text-[0.72rem] uppercase tracking-wide text-navy-400">
                  <th className="px-5 py-3 font-semibold">거래처</th>
                  <th className="px-3 py-3 font-semibold">상태</th>
                  <th className="px-3 py-3 text-right font-semibold">누적 매출</th>
                  <th className="px-3 py-3 text-right font-semibold">평균 주문</th>
                  <th className="px-3 py-3 text-right font-semibold">최근 거래</th>
                  <th className="px-3 py-3 text-right font-semibold">경과/주기</th>
                  <th className="px-3 py-3 text-center font-semibold">
                    재구매 가능성
                  </th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ customer, stats, status, score }, i) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: i * 0.02 }}
                    className="group border-b border-surface-line/70 transition-colors last:border-0 hover:bg-brand-50/30"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="block"
                      >
                        <span className="font-bold text-navy-900 group-hover:text-brand-700">
                          {customer.name}
                        </span>
                        <span className="mt-0.5 block text-[0.72rem] text-navy-400">
                          {customer.contactName} · {customer.segment}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-3 py-3.5 text-right font-bold tabular-nums text-navy-900">
                      {formatKRW(stats.totalRevenue)}
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-navy-600">
                      {formatKRW(stats.avgOrderValue)}
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-navy-600">
                      {stats.lastPurchaseDate
                        ? formatDate(stats.lastPurchaseDate)
                        : "—"}
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-navy-600">
                      {stats.elapsedDays != null
                        ? `${stats.elapsedDays}일 / ${stats.cycleDays}일`
                        : "—"}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <ScoreBadge score={score.score} label={score.label} size="sm" />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <Link
                        href={`/customers/${customer.id}`}
                        aria-label={`${customer.name} 상세 보기`}
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
          <ul className="mt-4 space-y-2.5 lg:hidden">
            {rows.map(({ customer, stats, status, score }, i) => (
              <motion.li
                key={customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
              >
                <Link
                  href={`/customers/${customer.id}`}
                  className="card card-hover block p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[0.95rem] font-bold text-navy-900">
                        {customer.name}
                      </p>
                      <p className="mt-0.5 text-[0.72rem] text-navy-400">
                        {customer.contactName} · {customer.segment}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-surface-line pt-3 text-center">
                    <div>
                      <p className="text-[0.66rem] text-navy-400">누적 매출</p>
                      <p className="mt-0.5 text-[0.82rem] font-bold tabular-nums text-navy-900">
                        {formatKRW(stats.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.66rem] text-navy-400">최근 구매</p>
                      <p className="mt-0.5 text-[0.82rem] font-bold tabular-nums text-navy-900">
                        {stats.elapsedDays != null ? `${stats.elapsedDays}일 전` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.66rem] text-navy-400">재구매 가능성</p>
                      <p className="mt-0.5 flex items-center justify-center">
                        <ScoreBadge score={score.score} size="sm" />
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense>
      <CustomersContent />
    </Suspense>
  );
}
