"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { clsx } from "@/lib/utils/clsx";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { getProduct } from "@/lib/data/derived";
import { getSalesSignal, summarizeActivity } from "@/lib/insights/customerSignals";
import { useAllCustomerActivities, useFavorites } from "@/lib/store";
import { formatDate, formatNumber } from "@/lib/utils/format";

const EASE = [0.22, 1, 0.36, 1] as const;

const KIND_ICON = {
  view: Eye,
  favorite: Heart,
  search: Search,
  sample: ClipboardList,
  quote: FileText,
  order: FileText,
  reorder: FileText,
} as const;

const TONE = {
  hot: {
    chip: "bg-critical-soft text-critical",
    label: "접촉 적기",
    rail: "from-critical to-critical",
  },
  warm: {
    chip: "bg-warning-soft text-warning",
    label: "관심 단계",
    rail: "from-gold-300 to-gold-400",
  },
  quiet: {
    chip: "bg-ink-200/60 text-ink-500",
    label: "접점 없음",
    rail: "from-ink-300 to-ink-400",
  },
} as const;

/**
 * 거래처 상세 — 고객이 화면에서 남긴 활동과 그로부터 나온 영업 신호.
 *
 * 내부 데이터(거래 이력)만 보던 화면에 외부 데이터(고객 행동)를 붙인다.
 * 거래가 일어나기 전의 신호를 보는 것이 이 섹션의 목적이다.
 */
export function DigitalActivity({ customerId }: { customerId: string }) {
  const allActivities = useAllCustomerActivities();
  const allFavorites = useFavorites();

  const activities = useMemo(
    () => allActivities.filter((a) => a.customerId === customerId),
    [allActivities, customerId]
  );
  const favorites = useMemo(
    () => allFavorites.filter((f) => f.customerId === customerId),
    [allFavorites, customerId]
  );

  const summary = summarizeActivity(activities, favorites);
  const signal = getSalesSignal(customerId, allActivities, allFavorites);
  const tone = TONE[signal.tone];
  const topProduct = summary.topProductId ? getProduct(summary.topProductId) : undefined;

  const metrics = [
    { icon: Eye, label: "제품 조회", value: summary.views, unit: "회" },
    { icon: Heart, label: "관심 제품", value: summary.favorites, unit: "개" },
    { icon: ClipboardList, label: "샘플 요청", value: summary.samples, unit: "건" },
    { icon: FileText, label: "견적 요청", value: summary.quotes, unit: "건" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.06, ease: EASE }}
      className="card-data relative overflow-hidden p-5 lg:p-6"
      aria-label="고객 디지털 활동"
    >
      <span
        aria-hidden
        className={clsx("absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r", tone.rail)}
      />

      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="mb-1 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-brand-600">
            Customer Front
          </p>
          <h2 className="t-card-title">고객 화면 활동</h2>
          <p className="mt-1 t-caption">최근 30일 기준</p>
        </div>
        <span
          className={clsx(
            "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-[0.85rem] font-bold",
            tone.chip
          )}
        >
          {tone.label}
        </span>
      </div>

      {/* 지표 */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="min-w-0 rounded-card bg-surface-sunken px-3.5 py-3">
            <span className="flex items-center gap-1.5 text-[0.84rem] font-semibold text-ink-500">
              <m.icon className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
              <span className="leading-snug">{m.label}</span>
            </span>
            <p className="mt-1 text-[1.3rem] font-extrabold tabular-nums tracking-[-0.02em] text-ink-900">
              {m.value}
              <span className="ml-0.5 text-[0.84rem] font-bold text-ink-500">
                {m.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* 영업 신호 */}
      <div className="mt-4 rounded-card border border-teal-500/20 bg-teal-50/40 px-4 py-3.5">
        <p className="flex items-center gap-1.5 text-[0.82rem] font-bold uppercase tracking-[0.1em] text-teal-700">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
          AX 영업 인사이트
        </p>
        <p className="mt-1.5 text-[1rem] font-bold leading-snug text-ink-900">
          {signal.headline}
        </p>
        {signal.basis.length ? (
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {signal.basis.map((b) => (
              <li key={b} className="text-[0.88rem] text-ink-600">
                · {b}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-2.5 text-[0.94rem] font-semibold leading-relaxed text-ink-800">
          {signal.action}
        </p>
      </div>

      {/* 가장 많이 본 제품 */}
      {topProduct && summary.topProductViews >= 2 ? (
        <Link
          href={`/inventory/${topProduct.id}`}
          className="mt-3 flex items-center gap-3 rounded-card border border-surface-line bg-white p-3 transition-colors hover:border-brand-200"
        >
          <LeatherSwatch
            color={topProduct.color}
            finish={topProduct.finish}
            className="h-11 w-11"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[0.82rem] font-bold uppercase tracking-[0.08em] text-ink-400">
              가장 많이 본 제품
            </span>
            <span className="mt-0.5 block text-[0.95rem] font-bold leading-snug text-ink-900">
              {topProduct.name}
            </span>
            <span className="block text-[0.86rem] leading-snug text-ink-500">
              {summary.topProductViews}회 조회 · 재고{" "}
              {formatNumber(topProduct.stockQty)}평
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-ink-300" aria-hidden />
        </Link>
      ) : null}

      {/* 활동 로그 */}
      {activities.length ? (
        <div className="mt-4 border-t border-surface-line pt-3.5">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-ink-400">
            최근 활동
          </p>
          <ul className="mt-2 space-y-1.5">
            {activities.slice(0, 6).map((a) => {
              const Icon = KIND_ICON[a.kind] ?? Eye;
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-ink-300" aria-hidden />
                    <span className="text-[0.9rem] leading-snug text-ink-600">
                      {a.label}
                    </span>
                  </span>
                  <span className="shrink-0 text-[0.84rem] tabular-nums text-ink-400">
                    {formatDate(a.date)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <Link
        href="/requests"
        className="mt-4 inline-flex min-h-[2.6rem] items-center gap-1.5 text-[0.9rem] font-bold text-brand-600 transition-colors hover:text-brand-700"
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        고객 요청 전체 보기
      </Link>
    </motion.section>
  );
}
