import { FINANCIALS, getRatios, getYear } from "@/lib/data/finance";

export interface FinancialBriefing {
  headline: string;
  paragraphs: string[];
  monitoringPoints: string[];
}

/**
 * 규칙 기반 AI 경영 브리핑 — 외부 LLM 없이 재무 데이터로 문장을 생성한다.
 * 향후 lib/ai/provider.ts 의 LLM Provider로 교체 가능.
 */
export function generateFinancialBriefing(year: number): FinancialBriefing {
  const cur = getYear(year);
  const prev = FINANCIALS.find((f) => f.year === year - 1);
  const ratios = getRatios(year);
  const paragraphs: string[] = [];
  const monitoringPoints: string[] = [];

  // 매출·이익 흐름
  if (prev) {
    if (ratios.revenueYoYPct != null && ratios.revenueYoYPct > 20) {
      paragraphs.push(
        `${year}년 매출은 ${cur.revenue.toFixed(2)}억원으로 전년 대비 ${ratios.revenueYoYPct.toFixed(
          0
        )}% 증가하며 크게 회복되었습니다.`
      );
    } else if (ratios.revenueYoYPct != null && ratios.revenueYoYPct < -20) {
      paragraphs.push(
        `${year}년 매출은 ${cur.revenue.toFixed(2)}억원으로 전년 대비 ${Math.abs(
          ratios.revenueYoYPct
        ).toFixed(0)}% 감소했습니다.`
      );
    } else {
      paragraphs.push(
        `${year}년 매출은 ${cur.revenue.toFixed(2)}억원으로 전년과 비슷한 수준을 유지했습니다.`
      );
    }

    if (cur.operatingProfit > prev.operatingProfit * 1.5) {
      paragraphs.push(
        `영업이익 ${cur.operatingProfit.toFixed(2)}억원, 당기순이익 ${cur.netProfit.toFixed(
          2
        )}억원으로 수익성이 함께 개선되었습니다.`
      );
    } else if (cur.operatingProfit < prev.operatingProfit * 0.6) {
      paragraphs.push(
        `영업이익이 ${cur.operatingProfit.toFixed(2)}억원으로 축소되어 수익성 관리가 필요합니다.`
      );
      monitoringPoints.push("영업이익률");
    }
  } else {
    paragraphs.push(`${year}년 매출은 ${cur.revenue.toFixed(2)}억원입니다.`);
  }

  // 자본 안정성
  if (prev && cur.equity < prev.equity * 0.5) {
    paragraphs.push(
      `다만 자기자본이 ${prev.equity.toFixed(2)}억원에서 ${cur.equity.toFixed(
        2
      )}억원으로 감소해 재무 안정성 지표가 약화되어 있습니다. 자본 변동폭이 커 상세 원인은 결산자료 확인이 필요합니다.`
    );
    monitoringPoints.push("자기자본", "부채 구조");
  } else if (ratios.equityRatioPct < 30) {
    monitoringPoints.push("자기자본");
  }

  // 현금흐름
  paragraphs.push(
    "현재는 수익성 개선과 함께 현금흐름 유지, 자본 구조 안정성 관리가 주요 경영 포인트입니다."
  );
  monitoringPoints.push("현금흐름", "매출채권");

  const headline =
    prev && ratios.revenueYoYPct != null && ratios.revenueYoYPct > 20
      ? `${year}년은 매출과 순이익이 크게 회복되며 수익성이 개선된 해였습니다.`
      : `${year}년 경영 현황 요약입니다.`;

  return {
    headline,
    paragraphs,
    monitoringPoints: Array.from(new Set(monitoringPoints)),
  };
}
