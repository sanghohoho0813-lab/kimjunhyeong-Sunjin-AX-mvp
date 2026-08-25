"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  PackageCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductFinder } from "@/components/shop/ProductFinder";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { PRODUCTS } from "@/lib/data/seed";
import { getProductStats } from "@/lib/data/derived";
import { recommendForCustomer, sortForCustomer } from "@/lib/shop/finder";
import {
  useAccount,
  useAllCustomerActivities,
  useAllOrders,
  useFavorites,
} from "@/lib/store";
import { formatNumber } from "@/lib/utils/format";
import type { LeatherMaterial } from "@/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const QUICK_ACTIONS = [
  {
    icon: ClipboardList,
    title: "샘플 요청",
    desc: "원하는 제품을 샘플로 먼저 확인하세요",
    href: "/request/sample",
  },
  {
    icon: FileText,
    title: "견적 문의",
    desc: "수량에 맞는 맞춤 견적을 받아보세요",
    href: "/request/quote",
  },
  {
    icon: PackageCheck,
    title: "재주문",
    desc: "이전에 구매한 제품을 간편하게 재주문하세요",
    href: "/portal?tab=orders",
  },
  {
    icon: Truck,
    title: "배송 / 납기",
    desc: "예상 일정과 진행 상태를 확인하실 수 있습니다",
    href: "/portal?tab=orders",
  },
];

const CATEGORY_LABEL: Record<LeatherMaterial, string> = {
  Cow: "소가죽",
  Lamb: "양가죽",
  Goat: "염소가죽",
  Split: "스플릿",
};

