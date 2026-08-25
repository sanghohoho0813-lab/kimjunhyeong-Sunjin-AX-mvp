import { PRODUCTS } from "@/lib/data/seed";
import { getProductStats } from "@/lib/data/derived";
import { usagesFor, type Usage } from "@/lib/data/customer";
import type {
  CustomerActivity,
  LeatherColor,
  LeatherGrade,
  LeatherMaterial,
  LeatherProduct,
} from "@/types";
import type { Favorite } from "@/lib/store";

/**
 * 고객용 제품 검색·추천.
 *
 * 내부 AX의 추천이 "재고를 어떻게 팔 것인가"라면, 여기는 "고객이 무엇을
 * 찾는가"에서 출발한다. 다만 판정 근거를 문장으로 남기는 방식은 같다.
 * 추천 이유를 설명할 수 없는 추천은 하지 않는다.
 */

export const MATERIAL_OPTIONS: LeatherMaterial[] = ["Cow", "Lamb", "Goat", "Split"];
export const COLOR_OPTIONS: LeatherColor[] = [
  "Black",
  "Dark Brown",
  "Camel",
  "Navy",
  "Burgundy",
  "Ivory",
  "Gray",
];
export const GRADE_OPTIONS: LeatherGrade[] = ["Premium", "A", "B"];
export const THICKNESS_OPTIONS = [0.8, 1.0, 1.2, 1.4, 1.6] as const;

export interface FinderQuery {
  usage?: Usage | "";
  material?: LeatherMaterial | "";
  color?: LeatherColor | "";
  grade?: LeatherGrade | "";
  /** [min, max] mm */
  thickness?: [number, number] | null;
  keyword?: string;
}

export const EMPTY_QUERY: FinderQuery = {
  usage: "",
  material: "",
  color: "",
  grade: "",
  thickness: null,
  keyword: "",
};

