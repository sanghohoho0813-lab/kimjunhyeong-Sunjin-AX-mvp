"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  FilePlus2,
  Sparkles,
  Store,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { DemoBadge, EmptyState, Score, Badge } from "@/components/shared/ui";
import {
  getCustomer,
  getProduct,
  getProductStats,
  productTransactions,
} from "@/lib/data/derived";
import { PRODUCTS } from "@/lib/data/seed";
import { getRecommendedBuyers } from "@/lib/scoring/match";
import { formatDate, formatKRW, formatNumber } from "@/lib/utils/format";

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id);
  const [buyersOpen, setBuyersOpen] = useState(false);
  const buyersRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => (product ? getProductStats(id) : null), [product, id]);
  const buyers = useMemo(
    () => (product ? getRecommendedBuyers(id, 5).filter((b) => b.match.score >= 35) : []),
    [product, id]
  );
  const similar = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        (p.material === product.material || p.color === product.color) &&
        Math.abs(p.thicknessMm - product.thicknessMm) <= 0.2
    ).slice(0, 3);
  }, [product]);

  if (!product || !stats) return notFound();

  const txs = productTransactions(id);

  const infoRows = [
    { label: "제품 코드", value: product.code },
    { label: "소재", value: `${product.material} Leather` },
    { label: "컬러", value: product.color },
    { label: "두께", value: `${product.thicknessMm}mm` },
    { label: "등급", value: `${product.grade} Grade` },
    { label: "가공", value: product.finish },
    { label: "입고일", value: formatDate(product.receivedDate) },
    {
      label: "최근 판매",
      value: stats.lastSoldDate ? formatDate(stats.lastSoldDate) : "판매 이력 없음",
    },
  ];

  return (
    <div>
      <Link
        href="/inventory"
        className="mb-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-ink-400 transition-colors hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> 재고 목록
      </Link>

      {/* 상단 요약 */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-data p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <LeatherSwatch
            color={product.color}
            className="h-20 w-20 sm:h-24 sm:w-24"
            rounded="rounded-card"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[1.3rem] font-extrabold text-ink-900 lg:text-[1.5rem]">
                {product.name}
              </h1>
              <Badge>{stats.status}</Badge>
              <DemoBadge />
            </div>
            <p className="mt-1 text-[0.8rem] text-ink-500">
              {product.code} · {product.grade} Grade · {product.finish}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "보유 수량",
                  value: `${formatNumber(product.stockQty)}평`,
                },
                { label: "재고금액", value: formatKRW(stats.stockValue) },
                {
                  label: "무출고 경과",
                  value: `${stats.idleDays}일`,
                  warn: stats.status !== "정상",
                },
                {
                  label: "잠재 매출 (권장가)",
                  value: formatKRW(stats.potentialRevenue),
                },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-[0.7rem] text-ink-400">{item.label}</dt>
                  <dd
                    className={
                      item.warn
                        ? "mt-0.5 text-[0.95rem] font-bold tabular-nums text-amber-600"
                        : "mt-0.5 text-[0.95rem] font-bold tabular-nums text-ink-900"
                    }
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* 핵심 CTA */}
        <div className="mt-4 flex flex-col gap-2 border-t border-surface-line pt-4 sm:flex-row">
          <button
            onClick={() => {
              setBuyersOpen(true);
              setTimeout(
                () =>
                  buyersRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  }),
                120
              );
            }}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-btn bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 sm:flex-none"
          >
            <Store className="h-4 w-4" aria-hidden />
            판매 가능 거래처 찾기
          </button>
          <Link
            href={`/quotes/new?product=${product.id}`}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-btn border border-surface-line bg-white px-5 text-sm font-bold text-ink-700 transition-colors hover:border-ink-300 sm:flex-none"
          >
            <FilePlus2 className="h-4 w-4 text-brand-600" aria-hidden />
            견적 만들기
          </Link>
        </div>
      </motion.section>

      {/* AX 추천 거래처 */}
      <div ref={buyersRef} className="scroll-mt-20">
        <AnimatePresence>
          {buyersOpen ? (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
              aria-label="판매 가능 거래처 추천"
            >
              <div className="card-insight mt-5 p-6">
                <h2 className="flex items-center gap-1.5 text-[1.02rem] font-bold text-ink-900">
                  <Sparkles className="h-4 w-4 text-brand-600" aria-hidden />
                  이 피혁을 구매할 가능성이 높은 거래처
                </h2>
                <p className="mt-1 text-[0.75rem] text-ink-500">
                  과거 구매 이력·선호 스펙·재구매 타이밍을 조합한 AX 추천
                  점수입니다.
                </p>
                {buyers.length === 0 ? (
                  <div className="mt-3">
                    <EmptyState message="추천할 거래처가 아직 없습니다." />
                  </div>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {buyers.map(({ customer, match }, i) => (
                      <motion.li
                        key={customer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.06 }}
                        className="card p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Score value={match.score} size="md" />
                            <div>
                              <p className="font-bold text-ink-900">
                                {customer.name}
                              </p>
                              <p className="text-[0.7rem] text-ink-400">
                                {customer.segment} · 구매 가능성 {match.label}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/customers/${customer.id}`}
                              className="flex h-9 items-center gap-0.5 rounded-btn border border-surface-line bg-white px-3 text-[0.78rem] font-semibold text-ink-600 transition-colors hover:border-ink-300"
                            >
                              거래처 보기
                            </Link>
                            <Link
                              href={`/quotes/new?customer=${customer.id}&product=${product.id}`}
                              className="flex h-9 items-center gap-0.5 rounded-btn bg-brand-600 px-3 text-[0.78rem] font-bold text-white transition-colors hover:bg-brand-700"
                            >
                              견적 생성
                            </Link>
                          </div>
                        </div>
                        {match.reasons.length ? (
                          <ul className="mt-3 space-y-1.5 border-t border-surface-line pt-3">
                            {match.reasons.map((reason, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-2 text-[0.78rem] leading-relaxed text-ink-600"
                              >
                                <span
                                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400"
                                  aria-hidden
                                />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {match.breakdown.map((b) => (
                            <span
                              key={b.key}
                              className="rounded-full bg-surface px-2.5 py-1 text-[0.68rem] font-semibold tabular-nums text-ink-500"
                            >
                              {b.label} {b.earned}/{b.max}
                            </span>
                          ))}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* 제품 정보 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="card-data p-6"
          aria-label="제품 정보"
        >
          <h2 className="text-[1.02rem] font-bold text-ink-900">제품 정보</h2>
          <dl className="mt-3 space-y-2.5">
            {infoRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 text-[0.82rem]"
              >
                <dt className="text-ink-400">{row.label}</dt>
                <dd className="font-semibold text-ink-800">{row.value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-surface-line pt-2.5 text-[0.82rem]">
              <dt className="text-ink-400">매입 단가</dt>
              <dd className="font-bold tabular-nums text-ink-900">
                {formatNumber(product.costPerUnit)}원/평
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-[0.82rem]">
              <dt className="text-ink-400">권장 판매가</dt>
              <dd className="font-bold tabular-nums text-brand-700">
                {formatNumber(product.listPricePerUnit)}원/평
              </dd>
            </div>
          </dl>
        </motion.section>

        {/* 판매 이력 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card-data p-6"
          aria-label="판매 이력"
        >
          <h2 className="text-[1.02rem] font-bold text-ink-900">판매 이력</h2>
          {txs.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                message="아직 판매 이력이 없습니다."
                hint="입고 후 출고된 기록이 없는 품목입니다."
              />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-surface-line/70">
              {txs.map((tx) => {
                const customer = getCustomer(tx.customerId);
                return (
                  <li key={tx.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/customers/${tx.customerId}`}
                        className="truncate text-[0.85rem] font-semibold text-ink-800 transition-colors hover:text-brand-700"
                      >
                        {customer?.name ?? tx.customerId}
                      </Link>
                      <span className="shrink-0 text-[0.82rem] font-bold tabular-nums text-ink-900">
                        {formatKRW(tx.qty * tx.unitPrice)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[0.7rem] tabular-nums text-ink-400">
                      {formatDate(tx.date)} · {formatNumber(tx.qty)}평 ×{" "}
                      {formatNumber(tx.unitPrice)}원
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.section>

        {/* 유사 피혁 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="card-data p-6"
          aria-label="유사 피혁"
        >
          <h2 className="text-[1.02rem] font-bold text-ink-900">유사 피혁</h2>
          {similar.length === 0 ? (
            <div className="mt-3">
              <EmptyState message="유사한 재고가 없습니다." />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {similar.map((p) => {
                const s = getProductStats(p.id);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/inventory/${p.id}`}
                      className="card-action tap flex items-center gap-3 p-3"
                    >
                      <LeatherSwatch color={p.color} className="h-10 w-10" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.82rem] font-bold text-ink-900">
                          {p.name}
                        </span>
                        <span className="block text-[0.7rem] tabular-nums text-ink-400">
                          {formatNumber(p.stockQty)}평 · {s.idleDays}일 무출고
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-ink-300"
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  );
}