function SectionHead({
  eyebrow,
  title,
  desc,
  href,
  hrefLabel = "전체 보기",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-5 gap-y-2">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-leather-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[1.4rem] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[1.6rem]">
          {title}
        </h2>
        {desc ? (
          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-500">
            {desc}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-[2.6rem] shrink-0 items-center gap-1 whitespace-nowrap rounded-btn px-2 text-[0.94rem] font-bold text-leather-600 transition-colors hover:bg-leather-50 hover:text-leather-700"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

export default function ShopHomePage() {
  const account = useAccount();
  const customerId = account.customerId ?? "c01";
  const favorites = useFavorites(customerId);
  const activities = useAllCustomerActivities();
  const orders = useAllOrders();

  const purchasedIds = useMemo(
    () =>
      orders
        .filter((o) => o.customerId === customerId)
        .flatMap((o) => o.items.map((i) => i.productId)),
    [orders, customerId]
  );

  const recos = useMemo(
    () =>
      recommendForCustomer({
        purchasedIds,
        favorites,
        activities: activities.filter((a) => a.customerId === customerId),
        limit: 4,
      }),
    [purchasedIds, favorites, activities, customerId]
  );

  const newArrivals = useMemo(
    () =>
      [...PRODUCTS]
        .sort((a, b) => b.receivedDate.localeCompare(a.receivedDate))
        .slice(0, 3),
    []
  );

  const categories = useMemo(() => {
    const map = new Map<LeatherMaterial, number>();
    for (const p of PRODUCTS) map.set(p.material, (map.get(p.material) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const totalStock = useMemo(
    () => PRODUCTS.reduce((s, p) => s + p.stockQty, 0),
    []
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-925 text-white">
        {/* 가죽 질감 배경 */}
        <span aria-hidden className="absolute inset-0">
          <span className="absolute inset-y-0 right-0 w-full lg:w-[58%]">
            <LeatherSwatch
              color="Dark Brown"
              finish="Aniline"
              rounded="rounded-none"
              className="h-full w-full"
            />
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-navy-925 via-navy-925/92 to-navy-925/45 lg:to-navy-925/10" />
        </span>

        <div className="relative mx-auto w-full max-w-shop px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: EASE }}
            className="max-w-2xl"
          >
            <p className="text-[0.8rem] font-bold uppercase tracking-[0.22em] text-leather-300">
              Leather for Better Products
            </p>
            <h1 className="mt-4 text-[2.1rem] font-extrabold leading-[1.18] tracking-[-0.03em] sm:text-[2.7rem] lg:text-[3.1rem]">
              제품에 맞는
              <br />
              최적의 피혁을 찾으세요.
            </h1>
            <p className="mt-5 max-w-lg text-[1rem] leading-relaxed text-navy-100 sm:text-[1.05rem]">
              소재·색상·두께·등급으로 빠르게 비교하고, 필요한 제품을 추천받아
              샘플과 견적까지 한 번에 요청하실 수 있습니다.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href="/products"
                className="inline-flex min-h-[3rem] items-center gap-2 rounded-btn bg-white px-6 text-[0.98rem] font-bold text-navy-900 transition-colors hover:bg-ivory"
              >
                제품 검색하기
                <ArrowRight className="h-[1.05rem] w-[1.05rem]" aria-hidden />
              </Link>
              <Link
                href="/request/sample"
                className="inline-flex min-h-[3rem] items-center rounded-btn border border-white/25 px-6 text-[0.98rem] font-bold text-white transition-colors hover:bg-white/10"
              >
                샘플 요청하기
              </Link>
            </div>
          </motion.div>

          {/* Finder */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.1, ease: EASE }}
            className="mt-9 lg:mt-12"
          >
            <ProductFinder />
          </motion.div>
        </div>
      </section>

      {/* ── 신뢰 지표 ─────────────────────────────────── */}
      <section className="border-b border-ivory-line bg-white">
        <div className="mx-auto grid w-full max-w-shop grid-cols-2 gap-x-5 gap-y-5 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { v: `약 ${formatNumber(Math.round(totalStock / 100) * 100)}평`, l: "보유 재고", s: "다양한 두께·색상·소재" },
            { v: "자체 가공", l: "국내 가공 공장 보유", s: "안정적 품질과 납기 대응" },
            { v: `${PRODUCTS.length}종`, l: "상시 취급 품목", s: "소재별 상시 재고 운영" },
            { v: "AX 추천", l: "데이터 기반 소재 제안", s: "구매 이력 기반 빠른 매칭" },
          ].map((x) => (
            <div key={x.l} className="min-w-0">
              <p className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-leather-600">
                {x.v}
              </p>
              <p className="mt-1 text-[0.95rem] font-bold text-ink-800">{x.l}</p>
              <p className="mt-0.5 text-[0.86rem] text-ink-500">{x.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Actions ────────────────────────────── */}
      <section className="mx-auto w-full max-w-shop px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
              className="min-w-0"
            >
              <Link
                href={a.href}
                className="group flex h-full flex-col rounded-card-lg border border-ivory-line bg-white p-4 transition-all duration-200 ease-premium hover:-translate-y-[2px] hover:border-leather-200 hover:shadow-card lg:p-5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ivory-deep text-leather-600">
                  <a.icon className="h-[1.2rem] w-[1.2rem]" strokeWidth={2} aria-hidden />
                </span>
                <span className="mt-3 block text-[1rem] font-extrabold text-ink-900">
                  {a.title}
                </span>
                <span className="mt-1 block text-[0.88rem] leading-relaxed text-ink-500">
                  {a.desc}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 추천 카테고리 ────────────────────────────── */}
      <section className="mx-auto w-full max-w-shop px-4 pb-10 sm:px-6 lg:px-8 lg:pb-14">
        <SectionHead
          eyebrow="Category"
          title="소재별로 찾아보기"
          href="/products"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {categories.map(([material, count], i) => (
            <motion.div
              key={material}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
              className="min-w-0"
            >
              <Link
                href={`/products?material=${material}`}
                className="group relative flex h-[9.5rem] flex-col justify-end overflow-hidden rounded-card-lg p-4 transition-all duration-200 ease-premium hover:-translate-y-[3px] hover:shadow-card-hover sm:h-[11rem]"
              >
                <LeatherSwatch
                  color={
                    material === "Cow"
                      ? "Dark Brown"
                      : material === "Lamb"
                        ? "Ivory"
                        : material === "Goat"
                          ? "Navy"
                          : "Gray"
                  }
                  finish={material === "Split" ? "Nubuck" : "Semi-Aniline"}
                  rounded="rounded-none"
                  className="absolute inset-0 h-full w-full"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent"
                />
                <span className="relative">
                  <span className="block text-[1.05rem] font-extrabold tracking-[-0.01em] text-white">
                    {material} Leather
                  </span>
                  <span className="mt-0.5 block text-[0.88rem] text-white/75">
                    {CATEGORY_LABEL[material]} · {count}종
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AX 추천 ──────────────────────────────────── */}
      <section className="bg-white py-10 lg:py-14">
        <div className="mx-auto w-full max-w-shop px-4 sm:px-6 lg:px-8">
          <SectionHead
            eyebrow="AX Recommendation"
            title={
              purchasedIds.length
                ? "최근 구매 이력을 바탕으로 추천했어요"
                : "나에게 맞는 추천 피혁"
            }
            desc="구매 이력·관심 제품·최근 조회를 함께 보고 지금 공급 가능한 소재를 골랐습니다"
            href="/products"
          />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {recos.map((r, i) => (
              <ProductCard
                key={r.product.id}
                product={r.product}
                index={i}
                recommended
                reason={r.reasons[0]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 신규 입고 ────────────────────────────────── */}
      <section className="mx-auto w-full max-w-shop px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <SectionHead
          eyebrow="New Arrival"
          title="신규 입고"
          desc="새롭게 입고된 피혁 소재입니다"
          href="/products"
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}

          {/* 빠른 샘플 요청 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.16, ease: EASE }}
            className="min-w-0"
          >
            <Link
              href="/request/sample"
              className="group flex h-full flex-col justify-between rounded-card-lg bg-navy-925 p-5 text-white transition-all duration-200 ease-premium hover:-translate-y-[3px] hover:shadow-card-hover"
            >
              <span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-leather-300">
                  <Sparkles className="h-[1.2rem] w-[1.2rem]" strokeWidth={2.2} aria-hidden />
                </span>
                <span className="mt-4 block text-[1.1rem] font-extrabold tracking-[-0.01em]">
                  빠른 샘플 요청
                </span>
                <span className="mt-2 block text-[0.9rem] leading-relaxed text-navy-200">
                  관심 있는 제품을 선택하고 샘플을 한 번에 요청해보세요. 담당자가
                  확인 후 연락드립니다.
                </span>
              </span>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[0.94rem] font-bold text-leather-300 transition-transform duration-200 group-hover:translate-x-0.5">
                샘플 요청하기
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 품질과 신뢰 ──────────────────────────────── */}
      <section className="bg-navy-925 py-10 text-white lg:py-14">
        <div className="mx-auto w-full max-w-shop px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center lg:gap-12">
            <div className="min-w-0">
              <p className="text-[0.8rem] font-bold uppercase tracking-[0.18em] text-leather-300">
                Why Sunjin
              </p>
              <h2 className="mt-3 text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] sm:text-[1.75rem]">
                선진산업의 품질과 신뢰
              </h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-navy-200">
                원피 선택부터 검수, 납기까지 직접 관리합니다.
              </p>
            </div>
            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              {[
                { t: "엄선된 원피", d: "국내외 Premium 원피만 선별해 사용합니다" },
                { t: "엄격한 품질 관리", d: "전 공정 품질 검사 시스템을 운영합니다" },
                { t: "안정적인 재고", d: "항상 일정 수준 이상의 재고를 보유합니다" },
                { t: "정확한 납기", d: "약속한 납기를 반드시 지킵니다" },
              ].map((x) => (
                <div key={x.t} className="min-w-0">
                  <p className="text-[1rem] font-extrabold text-white">{x.t}</p>
                  <p className="mt-1.5 text-[0.9rem] leading-relaxed text-navy-200">
                    {x.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
