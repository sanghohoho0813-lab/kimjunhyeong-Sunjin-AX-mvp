import { CUSTOMERS, PRODUCTS, TRANSACTIONS } from "./seed";
import { DEMO_TODAY, daysBetween } from "@/lib/utils/format";
import type {
  Customer,
  CustomerStatus,
  InventoryStatus,
  LeatherProduct,
  SalesTransaction,
} from "@/types";

/** 파생 값 계산 — 모든 화면이 동일한 수치를 보도록 이 모듈만 사용한다. */

export function getCustomer(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}

export function getProduct(id: string): LeatherProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function customerTransactions(customerId: string): SalesTransaction[] {
  return TRANSACTIONS.filter((t) => t.customerId === customerId).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export function productTransactions(productId: string): SalesTransaction[] {
  return TRANSACTIONS.filter((t) => t.productId === productId).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export interface CustomerStats {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  lastPurchaseDate: string | null;
  lastProduct: LeatherProduct | null;
  firstPurchaseDate: string | null;
  elapsedDays: number | null; // 마지막 구매 후 경과일
  cycleDays: number; // 평균 재구매 주기
  cycleRatio: number | null; // 경과일 / 주기
  revenue2025: number;
}

export function getCustomerStats(customerId: string): CustomerStats {
  const customer = getCustomer(customerId);
  const txs = customerTransactions(customerId);
  const totalRevenue = txs.reduce((sum, t) => sum + t.qty * t.unitPrice, 0);
  const revenue2025 = txs
    .filter((t) => t.date.startsWith("2025"))
    .reduce((sum, t) => sum + t.qty * t.unitPrice, 0);
  const last = txs[0] ?? null;
  const first = txs[txs.length - 1] ?? null;
  const cycleDays = customer?.avgRepurchaseCycleDays ?? 60;
  const elapsedDays = last ? daysBetween(last.date, DEMO_TODAY) : null;
  return {
    totalRevenue,
    orderCount: txs.length,
    avgOrderValue: txs.length ? totalRevenue / txs.length : 0,
    lastPurchaseDate: last?.date ?? null,
    lastProduct: last ? getProduct(last.productId) ?? null : null,
    firstPurchaseDate: first?.date ?? null,
    elapsedDays,
    cycleDays,
    cycleRatio: elapsedDays != null ? elapsedDays / cycleDays : null,
    revenue2025,
  };
}

/** 거래처 상태 판정 (시연용 룰) */
export function getCustomerStatus(customerId: string): CustomerStatus {
  const stats = getCustomerStats(customerId);
  if (
    stats.orderCount <= 2 &&
    stats.firstPurchaseDate &&
    daysBetween(stats.firstPurchaseDate) <= 90
  ) {
    return "신규";
  }
  if (stats.cycleRatio == null) return "신규";
  if (stats.cycleRatio > 2.0) return "휴면 가능";
  if (stats.cycleRatio > 1.15) return "재접촉 필요";
  if (stats.cycleRatio >= 0.85) return "재구매 예상";
  return "안정";
}

export interface ProductStats {
  lastSoldDate: string | null;
  /** 마지막 판매(없으면 입고) 이후 경과일 */
  idleDays: number;
  heldDays: number; // 입고 후 경과일
  stockValue: number; // 매입가 기준 재고금액
  potentialRevenue: number; // 권장 판매가 기준
  status: InventoryStatus;
  recentAvgPrice: number; // 최근 판매 평균 단가 (판매 이력 없으면 권장가)
  buyerIds: string[]; // 이 제품을 구매한 거래처
  soldQty2025: number;
}

/** 재고 리스크 판정 (시연용 룰: 90일 이상 '관심', 120일 이상 '장기재고') */
export function calculateInventoryRisk(idleDays: number): InventoryStatus {
  if (idleDays >= 120) return "장기재고";
  if (idleDays >= 90) return "관심";
  return "정상";
}

export function getProductStats(productId: string): ProductStats {
  const product = getProduct(productId);
  const txs = productTransactions(productId);
  const lastSoldDate = txs[0]?.date ?? null;
  const received = product?.receivedDate ?? DEMO_TODAY;
  // 기준일: 마지막 판매일과 입고일 중 더 최근 (재입고 상품 고려)
  const refDate =
    lastSoldDate && lastSoldDate > received ? lastSoldDate : received;
  const idleDays = daysBetween(refDate);
  const recent = txs.slice(0, 3);
  const recentAvgPrice = recent.length
    ? recent.reduce((s, t) => s + t.unitPrice, 0) / recent.length
    : product?.listPricePerUnit ?? 0;
  return {
    lastSoldDate,
    idleDays,
    heldDays: daysBetween(received),
    stockValue: (product?.stockQty ?? 0) * (product?.costPerUnit ?? 0),
    potentialRevenue: (product?.stockQty ?? 0) * (product?.listPricePerUnit ?? 0),
    status: calculateInventoryRisk(idleDays),
    recentAvgPrice,
    buyerIds: Array.from(new Set(txs.map((t) => t.customerId))),
    soldQty2025: txs
      .filter((t) => t.date.startsWith("2025"))
      .reduce((s, t) => s + t.qty, 0),
  };
}

export interface InventorySummary {
  totalValue: number;
  totalQty: number;
  itemCount: number;
  longStockValue: number;
  longStockCount: number;
  watchCount: number;
  longStockIds: string[];
  watchIds: string[];
}

export function getInventorySummary(): InventorySummary {
  let totalValue = 0;
  let totalQty = 0;
  let longStockValue = 0;
  const longStockIds: string[] = [];
  const watchIds: string[] = [];
  for (const p of PRODUCTS) {
    const stats = getProductStats(p.id);
    totalValue += stats.stockValue;
    totalQty += p.stockQty;
    if (stats.status === "장기재고") {
      longStockValue += stats.stockValue;
      longStockIds.push(p.id);
    } else if (stats.status === "관심") {
      watchIds.push(p.id);
    }
  }
  return {
    totalValue,
    totalQty,
    itemCount: PRODUCTS.length,
    longStockValue,
    longStockCount: longStockIds.length,
    watchCount: watchIds.length,
    longStockIds,
    watchIds,
  };
}

export function getTopCustomers(limit = 5) {
  return CUSTOMERS.map((c) => ({ customer: c, stats: getCustomerStats(c.id) }))
    .sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue)
    .slice(0, limit);
}

/** 재구매 예상 시점이 지난 거래처 (재접촉 필요 + 휴면 가능) */
export function getOverdueCustomers() {
  return CUSTOMERS.map((c) => ({
    customer: c,
    stats: getCustomerStats(c.id),
    status: getCustomerStatus(c.id),
  })).filter((c) => c.status === "재접촉 필요" || c.status === "휴면 가능");
}

/** 전체 거래 데이터 기준 평균 마진율(%) — 견적 마진 비교 기준 */
export function getAverageMarginRate(): number {
  let revenue = 0;
  let cost = 0;
  for (const t of TRANSACTIONS) {
    const p = getProduct(t.productId);
    if (!p) continue;
    revenue += t.qty * t.unitPrice;
    cost += t.qty * p.costPerUnit;
  }
  return revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
}
