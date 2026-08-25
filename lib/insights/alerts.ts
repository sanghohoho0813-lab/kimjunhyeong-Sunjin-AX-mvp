import { getInventorySummary, getOverdueCustomers } from "@/lib/data/derived";
import { getRatios, LATEST_YEAR } from "@/lib/data/finance";
import { SEED_QUOTES } from "@/lib/data/seed";
import { DEMO_TODAY, formatKRW } from "@/lib/utils/format";
import type { BusinessAlert } from "@/types";

/** 규칙 기반 알림 생성 — 데이터 상태에서 파생된다. */
export function generateBusinessAlerts(): BusinessAlert[] {
  const alerts: BusinessAlert[] = [];
  const inv = getInventorySummary();

  if (inv.longStockCount > 0) {
    alerts.push({
      id: "alert-longstock",
      category: "재고",
      title: `장기재고 ${inv.longStockCount}건 발생`,
      body: `120일 이상 출고되지 않은 재고 ${formatKRW(
        inv.longStockValue
      )}이 있습니다. 판매처 추천을 확인해보세요.`,
      date: DEMO_TODAY,
      href: "/inventory?status=장기재고",
    });
  }

  const overdue = getOverdueCustomers();
  const recontact = overdue.filter((c) => c.status === "재접촉 필요");
  if (recontact.length) {
    alerts.push({
      id: "alert-recontact",
      category: "거래처",
      title: `재구매 예상 시점이 지난 거래처 ${recontact.length}곳`,
      body: `${recontact
        .map((c) => c.customer.name)
        .join(", ")}의 재접촉이 필요합니다.`,
      date: DEMO_TODAY,
      href: "/customers?filter=재접촉 필요",
    });
  }

  const reviewQuotes = SEED_QUOTES.filter((q) => q.status === "검토");
  if (reviewQuotes.length) {
    alerts.push({
      id: "alert-quotes",
      category: "견적",
      title: `검토 대기 견적 ${reviewQuotes.length}건`,
      body: `${reviewQuotes.map((q) => q.number).join(", ")}이 검토 단계에 있습니다.`,
      date: "2025-12-08",
      href: "/quotes",
    });
  }

  const ratios = getRatios(LATEST_YEAR);
  if (ratios.equityRatioPct < 30) {
    alerts.push({
      id: "alert-equity",
      category: "재무",
      title: "자본 안정성 모니터링",
      body: "2025년 자기자본 변동폭이 큽니다. 경영분석에서 재무 시나리오를 확인해보세요.",
      date: "2025-12-05",
      href: "/analytics",
    });
  }

  if (inv.watchCount > 0) {
    alerts.push({
      id: "alert-watch",
      category: "재고",
      title: `장기화 조짐 재고 ${inv.watchCount}건`,
      body: "90일 이상 출고되지 않은 품목이 있습니다. 조기 판매 대상으로 검토해보세요.",
      date: "2025-12-03",
      href: "/inventory?status=관심",
    });
  }

  return alerts;
}
