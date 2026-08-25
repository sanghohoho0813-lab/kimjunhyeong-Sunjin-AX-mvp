import {
  customerTransactions,
  getCustomer,
  getCustomerStats,
  getProduct,
} from "@/lib/data/derived";
import { CUSTOMERS } from "@/lib/data/seed";
import { clamp } from "@/lib/utils/format";
import type { MatchBreakdownItem, MatchResult } from "@/types";

/**
 * AX 판매처 매칭 점수 (0~100, 시연용 룰 기반)
 * 배점: 소재 매칭 30 / 컬러·두께 매칭 20 / 재구매 타이밍 20 / 구매 빈도 15 / 거래 가치 15
 */
export function calculateCustomerProductMatch(
  productId: string,
  customerId: string
): MatchResult {
  const product = getProduct(productId);
  const customer = getCustomer(customerId);
  const stats = getCustomerStats(customerId);
  const txs = customerTransactions(customerId);
  const reasons: string[] = [];

  if (!product || !customer) {
    return { score: 0, label: "낮음", reasons: [], breakdown: [] };
  }

  // 1) 소재 매칭 (30점) — 동일 소재 구매 이력 + 선호 소재
  const sameMaterialTxs = txs.filter(
    (t) => getProduct(t.productId)?.material === product.material
  );
  const sameProductTxs = txs.filter((t) => t.productId === product.id);
  let material = 0;
  if (sameProductTxs.length > 0) {
    material = 30;
    reasons.push(`동일 품목(${product.code})을 ${sameProductTxs.length}회 구매했습니다.`);
  } else if (sameMaterialTxs.length > 0) {
    material = clamp(14 + sameMaterialTxs.length * 4, 14, 28);
    reasons.push(
      `${product.material} 소재를 ${sameMaterialTxs.length}회 구매한 이력이 있습니다.`
    );
  } else if (customer.preferredMaterials.includes(product.material)) {
    material = 12;
    reasons.push(`${product.material} 소재 선호 거래처입니다.`);
  }

  // 2) 컬러·두께 매칭 (20점)
  let style = 0;
  const colorTxs = txs.filter(
    (t) => getProduct(t.productId)?.color === product.color
  );
  const colorShare = txs.length ? colorTxs.length / txs.length : 0;
  if (colorShare >= 0.5 && txs.length >= 2) {
    style += 10;
    reasons.push(
      `${product.color} 계열 구매 비중이 ${Math.round(colorShare * 100)}%로 높습니다.`
    );
  } else if (
    colorTxs.length > 0 ||
    customer.preferredColors.includes(product.color)
  ) {
    style += 6;
  }
  const [minT, maxT] = customer.preferredThickness;
  if (product.thicknessMm >= minT && product.thicknessMm <= maxT) {
    style += 10;
  } else if (
    product.thicknessMm >= minT - 0.2 &&
    product.thicknessMm <= maxT + 0.2
  ) {
    style += 5;
  }
  style = clamp(style, 0, 20);

  // 3) 재구매 타이밍 (20점)
  const r = stats.cycleRatio;
  let timing = 8;
  if (r != null) {
    if (r >= 0.85 && r <= 1.6) {
      timing = 20;
      const overDays = Math.round(stats.elapsedDays! - stats.cycleDays);
      if (overDays >= 0)
        reasons.push(`평균 재구매 주기를 ${overDays}일 지나 접촉 적기입니다.`);
    } else if (r > 1.6 && r <= 2.5) timing = 13;
    else if (r < 0.85 && r >= 0.5) timing = 10;
    else if (r < 0.5) timing = 5;
    else timing = 6;
  }

  // 4) 구매 빈도 (15점)
  const freq = clamp((stats.orderCount / 8) * 15, 2, 15);

  // 5) 거래 가치 (15점)
  const value = clamp((stats.totalRevenue / 120_000_000) * 15, 2, 15);

  const breakdown: MatchBreakdownItem[] = [
    { key: "material", label: "소재 매칭", earned: Math.round(material), max: 30 },
    { key: "style", label: "컬러·두께", earned: Math.round(style), max: 20 },
    { key: "timing", label: "재구매 타이밍", earned: Math.round(timing), max: 20 },
    { key: "frequency", label: "구매 빈도", earned: Math.round(freq), max: 15 },
    { key: "value", label: "거래 가치", earned: Math.round(value), max: 15 },
  ];

  const score = Math.round(clamp(material + style + timing + freq + value, 0, 100));
  return { score, label: matchLabel(score), reasons: reasons.slice(0, 3), breakdown };
}

export function matchLabel(score: number): string {
  if (score >= 75) return "높음";
  if (score >= 55) return "보통 이상";
  if (score >= 35) return "관찰";
  return "낮음";
}

/** 특정 제품에 대한 추천 판매처 목록 (점수순) */
export function getRecommendedBuyers(productId: string, limit = 5) {
  return CUSTOMERS.map((c) => ({
    customer: c,
    match: calculateCustomerProductMatch(productId, c.id),
  }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);
}