export function searchProducts(q: FinderQuery): LeatherProduct[] {
  const kw = (q.keyword ?? "").trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    if (q.usage && !usagesFor(p).includes(q.usage)) return false;
    if (q.material && p.material !== q.material) return false;
    if (q.color && p.color !== q.color) return false;
    if (q.grade && p.grade !== q.grade) return false;
    if (q.thickness) {
      const [lo, hi] = q.thickness;
      if (p.thicknessMm < lo || p.thicknessMm > hi) return false;
    }
    if (kw) {
      const hay = `${p.code} ${p.name} ${p.material} ${p.color} ${p.grade} ${p.finish}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });
}

/** 재고가 많고 최근 회전이 좋은 순 — 고객에게는 "바로 나갈 수 있는" 순서다 */
export function sortForCustomer(list: LeatherProduct[]): LeatherProduct[] {
  return [...list].sort((a, b) => {
    const sa = getProductStats(a.id);
    const sb = getProductStats(b.id);
    // 출고가 최근일수록, 재고가 넉넉할수록 위로
    const scoreA = a.stockQty / 100 - sa.idleDays / 60;
    const scoreB = b.stockQty / 100 - sb.idleDays / 60;
    return scoreB - scoreA;
  });
}

export interface ShopRecommendation {
  product: LeatherProduct;
  score: number;
  /** 고객에게 그대로 보여주는 추천 이유 */
  reasons: string[];
}

/**
 * 고객 맞춤 추천.
 *
 * 검색 조건 + 로그인 고객의 과거 행동(구매·관심·조회)을 합쳐 점수를 낸다.
 * 각 가점마다 이유 문장을 만들어 두고, 화면에서는 가장 강한 이유를 보여준다.
 */
export function recommendForCustomer(opts: {
  query?: FinderQuery;
  /** 과거 구매 제품 id */
  purchasedIds?: string[];
  favorites?: Favorite[];
  activities?: CustomerActivity[];
  limit?: number;
}): ShopRecommendation[] {
  const {
    query = EMPTY_QUERY,
    purchasedIds = [],
    favorites = [],
    activities = [],
    limit = 6,
  } = opts;

  const favIds = new Set(favorites.map((f) => f.productId));
  const viewCount = new Map<string, number>();
  for (const a of activities) {
    if (a.kind === "view" && a.productId) {
      viewCount.set(a.productId, (viewCount.get(a.productId) ?? 0) + 1);
    }
  }

  // 과거 구매/관심 제품에서 선호 프로필을 뽑는다
  const refIds = [...purchasedIds, ...favIds];
  const refs = refIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is LeatherProduct => Boolean(p));
  const prefMaterials = new Set(refs.map((p) => p.material));
  const prefColors = new Set(refs.map((p) => p.color));
  const prefGrades = new Set(refs.map((p) => p.grade));
  const avgThickness = refs.length
    ? refs.reduce((s, p) => s + p.thicknessMm, 0) / refs.length
    : null;

  const scored = PRODUCTS.map((p) => {
    const reasons: string[] = [];
    let score = 0;

    // 1) 검색 조건 일치 (최대 40)
    if (query.usage && usagesFor(p).includes(query.usage)) {
      score += 14;
      reasons.push(`${query.usage}용으로 많이 선택되는 사양입니다.`);
    }
    if (query.material && p.material === query.material) score += 10;
    if (query.color && p.color === query.color) score += 8;
    if (query.grade && p.grade === query.grade) {
      score += 8;
      reasons.push(`선호하신 ${p.grade} Grade 조건과 일치합니다.`);
    }

    // 2) 과거 행동 (최대 40)
    if (purchasedIds.includes(p.id)) {
      score += 16;
      reasons.push("이전에 구매하신 제품입니다.");
    } else if (prefMaterials.has(p.material) && prefColors.has(p.color)) {
      score += 14;
      reasons.push(`최근 구매하신 ${p.color} ${p.material} 제품과 유사합니다.`);
    } else if (prefMaterials.has(p.material)) {
      score += 8;
      reasons.push(`자주 사용하시는 ${p.material} 소재입니다.`);
    }
    if (prefGrades.has(p.grade)) score += 5;
    if (avgThickness != null && Math.abs(p.thicknessMm - avgThickness) <= 0.2) {
      score += 6;
      reasons.push(`평소 사용하시는 두께(${avgThickness.toFixed(1)}mm 내외)와 가깝습니다.`);
    }
    const views = viewCount.get(p.id) ?? 0;
    if (views > 0) {
      score += Math.min(8, views * 3);
      reasons.push(`최근 ${views}회 확인하신 제품입니다.`);
    }
    if (favIds.has(p.id)) score += 6;

    // 3) 공급 가능성 (최대 20) — 추천했는데 못 주면 의미가 없다
    const stats = getProductStats(p.id);
    if (p.stockQty >= 200) {
      score += 10;
      reasons.push("재고가 충분해 바로 출고 가능합니다.");
    } else if (p.stockQty >= 100) {
      score += 6;
    }
    if (stats.idleDays >= 120) {
      // 오래 묶인 재고는 고객에게 손해가 아니다. 다만 신선도 가점은 주지 않는다.
      score += 2;
    } else {
      score += 5;
    }

    return { product: p, score, reasons };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** 제품 상세의 "함께 비교해보세요" — 같은 용도/유사 스펙 */
export function relatedProducts(
  product: LeatherProduct,
  limit = 4
): LeatherProduct[] {
  const usages = usagesFor(product);
  return PRODUCTS.filter((p) => p.id !== product.id)
    .map((p) => {
      let score = 0;
      if (p.material === product.material) score += 4;
      if (p.color === product.color) score += 3;
      if (Math.abs(p.thicknessMm - product.thicknessMm) <= 0.2) score += 3;
      if (p.grade === product.grade) score += 2;
      if (usagesFor(p).some((u) => usages.includes(u))) score += 2;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

/**
 * 자연어 입력에서 검색 조건을 뽑아낸다.
 *
 * 외부 LLM 없이 키워드 규칙으로만 처리한다. 대화창이 주인공이 되는 것을 막고
 * 결과는 항상 제품 카드로 돌려준다.
 */
export function parseNaturalQuery(text: string): FinderQuery {
  const t = text.toLowerCase();
  const q: FinderQuery = { ...EMPTY_QUERY };

  if (/가방|백|핸드백/.test(text)) q.usage = "가방";
  else if (/신발|슈즈|제화/.test(text)) q.usage = "신발";
  else if (/의류|자켓|재킷|옷/.test(text)) q.usage = "의류";
  else if (/지갑|벨트|소품|액세서리/.test(text)) q.usage = "소품";

  if (/소가죽|카우|cow/.test(t)) q.material = "Cow";
  else if (/양가죽|램|lamb/.test(t)) q.material = "Lamb";
  else if (/염소|고트|goat/.test(t)) q.material = "Goat";
  else if (/스플릿|split/.test(t)) q.material = "Split";

  if (/검정|블랙|black/.test(t)) q.color = "Black";
  else if (/다크브라운|진갈색|dark brown/.test(t)) q.color = "Dark Brown";
  else if (/카멜|낙타|camel/.test(t)) q.color = "Camel";
  else if (/네이비|남색|navy/.test(t)) q.color = "Navy";
  else if (/버건디|와인|burgundy/.test(t)) q.color = "Burgundy";
  else if (/아이보리|ivory/.test(t)) q.color = "Ivory";
  else if (/그레이|회색|gray|grey/.test(t)) q.color = "Gray";

  if (/프리미엄|premium/.test(t)) q.grade = "Premium";
  else if (/a\s*grade|에이급/.test(t)) q.grade = "A";

  // "1.2~1.4mm", "1.2mm", "1.2 - 1.4"
  const range = text.match(/(\d\.\d)\s*(?:~|-|—|에서)\s*(\d\.\d)/);
  const single = text.match(/(\d\.\d)\s*mm/);
  if (range) q.thickness = [parseFloat(range[1]), parseFloat(range[2])];
  else if (single) {
    const v = parseFloat(single[1]);
    q.thickness = [v - 0.1, v + 0.1];
  }

  return q;
}

/** 해석 결과를 사람이 읽는 문장으로 — 무엇으로 알아들었는지 보여준다 */
export function describeQuery(q: FinderQuery): string[] {
  const out: string[] = [];
  if (q.usage) out.push(`용도 ${q.usage}`);
  if (q.material) out.push(`소재 ${q.material}`);
  if (q.color) out.push(`색상 ${q.color}`);
  if (q.grade) out.push(`등급 ${q.grade}`);
  if (q.thickness) out.push(`두께 ${q.thickness[0]}~${q.thickness[1]}mm`);
  return out;
}
