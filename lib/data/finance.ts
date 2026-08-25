import type { FinancialYear } from "@/types";

/**
 * 선진산업 재무 실적 (제공 자료 기준, 단위: 억원)
 * — 2025년 자기자본 감소는 핵심 모니터링 신호로 다룬다.
 */
export const FINANCIALS: FinancialYear[] = [
  {
    year: 2023,
    revenue: 12.43,
    operatingProfit: 1.5,
    netProfit: 1.36,
    assets: 6.22,
    liabilities: 2.5,
    equity: 3.73,
  },
  {
    year: 2024,
    revenue: 6.34,
    operatingProfit: 0.25,
    netProfit: 0.13,
    assets: 5.75,
    liabilities: 1.9,
    equity: 3.86,
  },
  {
    year: 2025,
    revenue: 12.95,
    operatingProfit: 1.2,
    netProfit: 1.11,
    assets: 2.05,
    liabilities: 1.97,
    equity: 0.09,
  },
];

/** 연도별 현금성 자산 (시연용 추정 포함, 단위: 억원) */
export const CASH_BY_YEAR: Record<number, number> = {
  2023: 0.42,
  2024: 0.09,
  2025: 1.2,
};

/** 연도별 매출채권 (시연용 추정, 단위: 억원) */
export const RECEIVABLES_BY_YEAR: Record<number, number> = {
  2023: 1.02,
  2024: 0.58,
  2025: 0.45,
};

export function getYear(year: number): FinancialYear {
  const found = FINANCIALS.find((f) => f.year === year);
  return found ?? FINANCIALS[FINANCIALS.length - 1];
}

export const LATEST_YEAR = 2025;

export interface FinancialRatios {
  operatingMarginPct: number;
  netMarginPct: number;
  debtRatioPct: number; // 부채 / 자기자본
  equityRatioPct: number; // 자기자본 / 자산
  roePct: number | null; // 순이익 / 평균 자기자본
  revenueYoYPct: number | null;
  operatingYoYPct: number | null;
  netYoYPct: number | null;
  equityChangeEok: number | null;
}

export function getRatios(year: number): FinancialRatios {
  const cur = getYear(year);
  const prev = FINANCIALS.find((f) => f.year === year - 1) ?? null;
  const yoy = (c: number, p: number | undefined | null) =>
    p == null || p === 0 ? null : ((c - p) / Math.abs(p)) * 100;
  const avgEquity = prev ? (cur.equity + prev.equity) / 2 : cur.equity;
  return {
    operatingMarginPct: (cur.operatingProfit / cur.revenue) * 100,
    netMarginPct: (cur.netProfit / cur.revenue) * 100,
    debtRatioPct: cur.equity > 0 ? (cur.liabilities / cur.equity) * 100 : Infinity,
    equityRatioPct: (cur.equity / cur.assets) * 100,
    roePct: avgEquity > 0 ? (cur.netProfit / avgEquity) * 100 : null,
    revenueYoYPct: yoy(cur.revenue, prev?.revenue),
    operatingYoYPct: yoy(cur.operatingProfit, prev?.operatingProfit),
    netYoYPct: yoy(cur.netProfit, prev?.netProfit),
    equityChangeEok: prev ? cur.equity - prev.equity : null,
  };
}
