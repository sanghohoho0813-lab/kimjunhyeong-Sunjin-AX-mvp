"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "@/lib/utils/clsx";
import { Badge } from "@/components/shared/ui";
import { CardArt, type CardArtSrc } from "@/components/shared/CardArt";
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
 * AX Action Card — 일반 데이터 카드와 명확히 구별되는 Insight 전용 스타일.
 * 구조: Eyebrow → Headline → 근거(Signal) → 연결 대상 → 예상 효과 → CTA
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

  const body = (
    <>
      <CardArt
        src={ART_CYCLE[index % ART_CYCLE.length]}
        size="112% auto"
        position="right -18px bottom -26px"
        opacity={0.72}
      />

      {/* Eyebrow */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/10 text-teal-600">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
          </span>
          <span className="text-[0.8rem] font-bold uppercase tracking-[0.14em] text-teal-700">
            AX Insight
          </span>
        </span>
        <Badge>{reco.priority}</Badge>
      </div>

      {/* Headline */}
      <h3 className="mt-3.5 text-[1rem] font-bold leading-snug tracking-[-0.01em] text-ink-900">
        {reco.title}
      </h3>

      {/* 근거 */}
      <dl className="mt-3 space-y-2 border-t border-teal-500/10 pt-3">
        <div className="flex gap-2.5">
          <dt className="w-11 shrink-0 text-[0.84rem] font-bold text-ink-400">
            근거
          </dt>
          <dd className="min-w-0 flex-1 text-[0.8rem] leading-relaxed text-ink-600">
            {reco.why}
          </dd>
        </div>
        <div className="flex gap-2.5">
          <dt className="w-11 shrink-0 text-[0.84rem] font-bold text-ink-400">
            연결
          </dt>
          <dd className="min-w-0 flex-1 text-[0.8rem] leading-relaxed text-ink-600">
            {reco.connection}
          </dd>
        </div>
      </dl>

      {/* 예상 효과 + CTA */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {reco.expectedEffect ? (
            <>
              <p className="text-[0.8rem] font-bold uppercase tracking-[0.1em] text-ink-400">
                예상 효과
              </p>
              <p className="mt-0.5 truncate text-[0.94rem] font-extrabold tabular-nums text-teal-700">
                {reco.expectedEffect}
              </p>
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-[0.76rem] font-semibold text-ink-400">
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {reco.category}
            </span>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[0.82rem] font-bold text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5">
          {reco.actionLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
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
