import { CUSTOMERS, PRODUCTS } from "./seed";
import { DEMO_TODAY } from "@/lib/utils/format";
import type {
  CustomerActivity,
  CustomerNotification,
  CustomerOrder,
  LeatherProduct,
  QuoteRequest,
  SampleRequest,
  UserAccount,
} from "@/types";

/**
 * Customer Front / Portal 시연 데이터.
 *
 * 내부 AX의 거래처(CUSTOMERS)와 customerId로 연결된다. 고객이 화면에서 하는
 * 행동(조회·관심·샘플·견적·주문)은 모두 여기 형식으로 쌓이고, 내부 AX는
 * 같은 데이터를 영업 신호로 읽는다. 한 벌의 데이터를 양쪽에서 보는 구조다.
 */

/** 기준일에서 n일 전 */
function daysAgo(n: number): string {
  const d = new Date(`${DEMO_TODAY}T00:00:00`);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/* ── 계정 ─────────────────────────────────────────────── */

export const ACCOUNTS: UserAccount[] = [
  { id: "u-admin", role: "admin", name: "손순옥 대표", org: "선진산업" },
  { id: "u-staff", role: "staff", name: "영업담당", org: "선진산업" },
  ...CUSTOMERS.slice(0, 10).map((c, i) => ({
    id: `u-${c.id}`,
    role: "customer" as const,
    name: c.contactName,
    org: c.name,
    customerId: c.id,
  })).filter((_, i) => i < 10),
];

/** 시연 기본 고객 계정 — 한성패션 */
export const DEFAULT_CUSTOMER_ACCOUNT_ID = "u-c01";
export const DEFAULT_ADMIN_ACCOUNT_ID = "u-admin";

export function getAccount(id: string): UserAccount | undefined {
  return ACCOUNTS.find((a) => a.id === id);
}

/* ── 용도 분류 ────────────────────────────────────────────
   제품에 용도 필드를 따로 두지 않고 두께·소재에서 규칙으로 도출한다.
   기준이 코드에 드러나 있어 왜 이 용도로 분류됐는지 설명할 수 있다. */

export const USAGES = ["가방", "신발", "의류", "소품"] as const;
export type Usage = (typeof USAGES)[number];

export function usagesFor(p: LeatherProduct): Usage[] {
  const out: Usage[] = [];
  const t = p.thicknessMm;
  // 가방 — 형태 유지가 필요해 중간 두께 이상, 소가죽·염소가죽·스플릿
  if (t >= 1.0 && ["Cow", "Goat", "Split"].includes(p.material)) out.push("가방");
  // 신발 — 갑피용으로 두껍고 튼튼한 소재
  if (t >= 1.2 && ["Cow", "Split"].includes(p.material)) out.push("신발");
  // 의류 — 부드럽고 얇은 소재
  if (t <= 1.0 && ["Lamb", "Goat"].includes(p.material)) out.push("의류");
  // 소품 — 지갑·벨트·액세서리. 대부분의 두께가 가능하다
  if (t >= 0.8 && t <= 1.4) out.push("소품");
  return out.length ? out : ["소품"];
}

/** 예상 납기 — 재고가 넉넉할수록 빨리 나간다 (시연용 규칙) */
export function leadTimeDays(p: LeatherProduct): number {
  if (p.stockQty >= 300) return 3;
  if (p.stockQty >= 150) return 4;
  if (p.stockQty >= 80) return 5;
  return 7;
}

/* ── 관심 제품 ────────────────────────────────────────── */

export interface Favorite {
  customerId: string;
  productId: string;
  date: string;
}

export const SEED_FAVORITES: Favorite[] = [
  { customerId: "c01", productId: "p01", date: daysAgo(41) },
  { customerId: "c01", productId: "p03", date: daysAgo(28) },
  { customerId: "c01", productId: "p19", date: daysAgo(12) },
  { customerId: "c02", productId: "p16", date: daysAgo(35) },
  { customerId: "c02", productId: "p18", date: daysAgo(19) },
  { customerId: "c03", productId: "p08", date: daysAgo(46) },
  { customerId: "c03", productId: "p13", date: daysAgo(23) },
  { customerId: "c04", productId: "p19", date: daysAgo(52) },
  { customerId: "c05", productId: "p09", date: daysAgo(31) },
  { customerId: "c05", productId: "p10", date: daysAgo(17) },
  { customerId: "c06", productId: "p05", date: daysAgo(44) },
  { customerId: "c07", productId: "p12", date: daysAgo(26) },
  { customerId: "c08", productId: "p06", date: daysAgo(15) },
  { customerId: "c10", productId: "p04", date: daysAgo(38) },
  { customerId: "c11", productId: "p23", date: daysAgo(9) },
  { customerId: "c01", productId: "p23", date: daysAgo(5) },
];

/* ── 샘플 요청 ────────────────────────────────────────── */

export const SEED_SAMPLE_REQUESTS: SampleRequest[] = [
  {
    id: "sr01", number: "SR-2026-018", customerId: "c01",
    productIds: ["p01", "p03"], qty: 2, contactName: "김영주 이사",
    note: "가방 본체용. 검정 계열 두 종 비교하고 싶습니다.",
    status: "회신완료", createdAt: daysAgo(38),
  },
  {
    id: "sr02", number: "SR-2026-019", customerId: "c05",
    productIds: ["p09"], qty: 1, contactName: "정하늘 팀장",
    note: "수출 물량 검토용",
    status: "회신완료", createdAt: daysAgo(31),
  },
  {
    id: "sr03", number: "SR-2026-020", customerId: "c03",
    productIds: ["p08", "p13"], qty: 2, contactName: "이수진 실장",
    status: "회신완료", createdAt: daysAgo(24),
  },
  {
    id: "sr04", number: "SR-2026-021", customerId: "c07",
    productIds: ["p12"], qty: 1, contactName: "박서연 과장",
    note: "핸드백 안감용 질감 확인",
    status: "검토중", createdAt: daysAgo(11),
  },
  {
    id: "sr05", number: "SR-2026-022", customerId: "c02",
    productIds: ["p16", "p17", "p18"], qty: 3, contactName: "박정호 대표",
    note: "도매 물량 색상 비교",
    status: "검토중", createdAt: daysAgo(7),
  },
  {
    id: "sr06", number: "SR-2026-023", customerId: "c10",
    productIds: ["p04"], qty: 1, contactName: "윤도현 차장",
    status: "접수", createdAt: daysAgo(4),
  },
  {
    id: "sr07", number: "SR-2026-024", customerId: "c11",
    productIds: ["p23"], qty: 1, contactName: "장미르 대리",
    note: "신규 컬러 확인 요청",
    status: "접수", createdAt: daysAgo(2),
  },
  {
    id: "sr08", number: "SR-2026-025", customerId: "c01",
    productIds: ["p23", "p19"], qty: 2, contactName: "김영주 이사",
    note: "F/W 시즌 신규 라인 검토",
    status: "접수", createdAt: daysAgo(1),
  },
];

/* ── 견적 요청 ────────────────────────────────────────── */

export const SEED_QUOTE_REQUESTS: QuoteRequest[] = [
  {
    id: "qr01", number: "QR-2026-031", customerId: "c01",
    items: [{ productId: "p01", qty: 400 }], dueDate: daysAgo(-14),
    note: "가을 시즌 본생산 물량", status: "회신완료", createdAt: daysAgo(44),
  },
  {
    id: "qr02", number: "QR-2026-032", customerId: "c02",
    items: [{ productId: "p16", qty: 900 }, { productId: "p17", qty: 600 }],
    status: "회신완료", createdAt: daysAgo(36),
  },
  {
    id: "qr03", number: "QR-2026-033", customerId: "c04",
    items: [{ productId: "p19", qty: 320 }], status: "회신완료", createdAt: daysAgo(29),
  },
  {
    id: "qr04", number: "QR-2026-034", customerId: "c03",
    items: [{ productId: "p08", qty: 110 }, { productId: "p03", qty: 90 }],
    note: "프리미엄 라인 소량", status: "회신완료", createdAt: daysAgo(22),
  },
  {
    id: "qr05", number: "QR-2026-035", customerId: "c06",
    items: [{ productId: "p05", qty: 120 }], status: "검토중", createdAt: daysAgo(14),
  },
  {
    id: "qr06", number: "QR-2026-036", customerId: "c08",
    items: [{ productId: "p06", qty: 240 }], dueDate: daysAgo(-21),
    status: "검토중", createdAt: daysAgo(9),
  },
  {
    id: "qr07", number: "QR-2026-037", customerId: "c05",
    items: [{ productId: "p09", qty: 160 }, { productId: "p10", qty: 130 }],
    note: "수출 선적 일정에 맞춰 회신 부탁드립니다.",
    status: "검토중", createdAt: daysAgo(6),
  },
  {
    id: "qr08", number: "QR-2026-038", customerId: "c01",
    items: [{ productId: "p03", qty: 150 }], dueDate: daysAgo(-28),
    status: "접수", createdAt: daysAgo(3),
  },
  {
    id: "qr09", number: "QR-2026-039", customerId: "c07",
    items: [{ productId: "p12", qty: 75 }], status: "접수", createdAt: daysAgo(2),
  },
  {
    id: "qr10", number: "QR-2026-040", customerId: "c10",
    items: [{ productId: "p04", qty: 190 }, { productId: "p02", qty: 140 }],
    note: "두 품목 합산 단가 부탁드립니다.", status: "접수", createdAt: daysAgo(1),
  },
];

/* ── 주문 ─────────────────────────────────────────────── */

export const SEED_ORDERS: CustomerOrder[] = [
  {
    id: "so01", number: "SO-2026-052", customerId: "c01",
    items: [{ productId: "p01", qty: 450, unitPrice: 13200 }],
    status: "완료", orderedAt: daysAgo(97), deliveredAt: daysAgo(92),
  },
  {
    id: "so02", number: "SO-2026-058", customerId: "c02",
    items: [{ productId: "p16", qty: 1100, unitPrice: 5800 }],
    status: "완료", orderedAt: daysAgo(84), deliveredAt: daysAgo(80),
  },
  {
    id: "so03", number: "SO-2026-063", customerId: "c01",
    items: [{ productId: "p19", qty: 340, unitPrice: 12000 }],
    status: "완료", orderedAt: daysAgo(65), deliveredAt: daysAgo(61),
  },
  {
    id: "so04", number: "SO-2026-069", customerId: "c03",
    items: [{ productId: "p13", qty: 180, unitPrice: 15800 }],
    status: "완료", orderedAt: daysAgo(53), deliveredAt: daysAgo(49),
  },
  {
    id: "so05", number: "SO-2026-074", customerId: "c05",
    items: [{ productId: "p09", qty: 150, unitPrice: 20400 }],
    status: "완료", orderedAt: daysAgo(41), deliveredAt: daysAgo(36),
  },
  {
    id: "so06", number: "SO-2026-081", customerId: "c01",
    items: [{ productId: "p03", qty: 200, unitPrice: 17200 }],
    status: "출고완료", orderedAt: daysAgo(24), deliveredAt: daysAgo(19),
  },
  {
    id: "so07", number: "SO-2026-086", customerId: "c02",
    items: [{ productId: "p18", qty: 680, unitPrice: 5400 }],
    status: "배송중", orderedAt: daysAgo(8),
  },
  {
    id: "so08", number: "SO-2026-089", customerId: "c08",
    items: [{ productId: "p06", qty: 220, unitPrice: 9400 }],
    status: "생산중", orderedAt: daysAgo(3),
  },
];

/* ── 디지털 활동 ──────────────────────────────────────── */

const P = (id: string) => PRODUCTS.find((p) => p.id === id)?.name ?? id;

export const SEED_ACTIVITIES_CUSTOMER: CustomerActivity[] = [
  { id: "ca01", customerId: "c01", kind: "view", productId: "p01", label: `${P("p01")} 상세 조회`, date: daysAgo(1) },
  { id: "ca02", customerId: "c01", kind: "view", productId: "p01", label: `${P("p01")} 상세 조회`, date: daysAgo(2) },
  { id: "ca03", customerId: "c01", kind: "view", productId: "p03", label: `${P("p03")} 상세 조회`, date: daysAgo(2) },
  { id: "ca04", customerId: "c01", kind: "search", label: "가방용 · Cow · Black · 1.2~1.4mm 검색", date: daysAgo(2) },
  { id: "ca05", customerId: "c01", kind: "favorite", productId: "p23", label: `${P("p23")} 관심 등록`, date: daysAgo(5) },
  { id: "ca06", customerId: "c01", kind: "view", productId: "p19", label: `${P("p19")} 상세 조회`, date: daysAgo(6) },
  { id: "ca07", customerId: "c01", kind: "view", productId: "p01", label: `${P("p01")} 상세 조회`, date: daysAgo(9) },
  { id: "ca08", customerId: "c01", kind: "quote", label: "견적 요청 QR-2026-038", date: daysAgo(3) },
  { id: "ca09", customerId: "c01", kind: "sample", label: "샘플 요청 SR-2026-025", date: daysAgo(1) },
  { id: "ca10", customerId: "c01", kind: "view", productId: "p03", label: `${P("p03")} 상세 조회`, date: daysAgo(11) },
  { id: "ca11", customerId: "c02", kind: "view", productId: "p16", label: `${P("p16")} 상세 조회`, date: daysAgo(4) },
  { id: "ca12", customerId: "c02", kind: "sample", label: "샘플 요청 SR-2026-022", date: daysAgo(7) },
  { id: "ca13", customerId: "c02", kind: "view", productId: "p17", label: `${P("p17")} 상세 조회`, date: daysAgo(8) },
  { id: "ca14", customerId: "c02", kind: "order", label: "주문 SO-2026-086", date: daysAgo(8) },
  { id: "ca15", customerId: "c03", kind: "view", productId: "p08", label: `${P("p08")} 상세 조회`, date: daysAgo(13) },
  { id: "ca16", customerId: "c03", kind: "favorite", productId: "p13", label: `${P("p13")} 관심 등록`, date: daysAgo(23) },
  { id: "ca17", customerId: "c04", kind: "view", productId: "p19", label: `${P("p19")} 상세 조회`, date: daysAgo(16) },
  { id: "ca18", customerId: "c05", kind: "quote", label: "견적 요청 QR-2026-037", date: daysAgo(6) },
  { id: "ca19", customerId: "c05", kind: "view", productId: "p10", label: `${P("p10")} 상세 조회`, date: daysAgo(6) },
  { id: "ca20", customerId: "c05", kind: "view", productId: "p09", label: `${P("p09")} 상세 조회`, date: daysAgo(7) },
  { id: "ca21", customerId: "c06", kind: "quote", label: "견적 요청 QR-2026-035", date: daysAgo(14) },
  { id: "ca22", customerId: "c07", kind: "sample", label: "샘플 요청 SR-2026-021", date: daysAgo(11) },
  { id: "ca23", customerId: "c07", kind: "quote", label: "견적 요청 QR-2026-039", date: daysAgo(2) },
  { id: "ca24", customerId: "c08", kind: "order", label: "주문 SO-2026-089", date: daysAgo(3) },
  { id: "ca25", customerId: "c08", kind: "view", productId: "p06", label: `${P("p06")} 상세 조회`, date: daysAgo(4) },
  { id: "ca26", customerId: "c10", kind: "quote", label: "견적 요청 QR-2026-040", date: daysAgo(1) },
  { id: "ca27", customerId: "c10", kind: "view", productId: "p04", label: `${P("p04")} 상세 조회`, date: daysAgo(1) },
  { id: "ca28", customerId: "c10", kind: "sample", label: "샘플 요청 SR-2026-023", date: daysAgo(4) },
  { id: "ca29", customerId: "c11", kind: "favorite", productId: "p23", label: `${P("p23")} 관심 등록`, date: daysAgo(9) },
  { id: "ca30", customerId: "c11", kind: "sample", label: "샘플 요청 SR-2026-024", date: daysAgo(2) },
  { id: "ca31", customerId: "c01", kind: "reorder", label: "재주문 요청 — Cow Leather Black 1.4mm", date: daysAgo(15) },
  { id: "ca32", customerId: "c03", kind: "view", productId: "p03", label: `${P("p03")} 상세 조회`, date: daysAgo(18) },
];

/* ── 알림 ─────────────────────────────────────────────── */

export const SEED_CUSTOMER_NOTIFICATIONS: CustomerNotification[] = [
  {
    id: "cn01", customerId: "c01", kind: "restock",
    title: "관심 제품이 재입고되었습니다",
    body: "Cow Leather Camel 1.2mm(SJ-COW-CML-12) 165평이 입고됐습니다.",
    date: daysAgo(1), href: "/products/p23",
  },
  {
    id: "cn02", customerId: "c01", kind: "quote",
    title: "요청하신 견적이 검토 중입니다",
    body: "QR-2026-038 · Cow Leather Black 1.2mm Premium 150평",
    date: daysAgo(2), href: "/portal",
  },
  {
    id: "cn03", customerId: "c01", kind: "reorder",
    title: "이전에 구매한 제품을 다시 확인해보세요",
    body: "Cow Leather Black 1.4mm — 마지막 주문 후 97일이 지났습니다.",
    date: daysAgo(4), href: "/portal",
  },
  {
    id: "cn04", customerId: "c01", kind: "similar",
    title: "최근 본 제품과 유사한 신규 피혁이 입고됐습니다",
    body: "Lamb Leather Dark Brown 0.8mm — Premium / Aniline",
    date: daysAgo(6), href: "/products/p25",
  },
  {
    id: "cn05", customerId: "c02", kind: "sample",
    title: "샘플이 발송되었습니다",
    body: "SR-2026-022 · Split 계열 3종",
    date: daysAgo(5), href: "/portal",
  },
];
