import { CASH_BY_YEAR, FINANCIALS, getYear } from "./finance";
import { CURRENT_MONTH, CURRENT_YEAR, LAST_CLOSED_YEAR } from "@/lib/utils/format";

/**
 * 월별 실적 시리즈 — "현재 시점 누적"을 계산하기 위한 층.
 *
 * 왜 별도 파일인가:
 * 회사에 확정돼 있는 것은 연간 실적(lib/data/finance.ts)뿐이고 월별 수치는 없다.
 * 그렇다고 거래 원장(lib/data/seed.ts)의 합계를 쓰면 규모가 맞지 않는다.
 * 원장은 "추적 중인 거래처 12곳의 거래 샘플"이라 연간 합계가 실제 매출의
 * 일부에 불과하다. 두 값을 한 화면에 같이 두면 서로 모순돼 보인다.
 *
 * 그래서 이 파일은 확정된 연간 실적을 월별로 배분한다.
 *  - 완료 연도(2025)는 월 합계가 연간 실적과 정확히 일치한다.
 *  - 진행 연도(2026)는 시연용 추정이며 화면에서 '추정'으로 표기한다.
 * 원장은 거래처·재고·AX 판단에 그대로 쓰인다. 역할이 다르다.
 */

/** 피혁 수요 계절성 — 봄/가을 시즌 전 발주가 몰린다. 합이 1이 되도록 정규화한다. */
const SEASONALITY = [
  0.072, // 1월 — 연초 비수기
  0.078, // 2월
  0.096, // 3월 — 봄 시즌 준비
  0.101, // 4월
  0.092, // 5월
  0.079, // 6월
  0.071, // 7월 — 하계 비수기
  0.083, // 8월 — 추동 시즌 준비 시작
  0.104, // 9월 — 성수기
  0.098, // 10월
  0.069, // 11월
  0.057, // 12월
];

const SEASON_SUM = SEASONALITY.reduce((a, b) => a + b, 0);
const WEIGHT = SEASONALITY.map((w) => w / SEASON_SUM);

/** 진행 연도(2026) 성장 가정 — 시연용. 화면에서 '추정'으로 표기한다. */
const CURRENT_YEAR_ASSUMPTION = {
  /** 매출: 전년 대비 소폭 성장 */
  revenueGrowth: 0.086,
  /** 영업이익률: 전년보다 개선 (장기재고 소진·단가 관리 효과 가정) */
  operatingMarginPct: 10.4,
  /** 순이익률 */
  netMarginPct: 9.1,
};

export interface MonthPoint {
  year: number;
  month: number; // 1~12
  revenue: number; // 억원
  operatingProfit: number; // 억원
  netProfit: number; // 억원
}

function buildYear(
  year: number,
  revenue: number,
  operatingProfit: number,
  netProfit: number
): MonthPoint[] {
  return WEIGHT.map((w, i) => ({
    year,
    month: i + 1,
    revenue: revenue * w,
    operatingProfit: operatingProfit * w,
    netProfit: netProfit * w,
  }));
}

/** 완료 연도들 — 월 합계가 연간 확정 실적과 일치한다. */
const CLOSED_MONTHS: MonthPoint[] = FINANCIALS.flatMap((f) =>
  buildYear(f.year, f.revenue, f.operatingProfit, f.netProfit)
);

/** 진행 연도 — 확정 실적이 없어 가정에 따라 생성한 추정치. */
const lastClosed = getYear(LAST_CLOSED_YEAR);
const currentYearRevenue =
  lastClosed.revenue * (1 + CURRENT_YEAR_ASSUMPTION.revenueGrowth);

const CURRENT_MONTHS: MonthPoint[] = buildYear(
  CURRENT_YEAR,
  currentYearRevenue,
  (currentYearRevenue * CURRENT_YEAR_ASSUMPTION.operatingMarginPct) / 100,
  (currentYearRevenue * CURRENT_YEAR_ASSUMPTION.netMarginPct) / 100
);

export const MONTHLY: MonthPoint[] = [...CLOSED_MONTHS, ...CURRENT_MONTHS];

/** 해당 연도의 1월 ~ throughMonth 누적 */
export function ytd(year: number, throughMonth: number = CURRENT_MONTH) {
  const rows = MONTHLY.filter((m) => m.year === year && m.month <= throughMonth);
  return {
    revenue: rows.reduce((s, m) => s + m.revenue, 0),
    operatingProfit: rows.reduce((s, m) => s + m.operatingProfit, 0),
    netProfit: rows.reduce((s, m) => s + m.netProfit, 0),
    months: rows.length,
  };
}

