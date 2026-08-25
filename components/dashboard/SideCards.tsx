"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  getInventorySummary,
  getProduct,
  getProductStats,
} from "@/lib/data/derived";
import { formatNumber } from "@/lib/utils/format";
import { Badge } from "@/components/shared/ui";
import { CardArt } from "@/components/shared/CardArt";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";

/** 재고 현황 스냅샷 — 장기 보유 품목을 Material Swatch와 함께 표시 */
export function InventorySnapshot() {
  const inv = getInventorySummary();
  const items = [...inv.longStockIds, ...inv.watchIds]
    .map((id) => ({ product: getProduct(id), stats: getProductStats(id) }))
    .filter((x) => x.product)
    .sort((a, b) => b.stats.idleDays - a.stats.idleDays)
    .slice(0, 4);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
      className="card-data isolate flex h-full flex-col p-6"
      aria-label="주의가 필요한 재고"
    >
      <CardArt
        src="inventory-alert"
        size="54% auto"
        position="right -14px bottom -18px"
        opacity={0.42}
      />

      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="t-section">주의가 필요한 재고</h2>
          <p className="mt-1 t-caption">
            장기재고 {inv.longStockCount}건 · 관심 {inv.watchCount}건
          </p>
        </div>
        <Link
          href="/inventory"
          className="-mr-2 inline-flex min-h-[2.75rem] shrink-0 items-center gap-0.5 whitespace-nowrap rounded-btn px-2 text-[0.9rem] font-bold text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          전체 <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <ul className="flex-1 space-y-2">
        {items.map(({ product, stats }) => {
          if (!product) return null;
          return (
            <li key={product.id}>
              <Link
                href={`/inventory/${product.id}`}
                className="card-action tap group flex items-center gap-3 p-3"
              >
                <LeatherSwatch
                  color={product.color}
                  finish={product.finish}
                  className="h-11 w-11"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[0.85rem] font-bold leading-snug text-ink-900">
                      {product.material} · {product.color}
                    </span>
                    <Badge>{stats.status}</Badge>
                  </span>
                  <span className="mt-0.5 block text-[0.86rem] leading-snug tabular-nums text-ink-400">
                    {product.thicknessMm}mm · {product.grade} Grade ·{" "}
                    {formatNumber(product.stockQty)}평
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[0.84rem] font-extrabold tabular-nums text-ink-900">
                    {stats.idleDays}일
                  </span>
                  <span className="block text-[0.8rem] text-ink-400">무출고</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}
