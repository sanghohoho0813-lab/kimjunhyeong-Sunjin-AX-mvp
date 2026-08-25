import {
  customerTransactions,
  getProduct,
  getProductStats,
} from "@/lib/data/derived";
import { formatPercent } from "@/lib/utils/format";
import type { PriceRecommendation, QuoteItem } from "@/types";

/** 최소 목표 마진율 (시연용 기준) */
export const MIN_TARGET_MARGIN = 0.18;

/**
 * 추천 견적 단가 계산 (시연용 의사결정 참고 로직)
 * Base(최근 평균 판매가) → 거래처 과거 단가 반영 → 수량 구간 할인 → 최소 마진 가드
 */
export function calculateRecommendedPrice(
  productId: string,
  customerId: string,
  qty: number
): PriceRecommendation {
  const product = getProduct(productId);
  const stats = getProductStats(productId);
  const notes: string[] = [];

  if (!product) {
    return {
      recommendedPrice: 0,
      basePrice: 0,
      customerAvgPrice: null,
      quantityDiscountRate: 0,
      marginRate: 0,
      minPriceByMarginGuard: 0,
      notes: [],
    };
  }

  // 1) Base: 최근 평균 판매가 (판매 이력 없으면 권장 판매가)
  const basePrice = stats.recentAvgPrice || product.listPricePerUnit;

  // 2) 거래처 과거 단가 반영 (해당 제품 → 없으면 동일 소재)
  const custTxs = customerTransactions(customerId);
  const sameProduct = custTxs.filter((t) => t.productId === productId);
  const sameMaterial = custTxs.filter(
    (t) => getProduct(t.productId)?.material === product.material
  );
  let customerAvgPrice: number | null = null;
  if (sameProduct.length) {
    customerAvgPrice =
      sameProduct.reduce((s, t) => s + t.unitPrice, 0) / sameProduct.length;
  } else if (sameMaterial.length) {
    const ratios = sameMaterial.map((t) => {
      const p = getProduct(t.productId);
      return p ? t.unitPrice / p.listPricePerUnit : 1;
    });
    const avgRatio = ratios.reduce((s, r) => s + r, 0) / ratios.length;
    customerAvgPrice = product.listPricePerUnit * avgRatio;
  }

  let price = customerAvgPrice != null
    ? basePrice * 0.55 + customerAvgPrice * 0.45
    : basePrice;

  // 3) 수량 구간 할인
  let quantityDiscountRate = 0;
  if (qty >= 500) quantityDiscountRate = 0.05;
  else if (qty >= 300) quantityDiscountRate = 0.03;
  else if (qty >= 150) quantityDiscountRate = 0.015;
  price *= 1 - quantityDiscountRate;
  if (quantityDiscountRate > 0) {
    notes.push(
      `수량 ${qty.toLocaleString()}평 구간 할인 ${formatPercent(
        quantityDiscountRate * 100,
        1
      )} 반영`
    );
  }

  // 4) 최소 마진 가드
  const minPriceByMarginGuard = Math.ceil(
    product.costPerUnit / (1 - MIN_TARGET_MARGIN) / 100
  ) * 100;
  if (price < minPriceByMarginGuard) {
    price = minPriceByMarginGuard;
    notes.push(
      `최소 목표 마진 ${formatPercent(MIN_TARGET_MARGIN * 100, 0)} 확보를 위해 하한가를 적용했습니다.`
    );
  }

  const recommendedPrice = Math.round(price / 100) * 100;
  const marginRate =
    recommendedPrice > 0
      ? ((recommendedPrice - product.costPerUnit) / recommendedPrice) * 100
      : 0;

  if (customerAvgPrice != null) {
    const diff = ((recommendedPrice - customerAvgPrice) / customerAvgPrice) * 100;
    notes.unshift(
      `해당 거래처 최근 평균 단가 대비 ${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`
    );
  } else {
    notes.unshift("해당 거래처의 과거 단가 이력이 없어 최근 평균 판매가를 기준으로 했습니다.");
  }

  return {
    recommendedPrice,
    basePrice: Math.round(basePrice),
    customerAvgPrice: customerAvgPrice != null ? Math.round(customerAvgPrice) : null,
    quantityDiscountRate,
    marginRate,
    minPriceByMarginGuard,
    notes,
  };
}

/** 견적 합계 — 예상 매출·원가·마진 */
export function quoteTotals(items: QuoteItem[]): {
  revenue: number;
  cost: number;
  margin: number;
  marginRate: number;
} {
  let revenue = 0;
  let cost = 0;
  for (const item of items) {
    const product = getProduct(item.productId);
    revenue += item.qty * item.unitPrice;
    cost += item.qty * (product?.costPerUnit ?? 0);
  }
  const margin = revenue - cost;
  return {
    revenue,
    cost,
    margin,
    marginRate: revenue > 0 ? (margin / revenue) * 100 : 0,
  };
}

/** 임의 단가에 대한 마진율(%) */
export function marginRateFor(productId: string, unitPrice: number): number {
  const product = getProduct(productId);
  if (!product || unitPrice <= 0) return 0;
  return ((unitPrice - product.costPerUnit) / unitPrice) * 100;
}
