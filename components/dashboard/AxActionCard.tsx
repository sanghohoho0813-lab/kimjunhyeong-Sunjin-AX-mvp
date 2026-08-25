"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  LineChart,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "@/lib/utils/clsx";
import { Badge } from "@/components/shared/ui";
import { CardArt, type CardArtSrc } from "@/components/shared/CardArt";
import { formatKRW } from "@/lib/utils/format";
import type { AxRecommendation, RecoCategory } from "@/types";

const CATEGORY_ICON: Record<RecoCategory, typeof Boxes> = {
  재고: Boxes,
  거래처: Users,
  "매출 기회": LineChart,
  수익성: LineChart,
  "재무 모니터링": ShieldCheck,
};

/** 카드 배경 가죽 텍스처 — 순서대로 순환시켜 카드가 나란히 놓여도 겹치지 않게 한다 */
const ART_CYCLE: CardArtSrc[] = ["ax-cow-black", "ax-cow-navy", "ax-goat-navy"];

/**
 * AX Action Card.
 *
 * 위계를 "무엇을 / 얼마짜리" 두 가지에 몰아준다.
 *   1) 대상 — 어떤 품목·거래처인지 (카드에서 가장 큰 텍스트)
 *   2) 임팩트 — 금액이 얼마인지 (그 다음으로 큰 텍스트)
 * 근거와 연결은 라벨 칩을 달아 본문과 구분되게 두고,
 * 카테고리·우선순위 같은 메타 정보는 위계를 낮춰 배경으로 물러나게 한다.
 */
export function AxActionCard({
  reco,
  index = 0,
  onOpen,
}: {
  reco: AxRecommendation;
  index?: number;
  onOpen?: (reco: AxRecommendation) => void;
}) {
  const Icon = CATEGORY_ICON[reco.category] ?? Sparkles;
  const subject = reco.subject;
  const impact = reco.impact;

  const body = (
    <>
      <CardArt
        src={ART_CYCLE[index % ART_CYCLE.length]}
        size="112% auto"
        position="right -18px bottom -26px"
        opacity={0.72}
      />

      {/* 메타 줄 — 위계를 가장 낮춘다 */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500/10 text-teal-600">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
          </span>
          <span className="shrink-0 whitespace-nowrap text-[0.78rem] font-bold uppercase tracking-[0.14em] text-teal-700">
            AX Insight
          </span>
          {/* 카테고리는 보조 정보라 폭이 좁으면 아이콘만 남긴다 */}
          <span
            className="inline-flex shrink-0 items-center gap-1 text-[0.78rem] font-semibold text-ink-400"
            title={reco.category}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden 2xl:inline">{reco.category}</span>
          </span>
        </span>
        <Badge>{reco.priority}</Badge>
      </div>

      {/* ① 대상 — 카드의 주인공 */}
      {subject ? (
        <div className="mt-3.5">
          <h3 className="text-[1.24rem] font-extrabold leading-tight tracking-[-0.02em] text-ink-900">
            {subject.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {subject.meta ? (
              <span className="text-[0.9rem] font-semibold text-ink-500">
                {subject.meta}
              </span>
            ) : null}
            {subject.flag ? (
              <span className="inline-flex items-center rounded-md bg-critical-soft px-2 py-0.5 text-[0.86rem] font-bold text-critical">
                {subject.flag}
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <h3 className="mt-3.5 text-[1.12rem] font-extrabold leading-snug tracking-[-0.015em] text-ink-900">
          {reco.title}
        </h3>
      )}

      {/* ② 임팩트 — 금액을 크게 */}
      {impact ? (
        <div className="mt-3.5 rounded-card border border-teal-500/20 bg-white/80 px-4 py-3">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-teal-700">
            {impact.label}
          </p>
          <p className="mt-1 text-[1.6rem] font-extrabold leading-none tabular-nums tracking-[-0.03em] text-teal-700">
            {formatKRW(impact.amount)}
          </p>
          {impact.note ? (
            <p className="mt-1.5 text-[0.84rem] leading-snug text-ink-500">
              {impact.note}
            </p>
          ) : null}
        </div>
      ) : reco.expectedEffect ? (
        <div className="mt-3.5 rounded-card border border-teal-500/20 bg-white/80 px-4 py-3">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-teal-700">
            예상 효과
          </p>
          <p className="mt-1 text-[1.02rem] font-extrabold leading-snug text-teal-700">
            {reco.expectedEffect}
          </p>
        </div>
      ) : null}

      {/* ③ 근거 / 연결 — 라벨 칩을 달아 본문과 구분 */}
      <dl className="mt-4 flex-1 space-y-2.5">
        <div className="flex gap-2.5">
          <dt className="inline-flex h-[1.55rem] shrink-0 items-center gap-1 rounded-md bg-surface-sunken px-2 text-[0.82rem] font-bold text-ink-500">
            <Search className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
            근거
          </dt>
          <dd className="min-w-0 flex-1 text-[0.92rem] leading-relaxed text-ink-700">
            {reco.why}
          </dd>
        </div>
        <div className="flex gap-2.5">
          <dt className="inline-flex h-[1.55rem] shrink-0 items-center gap-1 rounded-md bg-brand-50 px-2 text-[0.82rem] font-bold text-brand-700">
            <Link2 className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
            연결
          </dt>
          <dd className="min-w-0 flex-1 text-[0.92rem] leading-relaxed text-ink-700">
            {reco.connection}
          </dd>
        </div>
      </dl>

      {/* CTA */}
      <span className="mt-4 inline-flex items-center gap-1.5 self-start rounded-btn bg-brand-600 px-3.5 py-2 text-[0.92rem] font-bold text-white transition-all duration-200 group-hover:bg-brand-700">
        {reco.actionLabel}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </>
  );

  const shell = clsx(
    "card-insight group isolate flex h-full flex-col p-5 text-left transition-all duration-200 ease-premium",
    "hover:-translate-y-[3px] hover:border-teal-300 hover:shadow-card-hover"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0"
    >
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(reco)}
          className={clsx(shell, "w-full")}
        >
          {body}
        </button>
      ) : (
        <Link href={reco.href} className={shell}>
          {body}
        </Link>
      )}
    </motion.div>
  );
}
