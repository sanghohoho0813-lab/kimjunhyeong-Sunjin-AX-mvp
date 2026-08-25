"use client";

import { motion } from "framer-motion";
import { ChevronRight, Package, RefreshCcw, TrendingUp } from "lucide-react";
import Link from "next/link";
import { generateRecommendations } from "@/lib/insights/recommendations";
import { StatusBadge } from "@/components/shared/ui";

const CATEGORY_ICON: Record<string, typeof Package> = {
  재고: Package,
  거래처: RefreshCcw,
  "매출 기회": TrendingUp,
  수익성: TrendingUp,
  "재무 모니터링": TrendingUp,
};

/** 오늘의 AX 추천 — 상위 3건 요약 */
export function AxRecoPanel() {
  const recos = generateRecommendations().slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.1 }}
      className="card flex h-full flex-col p-5"
      aria-label="오늘의 AX 추천"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[1.02rem] font-bold text-navy-900">오늘의 AX 추천</h2>
        <Link
          href="/insights"
          className="flex items-center gap-0.5 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          추천 {generateRecommendations().length}건 전체 보기
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <ul className="mt-3 flex-1 space-y-2.5">
        {recos.map((reco) => {
          const Icon = CATEGORY_ICON[reco.category] ?? TrendingUp;
          return (
            <li key={reco.id}>
              <Link
                href={reco.href}
                className="group flex items-start gap-3 rounded-xl border border-surface-line bg-surface-soft p-3 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/50"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-brand-600 shadow-sm">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[0.85rem] font-bold text-navy-900">
                      {reco.title}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[0.75rem] leading-relaxed text-navy-500">
                    {reco.why}
                  </span>
                  {reco.expectedEffect ? (
                    <span className="mt-1 block text-[0.72rem] font-semibold text-teal-600">
                      {reco.expectedEffect}
                    </span>
                  ) : null}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge status={reco.priority} />
                  <span className="flex items-center text-[0.72rem] font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                    {reco.actionLabel}
                    <ChevronRight className="h-3 w-3" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}
