"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Sheet } from "@/components/shared/Sheet";
import { EmptyState, Badge } from "@/components/shared/ui";
import { AxActionCard } from "@/components/dashboard/AxActionCard";
import { getCustomer, getProduct } from "@/lib/data/derived";
import { generateRecommendations } from "@/lib/insights/recommendations";
import { clsx } from "@/lib/utils/clsx";
import type { AxRecommendation, RecoCategory } from "@/types";

const CATEGORIES: Array<RecoCategory | "전체"> = [
  "전체",
  "매출 기회",
  "재고",
  "거래처",
  "수익성",
  "재무 모니터링",
];

export default function InsightsPage() {
  const [category, setCategory] = useState<RecoCategory | "전체">("전체");
  const [selected, setSelected] = useState<AxRecommendation | null>(null);
  const recos = useMemo(() => generateRecommendations(), []);
  const filtered =
    category === "전체" ? recos : recos.filter((r) => r.category === category);

  return (
    <div>
      <PageHeader
        title="AX 추천"
        subtitle="데이터에서 발견한 신호를 근거와 함께 다음 영업 행동으로 연결합니다."
      />

      {/* 카테고리 필터 */}
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((c) => {
          const count =
            c === "전체"
              ? recos.length
              : recos.filter((r) => r.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={clsx(
                "chip",
                category === c && "chip-on"
              )}
            >
              {c}
              <span
                className={clsx(
                  "ml-1.5 tabular-nums",
                  category === c ? "text-ink-300" : "text-ink-300"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            message="새로운 추천이 없습니다."
            hint="데이터가 갱신되면 추천이 다시 생성됩니다."
          />
        </div>
      ) : (
        <ul className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((reco, i) => (
            <li key={reco.id} className="min-w-0">
              <AxActionCard reco={reco} index={i} onOpen={setSelected} />
            </li>
          ))}
        </ul>
      )}

      {/* 추천 상세 시트 */}
      <Sheet
        open={selected != null}
        onClose={() => setSelected(null)}
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
            AX 추천 상세
          </span>
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-surface px-2.5 py-1 text-[0.68rem] font-bold text-ink-500">
                  {selected.category}
                </span>
                <Badge>{selected.priority}</Badge>
              </div>
              <h3 className="mt-2.5 text-[1.05rem] font-extrabold leading-snug text-ink-900">
                {selected.title}
              </h3>
            </div>

            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-wide text-ink-400">
                발견된 신호
              </p>
              <ul className="mt-2 space-y-1.5">
                {selected.signals.map((signal, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-surface-subtle px-3 py-2 text-[0.8rem] text-ink-700"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                      aria-hidden
                    />
                    {signal}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-wide text-ink-400">
                왜 중요한가
              </p>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-600">
                {selected.why}
              </p>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-500">
                {selected.connection}
              </p>
              {selected.expectedEffect ? (
                <p className="mt-2.5 rounded-xl bg-teal-50 px-3.5 py-2.5 text-[0.82rem] font-bold text-teal-700">
                  예상 효과 — {selected.expectedEffect}
                </p>
              ) : null}
            </div>

            {selected.relatedCustomerIds?.length ? (
              <div>
                <p className="text-[0.72rem] font-bold uppercase tracking-wide text-ink-400">
                  관련 거래처
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.relatedCustomerIds.map((cid) => (
                    <Link
                      key={cid}
                      href={`/customers/${cid}`}
                      onClick={() => setSelected(null)}
                      className="rounded-full border border-surface-line bg-white px-3 py-1 text-[0.78rem] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                    >
                      {getCustomer(cid)?.name ?? cid}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {selected.relatedProductIds?.length ? (
              <div>
                <p className="text-[0.72rem] font-bold uppercase tracking-wide text-ink-400">
                  관련 제품
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.relatedProductIds.map((pid) => (
                    <Link
                      key={pid}
                      href={`/inventory/${pid}`}
                      onClick={() => setSelected(null)}
                      className="rounded-full border border-surface-line bg-white px-3 py-1 text-[0.78rem] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                    >
                      {getProduct(pid)?.name ?? pid}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <Link
              href={selected.href}
              onClick={() => setSelected(null)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-600 text-sm font-bold text-white transition-colors hover:bg-brand-700"
            >
              {selected.actionLabel} — 액션 시작
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
