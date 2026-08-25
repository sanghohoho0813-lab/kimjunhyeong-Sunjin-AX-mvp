"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FinancialTrendChart } from "@/components/charts/FinancialTrendChart";
import { StatusBadge } from "@/components/shared/ui";
import {
  CASH_BY_YEAR,
  FINANCIALS,
  getRatios,
  getYear,
  RECEIVABLES_BY_YEAR,
} from "@/lib/data/finance";
import { useAppStore } from "@/lib/store";
import { clsx } from "@/lib/utils/clsx";
import { formatPercent } from "@/lib/utils/format";

/** 재무 위험 신호 (규칙 기반, 시연용 평가) */
function useRiskSignals(year: number) {
  return useMemo(() => {
    const ratios = getRatios(year);
    const signals: Array<{ label: string; level: "양호" | "관찰" | "주의"; note: string }> = [];

    signals.push(
      ratios.revenueYoYPct != null && ratios.revenueYoYPct > 10
        ? { label: "매출 성장", level: "양호", note: `전년 대비 +${ratios.revenueYoYPct.toFixed(0)}%` }
        : ratios.revenueYoYPct != null && ratios.revenueYoYPct < -10
          ? { label: "매출 성장", level: "주의", note: `전년 대비 ${ratios.revenueYoYPct.toFixed(0)}%` }
          : { label: "매출 성장", level: "관찰", note: "전년과 유사한 수준" }
    );
    signals.push(
      ratios.operatingMarginPct >= 8
        ? { label: "영업 수익성", level: "양호", note: `영업이익률 ${ratios.operatingMarginPct.toFixed(1)}%` }
        : ratios.operatingMarginPct >= 3
          ? { label: "영업 수익성", level: "관찰", note: `영업이익률 ${ratios.operatingMarginPct.toFixed(1)}%` }
          : { label: "영업 수익성", level: "주의", note: `영업이익률 ${ratios.operatingMarginPct.toFixed(1)}%` }
    );
    const cash = CASH_BY_YEAR[year] ?? 0;
    signals.push(
      cash >= 1
        ? { label: "현금흐름", level: "관찰", note: `현금성 자산 ${cash.toFixed(2)}억원` }
        : { label: "현금흐름", level: "주의", note: `현금성 자산 ${cash.toFixed(2)}억원` }
    );
    signals.push(
      ratios.equityRatioPct >= 40
        ? { label: "자본 안정성", level: "양호", note: `자기자본비율 ${ratios.equityRatioPct.toFixed(1)}%` }
        : ratios.equityRatioPct >= 20
          ? { label: "자본 안정성", level: "관찰", note: `자기자본비율 ${ratios.equityRatioPct.toFixed(1)}%` }
          : { label: "자본 안정성", level: "주의", note: `자기자본비율 ${ratios.equityRatioPct.toFixed(1)}%` }
    );
    const receivables = RECEIVABLES_BY_YEAR[year] ?? 0;
    signals.push({
      label: "매출채권",
      level: "관찰",
      note: `${receivables.toFixed(2)}억원 · 회수 주기 관리`,
    });
    return signals;
  }, [year]);
}

const LEVEL_BADGE: Record<string, string> = {
  양호: "안정",
  관찰: "관심",
  주의: "재접촉 필요",
};

