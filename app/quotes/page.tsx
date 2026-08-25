"use client";

import { motion } from "framer-motion";
import { ChevronRight, FilePlus2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoBadge, EmptyState, Badge } from "@/components/shared/ui";
import { getAverageMarginRate, getCustomer, getProduct } from "@/lib/data/derived";
import { quoteTotals } from "@/lib/pricing/recommend";
import { useAllQuotes } from "@/lib/store";
import { clsx } from "@/lib/utils/clsx";
import { formatDate, formatKRW, formatPercent } from "@/lib/utils/format";

export default function QuotesPage() {
  const quotes = useAllQuotes();
  const avgMargin = useMemo(() => getAverageMarginRate(), []);

  const rows = quotes.map((quote) => {
    const totals = quoteTotals(quote.items);
    const first = getProduct(quote.items[0]?.productId ?? "");
    return {
      quote,
      totals,
      customer: getCustomer(quote.customerId),
      productLabel: first
        ? quote.items.length > 1
          ? `${first.name} 외 ${quote.items.length - 1}건`
          : first.name
        : "—",
      lowMargin: totals.marginRate < avgMargin - 5,
    };
  });

  return (
    <div>
      <PageHeader
        title="견적 / 주문"
        subtitle="추천 단가로 견적을 만들고 예상 매출과 마진을 미리 확인합니다."
        badge={<DemoBadge />}
        actions={
          <Link
            href="/quotes/new"
            className="flex h-10 items-center gap-1.5 rounded-btn bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <FilePlus2 className="h-4 w-4" aria-hidden />
            추천 견적 생성
          </Link>
        }
      />

      <p className="mb-3 flex items-center gap-1.5 text-[0.75rem] text-ink-400">
        <Sparkles className="h-3.5 w-3.5 text-brand-500" aria-hidden />
        전체 거래 평균 마진율 {formatPercent(avgMargin, 1)} — 이보다 5%p 이상
        낮은 견적은 별도 표시됩니다.
      </p>

      {rows.length === 0 ? (
        <EmptyState
          message="아직 생성된 견적이 없습니다."
          hint="추천 견적 생성으로 첫 견적을 만들어보세요."
        />
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="card hidden overflow-x-auto lg:block">
            <table className="tbl min-w-[52rem]">
              <thead>
                <tr>
                  <th className="pl-6">견적번호</th>
                  <th>거래처</th>
                  <th>제품</th>
                  <th className="text-right">예상 매출</th>
                  <th className="text-right">예상 마진</th>
                  <th className="text-right">마진율</th>
                  <th>상태</th>
                  <th className="text-right">작성일</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ quote, totals, customer, productLabel, lowMargin }, i) => (
                  <motion.tr
                    key={quote.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: i * 0.02 }}
                    className="group"
                  >
                    <td className="pl-6 font-bold tabular-nums text-ink-900">
                      {quote.number}
                      {quote.source === "ax" ? (
                        <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[0.62rem] font-bold text-brand-600">
                          AX
                        </span>
                      ) : null}
                    </td>
                    <td className="">
                      <Link
                        href={`/customers/${quote.customerId}`}
                        className="font-semibold text-ink-800 transition-colors hover:text-brand-700"
                      >
                        {customer?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-3.5 text-ink-600">
                      {productLabel}
                    </td>
                    <td className="text-right font-bold tabular-nums text-ink-900">
                      {formatKRW(totals.revenue)}
                    </td>
                    <td className="text-right tabular-nums text-ink-700">
                      {formatKRW(totals.margin)}
                    </td>
                    <td
                      className={clsx(
                        "px-3 py-3.5 text-right font-bold tabular-nums",
                        lowMargin ? "text-amber-600" : "text-teal-600"
                      )}
                    >
                      {formatPercent(totals.marginRate, 1)}
                      {lowMargin ? (
                        <span className="ml-1 text-[0.62rem] font-semibold text-amber-500">
                          평균↓
                        </span>
                      ) : null}
                    </td>
                    <td className="">
                      <Badge>{quote.status}</Badge>
                    </td>
                    <td className="text-right tabular-nums text-ink-500">
                      {formatDate(quote.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <ul className="space-y-2.5 lg:hidden">
            {rows.map(({ quote, totals, customer, productLabel, lowMargin }, i) => (
              <motion.li
                key={quote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="card card-interactive tap p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[0.72rem] font-bold tabular-nums text-ink-400">
                      {quote.number}
                      {quote.source === "ax" ? (
                        <span className="ml-1.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-[0.6rem] font-bold text-brand-600">
                          AX
                        </span>
                      ) : null}
                      <span className="ml-2 font-medium">
                        {formatDate(quote.createdAt)}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-[0.92rem] font-bold text-ink-900">
                      {customer?.name ?? "—"}
                    </p>
                    <p className="mt-0.5 truncate text-[0.75rem] text-ink-500">
                      {productLabel}
                    </p>
                  </div>
                  <Badge>{quote.status}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-surface-line pt-3 text-center">
                  <div>
                    <p className="text-[0.66rem] text-ink-400">예상 매출</p>
                    <p className="mt-0.5 text-[0.82rem] font-bold tabular-nums text-ink-900">
                      {formatKRW(totals.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.66rem] text-ink-400">예상 마진</p>
                    <p className="mt-0.5 text-[0.82rem] font-bold tabular-nums text-ink-900">
                      {formatKRW(totals.margin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.66rem] text-ink-400">마진율</p>
                    <p
                      className={clsx(
                        "mt-0.5 text-[0.82rem] font-bold tabular-nums",
                        lowMargin ? "text-amber-600" : "text-teal-600"
                      )}
                    >
                      {formatPercent(totals.marginRate, 1)}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* 모바일 신규 버튼 */}
          <Link
            href="/quotes/new"
            className="mt-4 flex h-12 items-center justify-center gap-1.5 rounded-btn bg-brand-600 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 lg:hidden"
          >
            <FilePlus2 className="h-4 w-4" aria-hidden />
            추천 견적 생성
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </>
      )}
    </div>
  );
}
