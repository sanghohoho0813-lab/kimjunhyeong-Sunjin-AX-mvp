import {
  generateFinancialBriefing,
  type FinancialBriefing,
} from "@/lib/insights/financialBriefing";

/**
 * Insight Provider 인터페이스
 * — 현재는 규칙 기반 엔진을 사용하며, 향후 외부 LLM(Claude 등) Provider로
 *   교체할 수 있도록 동일한 계약을 유지한다. 외부 API Key는 필수가 아니다.
 */
export interface InsightProvider {
  readonly name: string;
  generateBriefing(year: number): Promise<FinancialBriefing>;
}

export class RuleBasedInsightProvider implements InsightProvider {
  readonly name = "rule-based";

  async generateBriefing(year: number): Promise<FinancialBriefing> {
    return generateFinancialBriefing(year);
  }
}

/** 활성 Provider — LLM 연동 시 이 팩토리만 교체하면 된다. */
export function getInsightProvider(): InsightProvider {
  return new RuleBasedInsightProvider();
}
