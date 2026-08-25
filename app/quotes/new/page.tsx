"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Minus, Plus, Sparkles, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { Score } from "@/components/shared/ui";
import { getCustomerStats, getProduct, getProductStats } from "@/lib/data/derived";
import { CUSTOMERS, PRODUCTS } from "@/lib/data/seed";
import {
  calculateRecommendedPrice,
  MIN_TARGET_MARGIN,
  quoteTotals,
} from "@/lib/pricing/recommend";
import { calculateCustomerProductMatch } from "@/lib/scoring/match";
import { useAppStore } from "@/lib/store";
import { clsx } from "@/lib/utils/clsx";
import { formatKRW, formatNumber, formatPercent } from "@/lib/utils/format";

function QuoteBuilder() {
  const params = useSearchParams();
  const router = useRouter();
  const addQuote = useAppStore((s) => s.addQuote);
  const pushToast = useAppStore((s) => s.pushToast);

  const [customerId, setCustomerId] = useState(
    () => params.get("customer") ?? ""
  );
  const [productId, setProductId] = useState(() => params.get("product") ?? "");
  const [qty, setQty] = useState(100);
  const [price, setPrice] = useState<number | null>(null);
  const [priceTouched, setPriceTouched] = useState(false);

  const product = productId ? getProduct(productId) : undefined;
  const customer = CUSTOMERS.find((c) => c.id === customerId);

  const recommendation = useMemo(() => {
    if (!customerId || !productId || qty <= 0) return null;
    return calculateRecommendedPrice(productId, customerId, qty);
  }, [customerId, productId, qty]);

  const match = useMemo(() => {
    if (!customerId || !productId) return null;
    return calculateCustomerProductMatch(productId, customerId);
  }, [customerId, productId]);

  // 추천가 자동 적용 (사용자가 직접 수정하기 전까지)
  useEffect(() => {
    if (recommendation && !priceTouched) {
      setPrice(recommendation.recommendedPrice);
    }
  }, [recommendation, priceTouched]);

  const effectivePrice = price ?? recommendation?.recommendedPrice ?? 0;
  const totals = useMemo(() => {
    if (!productId || qty <= 0 || effectivePrice <= 0) return null;
    return quoteTotals([{ productId, qty, unitPrice: effectivePrice }]);
  }, [productId, qty, effectivePrice]);

  const belowGuard =
    totals != null && totals.marginRate < MIN_TARGET_MARGIN * 100;
  const canSave = Boolean(customerId && productId && qty > 0 && effectivePrice > 0);
  const maxQty = product?.stockQty ?? 9999;

  const save = () => {
    if (!canSave) return;
    const quote = addQuote(
      customerId,
      [{ productId, qty, unitPrice: effectivePrice }],
      "AX 추천 견적"
    );
    pushToast(`견적 ${quote.number}이 저장되었습니다.`);
    router.push("/quotes");
  };

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/quotes"
        className="mb-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-ink-400 transition-colors hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> 견적 목록
      </Link>

      <div className="mb-5">
        <h1 className="text-[1.35rem] font-extrabold text-ink-900 lg:text-[1.6rem]">
          추천 견적 생성
        </h1>
        <p className="mt-1 text-[0.82rem] text-ink-500">
          거래처와 제품을 선택하면 과거 단가와 수량 구간을 반영한 추천가가
          계산됩니다. 가격은 직접 수정할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* 입력 폼 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card-data space-y-6 p-6 lg:col-span-3"
        >
          <div>
            <label
              htmlFor="quote-customer"
              className="mb-1.5 block text-[0.8rem] font-bold text-ink-700"
            >
              거래처
            </label>
            <select
              id="quote-customer"
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setPriceTouched(false);
              }}
              className="h-12 w-full rounded-btn border border-surface-line bg-white px-3.5 text-sm font-semibold text-ink-800 focus:border-brand-400"
            >
              <option value="">거래처를 선택하세요</option>
              {CUSTOMERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.segment}
                </option>
              ))}
            </select>
            {customer ? (
              <p className="mt-1.5 text-[0.84rem] text-ink-400">
                누적 {formatKRW(getCustomerStats(customer.id).totalRevenue)} ·
                평균 주문 {formatKRW(getCustomerStats(customer.id).avgOrderValue)}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="quote-product"
              className="mb-1.5 block text-[0.8rem] font-bold text-ink-700"
            >
              제품 (보유 재고)
            </label>
            <select
              id="quote-product"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setPriceTouched(false);
              }}
              className="h-12 w-full rounded-btn border border-surface-line bg-white px-3.5 text-sm font-semibold text-ink-800 focus:border-brand-400"
            >
              <option value="">제품을 선택하세요</option>
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · 재고 {formatNumber(p.stockQty)}평
                </option>
              ))}
            </select>
            {product ? (
              <div className="mt-2 flex items-center gap-3 rounded-card bg-surface-subtle p-3">
                <LeatherSwatch color={product.color} className="h-10 w-10" />
                <div className="min-w-0 text-[0.75rem] text-ink-500">
                  <p className="font-bold text-ink-800">{product.code}</p>
                  <p className="tabular-nums">
                    매입가 {formatNumber(product.costPerUnit)}원 · 권장가{" "}
                    {formatNumber(product.listPricePerUnit)}원 · 무출고{" "}
                    {getProductStats(product.id).idleDays}일
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="quote-qty"
                className="mb-1.5 block text-[0.8rem] font-bold text-ink-700"
              >
                수량 (평)
              </label>
              <div className="flex h-12 items-stretch overflow-hidden rounded-btn border border-surface-line bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(10, q - 50))}
                  aria-label="수량 50 감소"
                  className="w-12 shrink-0 text-ink-500 transition-colors hover:bg-surface"
                >
                  <Minus className="mx-auto h-4 w-4" />
                </button>
                <input
                  id="quote-qty"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxQty}
                  value={qty}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setQty(Number.isFinite(v) ? Math.max(0, Math.min(v, maxQty)) : 0);
                  }}
                  className="w-full border-x border-surface-line text-center text-base font-bold tabular-nums text-ink-900 focus:outline-none"
                />
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 50))}
                  aria-label="수량 50 증가"
                  className="w-12 shrink-0 text-ink-500 transition-colors hover:bg-surface"
                >
                  <Plus className="mx-auto h-4 w-4" />
                </button>
              </div>
              {product ? (
                <p className="mt-1.5 text-[0.84rem] text-ink-400">
                  보유 재고 {formatNumber(product.stockQty)}평 이내
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="quote-price"
                className="mb-1.5 block text-[0.8rem] font-bold text-ink-700"
              >
                판매 단가 (원/평)
              </label>
              <input
                id="quote-price"
                type="number"
                inputMode="numeric"
                min={0}
                value={effectivePrice || ""}
                onChange={(e) => {
                  setPriceTouched(true);
                  const v = Number(e.target.value);
                  setPrice(Number.isFinite(v) ? v : 0);
                }}
                className="h-12 w-full rounded-btn border border-surface-line bg-white px-3.5 text-right text-base font-bold tabular-nums text-ink-900 focus:border-brand-400"
              />
              {recommendation && priceTouched ? (
                <button
                  onClick={() => {
                    setPriceTouched(false);
                    setPrice(recommendation.recommendedPrice);
                  }}
                  className="mt-1.5 text-[0.84rem] font-bold text-brand-600 hover:text-brand-700"
                >
                  추천가 {formatNumber(recommendation.recommendedPrice)}원 다시
                  적용
                </button>
              ) : null}
            </div>
          </div>

          {/* 추천 근거 */}
          {recommendation ? (
            <div className="card-insight p-4">
              <p className="flex items-center gap-1.5 text-[0.8rem] font-bold text-brand-800">
                <Sparkles className="h-4 w-4" aria-hidden />
                추천가 {formatNumber(recommendation.recommendedPrice)}원/평
                <span className="font-medium text-brand-600">
                  (참고 가격 · 예상 마진{" "}
                  {formatPercent(recommendation.marginRate, 1)})
                </span>
              </p>
              <ul className="mt-2 space-y-1">
                {recommendation.notes.map((note, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-ink-600"
                  >
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400"
                      aria-hidden
                    />
                    {note}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-ink-600">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400"
                    aria-hidden
                  />
                  최근 평균 판매가 {formatNumber(recommendation.basePrice)}원
                  기준으로 계산되었습니다.
                </li>
              </ul>
              {match && match.score >= 35 ? (
                <div className="mt-3 flex items-center gap-2 border-t border-brand-100 pt-3">
                  <Score value={match.score} size="sm" />
                  <span className="text-[0.84rem] font-semibold text-ink-500">
                    이 거래처의 구매 가능성 지수 {match.score}점 ({match.label})
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="rounded-card bg-surface-subtle p-4 text-[0.8rem] text-ink-400">
              거래처와 제품을 선택하면 추천 단가와 근거가 표시됩니다.
            </p>
          )}
        </motion.section>

        {/* 요약 패널 */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="lg:col-span-2"
        >
          <div className="card-data p-6 lg:sticky lg:top-6">
            <h2 className="text-[1.02rem] font-bold text-ink-900">
              예상 매출 · 마진
            </h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-[0.82rem] text-ink-500">예상 매출</dt>
                <dd className="text-[1.25rem] font-extrabold tabular-nums text-ink-900">
                  {totals ? formatKRW(totals.revenue) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.82rem] text-ink-500">예상 원가</dt>
                <dd className="text-[0.95rem] font-bold tabular-nums text-ink-600">
                  {totals ? formatKRW(totals.cost) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-surface-line pt-3">
                <dt className="text-[0.82rem] font-bold text-ink-700">
                  예상 마진
                </dt>
                <dd className="text-[1.1rem] font-extrabold tabular-nums text-teal-600">
                  {totals ? formatKRW(totals.margin) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.82rem] text-ink-500">예상 마진율</dt>
                <dd
                  className={clsx(
                    "text-[0.95rem] font-bold tabular-nums",
                    belowGuard ? "text-amber-600" : "text-teal-600"
                  )}
                >
                  {totals ? formatPercent(totals.marginRate, 1) : "—"}
                </dd>
              </div>
            </dl>

            {belowGuard ? (
              <p className="mt-3 flex items-start gap-2 rounded-card bg-warning-soft p-3 text-[0.75rem] leading-relaxed text-amber-700">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                목표 마진 {formatPercent(MIN_TARGET_MARGIN * 100, 0)}보다 낮은
                단가입니다. 가격을 다시 확인해보세요.
              </p>
            ) : null}

            <button
              onClick={save}
              disabled={!canSave}
              className={clsx(
                "mt-5 hidden h-12 w-full items-center justify-center gap-2 rounded-btn text-sm font-bold text-white transition-colors lg:flex",
                canSave
                  ? "bg-brand-600 hover:bg-brand-700"
                  : "cursor-not-allowed bg-ink-300"
              )}
            >
              <Check className="h-4 w-4" aria-hidden />
              견적 저장
            </button>
            <p className="mt-3 hidden text-center text-[0.8rem] text-ink-400 lg:block">
              추천가는 시연용 참고 가격이며, 저장 후 목록에서 확인할 수 있습니다.
            </p>
          </div>
        </motion.aside>
      </div>

      {/* 모바일 sticky 저장 바 */}
      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] z-40 border-t border-surface-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.8rem] text-ink-400">예상 매출 / 마진율</p>
            <p className="truncate text-[0.95rem] font-extrabold tabular-nums text-ink-900">
              {totals ? formatKRW(totals.revenue) : "—"}
              <span
                className={clsx(
                  "ml-2 text-[0.8rem] font-bold",
                  belowGuard ? "text-amber-600" : "text-teal-600"
                )}
              >
                {totals ? formatPercent(totals.marginRate, 1) : ""}
              </span>
            </p>
          </div>
          <button
            onClick={save}
            disabled={!canSave}
            className={clsx(
              "flex h-12 shrink-0 items-center gap-1.5 rounded-btn px-6 text-sm font-bold text-white transition-colors",
              canSave ? "bg-brand-600 hover:bg-brand-700" : "cursor-not-allowed bg-ink-300"
            )}
          >
            <Check className="h-4 w-4" aria-hidden />
            견적 저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuoteNewPage() {
  return (
    <Suspense>
      <QuoteBuilder />
    </Suspense>
  );
}