/** 진행 연도가 확정 실적이 아닌지 여부 — 화면 표기에 사용 */
export function isEstimatedYear(year: number): boolean {
  return !FINANCIALS.some((f) => f.year === year);
}

/**
 * 현재 시점 누적 vs 전년 동기.
 * 같은 개월 수(1월~현재월)끼리 비교하므로 연간 실적과 섞이지 않는다.
 */
export interface YtdComparison {
  label: string;
  current: number;
  previous: number;
  deltaPct: number | null;
  deltaAbs: number;
}

function compare(label: string, cur: number, prev: number): YtdComparison {
  return {
    label,
    current: cur,
    previous: prev,
    deltaPct: prev === 0 ? null : ((cur - prev) / Math.abs(prev)) * 100,
    deltaAbs: cur - prev,
  };
}

export function getYtdComparison(throughMonth: number = CURRENT_MONTH) {
  const cur = ytd(CURRENT_YEAR, throughMonth);
  const prev = ytd(LAST_CLOSED_YEAR, throughMonth);
  return {
    throughMonth,
    revenue: compare("누적 매출", cur.revenue, prev.revenue),
    operatingProfit: compare("누적 영업이익", cur.operatingProfit, prev.operatingProfit),
    netProfit: compare("누적 순이익", cur.netProfit, prev.netProfit),
    /** 연간 실적 대비 현재까지의 진도 (전년 연간 = 100%) */
    paceVsLastFullYear:
      getYear(LAST_CLOSED_YEAR).revenue > 0
        ? (cur.revenue / getYear(LAST_CLOSED_YEAR).revenue) * 100
        : null,
  };
}

/**
 * 현재 시점 현금성 자산 — 전년 말 잔액에서 월별 순증감을 누적한다.
 *
 * 현금 유입 계수는 임의로 정하지 않고 완료 연도(2025) 실적에서 역산한다.
 *   기말잔액 = 기초잔액 + 매출 x 계수 - 고정지출 x 12
 * 이렇게 하면 완료 연도를 이 모델로 돌렸을 때 실제 기말 현금성 자산과
 * 정확히 일치하고, 같은 계수를 진행 연도에 적용한 값이 추정치가 된다.
 */
const FIXED_MONTHLY_OUTFLOW = 0.082; // 억원 — 인건비·임차료 등 고정 지출 가정

/** 완료 연도 실적으로부터 역산한 매출 대비 현금 유입 계수 */
const CASH_CONVERSION = (() => {
  const opening = CASH_BY_YEAR[LAST_CLOSED_YEAR - 1] ?? 0;
  const closing = CASH_BY_YEAR[LAST_CLOSED_YEAR] ?? 0;
  const revenue = getYear(LAST_CLOSED_YEAR).revenue;
  if (revenue <= 0) return 0;
  return (closing - opening + FIXED_MONTHLY_OUTFLOW * 12) / revenue;
})();

function runBalance(year: number, months: number) {
  let balance = CASH_BY_YEAR[year - 1] ?? 0;
  const series: { month: number; balance: number; net: number }[] = [];
  for (const m of MONTHLY.filter((x) => x.year === year && x.month <= months)) {
    const net = m.revenue * CASH_CONVERSION - FIXED_MONTHLY_OUTFLOW;
    balance += net;
    series.push({ month: m.month, balance, net });
  }
  return series;
}

export function getCashPosition(throughMonth: number = CURRENT_MONTH) {
  const opening = CASH_BY_YEAR[LAST_CLOSED_YEAR] ?? 0;
  const cur = runBalance(CURRENT_YEAR, throughMonth);
  const prev = runBalance(LAST_CLOSED_YEAR, throughMonth);
  const balance = cur.at(-1)?.balance ?? opening;
  const previousYearBalance = prev.at(-1)?.balance ?? 0;

  return {
    opening,
    balance,
    previousYearBalance,
    netChange: balance - opening,
    comparison: compare("현금성 자산", balance, previousYearBalance),
    series: cur,
    /** 고정 지출만 기준으로 버틸 수 있는 개월 수 */
    runwayMonths: FIXED_MONTHLY_OUTFLOW > 0 ? balance / FIXED_MONTHLY_OUTFLOW : null,
    fixedMonthlyOutflow: FIXED_MONTHLY_OUTFLOW,
  };
}
