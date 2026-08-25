"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTopCustomers } from "@/lib/data/derived";
import { formatKRW } from "@/lib/utils/format";
import { DemoBadge } from "@/components/shared/ui";

/** 거래처 TOP 5 — 누적 매출 기준 (거래 데이터에서 파생) */
export function TopCustomersCard() {
  const top = getTopCustomers(5);
  const max = top[0]?.stats.totalRevenue ?? 1;
  const total = top.reduce((s, t) => s + t.stats.totalRevenue, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.15 }}
      className="card flex h-full flex-col p-5"
      aria-label="거래처 TOP 5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[1.02rem] font-bold text-navy-900">
          거래처 TOP 5
          <DemoBadge />
        </h2>
        <Link
          href="/customers"
          className="flex items-center gap-0.5 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          전체 보기 <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <ol className="mt-3 flex-1 space-y-2">
        {top.map(({ customer, stats }, i) => (
          <li key={customer.id}>
            <Link
              href={`/customers/${customer.id}`}
              className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-soft"
            >
              <span
                className={
                  i === 0
                    ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-600 text-[0.7rem] font-bold text-white"
                    : "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-navy-50 text-[0.7rem] font-bold text-navy-500"
                }
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[0.85rem] font-semibold text-navy-800 group-hover:text-brand-700">
                    {customer.name}
                  </span>
                  <span className="shrink-0 text-[0.82rem] font-bold tabular-nums text-navy-900">
                    {formatKRW(stats.totalRevenue)}
                  </span>
                </span>
                <span className="mt-1.5 flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-50">
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(stats.totalRevenue / max) * 100}%`,
                      }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.06 }}
                      className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400"
                    />
                  </span>
                  <span className="w-11 shrink-0 text-right text-[0.7rem] font-semibold tabular-nums text-navy-400">
                    {((stats.totalRevenue / total) * 100).toFixed(1)}%
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </motion.section>
  );
}
