"use client";

import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Eye, FileText, RefreshCw, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { clsx } from "@/lib/utils/clsx";
import { todayFrontSummary } from "@/lib/insights/customerSignals";
import {
  useAllCustomerActivities,
  useAllOrders,
  useAllQuoteRequests,
  useAllSampleRequests,
} from "@/lib/store";
import { formatKRW } from "@/lib/utils/format";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 고객 Front 활동 요약.
 *
 * 대시보드를 복잡하게 만들지 않는 선에서, 고객 화면에서 무슨 일이 있었는지만
 * 짧게 보여준다. 상세는 고객 요청 화면으로 넘긴다.
 */
export function CustomerFrontActivity() {
  const activities = useAllCustomerActivities();
  const samples = useAllSampleRequests();
  const quotes = useAllQuoteRequests();
  const orders = useAllOrders();

  const s = useMemo(
    () => todayFrontSummary(activities, samples, quotes, orders),
    [activities, samples, quotes, orders]
  );

  const items = [
    { icon: Eye, label: "제품 조회", value: s.weekViews, unit: "회", tone: "text-brand-600 bg-brand-50" },
    { icon: ClipboardList, label: "샘플 요청", value: s.newSamples, unit: "건", tone: "text-teal-600 bg-teal-50" },
    { icon: FileText, label: "견적 요청", value: s.newQuotes, unit: "건", tone: "text-violet-600 bg-violet-50" },
    { icon: RefreshCw, label: "재주문", value: s.newReorders, unit: "건", tone: "text-gold-500 bg-gold-100" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
      className="card-data p-5 lg:p-6"
      aria-label="고객 Front 활동"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="mb-1 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-brand-600">
            Customer Front
          </p>
          <h3 className="t-card-title">고객 화면 활동</h3>
          <p className="mt-1 t-caption">최근 7일 · 고객이 직접 만든 신호입니다</p>
        </div>
        <Link
          href="/requests"
          className="inline-flex min-h-[2.6rem] shrink-0 items-center gap-1 whitespace-nowrap rounded-btn px-2 text-[0.92rem] font-bold text-brand-600 transition-colors hover:bg-brand-50"
        >
          고객 활동 보기
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((x) => (
          <div key={x.label} className="min-w-0 rounded-card bg-surface-sunken px-3.5 py-3">
            <span
              className={clsx(
                "flex h-8 w-8 items-center justify-center rounded-[9px]",
                x.tone
              )}
            >
              <x.icon className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            </span>
            <p className="mt-2 truncate text-[0.86rem] font-semibold text-ink-500">
              {x.label}
            </p>
            <p className="mt-0.5 text-[1.35rem] font-extrabold tabular-nums tracking-[-0.02em] text-ink-900">
              {x.value}
              <span className="ml-0.5 text-[0.84rem] font-bold text-ink-500">
                {x.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {s.pending > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-warning/20 bg-warning-soft px-4 py-3">
          <p className="min-w-0 text-[0.94rem] font-semibold leading-relaxed text-ink-800">
            아직 회신하지 않은 요청이{" "}
            <span className="font-extrabold text-warning">{s.pending}건</span>{" "}
            있습니다. 참고가 기준 {formatKRW(s.pendingQuoteValue)} 규모입니다.
          </p>
          <Link
            href="/requests"
            className="inline-flex min-h-[2.6rem] shrink-0 items-center gap-1.5 rounded-btn bg-navy-900 px-3.5 text-[0.9rem] font-bold text-white transition-colors hover:bg-navy-800"
          >
            요청 확인
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : null}

      <Link
        href="/"
        className="mt-3 inline-flex min-h-[2.6rem] items-center gap-1.5 text-[0.9rem] font-bold text-ink-500 transition-colors hover:text-ink-800"
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        고객이 보는 화면 열기
      </Link>
    </motion.section>
  );
}
