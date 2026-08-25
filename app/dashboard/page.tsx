"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AssetCompositionChart } from "@/components/charts/AssetCompositionChart";
import { FinancialTrendChart } from "@/components/charts/FinancialTrendChart";
import { AxActionCard } from "@/components/dashboard/AxActionCard";
import { BriefingCard } from "@/components/dashboard/BriefingCard";
import { CurrentStatus, TopActions } from "@/components/dashboard/CurrentStatus";
import { DecisionCard } from "@/components/dashboard/DecisionCard";
import { InventorySnapshot } from "@/components/dashboard/SideCards";
import { TopCustomersCard } from "@/components/dashboard/TopCustomersCard";
import { CardArt } from "@/components/shared/CardArt";
import { COMPANY } from "@/lib/data/seed";
import { getOperationDecisions } from "@/lib/insights/decisions";
import { generateRecommendations } from "@/lib/insights/recommendations";
import {
  CURRENT_MONTH,
  CURRENT_YEAR,
  LAST_CLOSED_YEAR,
  formatDateKo,
  DEMO_TODAY,
} from "@/lib/utils/format";
import { useAppStore } from "@/lib/store";

const EASE = [0.22, 1, 0.36, 1] as const;

/** 섹션 머리 — 이 블록이 어떤 질문에 답하는지 먼저 말한다 */
function SectionHead({
  eyebrow,
  title,
  desc,
  right,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-brand-600">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="t-section">{title}</h2>
        {desc ? <p className="mt-1 t-caption">{desc}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export default function DashboardPage() {
  const year = useAppStore((s) => s.periodYear);

  const recos = generateRecommendations();
  const topRecos = recos.slice(0, 3);
  const urgentCount = recos.filter(
    (r) => r.priority === "긴급" || r.priority === "높음"
  ).length;
  const opDecisions = getOperationDecisions();

  return (
    <div>
      {/* ── 모바일 Hero ── */}
      <section className="mb-5 lg:hidden">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: EASE }}
        >
          <p className="text-[1.4rem] font-extrabold leading-tight tracking-[-0.02em] text-ink-900">
            안녕하세요, {COMPANY.ceoTitle}님
          </p>
          <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-500">
            {formatDateKo(DEMO_TODAY)} 기준 · 확인할 경영 이슈{" "}
            <span className="font-bold text-brand-600">{urgentCount}건</span>
          </p>
        </motion.div>
      </section>

      {/* ── 데스크톱 헤더 ── */}
      <div className="hidden lg:block">
        <PageHeader
          title="경영 대시보드"
          subtitle={`${CURRENT_YEAR}년 현재까지의 실적과 재고·거래처 상황을 전년 같은 기간과 비교해 오늘 필요한 결정을 정리합니다.`}
        />
      </div>

      {/* ── ① 지금 어떤 상태인가 ── */}
      <CurrentStatus />

      {/* ── ② 그래서 무엇을 할 것인가 ── */}
      <section className="mt-8" aria-label="지표별 권장 행동">
        <SectionHead
          eyebrow="Next Action"
          title="지금 해야 할 일"
          desc="위 지표에서 바로 이어지는 행동입니다"
        />
        <TopActions />
      </section>

      {/* ── ③ AX 추천 ── */}
      <section className="mt-9" aria-label="오늘의 AX 추천">
        <SectionHead
          eyebrow="AX Insight"
          title={
            <span className="inline-flex items-center gap-2">
              <Sparkles
                className="h-[1.1rem] w-[1.1rem] shrink-0 text-teal-500"
                aria-hidden
              />
              오늘의 AX 추천
            </span>
          }
          desc="어떤 재고를 누구에게 팔면 얼마가 되는지 데이터로 연결했습니다"
          right={
            <Link
              href="/insights"
              className="btn btn-ghost btn-sm !font-bold text-brand-600"
            >
              추천 {recos.length}건 전체 보기
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        <div className="grid gap-4 lg:gap-5 xl:grid-cols-3">
          {topRecos.map((reco, i) => (
            <AxActionCard key={reco.id} reco={reco} index={i} />
          ))}
        </div>
      </section>

      {/* ── ④ 운영 판단 — 재고·거래처·견적·자본 ── */}
      <section className="mt-9" aria-label="운영 의사결정">
        <SectionHead
          eyebrow="Operation"
          title="운영 판단"
          desc="재고·거래처·견적·자본을 현재 기준으로 진단하고 다음 행동까지 제안합니다"
        />
        <div className="grid gap-4 lg:gap-5 xl:grid-cols-2 2xl:grid-cols-4">
          {opDecisions.map((d, i) => (
            <DecisionCard key={d.id} decision={d} index={i} />
          ))}
        </div>
      </section>

      {/* ── ⑤ 상세 근거 — 매일 볼 필요는 없지만 확인은 되어야 하는 것들 ── */}
      <section className="mt-9" aria-label="상세 데이터">
        <SectionHead
          eyebrow="Reference"
          title="상세 데이터"
          desc="판단의 바탕이 된 원본 수치입니다"
        />

        <div className="grid gap-4 lg:gap-5 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-7">
            <InventorySnapshot />
          </div>
          <div className="min-w-0 xl:col-span-5">
            <TopCustomersCard />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:gap-5 xl:grid-cols-12">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: EASE }}
            className="card-data isolate flex flex-col p-5 xl:col-span-7 lg:p-6"
            aria-label="재무 성과 추이"
          >
            <CardArt
              src="financial-trend"
              size="38% auto"
              position="right -18px top -24px"
              opacity={0.45}
            />
            <div className="mb-2 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
              <div className="min-w-0">
                <h3 className="t-card-title">연간 재무 성과 추이</h3>
                <p className="mt-1 t-caption">
                  {LAST_CLOSED_YEAR - 2} ~ {LAST_CLOSED_YEAR} 확정 실적 · 단위 억원
                </p>
              </div>
              <span className="hidden shrink-0 rounded-md bg-surface-sunken px-2.5 py-1 text-[0.82rem] font-bold text-ink-500 sm:inline">
                3개년
              </span>
            </div>
            <div className="hidden min-h-[280px] flex-1 lg:block">
              <FinancialTrendChart fill />
            </div>
            <div className="lg:hidden">
              <FinancialTrendChart height={252} compact />
            </div>
          </motion.section>

          <div className="min-w-0 xl:col-span-5">
            <BriefingCard year={year} />
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.1, ease: EASE }}
          className="card-data isolate mt-4 p-5 lg:p-6"
          aria-label="자산 구성 현황"
        >
          <CardArt
            src="asset-composition"
            size="72% auto"
            position="right -60px bottom -34px"
            opacity={0.28}
          />
          <div className="mb-4 min-w-0">
            <h3 className="t-card-title">자산 구성 현황</h3>
            <p className="mt-1 t-caption">{year}년 확정 실적 · 단위 억원</p>
          </div>
          <AssetCompositionChart year={year} />
        </motion.section>
      </section>

      {/* 데이터 기준 안내 — 어디까지가 확정이고 어디부터가 추정인지 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-6 text-[0.86rem] leading-relaxed text-ink-400"
      >
        {LAST_CLOSED_YEAR}년까지는 확정 실적입니다. {CURRENT_YEAR}년 1~
        {CURRENT_MONTH}월 누적과 현금 잔액은 확정 결산 전 추정치이며, 거래처·재고·견적
        데이터는 시연용 샘플입니다.
      </motion.p>
    </div>
  );
}
