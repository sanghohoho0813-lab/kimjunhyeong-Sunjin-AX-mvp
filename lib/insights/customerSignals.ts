import { getCustomer, getProduct } from "@/lib/data/derived";
import { daysBetween, formatKRW, formatNumber } from "@/lib/utils/format";
import type {
  CustomerActivity,
  CustomerOrder,
  QuoteRequest,
  SampleRequest,
} from "@/types";
import type { Favorite } from "@/lib/store";

/**
 * 고객 행동 → 영업 신호.
 *
 * 고객 Front에서 쌓인 조회·관심·요청 데이터를 내부 AX가 읽는 층이다.
 * 숫자를 세는 데서 그치지 않고 "그래서 지금 무엇을 할 것인가"까지 만든다.
 * 판정 기준은 모두 이 파일에 드러나 있다.
 */

export interface DigitalActivitySummary {
  views: number;
  favorites: number;
  samples: number;
  quotes: number;
  searches: number;
  /** 가장 많이 본 제품 */
  topProductId?: string;
  topProductViews: number;
  lastActiveDate?: string;
}

export function summarizeActivity(
  activities: CustomerActivity[],
  favorites: Favorite[],
  windowDays = 30
): DigitalActivitySummary {
  const recent = activities.filter((a) => daysBetween(a.date) <= windowDays);
  const viewCount = new Map<string, number>();
  for (const a of recent) {
    if (a.kind === "view" && a.productId) {
      viewCount.set(a.productId, (viewCount.get(a.productId) ?? 0) + 1);
    }
  }
  const top = [...viewCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const dates = recent.map((a) => a.date).sort();

  return {
    views: recent.filter((a) => a.kind === "view").length,
    favorites: favorites.length,
    samples: recent.filter((a) => a.kind === "sample").length,
    quotes: recent.filter((a) => a.kind === "quote").length,
    searches: recent.filter((a) => a.kind === "search").length,
    topProductId: top?.[0],
    topProductViews: top?.[1] ?? 0,
    lastActiveDate: dates.at(-1),
  };
}

export interface SalesSignal {
  tone: "hot" | "warm" | "quiet";
  headline: string;
  basis: string[];
  action: string;
  href: string;
  actionLabel: string;
}

/**
 * 거래처별 영업 기회 판정.
 *
 * hot  — 같은 제품을 반복해서 보거나 요청까지 올라온 상태
 * warm — 둘러보고는 있으나 요청으로 넘어오지 않은 상태
 * quiet— 최근 접점이 없는 상태
 */
export function getSalesSignal(
  customerId: string,
  activities: CustomerActivity[],
  favorites: Favorite[]
): SalesSignal {
  const mine = activities.filter((a) => a.customerId === customerId);
  const myFavs = favorites.filter((f) => f.customerId === customerId);
  const s = summarizeActivity(mine, myFavs);
  const customer = getCustomer(customerId);
  const name = customer?.name ?? "이 거래처";
  const topProduct = s.topProductId ? getProduct(s.topProductId) : undefined;

  const basis: string[] = [];
  if (s.views) basis.push(`최근 30일 제품 조회 ${s.views}회`);
  if (s.favorites) basis.push(`관심 제품 ${s.favorites}개`);
  if (s.samples) basis.push(`샘플 요청 ${s.samples}건`);
  if (s.quotes) basis.push(`견적 요청 ${s.quotes}건`);
  if (topProduct && s.topProductViews >= 2) {
    basis.push(`${topProduct.name} ${s.topProductViews}회 반복 조회`);
  }

  // 요청까지 올라왔거나 같은 제품을 반복해서 보는 중
  if (s.quotes > 0 || s.samples > 0 || s.topProductViews >= 3) {
    const stockNote = topProduct
      ? `${topProduct.name} 재고는 ${formatNumber(topProduct.stockQty)}평으로 충분합니다.`
      : "";
    return {
      tone: "hot",
      headline: topProduct
        ? `${name}이 ${topProduct.name}을 반복 확인하고 있습니다`
        : `${name}에서 요청이 올라와 있습니다`,
      basis,
      action: `지금이 접촉 적기입니다. ${stockNote} 견적을 먼저 보내면 전환 가능성이 높습니다.`,
      href: `/customers/${customerId}`,
      actionLabel: "영업 기회 보기",
    };
  }

  if (s.views > 0 || s.favorites > 0) {
    return {
      tone: "warm",
      headline: `${name}이 제품을 둘러보고 있습니다`,
      basis,
      action:
        "아직 요청으로 이어지지 않았습니다. 관심 품목의 샘플을 먼저 제안해보세요.",
      href: `/customers/${customerId}`,
      actionLabel: "관심 품목 확인",
    };
  }

  return {
    tone: "quiet",
    headline: `${name}은 최근 접점이 없습니다`,
    basis: s.lastActiveDate
      ? [`마지막 활동 ${daysBetween(s.lastActiveDate)}일 전`]
      : ["최근 30일 내 화면 활동 없음"],
    action: "고객 화면에 신규 입고 알림이 닿도록 재입고 품목을 확인하세요.",
    href: `/customers/${customerId}`,
    actionLabel: "거래처 상세",
  };
}

/** 대시보드용 — 오늘 고객 화면에서 일어난 일 */
export function todayFrontSummary(
  activities: CustomerActivity[],
  samples: SampleRequest[],
  quotes: QuoteRequest[],
  orders: CustomerOrder[]
) {
  const isToday = (d: string) => daysBetween(d) === 0;
  const within7 = (d: string) => daysBetween(d) <= 7;

  return {
    todayViews: activities.filter((a) => a.kind === "view" && isToday(a.date)).length,
    weekViews: activities.filter((a) => a.kind === "view" && within7(a.date)).length,
    newSamples: samples.filter((r) => within7(r.createdAt)).length,
    newQuotes: quotes.filter((r) => within7(r.createdAt)).length,
    newReorders: activities.filter((a) => a.kind === "reorder" && within7(a.date)).length,
    /** 아직 회신하지 않은 요청 */
    pending:
      samples.filter((r) => r.status === "접수").length +
      quotes.filter((r) => r.status === "접수").length,
    pendingQuoteValue: quotes
      .filter((r) => r.status !== "회신완료")
      .reduce(
        (s, r) =>
          s +
          r.items.reduce((a, i) => {
            const p = getProduct(i.productId);
            return a + i.qty * (p?.listPricePerUnit ?? 0);
          }, 0),
        0
      ),
  };
}

/** 견적 요청 금액 (참고 단가 기준) */
export function quoteRequestValue(req: QuoteRequest): number {
  return req.items.reduce((s, i) => {
    const p = getProduct(i.productId);
    return s + i.qty * (p?.listPricePerUnit ?? 0);
  }, 0);
}

export function formatQuoteRequestValue(req: QuoteRequest): string {
  return formatKRW(quoteRequestValue(req));
}
