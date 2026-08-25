"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTopCustomers } from "@/lib/data/derived";
import { formatKRW } from "@/lib/utils/format";
import { DemoBadge, Meter } from "@/components/shared/ui";
import { clsx } from "@/lib/utils/clsx";

/** 거래처 TOP 5 — 누적 매출 기준 Data Card */
export function TopCustomersCard() {
  const top = getTopCustomers(5);
  const max = top[0]?.stats.totalRevenue ?? 1;
  const total = top.reduce((s, t) => s + t.stats.totalRevenue, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="card-data flex h-full flex-col p-6"
      aria-label="거래처 TOP 5"
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="t-section">거래처 TOP 5</h2>
          <p className="mt-1 t-caption">누적 매출 기준</p>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge />
          <Link
            href="/customers"
            className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[0.9rem] font-bold text-brand-600 transition-colors hover:text-brand-700"
          >
            전체 <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      <ol className="flex-1 space-y-3.5">
        {top.map(({ customer, stats }, i) => (
          <li key={customer.id}>
            <Link
              href={`/customers/${customer.id}`}
              className="group block rounded-lg outline-offset-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={clsx(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[0.66rem] font-bold tabular-nums",
                      i === 0
                        ? "bg-brand-600 text-white"
                        : "bg-surface-sunken text-ink-500"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate text-[0.88rem] font-semibold text-ink-800 transition-colors group-hover:text-brand-700">
                    {customer.name}
                  </span>
                </span>
                <span className="shrink-0 text-[0.86rem] font-bold tabular-nums text-ink-900">
                  {formatKRW(stats.totalRevenue)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2.5">
                <Meter
                  ratio={stats.totalRevenue / max}
                  className="flex-1"
                  tone={i === 0 ? "brand" : "teal"}
                />
                <span className="w-10 shrink-0 text-right text-[0.72rem] font-semibold tabular-nums text-ink-400">
                  {((stats.totalRevenue / total) * 100).toFixed(1)}%
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </motion.section>
  );
}
