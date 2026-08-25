import { getCashPosition, getYtdComparison, isEstimatedYear } from "@/lib/data/monthly";
import { getYear } from "@/lib/data/finance";
import {
  getInventorySummary,
  getOverdueCustomers,
  getProduct,
  getProductStats,
} from "@/lib/data/derived";
import { SEED_QUOTES } from "@/lib/data/seed";
import {
  CURRENT_MONTH,
  CURRENT_YEAR,
  LAST_CLOSED_YEAR,
  formatKRW,
  formatNumber,
} from "@/lib/utils/format";

/**
 * 의사결정 레이어 — "지금 어떤 상태인가 / 왜 그렇게 보는가 / 무엇을 할 것인가".
 *
 * 화면에 숫자만 놓으면 대표가 매번 스스로 해석해야 한다. 이 모듈은 지표마다
 * 규칙으로 판정(tone)과 근거(basis), 다음 행동(action)을 만들어 붙인다.
 * 모든 판정은 임계값이 코드에 드러나 있어 왜 그 결론이 나왔는지 추적할 수 있다.
 * 예측이 아니라 현재 데이터에 대한 해석이며, 확정 실적이 아닌 값은 estimated로 표시한다.
 */

export type DecisionTone = "good" | "watch" | "risk" | "neutral";

export interface Decision {
  id: string;
  /** 지표 이름 */
  label: string;
  /** 현재 값 (표시용 문자열) */
  value: string;
  /** 값 뒤에 붙는 단위 */
  unit?: string;
  /** 전년 동기 대비 증감률(%) — 없으면 비교 불가 */
  deltaPct: number | null;
  /** 증감이 위쪽일 때 좋은 신호인지 */
  goodWhenUp: boolean;
  /** 비교 대상 설명 */
  comparedTo: string;
  /** 한 줄 판정 */
  verdict: string;
  tone: DecisionTone;
  /** 그렇게 판단한 근거 — 숫자로 말한다 */
  basis: string;
  /** 다음에 할 일 */
  action: string;
  /** 행동으로 이동하는 링크 */
  href: string;
  actionLabel: string;
  /** 확정 실적이 아닌 추정치 여부 */
  estimated?: boolean;
}

