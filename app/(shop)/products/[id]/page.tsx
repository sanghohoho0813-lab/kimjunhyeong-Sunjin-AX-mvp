"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ClipboardList, FileText, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { FavoriteButton, ProductCard } from "@/components/shop/ProductCard";
import { RequestDialog } from "@/components/shop/RequestDialog";
import { getProduct, getProductStats } from "@/lib/data/derived";
import { leadTimeDays, usagesFor } from "@/lib/data/customer";
import { recommendForCustomer, relatedProducts } from "@/lib/shop/finder";
import {
  useAccount,
  useAllCustomerActivities,
  useAllOrders,
  useAppStore,
  useFavorites,
  useIsInternal,
} from "@/lib/store";
import { formatNumber } from "@/lib/utils/format";

const EASE = [0.22, 1, 0.36, 1] as const;

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ivory-line py-3 last:border-b-0">
      <dt className="shrink-0 text-[0.92rem] font-semibold text-ink-500">{label}</dt>
      <dd className="min-w-0 text-right text-[0.98rem] font-bold text-ink-900">
        {value}
      </dd>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const product = getProduct(params.id);
  const account = useAccount();
  const isInternal = useIsInternal();
  const customerId = account.customerId ?? "c01";
  const logActivity = useAppStore((s) => s.logActivity);
  const favorites = useFavorites(customerId);
  const activities = useAllCustomerActivities();
  const orders = useAllOrders();

  const [dialog, setDialog] = useState<"sample" | "quote" | null>(null);

  // 조회 이력 — 내부 AX의 관심 신호가 된다
  useEffect(() => {
    if (!product) return;
    const t = setTimeout(
      () =>
        logActivity({
          customerId,
          kind: "view",
          productId: product.id,
          label: `${product.name} 상세 조회`,
        }),
      900
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, customerId]);

  const purchasedIds = useMemo(
    () =>
      orders
        .filter((o) => o.customerId === customerId)
        .flatMap((o) => o.items.map((i) => i.productId)),
    [orders, customerId]
  );

  const reason = useMemo(() => {
    if (!product) return undefined;
    const hit = recommendForCustomer({
      purchasedIds,
      favorites,
      activities: activities.filter((a) => a.customerId === customerId),
      limit: 25,
    }).find((r) => r.product.id === product.id);
    return hit?.reasons ?? [];
  }, [product, purchasedIds, favorites, activities, customerId]);

  if (!product) notFound();

  const stats = getProductStats(product.id);
  const usages = usagesFor(product);
  const lead = leadTimeDays(product);
  const related = relatedProducts(product);

  return (
    <div className="mx-auto w-full max-w-shop px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/products"
        className="mb-5 inline-flex min-h-[2.6rem] items-center gap-1.5 text-[0.92rem] font-bold text-ink-500 transition-colors hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        제품 목록
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
        {/* 소재 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: EASE }}
          className="min-w-0"
        >
          <LeatherSwatch
            color={product.color}
            finish={product.finish}
            rounded="rounded-card-lg"
            className="h-[15rem] w-full sm:h-[22rem] lg:h-[27rem]"
          />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { l: "가공", v: product.finish },
              { l: "단위", v: `${product.unit} 단위 거래` },
              { l: "최소 주문", v: "50평" },
            ].map((x) => (
              <div
                key={x.l}
                className="min-w-0 rounded-card border border-ivory-line bg-white px-3 py-2.5"
              >
                <p className="text-[0.82rem] font-semibold text-ink-400">{x.l}</p>
                <p className="mt-0.5 text-[0.92rem] font-bold leading-snug text-ink-800">
                  {x.v}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.06, ease: EASE }}
          className="min-w-0"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.84rem] font-bold uppercase tracking-[0.12em] text-leather-500">
                {product.code}
              </p>
              <h1 className="mt-2 text-[1.6rem] font-extrabold leading-tight tracking-[-0.025em] text-ink-900 sm:text-[1.95rem]">
                {product.name}
              </h1>
              <p className="mt-2 text-[1rem] font-semibold text-ink-600">
                {product.color} · {product.thicknessMm}mm · {product.grade} Grade
              </p>
            </div>
            <FavoriteButton productId={product.id} />
          </div>

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {usages.map((u) => (
              <span
                key={u}
                className="inline-flex items-center rounded-md bg-ivory-deep px-2.5 py-1 text-[0.86rem] font-bold text-leather-700"
              >
                {u}용
              </span>
            ))}
          </div>

          {/* 재고 / 납기 */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-card-lg border border-ivory-line bg-white px-4 py-3.5">
              <p className="text-[0.86rem] font-semibold text-ink-500">보유 재고</p>
              <p className="mt-1 text-[1.5rem] font-extrabold tabular-nums tracking-[-0.02em] text-ink-900">
                {formatNumber(product.stockQty)}
                <span className="ml-1 text-[0.92rem] font-bold text-ink-500">평</span>
              </p>
            </div>
            <div className="rounded-card-lg border border-teal-500/20 bg-teal-50/60 px-4 py-3.5">
              <p className="text-[0.86rem] font-semibold text-teal-700">예상 납기</p>
              <p className="mt-1 text-[1.5rem] font-extrabold tabular-nums tracking-[-0.02em] text-teal-700">
                {lead}
                <span className="ml-1 text-[0.92rem] font-bold">일 이내</span>
              </p>
            </div>
          </div>

          {/* 추천 이유 */}
          {reason && reason.length ? (
            <div className="mt-4 rounded-card-lg border border-teal-500/20 bg-white px-4 py-3.5">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-teal-700">
                이 제품을 추천하는 이유
              </p>
              <ul className="mt-2 space-y-1.5">
                {reason.slice(0, 3).map((r) => (
                  <li key={r} className="flex gap-2">
                    <span
                      aria-hidden
                      className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-teal-500"
                    />
                    <span className="text-[0.92rem] leading-relaxed text-ink-600">
                      {r}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 스펙 */}
          <dl className="mt-5 rounded-card-lg border border-ivory-line bg-white px-4">
            <SpecRow label="제품 코드" value={product.code} />
            <SpecRow label="가죽 종류" value={`${product.material} Leather`} />
            <SpecRow label="색상" value={product.color} />
            <SpecRow label="두께" value={`${product.thicknessMm}mm`} />
            <SpecRow label="등급" value={`${product.grade} Grade`} />
            <SpecRow label="가공 방식" value={product.finish} />
            <SpecRow label="용도 추천" value={usages.join(" · ")} />
            <SpecRow
              label="참고 단가"
              value={
                <span>
                  {formatNumber(product.listPricePerUnit)}원
                  <span className="ml-1 text-[0.86rem] font-semibold text-ink-400">
                    / 평
                  </span>
                </span>
              }
            />
          </dl>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-ink-400">
            참고 단가는 기준 가격이며 수량·납기·가공 조건에 따라 달라집니다. 정확한
            금액은 견적 요청 후 안내드립니다.
          </p>

          {/* CTA */}
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => setDialog("sample")}
              className="flex min-h-[3.1rem] flex-1 items-center justify-center gap-2 rounded-btn border border-navy-900 bg-white px-5 text-[1rem] font-bold text-navy-900 transition-colors hover:bg-ivory-deep"
            >
              <ClipboardList className="h-[1.1rem] w-[1.1rem]" aria-hidden />
              샘플 요청
            </button>
            <button
              type="button"
              onClick={() => setDialog("quote")}
              className="flex min-h-[3.1rem] flex-1 items-center justify-center gap-2 rounded-btn bg-leather-600 px-5 text-[1rem] font-bold text-white transition-colors hover:bg-leather-700"
            >
              <FileText className="h-[1.1rem] w-[1.1rem]" aria-hidden />
              견적 요청
            </button>
          </div>

          {/* 관리자에게만 — 내부 재고 상세로 바로 이동 */}
          {isInternal ? (
            <Link
              href={`/inventory/${product.id}`}
              className="mt-3 inline-flex min-h-[2.8rem] w-full items-center justify-center gap-2 rounded-btn border border-navy-200 bg-navy-50 px-4 text-[0.92rem] font-bold text-navy-800 transition-colors hover:bg-navy-100"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              내부 AX에서 이 재고 보기
              <span className="text-[0.84rem] font-semibold text-navy-500">
                {stats.idleDays}일 무출고 · {stats.status}
              </span>
            </Link>
          ) : null}
        </motion.div>
      </div>

      {/* 함께 비교 */}
      <section className="mt-12" aria-label="함께 비교해보세요">
        <h2 className="mb-5 text-[1.3rem] font-extrabold tracking-[-0.02em] text-ink-900 sm:text-[1.5rem]">
          함께 비교해보세요
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {related.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      <RequestDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        kind={dialog ?? "sample"}
        productIds={[product.id]}
      />
    </div>
  );
}
