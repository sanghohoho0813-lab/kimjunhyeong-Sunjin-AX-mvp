"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  LineChart,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { PageHeader, PeriodSelect } from "@/components/layout/PageHeader";
import { AssetCompositionChart } from "@/components/charts/AssetCompositionChart";
import { FinancialTrendChart } from "@/components/charts/FinancialTrendChart";
import { AxActionCard } from "@/components/dashboard/AxActionCard";
import { BriefingCard } from "@/components/dashboard/BriefingCard";
import {
  CashflowCard,
  InventorySnapshot,
  MetricStrip,
} from "@/components/dashboard/SideCards";
import { TopCustomersCard } from "@/components/dashboard/TopCustomersCard";
import { HeroKpi, MiniKpi } from "@/components/shared/KpiCard";
import { COMPANY } from "@/lib/data/seed";
import { CASH_BY_YEAR, getRatios, getYear } from "@/lib/data/finance";
import { generateRecommendations } from "@/lib/insights/recommendations";
import { useAppStore } from "@/lib/store";

/** 데스크톱 헤더용 둘러보기 진입 버튼 (플로팅 배너와 겹치지 않도록 헤더에 배치) */
function TourButton() {
  const setTourOpen = useAppStore((s) => s.setTourOpen);
  return (
    <button onClick={() => setTourOpen(true)} className="btn btn-ghost">
      <Sparkles className="h-4 w-4 text-teal-500" aria-hidden />
      AX 둘러보기
    </button>
  );
}

