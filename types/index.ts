/** 선진산업 Business AX — 도메인 타입 정의 */

export type LeatherMaterial = "Cow" | "Lamb" | "Goat" | "Split";
export type LeatherColor =
  | "Black"
  | "Dark Brown"
  | "Camel"
  | "Navy"
  | "Burgundy"
  | "Ivory"
  | "Gray";
export type LeatherGrade = "Premium" | "A" | "B";
export type LeatherFinish = "Aniline" | "Semi-Aniline" | "Pigmented" | "Nubuck" | "Embossed";

/** 재고 상태 — 시연용 룰 기반 판정 (90일 이상 관심 / 120일 이상 장기재고) */
export type InventoryStatus = "정상" | "관심" | "장기재고";

export type CustomerStatus = "안정" | "재구매 예상" | "재접촉 필요" | "휴면 가능" | "신규";

export type QuoteStatus = "작성중" | "발송" | "검토" | "승인" | "보류";

export interface LeatherProduct {
  id: string;
  code: string; // 예: SJ-COW-BLK-14
  name: string; // 예: Cow Leather Black 1.4mm
  material: LeatherMaterial;
  color: LeatherColor;
  thicknessMm: number; // 0.8 ~ 1.6
  grade: LeatherGrade;
  finish: LeatherFinish;
  unit: "평"; // 피혁 거래 단위(사절평)
  stockQty: number; // 보유 수량(평)
  costPerUnit: number; // 매입 단가(원/평)
  listPricePerUnit: number; // 권장 판매가(원/평)
  receivedDate: string; // 입고일 YYYY-MM-DD
}

export interface Customer {
  id: string;
  name: string;
  contactName: string; // 담당자
  region: string;
  segment: string; // 가방 / 신발 / 의류 / 잡화 등
  since: string; // 거래 시작
  preferredMaterials: LeatherMaterial[];
  preferredColors: LeatherColor[];
  preferredThickness: [number, number]; // 선호 두께 범위
  preferredGrades: LeatherGrade[];
  avgRepurchaseCycleDays: number; // 평균 재구매 주기(일)
  memo?: string;
}

export interface SalesTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  customerId: string;
  productId: string;
  qty: number; // 평
  unitPrice: number; // 판매 단가(원/평)
}

export interface QuoteItem {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  number: string; // 예: Q-2025-014
  customerId: string;
  items: QuoteItem[];
  status: QuoteStatus;
  createdAt: string; // YYYY-MM-DD
  memo?: string;
  source?: "manual" | "ax"; // AX 추천으로 생성 여부
}

export interface SalesActivity {
  id: string;
  date: string;
  customerId: string;
  type: "전화" | "방문" | "샘플 발송" | "견적 발송" | "팔로업";
  memo: string;
}

export interface BusinessAlert {
  id: string;
  category: "재고" | "거래처" | "견적" | "재무";
  title: string;
  body: string;
  date: string;
  href?: string;
}

export type RecoPriority = "긴급" | "높음" | "보통";
export type RecoCategory = "매출 기회" | "재고" | "거래처" | "수익성" | "재무 모니터링";

/** 추천이 다루는 대상 — 카드에서 가장 크게 보여줄 "무엇" */
export interface RecoSubject {
  /** 품목명 또는 거래처명 */
  title: string;
  /** 두께·등급·보유량 같은 식별 보조 정보 */
  meta?: string;
  /** 이 대상이 왜 걸렸는지 한 마디 (예: 153일 무출고) */
  flag?: string;
}

/** 금액으로 환산한 기대 효과 — 카드에서 가장 크게 보여줄 "얼마" */
export interface RecoImpact {
  label: string; // 예: 잠재 매출
  amount: number; // 원 단위
  /** 금액 산출 근거 한 줄 */
  note?: string;
}

export interface AxRecommendation {
  id: string;
  category: RecoCategory;
  priority: RecoPriority;
  title: string; // 무엇을 발견했는지
  why: string; // 왜 중요한지
  connection: string; // 누구/무엇과 연결되는지
  subject?: RecoSubject;
  impact?: RecoImpact;
  expectedEffect?: string; // 예상 효과 (문자열 표기용 · impact 우선)
  actionLabel: string;
  href: string;
  signals: string[]; // 발견된 signal 목록
  relatedCustomerIds?: string[];
  relatedProductIds?: string[];
}

/** 연도별 재무 실적 (단위: 억원) */
export interface FinancialYear {
  year: number;
  revenue: number; // 매출액
  operatingProfit: number; // 영업이익
  netProfit: number; // 당기순이익
  assets: number; // 자산
  liabilities: number; // 부채
  equity: number; // 자기자본
}

export interface ScoreResult {
  score: number; // 0~100
  label: string;
  reasons: string[];
}

export interface MatchBreakdownItem {
  key: string;
  label: string;
  earned: number;
  max: number;
}

export interface MatchResult extends ScoreResult {
  breakdown: MatchBreakdownItem[];
}

export interface PriceRecommendation {
  recommendedPrice: number;
  basePrice: number; // 최근 평균 판매가
  customerAvgPrice: number | null; // 해당 거래처 과거 평균 단가
  quantityDiscountRate: number; // 수량 구간 할인율
  marginRate: number; // 추천가 기준 예상 마진율(%)
  minPriceByMarginGuard: number; // 목표 마진 하한 가격
  notes: string[];
}