export default function AnalyticsPage() {
  const year = useAppStore((s) => s.periodYear);
  const pushToast = useAppStore((s) => s.pushToast);
  const fin = getYear(year);
  const ratios = getRatios(year);
  const signals = useRiskSignals(year);
  const prev = FINANCIALS.find((f) => f.year === year - 1);

  // 재무 시나리오 (시연용 Simulation — 정책자금 예측이 아님)
  const [retain, setRetain] = useState(0.5); // 이익 유보 (억)
  const [repay, setRepay] = useState(0.3); // 부채 상환 (억)

  const sim = useMemo(() => {
    const base2025 = getYear(2025);
    const cash = CASH_BY_YEAR[2025] ?? 0;
    const equity = base2025.equity + retain;
    const liabilities = Math.max(0, base2025.liabilities - repay);
    const assets = base2025.assets + retain - repay;
    const newCash = Math.max(0, cash + retain - repay);
    return {
      equity,
      liabilities,
      cash: newCash,
      debtRatio: equity > 0 ? (liabilities / equity) * 100 : null,
      equityRatio: assets > 0 ? (equity / assets) * 100 : 0,
      baseEquityRatio: (base2025.equity / base2025.assets) * 100,
    };
  }, [retain, repay]);

  const kpis = [
    { label: "매출액", value: `${fin.revenue.toFixed(2)}억` },
    { label: "영업이익률", value: formatPercent(ratios.operatingMarginPct, 1) },
    { label: "당기순이익률", value: formatPercent(ratios.netMarginPct, 1) },
    { label: "현금성 자산", value: `${(CASH_BY_YEAR[year] ?? 0).toFixed(2)}억` },
    { label: "매출채권", value: `${(RECEIVABLES_BY_YEAR[year] ?? 0).toFixed(2)}억` },
    {
      label: "자기자본",
      value: `${fin.equity.toFixed(2)}억`,
      warn: fin.equity < 1,
    },
  ];

  const changes = prev
    ? [
        { label: "매출액", from: prev.revenue, to: fin.revenue, goodUp: true },
        {
          label: "영업이익",
          from: prev.operatingProfit,
          to: fin.operatingProfit,
          goodUp: true,
        },
        { label: "당기순이익", from: prev.netProfit, to: fin.netProfit, goodUp: true },
        { label: "자기자본", from: prev.equity, to: fin.equity, goodUp: true },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="경영분석"
        subtitle="핵심 재무 지표와 위험 신호, 그리고 자본 구조 시나리오를 확인합니다."
        withPeriod
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="card p-3.5"
          >
            <p className="text-[0.7rem] font-semibold text-navy-400">{kpi.label}</p>
            <p
              className={clsx(
                "mt-1 text-[1.15rem] font-extrabold tabular-nums",
                kpi.warn ? "text-amber-600" : "text-navy-900"
              )}
            >
              {kpi.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* 재무 성과 추이 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card p-5"
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-[1.02rem] font-bold text-navy-900">
              3개년 재무 성과
            </h2>
            <span className="text-[0.7rem] text-navy-400">단위: 억원</span>
          </div>
          <div className="mt-2">
            <FinancialTrendChart height={240} />
          </div>
        </motion.section>

        {/* 재무 위험 신호 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="card p-5"
          aria-label="재무 위험 신호"
        >
          <h2 className="text-[1.02rem] font-bold text-navy-900">재무 신호</h2>
          <ul className="mt-3 space-y-2.5">
            {signals.map((signal) => (
              <li
                key={signal.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-surface-line bg-surface-soft px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[0.85rem] font-bold text-navy-800">
                    {signal.label}
                  </p>
                  <p className="text-[0.72rem] tabular-nums text-navy-400">
                    {signal.note}
                  </p>
                </div>
                <StatusBadge
                  status={LEVEL_BADGE[signal.level]}
                  className="!px-3"
                />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.68rem] leading-relaxed text-navy-400">
            시연용 룰 기반 평가입니다. 정밀한 판단은 결산자료 확인이 필요합니다.
          </p>
        </motion.section>
      </div>

      {/* 2024 → 2025 핵심 변화 */}
      {changes.length ? (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card mt-4 p-5"
          aria-label="핵심 변화"
        >
          <h2 className="text-[1.02rem] font-bold text-navy-900">
            {year - 1} → {year} 핵심 변화
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {changes.map((change) => {
              const up = change.to >= change.from;
              const good = change.goodUp ? up : !up;
              return (
                <div
                  key={change.label}
                  className="rounded-xl border border-surface-line bg-surface-soft p-3.5"
                >
                  <p className="text-[0.72rem] font-semibold text-navy-400">
                    {change.label}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[0.9rem] font-bold tabular-nums">
                    <span className="text-navy-400">{change.from.toFixed(2)}억</span>
                    <ArrowRight className="h-3.5 w-3.5 text-navy-300" aria-hidden />
                    <span className={good ? "text-navy-900" : "text-amber-600"}>
                      {change.to.toFixed(2)}억
                    </span>
                  </div>
                  <p
                    className={clsx(
                      "mt-1 flex items-center gap-1 text-[0.72rem] font-bold",
                      good ? "text-emerald-600" : "text-amber-600"
                    )}
                  >
                    {up ? (
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {up ? "+" : ""}
                    {(change.to - change.from).toFixed(2)}억원
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl bg-navy-50/60 p-4 text-[0.82rem] leading-relaxed text-navy-600">
            <p>2025년은 매출과 수익성이 크게 회복되었습니다.</p>
            <p className="mt-1">
              반면 자기자본이 감소하면서 재무 안정성 관련 지표는 약화되었습니다.
              자본 변동폭이 커 상세 원인은 결산자료 확인이 필요합니다.
            </p>
            <p className="mt-1">
              현 단계에서는 수익 확대와 함께 자본 구조 및 현금흐름을 함께
              관리하는 것이 중요합니다.
            </p>
          </div>
        </motion.section>
      ) : null}

      {/* 재무 시나리오 */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="card mt-4 p-5"
        aria-label="재무 시나리오"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-[1.02rem] font-bold text-navy-900">
            <Calculator className="h-4 w-4 text-brand-600" aria-hidden />
            재무 시나리오 (2025년 기준)
          </h2>
          <button
            onClick={() => {
              setRetain(0.5);
              setRepay(0.3);
              pushToast("시나리오가 초기화되었습니다.");
            }}
            className="flex h-8 items-center gap-1 rounded-btn border border-surface-line px-3 text-[0.75rem] font-semibold text-navy-500 transition-colors hover:border-navy-300"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> 초기화
          </button>
        </div>
        <p className="mt-1 text-[0.75rem] text-navy-400">
          이익 유보와 부채 상환 계획에 따른 자본 구조 변화를 가늠해보는 경영
          Simulation입니다.
        </p>

        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="sim-retain"
                  className="text-[0.82rem] font-bold text-navy-700"
                >
                  연간 이익 유보
                </label>
                <span className="text-[0.85rem] font-extrabold tabular-nums text-brand-700">
                  {retain.toFixed(1)}억원
                </span>
              </div>
              <input
                id="sim-retain"
                type="range"
                min={0}
                max={1.5}
                step={0.1}
                value={retain}
                onChange={(e) => setRetain(Number(e.target.value))}
                className="mt-2 w-full accent-brand-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="sim-repay"
                  className="text-[0.82rem] font-bold text-navy-700"
                >
                  부채 상환
                </label>
                <span className="text-[0.85rem] font-extrabold tabular-nums text-brand-700">
                  {repay.toFixed(1)}억원
                </span>
              </div>
              <input
                id="sim-repay"
                type="range"
                min={0}
                max={1.2}
                step={0.1}
                value={repay}
                onChange={(e) => setRepay(Number(e.target.value))}
                className="mt-2 w-full accent-brand-600"
              />
            </div>
            <p className="text-[0.68rem] leading-relaxed text-navy-400">
              단순화된 시연용 계산입니다. 실제 재무 계획은 세무·회계 전문가와
              함께 검토가 필요합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "예상 자기자본",
                value: `${sim.equity.toFixed(2)}억`,
                sub: `현재 0.09억 → +${retain.toFixed(1)}억`,
              },
              {
                label: "예상 부채",
                value: `${sim.liabilities.toFixed(2)}억`,
                sub: `상환 ${repay.toFixed(1)}억 반영`,
              },
              {
                label: "예상 현금 잔액",
                value: `${sim.cash.toFixed(2)}억`,
                sub: "유보 - 상환 반영",
              },
              {
                label: "예상 자기자본비율",
                value: formatPercent(sim.equityRatio, 1),
                sub:
                  sim.equityRatio > sim.baseEquityRatio
                    ? `현재 ${sim.baseEquityRatio.toFixed(1)}% 대비 개선`
                    : `현재 ${sim.baseEquityRatio.toFixed(1)}%`,
                highlight: sim.equityRatio > 20,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-surface-line bg-surface-soft p-3.5"
              >
                <p className="text-[0.7rem] font-semibold text-navy-400">
                  {item.label}
                </p>
                <p
                  className={clsx(
                    "mt-1 text-[1.15rem] font-extrabold tabular-nums",
                    item.highlight ? "text-teal-600" : "text-navy-900"
                  )}
                >
                  {item.value}
                </p>
                <p className="mt-0.5 text-[0.68rem] text-navy-400">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