export default function DashboardPage() {
  const year = useAppStore((s) => s.periodYear);
  const fin = getYear(year);
  const ratios = getRatios(year);
  const cash = CASH_BY_YEAR[year] ?? 0;
  const prevCash = CASH_BY_YEAR[year - 1];
  const cashDelta =
    prevCash != null && prevCash > 0 ? ((cash - prevCash) / prevCash) * 100 : null;

  const recos = generateRecommendations();
  const topRecos = recos.slice(0, 3);
  const urgentCount = recos.filter(
    (r) => r.priority === "긴급" || r.priority === "높음"
  ).length;

  return (
    <div>
      {/* ── 모바일 Hero — 대표 관점의 인사 + 오늘의 이슈 ── */}
      <section className="mb-5 lg:hidden">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[1.4rem] font-extrabold leading-tight tracking-[-0.02em] text-ink-900">
            안녕하세요, {COMPANY.ceoTitle}님
          </p>
          <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-500">
            오늘 확인할 경영 이슈가{" "}
            <span className="font-bold text-brand-600">{urgentCount}건</span>{" "}
            있습니다.
          </p>
        </motion.div>
        <div className="mt-4">
          <PeriodSelect />
        </div>
      </section>

      {/* ── 데스크톱 헤더 ── */}
      <div className="hidden lg:block">
        <PageHeader
          title="경영 대시보드"
          subtitle="매출·재무·거래처·재고를 연결해 오늘 필요한 의사결정을 한눈에 확인합니다."
          withPeriod
          actions={<TourButton />}
        />
      </div>

      {/* ── ROW 2: KPI ── */}
      {/* 모바일: 핵심 3개만 */}
      <div className="grid grid-cols-3 gap-2.5 lg:hidden">
        <MiniKpi
          label="매출액"
          value={fin.revenue}
          unit="억"
          delta={ratios.revenueYoYPct}
          accent="brand"
          index={0}
        />
        <MiniKpi
          label="영업이익"
          value={fin.operatingProfit}
          unit="억"
          delta={ratios.operatingYoYPct}
          accent="teal"
          index={1}
        />
        <MiniKpi
          label="당기순이익"
          value={fin.netProfit}
          unit="억"
          delta={ratios.netYoYPct}
          accent="gold"
          index={2}
        />
      </div>

      {/* 데스크톱: Hero KPI 4개 */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-4">
        <HeroKpi
          icon={BadgeDollarSign}
          label="매출액"
          value={fin.revenue}
          unit="억원"
          delta={ratios.revenueYoYPct}
          accent="brand"
          index={0}
        />
        <HeroKpi
          icon={TrendingUp}
          label="영업이익"
          value={fin.operatingProfit}
          unit="억원"
          delta={ratios.operatingYoYPct}
          accent="teal"
          index={1}
        />
        <HeroKpi
          icon={LineChart}
          label="당기순이익"
          value={fin.netProfit}
          unit="억원"
          delta={ratios.netYoYPct}
          accent="gold"
          index={2}
        />
        <HeroKpi
          icon={Wallet}
          label="현금성 자산"
          value={cash}
          unit="억원"
          delta={cashDelta}
          accent="navy"
          index={3}
        />
      </div>

      {/* ── 모바일: AX 추천을 KPI 바로 다음에 ── */}
      <section className="mt-7 lg:hidden" aria-label="오늘의 AX 추천">
        <div className="mb-3.5 flex items-end justify-between gap-3">
          <div>
            <h2 className="t-section">오늘의 AX 추천</h2>
            <p className="mt-1 t-caption">가장 먼저 확인할 행동입니다</p>
          </div>
          <Link
            href="/insights"
            className="inline-flex items-center gap-0.5 text-[0.78rem] font-bold text-brand-600"
          >
            {recos.length}건 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-3">
          {topRecos.map((reco, i) => (
            <AxActionCard key={reco.id} reco={reco} index={i} />
          ))}
        </div>
      </section>

      {/* ── ROW 3: 재무 차트 65% + AI 브리핑 35% ── */}
      <div className="mt-7 grid gap-4 lg:mt-8 lg:grid-cols-12 lg:gap-5">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="card-data flex flex-col p-5 lg:col-span-8 lg:p-6"
          aria-label="재무 성과 추이"
        >
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <h2 className="t-section">재무 성과 추이</h2>
              <p className="mt-1 t-caption">2023 ~ 2025 · 단위 억원</p>
            </div>
            <span className="hidden rounded-md bg-surface-sunken px-2.5 py-1 text-[0.7rem] font-bold text-ink-500 sm:inline">
              3개년
            </span>
          </div>
          <div className="hidden min-h-[300px] flex-1 lg:block">
            <FinancialTrendChart fill />
          </div>
          <div className="lg:hidden">
            <FinancialTrendChart height={252} compact />
          </div>
        </motion.section>

        <div className="lg:col-span-4">
          <BriefingCard year={year} />
        </div>
      </div>

      {/* ── ROW 4: 데스크톱 AX Actions ── */}
      <section className="mt-8 hidden lg:block" aria-label="오늘의 AX 추천">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="t-section">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-[1.05rem] w-[1.05rem] text-teal-500" aria-hidden />
                오늘의 AX 추천
              </span>
            </h2>
            <p className="mt-1 t-caption">
              데이터에서 발견한 신호를 근거와 함께 다음 행동으로 연결합니다
            </p>
          </div>
          <Link
            href="/insights"
            className="btn btn-ghost btn-sm !font-bold text-brand-600"
          >
            추천 {recos.length}건 전체 보기
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {topRecos.map((reco, i) => (
            <AxActionCard key={reco.id} reco={reco} index={i} />
          ))}
        </div>
      </section>

      {/* ── ROW 5: 거래처 / 재고 / 재무 개요 ── */}
      <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-12 lg:gap-5">
        <div className="lg:col-span-5">
          <InventorySnapshot />
        </div>
        <div className="lg:col-span-4">
          <TopCustomersCard />
        </div>
        <div className="lg:col-span-3">
          <CashflowCard year={year} />
        </div>
      </div>

      {/* 자산 구성 */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="card-data mt-4 p-5 lg:mt-5 lg:p-6"
        aria-label="자산 구성 현황"
      >
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="t-section">자산 구성 현황</h2>
            <p className="mt-1 t-caption">{year}년 · 단위 억원</p>
          </div>
        </div>
        <AssetCompositionChart year={year} />
      </motion.section>

      {/* ── ROW 6: 요약 스트립 ── */}
      <div className="mt-4 lg:mt-5">
        <MetricStrip year={year} />
      </div>
    </div>
  );
}
