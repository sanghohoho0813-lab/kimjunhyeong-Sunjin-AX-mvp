"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  FilePlus2,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Sheet } from "@/components/shared/Sheet";
import { DigitalActivity } from "@/components/customers/DigitalActivity";
import {
  DemoBadge,
  EmptyState,
  Score,
  Badge,
} from "@/components/shared/ui";
import {
  customerTransactions,
  getCustomer,
  getCustomerStats,
  getCustomerStatus,
  getProduct,
} from "@/lib/data/derived";
import { PRODUCTS } from "@/lib/data/seed";
import { calculateCustomerProductMatch } from "@/lib/scoring/match";
import { calculateRepurchaseScore } from "@/lib/scoring/repurchase";
import { useAllActivities, useAppStore } from "@/lib/store";
import { formatDate, formatKRW, formatNumber } from "@/lib/utils/format";

const ACTIVITY_TYPES = ["전화", "방문", "샘플 발송", "견적 발송", "팔로업"] as const;

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customer = getCustomer(id);
  const addActivity = useAppStore((s) => s.addActivity);
  const pushToast = useAppStore((s) => s.pushToast);
  const activities = useAllActivities().filter((a) => a.customerId === id);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] =
    useState<(typeof ACTIVITY_TYPES)[number]>("전화");
  const [actionMemo, setActionMemo] = useState("");

  const stats = useMemo(() => (customer ? getCustomerStats(id) : null), [customer, id]);
  const recommendedProducts = useMemo(() => {
    if (!customer) return [];
    return PRODUCTS.map((p) => ({
      product: p,
      match: calculateCustomerProductMatch(p.id, id),
    }))
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 3);
  }, [customer, id]);

  if (!customer || !stats) return notFound();

  const status = getCustomerStatus(id);
  const score = calculateRepurchaseScore(id);
  const txs = customerTransactions(id);

  return (
    <div>
      <Link
        href="/customers"
        className="mb-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-ink-400 transition-colors hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> 거래처 목록
      </Link>

      {/* 상단 요약 */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-data p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[1.35rem] font-extrabold text-ink-900 lg:text-[1.55rem]">
                {customer.name}
              </h1>
              <Badge>{status}</Badge>
              <DemoBadge />
            </div>
            <p className="mt-1 text-[0.8rem] text-ink-500">
              {customer.contactName} · {customer.segment} · {customer.region} ·
              거래 시작 {customer.since}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              onClick={() => setActionOpen(true)}
              className="btn btn-ghost w-full sm:w-auto"
            >
              <PhoneCall className="h-4 w-4 text-brand-600" aria-hidden />
              영업 액션 등록
            </button>
            <Link
              href={`/quotes/new?customer=${customer.id}`}
              className="btn btn-primary w-full sm:w-auto"
            >
              <FilePlus2 className="h-4 w-4" aria-hidden />
              견적 만들기
            </Link>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-surface-line pt-4 sm:grid-cols-4">
          {[
            { label: "누적 거래금액", value: formatKRW(stats.totalRevenue) },
            { label: "평균 주문금액", value: formatKRW(stats.avgOrderValue) },
            {
              label: "최근 거래",
              value: stats.lastPurchaseDate
                ? `${formatDate(stats.lastPurchaseDate)} (${stats.elapsedDays}일 전)`
                : "—",
            },
            { label: "평균 재구매 주기", value: `${stats.cycleDays}일` },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-[0.82rem] text-ink-400">{item.label}</dt>
              <dd className="mt-0.5 text-[0.95rem] font-bold tabular-nums text-ink-900">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </motion.section>

      {/* 고객 화면 활동 — 거래가 일어나기 전의 신호 */}
      <div className="mt-4">
        <DigitalActivity customerId={customer.id} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* AX 인사이트 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="card-data p-6 lg:col-span-1"
          aria-label="AX 인사이트"
        >
          <h2 className="flex items-center gap-1.5 text-[1.02rem] font-bold text-ink-900">
            <Sparkles className="h-4 w-4 text-brand-600" aria-hidden />
            AX 인사이트
          </h2>
          <div className="mt-3 flex items-center gap-3 rounded-card bg-surface-subtle p-3.5">
            <Score value={score.score} size="lg" />
            <div>
              <p className="text-sm font-bold text-ink-900">
                재구매 가능성 {score.label}
              </p>
              <p className="text-[0.82rem] text-ink-400">
                구매 주기·빈도·규모·추세 기반 지수
              </p>
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {score.reasons.map((reason, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[0.8rem] leading-relaxed text-ink-600"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                  aria-hidden
                />
                {reason}
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-surface-line pt-3.5">
            <p className="text-[0.82rem] font-bold uppercase tracking-wide text-ink-400">
              선호 피혁
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {[
                ...customer.preferredMaterials,
                ...customer.preferredColors,
                `${customer.preferredThickness[0]}~${customer.preferredThickness[1]}mm`,
                ...customer.preferredGrades.map((g) => `${g} Grade`),
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-surface-line bg-white px-2.5 py-0.5 text-xs font-semibold text-ink-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 추천 상품 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card-data p-6 lg:col-span-2"
          aria-label="추천 상품"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[1.02rem] font-bold text-ink-900">
              이 거래처에 추천할 재고
            </h2>
            <span className="text-[0.82rem] text-ink-400">
              AX 매칭 점수 기준 상위 3개
            </span>
          </div>
          <ul className="mt-3 space-y-2.5">
            {recommendedProducts.map(({ product, match }) => (
              <li
                key={product.id}
                className="card-action p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/inventory/${product.id}`}
                    className="min-w-0 font-bold text-ink-900 transition-colors hover:text-brand-700"
                  >
                    {product.name}
                    <span className="ml-2 text-[0.82rem] font-medium text-ink-400">
                      {product.code}
                    </span>
                  </Link>
                  <Score value={match.score} label={match.label} size="sm" />
                </div>
                <p className="mt-1 text-[0.75rem] text-ink-500">
                  보유 {formatNumber(product.stockQty)}평 · 권장가{" "}
                  {formatNumber(product.listPricePerUnit)}원/평 ·{" "}
                  {product.grade} Grade
                </p>
                {match.reasons.length ? (
                  <p className="mt-1.5 text-[0.75rem] leading-relaxed text-teal-700">
                    {match.reasons[0]}
                  </p>
                ) : null}
                <div className="mt-2.5 flex gap-2">
                  <Link
                    href={`/quotes/new?customer=${customer.id}&product=${product.id}`}
                    className="flex h-9 items-center gap-1 rounded-btn bg-brand-600 px-3.5 text-[0.78rem] font-bold text-white transition-colors hover:bg-brand-700"
                  >
                    추천 견적 생성
                  </Link>
                  <Link
                    href={`/inventory/${product.id}`}
                    className="flex h-9 items-center gap-0.5 rounded-btn border border-surface-line bg-white px-3.5 text-[0.78rem] font-semibold text-ink-600 transition-colors hover:border-ink-300"
                  >
                    재고 상세 <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* 구매 이력 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="card-data p-6 lg:col-span-2"
          aria-label="구매 이력"
        >
          <h2 className="text-[1.02rem] font-bold text-ink-900">구매 이력</h2>
          {txs.length === 0 ? (
            <div className="mt-3">
              <EmptyState message="구매 이력이 없습니다." />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-surface-line/70">
              {txs.map((tx) => {
                const product = getProduct(tx.productId);
                return (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[0.85rem] font-semibold leading-snug text-ink-800">
                        {product?.name ?? tx.productId}
                      </p>
                      <p className="mt-0.5 text-[0.84rem] tabular-nums text-ink-400">
                        {formatDate(tx.date)} · {formatNumber(tx.qty)}평 ×{" "}
                        {formatNumber(tx.unitPrice)}원
                      </p>
                    </div>
                    <span className="shrink-0 text-[0.85rem] font-bold tabular-nums text-ink-900">
                      {formatKRW(tx.qty * tx.unitPrice)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.section>

        {/* 영업 활동 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card-data p-6"
          aria-label="영업 활동"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[1.02rem] font-bold text-ink-900">영업 활동</h2>
            <button
              onClick={() => setActionOpen(true)}
              className="text-xs font-bold text-brand-600 transition-colors hover:text-brand-700"
            >
              + 액션 등록
            </button>
          </div>
          {activities.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                message="등록된 영업 활동이 없습니다."
                hint="전화·방문·샘플 발송 등의 활동을 기록해보세요."
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {activities.map((activity) => (
                <li key={activity.id} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.8rem] font-bold text-ink-800">
                      {activity.type}
                      <span className="ml-2 text-[0.8rem] font-medium tabular-nums text-ink-400">
                        {formatDate(activity.date)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[0.78rem] leading-relaxed text-ink-500">
                      {activity.memo}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>

      {/* 영업 액션 등록 시트 */}
      <Sheet
        open={actionOpen}
        onClose={() => setActionOpen(false)}
        title={`영업 액션 등록 — ${customer.name}`}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-[0.78rem] font-bold text-ink-700">
              활동 유형
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setActionType(type)}
                  className={
                    actionType === type
                      ? "h-10 rounded-btn bg-navy-900 px-3.5 text-[0.8rem] font-bold text-white"
                      : "h-10 rounded-btn border border-surface-line bg-white px-3.5 text-[0.8rem] font-semibold text-ink-500 transition-colors hover:border-ink-300"
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="action-memo"
              className="mb-1.5 block text-[0.78rem] font-bold text-ink-700"
            >
              메모
            </label>
            <textarea
              id="action-memo"
              value={actionMemo}
              onChange={(e) => setActionMemo(e.target.value)}
              rows={3}
              placeholder="예: 장기재고 Black Cow 1.4mm 제안 전화"
              className="w-full rounded-btn border border-surface-line bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-300 focus:border-brand-400"
            />
          </div>
          <button
            onClick={() => {
              addActivity({
                customerId: customer.id,
                type: actionType,
                memo: actionMemo.trim() || `${actionType} 진행 예정`,
              });
              setActionMemo("");
              setActionOpen(false);
              pushToast("영업 액션이 등록되었습니다.");
            }}
            className="h-12 w-full rounded-btn bg-brand-600 text-sm font-bold text-white transition-colors hover:bg-brand-700"
          >
            액션 등록
          </button>
        </div>
      </Sheet>
    </div>
  );
}