const pct = (n: number, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;

/** 진행 연도 실적 — 매출 / 영업이익 / 순이익 */
export function getPerformanceDecisions(): Decision[] {
  const ytdCmp = getYtdComparison();
  const lastFull = getYear(LAST_CLOSED_YEAR);
  const estimated = isEstimatedYear(CURRENT_YEAR);
  const monthsLeft = 12 - CURRENT_MONTH;

  const rev = ytdCmp.revenue;
  const op = ytdCmp.operatingProfit;
  const pace = ytdCmp.paceVsLastFullYear ?? 0;
  // 현재 월까지 지나간 비율. 이보다 진도가 앞서면 연간 초과 페이스다.
  const elapsedPct = (CURRENT_MONTH / 12) * 100;
  const opMargin = rev.current > 0 ? (op.current / rev.current) * 100 : 0;
  const prevOpMargin =
    rev.previous > 0 ? (op.previous / rev.previous) * 100 : 0;

  const revTone: DecisionTone =
    rev.deltaPct == null ? "neutral" : rev.deltaPct >= 5 ? "good" : rev.deltaPct >= -5 ? "watch" : "risk";

  const decisions: Decision[] = [
    {
      id: "revenue",
      label: "누적 매출",
      value: rev.current.toFixed(2),
      unit: "억원",
      deltaPct: rev.deltaPct,
      goodWhenUp: true,
      comparedTo: `${LAST_CLOSED_YEAR}년 1~${CURRENT_MONTH}월`,
      tone: revTone,
      verdict:
        rev.deltaPct == null
          ? "비교할 전년 실적이 없습니다"
          : rev.deltaPct >= 5
            ? `전년 같은 기간보다 ${rev.deltaAbs.toFixed(2)}억원 앞서 있습니다`
            : rev.deltaPct >= -5
              ? "전년 같은 기간과 비슷한 수준입니다"
              : `전년 같은 기간보다 ${Math.abs(rev.deltaAbs).toFixed(2)}억원 뒤처져 있습니다`,
      basis: `${CURRENT_MONTH}개월 경과(${elapsedPct.toFixed(0)}%) 시점에 전년 연간 실적 ${lastFull.revenue.toFixed(2)}억원의 ${pace.toFixed(0)}%를 달성했습니다.`,
      action:
        pace >= elapsedPct
          ? `남은 ${monthsLeft}개월도 이 속도면 전년 실적을 넘어섭니다. 9~10월 성수기 물량을 미리 확보해 두세요.`
          : `연간 기준을 맞추려면 남은 ${monthsLeft}개월에 월 ${((lastFull.revenue - rev.current) / Math.max(1, monthsLeft)).toFixed(2)}억원이 필요합니다. 재구매 시점이 지난 거래처부터 접촉하세요.`,
      href: "/insights",
      actionLabel: "매출 기회 보기",
      estimated,
    },
    {
      id: "operating",
      label: "누적 영업이익",
      value: op.current.toFixed(2),
      unit: "억원",
      deltaPct: op.deltaPct,
      goodWhenUp: true,
      comparedTo: `${LAST_CLOSED_YEAR}년 1~${CURRENT_MONTH}월`,
      tone: opMargin >= prevOpMargin ? "good" : "watch",
      verdict:
        opMargin >= prevOpMargin
          ? `영업이익률이 ${prevOpMargin.toFixed(1)}% → ${opMargin.toFixed(1)}%로 개선됐습니다`
          : `영업이익률이 ${prevOpMargin.toFixed(1)}% → ${opMargin.toFixed(1)}%로 낮아졌습니다`,
      basis: `매출은 ${rev.deltaPct == null ? "비교 불가" : pct(rev.deltaPct)}, 영업이익은 ${op.deltaPct == null ? "비교 불가" : pct(op.deltaPct)} 변동했습니다. 이익이 매출보다 ${op.deltaPct != null && rev.deltaPct != null && op.deltaPct > rev.deltaPct ? "빠르게" : "느리게"} 움직였습니다.`,
      action:
        opMargin >= prevOpMargin
          ? "단가 정책이 작동하고 있습니다. 견적 시 마진 하한을 지금 기준으로 유지하세요."
          : "저마진 거래가 늘고 있는지 확인이 필요합니다. 견적별 마진율을 점검하세요.",
      href: "/quotes",
      actionLabel: "견적 마진 점검",
      estimated,
    },
    {
      id: "net",
      label: "누적 순이익",
      value: ytdCmp.netProfit.current.toFixed(2),
      unit: "억원",
      deltaPct: ytdCmp.netProfit.deltaPct,
      goodWhenUp: true,
      comparedTo: `${LAST_CLOSED_YEAR}년 1~${CURRENT_MONTH}월`,
      tone:
        ytdCmp.netProfit.deltaPct == null
          ? "neutral"
          : ytdCmp.netProfit.deltaPct >= 0
            ? "good"
            : "watch",
      verdict:
        ytdCmp.netProfit.current >= 0
          ? `${CURRENT_MONTH}개월간 ${ytdCmp.netProfit.current.toFixed(2)}억원이 남았습니다`
          : "누적 손실 구간입니다",
      basis: `순이익률 ${rev.current > 0 ? ((ytdCmp.netProfit.current / rev.current) * 100).toFixed(1) : "0"}%로 전년 같은 기간 ${rev.previous > 0 ? ((ytdCmp.netProfit.previous / rev.previous) * 100).toFixed(1) : "0"}% 대비 변동했습니다.`,
      action:
        "이익을 배당하지 않고 유보하면 자기자본비율이 개선됩니다. 경영분석에서 효과를 확인하세요.",
      href: "/analytics",
      actionLabel: "유보 효과 보기",
      estimated,
    },
  ];

  return decisions;
}

/** 현금 포지션 */
export function getCashDecision(): Decision {
  const cash = getCashPosition();
  const runway = cash.runwayMonths ?? 0;
  const tone: DecisionTone = runway >= 12 ? "good" : runway >= 6 ? "watch" : "risk";

  return {
    id: "cash",
    label: "현금성 자산",
    value: cash.balance.toFixed(2),
    unit: "억원",
    deltaPct: cash.comparison.deltaPct,
    goodWhenUp: true,
    comparedTo: `${LAST_CLOSED_YEAR}년 ${CURRENT_MONTH}월 말`,
    tone,
    verdict:
      cash.netChange >= 0
        ? `연초 ${cash.opening.toFixed(2)}억원에서 ${cash.netChange.toFixed(2)}억원 늘었습니다`
        : `연초 ${cash.opening.toFixed(2)}억원에서 ${Math.abs(cash.netChange).toFixed(2)}억원 줄었습니다`,
    basis: `월 고정 지출 ${(cash.fixedMonthlyOutflow * 10000).toFixed(0)}만원 기준으로 ${runway.toFixed(0)}개월을 버틸 수 있는 잔액입니다.`,
    action:
      runway >= 12
        ? "당장의 유동성 부담은 없습니다. 장기재고를 매입가 이하로 급하게 처분할 이유가 없으니 제값 받는 거래처를 찾으세요."
        : runway >= 6
          ? "6개월치 이상은 확보돼 있지만 여유는 크지 않습니다. 미회수 대금 회수 일정을 먼저 점검하세요."
          : "운영 자금이 빠듯합니다. 장기재고 현금화와 대금 회수를 동시에 진행해야 합니다.",
    href: "/analytics",
    actionLabel: "재무 상세 보기",
    estimated: true,
  };
}

/** 자기자본 — 실제 확정 실적 기반 (추정 아님) */
export function getEquityDecision(): Decision {
  const last = getYear(LAST_CLOSED_YEAR);
  const prev = getYear(LAST_CLOSED_YEAR - 1);
  const ratio = (last.equity / last.assets) * 100;
  const change = last.equity - prev.equity;
  const tone: DecisionTone = ratio < 15 ? "risk" : ratio < 30 ? "watch" : "good";

  return {
    id: "equity",
    label: "자기자본비율",
    value: ratio.toFixed(1),
    unit: "%",
    deltaPct: prev.equity !== 0 ? (change / Math.abs(prev.equity)) * 100 : null,
    goodWhenUp: true,
    comparedTo: `${LAST_CLOSED_YEAR - 1}년 말`,
    tone,
    verdict:
      ratio < 15
        ? "자본 대비 부채 비중이 높아 재무 안정성 점검이 필요합니다"
        : "자본 구조는 관리 가능한 범위입니다",
    basis: `자기자본이 ${prev.equity.toFixed(2)}억원에서 ${last.equity.toFixed(2)}억원으로 ${change >= 0 ? "" : ""}${change.toFixed(2)}억원 변동했습니다. 변동폭이 커 결산 자료 확인이 필요합니다.`,
    action:
      ratio < 15
        ? "올해 순이익을 배당하지 않고 유보하면 비율이 개선됩니다. 경영분석에서 시나리오를 비교해 보세요."
        : "현재 수준을 유지하면 됩니다. 분기마다 부채 상환 일정만 확인하세요.",
    href: "/analytics",
    actionLabel: "시나리오 비교",
  };
}

/** 재고 — 장기재고 비중 */
export function getInventoryDecision(): Decision {
  const inv = getInventorySummary();
  const longPct = inv.totalValue > 0 ? (inv.longStockValue / inv.totalValue) * 100 : 0;
  const tone: DecisionTone = longPct >= 25 ? "risk" : longPct >= 10 ? "watch" : "good";

  // 가장 오래 묶여 있는 품목을 근거로 든다
  const worst = inv.longStockIds
    .map((id) => ({ product: getProduct(id), stats: getProductStats(id) }))
    .sort((a, b) => b.stats.idleDays - a.stats.idleDays)[0];

  return {
    id: "inventory",
    label: "장기재고",
    value: formatKRW(inv.longStockValue),
    deltaPct: null,
    goodWhenUp: false,
    comparedTo: `전체 재고 ${formatKRW(inv.totalValue)}`,
    tone,
    verdict:
      inv.longStockCount === 0
        ? "120일 이상 묶인 재고가 없습니다"
        : `재고금액의 ${longPct.toFixed(0)}%가 ${inv.longStockCount}개 품목에 묶여 있습니다`,
    basis: worst?.product
      ? `가장 오래된 품목은 ${worst.product.material} ${worst.product.color} ${worst.product.thicknessMm}mm로 ${worst.stats.idleDays}일간 출고가 없었습니다. 재고 ${formatNumber(worst.product.stockQty)}평, ${formatKRW(worst.stats.stockValue)} 규모입니다.`
      : `관심 단계 ${inv.watchCount}개 품목이 90일을 넘겼습니다.`,
    action:
      inv.longStockCount === 0
        ? "현재 회전율을 유지하세요."
        : `AX 추천에서 이 품목을 살 가능성이 높은 거래처를 확인하고 견적부터 보내세요. 묶인 ${formatKRW(inv.longStockValue)}이 현금으로 돌아옵니다.`,
    href: "/inventory?status=장기재고",
    actionLabel: "장기재고 보기",
  };
}

/** 거래처 — 재구매 시점이 지난 곳 */
export function getCustomerDecision(): Decision {
  const overdue = getOverdueCustomers();
  const potential = overdue.reduce((s, o) => s + o.stats.avgOrderValue, 0);
  const tone: DecisionTone = overdue.length >= 5 ? "risk" : overdue.length >= 2 ? "watch" : "good";
  const worst = [...overdue].sort(
    (a, b) => (b.stats.cycleRatio ?? 0) - (a.stats.cycleRatio ?? 0)
  )[0];

  return {
    id: "customers",
    label: "재접촉 대상",
    value: String(overdue.length),
    unit: "곳",
    deltaPct: null,
    goodWhenUp: false,
    comparedTo: "평균 재구매 주기 기준",
    tone,
    verdict:
      overdue.length === 0
        ? "재구매 주기를 넘긴 거래처가 없습니다"
        : `${overdue.length}곳이 평균 재구매 주기를 지났습니다`,
    basis: worst
      ? `가장 오래된 곳은 ${worst.customer.name}으로 마지막 거래 후 ${worst.stats.elapsedDays}일이 지났습니다. 평균 주기 ${worst.stats.cycleDays}일의 ${((worst.stats.cycleRatio ?? 0) * 100).toFixed(0)}% 수준입니다.`
      : "전 거래처가 주기 내에 있습니다.",
    action:
      overdue.length === 0
        ? "접촉 주기를 유지하세요."
        : `과거 평균 주문금액 기준으로 ${formatKRW(potential)} 규모의 재구매 기회입니다. 주기를 가장 많이 넘긴 곳부터 연락하세요.`,
    href: "/customers?filter=재접촉 필요",
    actionLabel: "거래처 확인",
  };
}

/** 견적 — 진행 중 파이프라인 */
export function getQuoteDecision(): Decision {
  const active = SEED_QUOTES.filter((q) =>
    ["작성중", "발송", "검토"].includes(q.status)
  );
  const amount = active.reduce(
    (s, q) => s + q.items.reduce((a, i) => a + i.qty * i.unitPrice, 0),
    0
  );
  const stale = active.filter((q) => q.status === "작성중").length;
  const tone: DecisionTone = active.length === 0 ? "watch" : stale > 0 ? "watch" : "good";

  return {
    id: "quotes",
    label: "진행 중 견적",
    value: String(active.length),
    unit: "건",
    deltaPct: null,
    goodWhenUp: true,
    comparedTo: "작성중·발송·검토 단계",
    tone,
    verdict:
      active.length === 0
        ? "진행 중인 견적이 없습니다"
        : `${formatKRW(amount)} 규모가 파이프라인에 있습니다`,
    basis:
      stale > 0
        ? `${active.length}건 중 ${stale}건이 아직 '작성중'이라 거래처에 전달되지 않았습니다.`
        : `${active.length}건 모두 거래처에 전달돼 회신을 기다리는 단계입니다.`,
    action:
      active.length === 0
        ? "AX 추천에서 견적을 만들어 파이프라인을 채우세요."
        : stale > 0
          ? "작성중 견적을 먼저 발송하세요. 보내지 않은 견적은 매출로 이어지지 않습니다."
          : "발송 후 3일이 지난 건은 확인 전화를 돌리세요.",
    href: "/quotes",
    actionLabel: "견적 관리",
  };
}

/** 대시보드 하단 요약 스트립에 쓰는 의사결정 묶음 */
export function getOperationDecisions(): Decision[] {
  return [
    getInventoryDecision(),
    getCustomerDecision(),
    getQuoteDecision(),
    getEquityDecision(),
  ];
}
