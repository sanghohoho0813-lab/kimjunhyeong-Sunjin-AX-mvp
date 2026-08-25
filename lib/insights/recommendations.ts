import {
  getAverageMarginRate,
  getInventorySummary,
  getOverdueCustomers,
  getProduct,
  getProductStats,
} from "@/lib/data/derived";
import { getRatios, LATEST_YEAR } from "@/lib/data/finance";
import { getRecommendedBuyers } from "@/lib/scoring/match";
import { marginRateFor } from "@/lib/pricing/recommend";
import { SEED_QUOTES } from "@/lib/data/seed";
import { getCustomer } from "@/lib/data/derived";
import { formatKRW } from "@/lib/utils/format";
import type { AxRecommendation } from "@/types";

/**
 * AX 추천 생성 — 재고·거래처·견적·재무 데이터를 규칙 기반으로 연결한다.
 * 데이터가 바뀌면 추천 내용과 우선순위도 함께 바뀐다.
 */
export function generateRecommendations(): AxRecommendation[] {
  const recos: AxRecommendation[] = [];
  const inv = getInventorySummary();

  // 1) 장기재고 → 판매처 연결 (제품별)
  for (const pid of inv.longStockIds) {
    const product = getProduct(pid);
    if (!product) continue;
    const stats = getProductStats(pid);
    const buyers = getRecommendedBuyers(pid, 3).filter((b) => b.match.score >= 40);
    recos.push({
      id: `reco-longstock-${pid}`,
      category: "재고",
      priority: stats.idleDays >= 150 ? "긴급" : "높음",
      title: `장기재고 판매 추천 — ${product.name}`,
      why: `최근 ${stats.idleDays}일간 출고가 없어 재고금액 ${formatKRW(stats.stockValue)}이 묶여 있습니다.`,
      connection: buyers.length
        ? `과거 유사 품목 구매 이력이 있는 거래처 ${buyers.length}곳(${buyers
            .map((b) => b.customer.name)
            .join(", ")})과 연결됩니다.`
        : "구매 가능성이 있는 거래처를 탐색 중입니다.",
      expectedEffect: `잠재 매출 ${formatKRW(stats.potentialRevenue)}`,
      actionLabel: "판매처 보기",
      href: `/inventory/${pid}`,
      signals: [
        `보유 ${product.stockQty.toLocaleString()}평 · ${stats.idleDays}일 무출고`,
        `재고금액 ${formatKRW(stats.stockValue)}`,
      ],
      relatedProductIds: [pid],
      relatedCustomerIds: buyers.map((b) => b.customer.id),
    });
  }

  // 2) 거래처 재접촉
  const overdue = getOverdueCustomers();
  const recontact = overdue.filter((c) => c.status === "재접촉 필요");
  if (recontact.length) {
    recos.push({
      id: "reco-recontact",
      category: "거래처",
      priority: "높음",
      title: `재구매 시점이 지난 거래처 ${overdue.length}곳`,
      why: `${recontact
        .map((c) => c.customer.name)
        .join(", ")} 등이 평균 재구매 주기를 지나 접촉 적기입니다.`,
      connection: "각 거래처의 선호 품목과 현재 보유 재고가 연결됩니다.",
      expectedEffect: `평균 주문금액 기준 잠재 매출 ${formatKRW(
        recontact.reduce((s, c) => s + c.stats.avgOrderValue, 0)
      )}`,
      actionLabel: "거래처 확인",
      href: "/customers?filter=재접촉 필요",
      signals: recontact
        .slice(0, 3)
        .map(
          (c) =>
            `${c.customer.name} — 주기 대비 ${Math.round(
              (c.stats.cycleRatio ?? 0) * 100
            )}% 경과`
        ),
      relatedCustomerIds: recontact.map((c) => c.customer.id),
    });
  }

  // 3) 휴면 가능 거래처
  const dormant = overdue.filter((c) => c.status === "휴면 가능");
  if (dormant.length) {
    recos.push({
      id: "reco-dormant",
      category: "거래처",
      priority: "보통",
      title: `휴면 전환 가능성이 있는 거래처 ${dormant.length}곳`,
      why: `${dormant
        .map((c) => c.customer.name)
        .join(", ")}의 마지막 거래 이후 시간이 길게 경과했습니다.`,
      connection: "과거 구매 품목 기준 재제안 리스트가 준비되어 있습니다.",
      actionLabel: "거래처 확인",
      href: "/customers?filter=휴면 가능",
      signals: dormant.map(
        (c) => `${c.customer.name} — 마지막 구매 후 ${c.stats.elapsedDays}일`
      ),
      relatedCustomerIds: dormant.map((c) => c.customer.id),
    });
  }

  // 4) 마진 개선 기회 — 평균 마진 대비 낮은 견적
  const avgMargin = getAverageMarginRate();
  const lowMarginQuotes = SEED_QUOTES.filter((q) => {
    const m = quoteMarginRate(q.id);
    return m != null && m < avgMargin - 5;
  });
  if (lowMarginQuotes.length) {
    recos.push({
      id: "reco-margin",
      category: "수익성",
      priority: "보통",
      title: `평균 대비 마진율이 낮은 견적 ${lowMarginQuotes.length}건`,
      why: `전체 평균 마진율 ${avgMargin.toFixed(1)}%보다 5%p 이상 낮은 견적이 진행 중입니다.`,
      connection: lowMarginQuotes
        .map((q) => `${getCustomer(q.customerId)?.name ?? ""} ${q.number}`)
        .join(", "),
      expectedEffect: "단가 재협의 시 마진율 개선 여지가 있습니다.",
      actionLabel: "견적 분석",
      href: "/quotes",
      signals: lowMarginQuotes.map((q) => {
        const m = quoteMarginRate(q.id);
        return `${q.number} — 마진율 ${m != null ? m.toFixed(1) : "-"}%`;
      }),
    });
  }

  // 5) 관심 재고 조기 대응
  if (inv.watchIds.length) {
    const names = inv.watchIds
      .map((id) => getProduct(id)?.name)
      .filter(Boolean)
      .slice(0, 3)
      .join(", ");
    recos.push({
      id: "reco-watch-stock",
      category: "매출 기회",
      priority: "보통",
      title: `장기화 조짐이 있는 재고 ${inv.watchIds.length}건`,
      why: `${names} 품목이 90일 이상 출고되지 않았습니다.`,
      connection: "장기재고 전환 전 우선 판매 대상으로 관리할 수 있습니다.",
      actionLabel: "재고 확인",
      href: "/inventory?status=관심",
      signals: inv.watchIds.map((id) => {
        const p = getProduct(id);
        const s = getProductStats(id);
        return `${p?.name ?? id} — ${s.idleDays}일 무출고`;
      }),
      relatedProductIds: inv.watchIds,
    });
  }

  // 6) 재무 모니터링 — 자기자본 감소
  const ratios = getRatios(LATEST_YEAR);
  if (ratios.equityChangeEok != null && ratios.equityChangeEok < -1) {
    recos.push({
      id: "reco-equity",
      category: "재무 모니터링",
      priority: "높음",
      title: "자본 안정성 모니터링 필요",
      why: `2025년 자기자본이 전년 대비 ${Math.abs(ratios.equityChangeEok).toFixed(
        2
      )}억원 감소했습니다. 변동폭이 커 상세 원인은 결산자료 확인이 필요합니다.`,
      connection: "경영분석의 재무 시나리오에서 이익 유보·부채 상환 영향을 확인할 수 있습니다.",
      actionLabel: "경영분석 보기",
      href: "/analytics",
      signals: [
        "자기자본 3.86억 → 0.09억 (2024 → 2025)",
        `자기자본비율 ${ratios.equityRatioPct.toFixed(1)}%`,
      ],
    });
  }

  const priorityOrder = { 긴급: 0, 높음: 1, 보통: 2 } as const;
  return recos.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/** 견적 전체 마진율(%) — 항목 합산 기준 */
export function quoteMarginRate(quoteId: string): number | null {
  const quote = SEED_QUOTES.find((q) => q.id === quoteId);
  if (!quote) return null;
  let revenue = 0;
  let weighted = 0;
  for (const item of quote.items) {
    const amount = item.qty * item.unitPrice;
    revenue += amount;
    weighted += amount * marginRateFor(item.productId, item.unitPrice);
  }
  return revenue > 0 ? weighted / revenue : null;
}
