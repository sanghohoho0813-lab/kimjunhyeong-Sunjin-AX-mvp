"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { clsx } from "@/lib/utils/clsx";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { leadTimeDays, usagesFor } from "@/lib/data/customer";
import { useAccount, useAppStore, useFavorites } from "@/lib/store";
import { formatNumber } from "@/lib/utils/format";
import type { LeatherProduct } from "@/types";

/** 관심 제품 하트 — 고객 행동이므로 누르면 내부 AX의 관심 신호로도 남는다 */
export function FavoriteButton({
  productId,
  className,
  size = "md",
}: {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const account = useAccount();
  const customerId = account.customerId ?? "c01";
  const favorites = useFavorites(customerId);
  const toggle = useAppStore((s) => s.toggleFavorite);
  const logActivity = useAppStore((s) => s.logActivity);
  const pushToast = useAppStore((s) => s.pushToast);
  const on = favorites.some((f) => f.productId === productId);

  return (
    <button
      type="button"
      aria-label={on ? "관심 제품 해제" : "관심 제품 등록"}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(customerId, productId);
        if (added) {
          logActivity({ customerId, kind: "favorite", productId, label: "관심 등록" });
        }
        pushToast(added ? "관심 제품에 담았습니다" : "관심 제품에서 뺐습니다");
      }}
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full border transition-all duration-200",
        size === "sm" ? "h-9 w-9" : "h-11 w-11",
        on
          ? "border-leather-300 bg-leather-50 text-leather-600"
          : "border-ivory-line bg-white/90 text-ink-400 hover:border-leather-300 hover:text-leather-500",
        className
      )}
    >
      <Heart
        className={size === "sm" ? "h-4 w-4" : "h-[1.15rem] w-[1.15rem]"}
        fill={on ? "currentColor" : "none"}
        strokeWidth={2.2}
      />
    </button>
  );
}

/**
 * B2B 소재 카드.
 *
 * 일반 쇼핑몰 상품카드가 아니라 자재 스펙 카드로 읽혀야 한다.
 * 코드 → 소재 → 스펙(색/두께/등급) → 재고 → 납기 순으로 위계를 잡는다.
 */
export function ProductCard({
  product,
  index = 0,
  recommended = false,
  reason,
}: {
  product: LeatherProduct;
  index?: number;
  recommended?: boolean;
  reason?: string;
}) {
  const lead = leadTimeDays(product);
  const usages = usagesFor(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index, 8) * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="min-w-0"
    >
      <Link
        href={`/products/${product.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-card-lg border border-ivory-line bg-white transition-all duration-200 ease-premium hover:-translate-y-[3px] hover:border-leather-200 hover:shadow-card-hover"
      >
        {/* 소재 텍스처 */}
        <span className="relative block">
          <LeatherSwatch
            color={product.color}
            finish={product.finish}
            rounded="rounded-none"
            className="h-[10.5rem] w-full sm:h-[11.5rem]"
          />
          {recommended ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-navy-900/90 px-2 py-1 text-[0.76rem] font-bold uppercase tracking-[0.1em] text-teal-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
              AX 추천
            </span>
          ) : null}
          <span className="absolute right-3 top-3">
            <FavoriteButton productId={product.id} size="sm" />
          </span>
        </span>

        <span className="flex flex-1 flex-col p-4">
          <span className="block text-[0.8rem] font-bold uppercase tracking-[0.1em] text-leather-500">
            {product.code}
          </span>
          <span className="mt-1.5 block text-[1.02rem] font-extrabold leading-snug tracking-[-0.01em] text-ink-900">
            {product.material} Leather
          </span>
          <span className="mt-1 block text-[0.92rem] font-semibold text-ink-600">
            {product.color} · {product.thicknessMm}mm · {product.grade} Grade
          </span>

          {/* 용도 태그 */}
          <span className="mt-2.5 flex flex-wrap gap-1">
            {usages.map((u) => (
              <span
                key={u}
                className="inline-flex items-center rounded-md bg-ivory-deep px-2 py-0.5 text-[0.8rem] font-semibold text-leather-700"
              >
                {u}
              </span>
            ))}
          </span>

          {reason ? (
            <span className="mt-2.5 block rounded-card bg-teal-50 px-3 py-2 text-[0.84rem] leading-snug text-teal-800">
              {reason}
            </span>
          ) : null}

          <span className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-3.5">
            <span className="text-[0.88rem] font-semibold text-ink-500">
              재고{" "}
              <span className="font-extrabold tabular-nums text-ink-800">
                {formatNumber(product.stockQty)}
              </span>
              평
            </span>
            <span className="text-[0.86rem] font-bold text-teal-700">
              {lead}일 이내 출고
            </span>
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
