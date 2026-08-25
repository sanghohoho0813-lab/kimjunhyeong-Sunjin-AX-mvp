"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { generateFinancialBriefing } from "@/lib/insights/financialBriefing";

/**
 * AI Executive Brief — 대표가 10초 안에 읽는 브리핑.
 * 긴 보고서가 아니라 Headline + 근거 3줄 + 모니터링 지표 구조.
 */
export function BriefingCard({ year }: { year: number }) {
  const briefing = generateFinancialBriefing(year);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="card-insight flex h-full flex-col p-6"
      aria-label="AI 경영 브리핑"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-500 text-white">
          <Sparkles className="h-[1.1rem] w-[1.1rem]" strokeWidth={2.3} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[1.05rem] font-bold text-ink-900">
            AI 경영 브리핑
          </span>
          <span className="block text-[0.82rem] font-semibold text-teal-700">
            {year}년 기준 · 규칙 기반 인사이트
          </span>
        </span>
      </div>

      {/* Headline — 브리핑의 주인공 */}
      <p className="mt-5 text-[1.02rem] font-bold leading-relaxed tracking-[-0.01em] text-ink-900">
        {briefing.headline}
      </p>

      <ul className="mt-3 flex-1 space-y-2.5">
        {briefing.paragraphs.map((p, i) => (
          <li key={i} className="flex gap-2.5">
            <span
              aria-hidden
              className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-teal-500"
            />
            <span className="text-[0.84rem] leading-relaxed text-ink-600">
              {p}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-card border border-teal-500/10 bg-white/80 px-4 py-3.5">
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-ink-400">
          핵심 모니터링 지표
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {briefing.monitoringPoints.map((point) => (
            <span
              key={point}
              className="rounded-md border border-surface-line bg-white px-2.5 py-1 text-[0.74rem] font-semibold text-ink-700"
            >
              {point}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
