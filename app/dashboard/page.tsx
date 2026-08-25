"use client";

import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  LineChart,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AssetCompositionChart } from "@/components/charts/AssetCompositionChart";
import { FinancialTrendChart } from "@/components/charts/FinancialTrendChart";
import { AxRecoPanel } from "@/components/dashboard/AxRecoPanel";
import { BriefingCard } from "@/components/dashboard/BriefingCard";
import { BottomStrip, CashflowCard } from "@/components/dashboard/SideCards";
import { TopCustomersCard } from "@/components/dashboard/TopCustomersCard";
import { KpiCard, useCountUp } from "@/components/shared/KpiCard";
import { DeltaBadge } from "@/components/shared/ui";
import { CASH_BY_YEAR, getRatios, getYear } from "@/lib/data/finance";
import { useAppStore } from "@/lib/store";
import { clsx } from "@/lib/utils/clsx";

/** 모바일 전용 소형 KPI 카드 */
function MobileKpi({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: number;
  delta: number | null;
  accent: string;
}) {
  const animated = useCountUp(value);
  return (
    <div className="card flex min-w-0 flex-col gap-1 p-3">
      <span className={clsx("text-[0.7rem] font-semibold", accent)}>{label}</span>
      <span className="text-[1.25rem] font-extrabold tabular-nums leading-none text-navy-900">
        {animated.toFixed(2)}
        <span className="text-[0.75rem] font-bold text-navy-500">억</span>
      </span>
      {delta != null ? (
        <span
          className={clsx(
            "text-[0.68rem] font-bold tabular-nums",
            delta >= 0 ? "text-emerald-600" : "text-rose-600"
          )}
        >
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
        </span>
      ) : (
        <span className="text-[0.68rem] text-navy-400">—</span>
      )}
    </div>
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

  const prevRatios = year > 2023 ? getRatios(year - 1) : null;
  const roeDeltaP =
    ratios.roePct != null && prevRatios?.roePct != null
      ? ratios.roePct - prevRatios.roePct
      : null;

  return (
    <div>
      <PageHeader
        title="경영 대시보드"
        subtitle="매출·재무·거래처·재고를 연결해 오늘 필요한 의사결정을 한눈에 확인합니다."
        withPeriod
      />

      {/* 모바일 KPI (3열) */}
      <div className="grid grid-cols-3 gap-2 lg:hidden">
        <MobileKpi
          label="매출액"
          value={fin.revenue}
          delta={ratios.revenueYoYPct}
          accent="text-brand-600"
        />
        <MobileKpi
          label="영업이익"
          value={fin.operatingProfit}
          delta={ratios.operatingYoYPct}
          accent="text-teal-600"
        />
        <MobileKpi
          label="당기순이익"
          value={fin.netProfit}
          delta={ratios.netYoYPct}
          accent="text-indigo-600"
        />
      </div>

      {/* 데스크톱 KPI (5열) */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-5">
        <KpiCard
          icon={BadgeDollarSign}
          label="매출액"
          value={fin.revenue}
          unit="억"
          delta={ratios.revenueYoYPct}
          tone="blue"
        />
        <KpiCard
          icon={TrendingUp}
          label="영업이익"
          value={fin.operatingProfit}
          unit="억"
          delta={ratios.operatingYoYPct}
          tone="teal"
        />
        <KpiCard
          icon={LineChart}
          label="당기순이익"
          value={fin.netProfit}
          unit="억"
          delta={ratios.netYoYPct}
          tone="violet"
        />
        <KpiCard
          icon={Wallet}
          label="현금성 자산"
          value={cash}
          unit="억"
          delta={cashDelta}
          tone="gold"
        />
        <KpiCard
          icon={PiggyBank}
          label="자기자본이익률(ROE)"
          value={ratios.roePct ?? 0}
          decimals={1}
          unit="%"
          delta={roeDeltaP}
          deltaSuffix="%p"
          tone="navy"
        />
      </div>

      {/* 차트 + 브리핑 + 추천 (모바일: 재무 성과 → AI 브리핑 → AX 추천 우선) */}
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="card order-1 p-5 lg:col-span-5"
          aria-label="재무 성과 추이"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[1.02rem] font-bold text-navy-900">
              재무 성과 추이
            </h2>
            <span className="text-[0.7rem] text-navy-400">단위: 억원</span>
          </div>
          <div className="mt-2">
            <FinancialTrendChart height={248} />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.05 }}
          className="card order-4 p-5 lg:order-2 lg:col-span-4"
          aria-label="자산 구성 현황"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[1.02rem] font-bold text-navy-900">
              자산 구성 현황
            </h2>
            <span className="text-[0.7rem] text-navy-400">{year}년</span>
          </div>
          <div className="mt-4">
            <AssetCompositionChart year={year} />
          </div>
        </motion.section>

        <div className="order-5 lg:order-3 lg:col-span-3">
          <CashflowCard year={year} />
        </div>
        <div className="order-2 lg:order-4 lg:col-span-4">
          <BriefingCard year={year} />
        </div>
        <div className="order-3 lg:order-5 lg:col-span-4">
          <AxRecoPanel />
        </div>
        <div className="order-6 lg:col-span-4">
          <TopCustomersCard />
        </div>
      </div>

      {/* 하단 지표 스트립 */}
      <div className="mt-4">
        <BottomStrip year={year} />
      </div>
    </div>
  );
}
