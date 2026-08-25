/** 숫자·날짜 포맷 유틸 — 시연 데이터는 고정 기준일을 사용해 SSR/CSR 결과를 일치시킨다. */

/** 시연 기준일 — 화면의 "현재"는 모두 이 날짜를 기준으로 계산한다. */
export const DEMO_TODAY = "2026-08-25";

/** 진행 중인 연도 / 직전 완료 연도 */
export const CURRENT_YEAR = Number(DEMO_TODAY.slice(0, 4));
export const CURRENT_MONTH = Number(DEMO_TODAY.slice(5, 7));
/** 감사받은 연간 실적이 존재하는 마지막 연도 */
export const LAST_CLOSED_YEAR = CURRENT_YEAR - 1;

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(from: string, to: string = DEMO_TODAY): number {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.max(0, Math.round((b - a) / DAY_MS));
}

/** 12950000 → "1,295만원" / 1295000000 → "12.95억원" */
export function formatKRW(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 100_000_000) {
    const eok = abs / 100_000_000;
    return `${sign}${eok >= 100 ? Math.round(eok).toLocaleString() : trimNum(eok)}억원`;
  }
  if (abs >= 10_000) {
    return `${sign}${Math.round(abs / 10_000).toLocaleString()}만원`;
  }
  return `${sign}${Math.round(abs).toLocaleString()}원`;
}

/** 억원 단위 값 표시: 12.95 → "12.95억" */
export function formatEok(eok: number, suffix = "억"): string {
  return `${trimNum(eok)}${suffix}`;
}

function trimNum(n: number): string {
  const fixed = n.toFixed(2);
  return fixed.replace(/\.?0+$/, "");
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}.${m}.${d}`;
}

export function formatDateShort(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/** n일 전 표기 */
export function formatDaysAgo(date: string): string {
  const days = daysBetween(date);
  if (days === 0) return "오늘";
  if (days < 30) return `${days}일 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}

/** "2026-08-25" → "2026년 8월 25일" */
export function formatDateKo(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

/** "2026-08-25" → "2026년 8월" */
export function formatMonthKo(date: string): string {
  const [y, m] = date.split("-");
  return `${y}년 ${Number(m)}월`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
