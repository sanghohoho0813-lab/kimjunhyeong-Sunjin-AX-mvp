"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { generateFinancialBriefing } from "@/lib/insights/financialBriefing";

/** AI 경영 브리핑 — 규칙 기반 인사이트 엔진 (10초 안에 읽는 브리핑 카드) */
export function BriefingCard({ year }: { year: number }) {
  const briefing = generateFinancialBriefing(year);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.05 }}
      className="card flex h-full flex-col p-5"
      aria-label="AI 경영 브리핑"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[1.02rem] font-bold text-navy-900">AI 경영 브리핑</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-teal-500 px-2.5 py-1 text-[0.68rem] font-bold text-white">
          <Sparkles className="h-3 w-3" aria-hidden /> AI
        </span>
      </div>
      <p className="mt-3 text-sm font-bold leading-relaxed text-navy-800">
        {briefing.headline}
      </p>
      <ul className="mt-2 flex-1 space-y-2">
        {briefing.paragraphs.map((p, i) => (
          <li key={i} className="text-[0.82rem] leading-relaxed text-navy-500">
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-xl bg-navy-50/70 px-3.5 py-3">
        <p className="text-[0.7rem] font-bold uppercase tracking-wide text-navy-400">
          핵심 모니터링 지표
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {briefing.monitoringPoints.map((point) => (
            <span
              key={point}
              className="rounded-full border border-navy-100 bg-white px-2.5 py-0.5 text-xs font-semibold text-navy-600"
            >
              {point}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
