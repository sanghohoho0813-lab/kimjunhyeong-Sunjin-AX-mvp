import { getCustomerStats } from "@/lib/data/derived";
import { clamp } from "@/lib/utils/format";
import type { ScoreResult } from "@/types";

/**
 * 재구매 가능성 지수 (0~100, 시연용 룰 기반)
 * — 경과일/주기 비율, 구매 빈도, 누적 매출, 최근 추세를 조합한다.
 */
export function calculateRepurchaseScore(customerId: string): ScoreResult {
  const stats = getCustomerStats(customerId);
  const reasons: string[] = [];

  if (stats.cycleRatio == null || stats.lastPurchaseDate == null) {
    return {
      score: 50,
      label: "관찰",
      reasons: ["구매 이력이 아직 충분하지 않습니다."],
    };
  }

  // 1) 재구매 타이밍 (40점) — 주기 대비 0.9~1.3 구간이 가장 높음
  const r = stats.cycleRatio;
  let timing: number;
  if (r < 0.5) timing = 12;
  else if (r < 0.85) timing = 24;
  else if (r <= 1.3) timing = 40;
  else if (r <= 1.8) timing = 30;
  else if (r <= 2.5) timing = 16;
  else timing = 6;

  const overDays = Math.round(stats.elapsedDays! - stats.cycleDays);
  if (r >= 0.85 && r <= 1.3) {
    reasons.push(
      overDays >= 0
        ? `평균 재구매 주기(${stats.cycleDays}일)보다 ${overDays}일 지나 재구매 시점입니다.`
        : `평균 재구매 주기(${stats.cycleDays}일) 도래가 임박했습니다.`
    );
  } else if (r > 1.3 && r <= 2.5) {
    reasons.push(
      `평균 재구매 주기보다 ${overDays}일 지났습니다. 재접촉이 필요합니다.`
    );
  } else if (r > 2.5) {
    reasons.push(`마지막 구매 후 ${stats.elapsedDays}일 경과로 휴면 가능성이 있습니다.`);
  } else {
    reasons.push(`최근 ${stats.elapsedDays}일 전 구매로 아직 주기 도래 전입니다.`);
  }

  // 2) 구매 빈도 (25점)
  const freq = clamp((stats.orderCount / 8) * 25, 5, 25);
  if (stats.orderCount >= 6) {
    reasons.push(`누적 ${stats.orderCount}회 구매로 거래 빈도가 높습니다.`);
  } else if (stats.orderCount <= 2) {
    reasons.push(`구매 이력이 ${stats.orderCount}회로 아직 적습니다.`);
  }

  // 3) 거래 규모 (20점) — 누적 매출 1.2억 기준 만점
  const value = clamp((stats.totalRevenue / 120_000_000) * 20, 3, 20);

  // 4) 최근 추세 (15점) — 올해 매출 비중
  const trendRatio =
    stats.totalRevenue > 0 ? stats.revenueThisYear / stats.totalRevenue : 0;
  const trend = clamp(trendRatio * 15, 0, 15);
  if (trendRatio >= 0.7 && stats.orderCount >= 3) {
    reasons.push("올해 거래 비중이 높아 관계가 활발히 유지되고 있습니다.");
  } else if (trendRatio < 0.3 && stats.orderCount >= 3) {
    reasons.push("올해 거래 비중이 낮아 관계 회복이 필요합니다.");
  }

  const score = Math.round(clamp(timing + freq + value + trend, 0, 100));
  return { score, label: repurchaseLabel(score), reasons: reasons.slice(0, 3) };
}

export function repurchaseLabel(score: number): string {
  if (score >= 80) return "높음";
  if (score >= 60) return "보통 이상";
  if (score >= 40) return "관찰";
  return "낮음";
}
