"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_ACTIVITIES, SEED_QUOTES } from "@/lib/data/seed";
import {
  DEFAULT_ADMIN_ACCOUNT_ID,
  SEED_ACTIVITIES_CUSTOMER,
  SEED_CUSTOMER_NOTIFICATIONS,
  SEED_FAVORITES,
  SEED_ORDERS,
  SEED_QUOTE_REQUESTS,
  SEED_SAMPLE_REQUESTS,
  getAccount,
  type Favorite,
} from "@/lib/data/customer";
import { DEMO_TODAY } from "@/lib/utils/format";
import type {
  CustomerActivity,
  CustomerNotification,
  CustomerOrder,
  Quote,
  QuoteItem,
  QuoteRequest,
  QuoteRequestItem,
  SalesActivity,
  SampleRequest,
  UserAccount,
} from "@/types";

export type FontScale = "sm" | "base" | "lg";
export type PeriodYear = 2023 | 2024 | 2025;

interface ToastItem {
  id: number;
  message: string;
}

interface AppState {
  /* ── 세션 / 역할 ────────────────────────────────────
     시연용 역할 전환. 실제 인증 대신 계정 id만 들고 다닌다. */
  accountId: string;
  setAccountId: (id: string) => void;

  /* ── 고객 Front 데이터 (시드 위에 누적) ───────────── */
  favorites: Favorite[];
  toggleFavorite: (customerId: string, productId: string) => boolean;
  sampleRequests: SampleRequest[];
  addSampleRequest: (
    input: Omit<SampleRequest, "id" | "number" | "status" | "createdAt">
  ) => SampleRequest;
  quoteRequests: QuoteRequest[];
  addQuoteRequest: (
    input: Omit<QuoteRequest, "id" | "number" | "status" | "createdAt">
  ) => QuoteRequest;
  customerOrders: CustomerOrder[];
  addReorder: (source: CustomerOrder, items: CustomerOrder["items"]) => CustomerOrder;
  customerActivities: CustomerActivity[];
  logActivity: (a: Omit<CustomerActivity, "id" | "date">) => void;
  readNotificationIds: string[];
  markNotificationsRead: (ids: string[]) => void;

  /** 내부 AX ↔ 고객 Front 왕복 시 돌아갈 내부 경로 */
  internalReturnPath: string;
  setInternalReturnPath: (path: string) => void;

  // 화면 설정
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;

  /** PC 버전으로 보기 — 모바일에서 viewport를 고정폭으로 바꿔 데스크톱 레이아웃을 표시 */
  desktopMode: boolean;
  setDesktopMode: (on: boolean) => void;

  // 기간 선택 (대시보드)
  periodYear: PeriodYear;
  setPeriodYear: (year: PeriodYear) => void;

  // 사용자 생성 데이터 (시드 데이터 위에 누적)
  savedQuotes: Quote[];
  addQuote: (customerId: string, items: QuoteItem[], memo?: string) => Quote;
  activities: SalesActivity[];
  addActivity: (activity: Omit<SalesActivity, "id" | "date">) => void;

  // 알림
  readAlertIds: string[];
  markAlertsRead: (ids: string[]) => void;

  // 전역 UI 상태 (비저장)
  alertsOpen: boolean;
  setAlertsOpen: (open: boolean) => void;
  moreOpen: boolean;
  setMoreOpen: (open: boolean) => void;

  // 둘러보기
  tourDone: boolean;
  tourOpen: boolean;
  setTourOpen: (open: boolean) => void;
  finishTour: () => void;

  // 토스트
  toasts: ToastItem[];
  pushToast: (message: string) => void;
  dismissToast: (id: number) => void;

  // 데모 초기화
  resetDemo: () => void;
}

let toastSeq = 1;
let quoteSeq = 1;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      accountId: DEFAULT_ADMIN_ACCOUNT_ID,
      setAccountId: (accountId) => set({ accountId }),

      favorites: [],
      toggleFavorite: (customerId, productId) => {
        const all = get().favorites;
        const hit = all.find(
          (f) => f.customerId === customerId && f.productId === productId
        );
        if (hit) {
          set({ favorites: all.filter((f) => f !== hit) });
          return false;
        }
        set({
          favorites: [{ customerId, productId, date: DEMO_TODAY }, ...all],
        });
        return true;
      },

      sampleRequests: [],
      addSampleRequest: (input) => {
        const seq =
          SEED_SAMPLE_REQUESTS.length + get().sampleRequests.length + 26;
        const req: SampleRequest = {
          ...input,
          id: `usr-${Date.now()}`,
          number: `SR-2026-${String(seq).padStart(3, "0")}`,
          status: "접수",
          createdAt: DEMO_TODAY,
        };
        set({ sampleRequests: [req, ...get().sampleRequests] });
        get().logActivity({
          customerId: input.customerId,
          kind: "sample",
          label: `샘플 요청 ${req.number}`,
        });
        return req;
      },

      quoteRequests: [],
      addQuoteRequest: (input) => {
        const seq =
          SEED_QUOTE_REQUESTS.length + get().quoteRequests.length + 31;
        const req: QuoteRequest = {
          ...input,
          id: `uqr-${Date.now()}`,
          number: `QR-2026-${String(seq).padStart(3, "0")}`,
          status: "접수",
          createdAt: DEMO_TODAY,
        };
        set({ quoteRequests: [req, ...get().quoteRequests] });
        get().logActivity({
          customerId: input.customerId,
          kind: "quote",
          label: `견적 요청 ${req.number}`,
        });
        return req;
      },

      customerOrders: [],
      addReorder: (source, items) => {
        const seq = SEED_ORDERS.length + get().customerOrders.length + 90;
        const order: CustomerOrder = {
          id: `uso-${Date.now()}`,
          number: `SO-2026-${String(seq).padStart(3, "0")}`,
          customerId: source.customerId,
          items,
          status: "접수",
          orderedAt: DEMO_TODAY,
          reorderOf: source.number,
        };
        set({ customerOrders: [order, ...get().customerOrders] });
        get().logActivity({
          customerId: source.customerId,
          kind: "reorder",
          label: `재주문 요청 ${order.number}`,
        });
        return order;
      },

      customerActivities: [],
      logActivity: (a) =>
        set({
          customerActivities: [
            { ...a, id: `uca-${Date.now()}-${Math.round(performance.now())}`, date: DEMO_TODAY },
            ...get().customerActivities,
          ],
        }),

      readNotificationIds: [],
      markNotificationsRead: (ids) =>
        set({
          readNotificationIds: Array.from(
            new Set([...get().readNotificationIds, ...ids])
          ),
        }),

      internalReturnPath: "/dashboard",
      setInternalReturnPath: (internalReturnPath) => set({ internalReturnPath }),

      fontScale: "base",
      setFontScale: (fontScale) => set({ fontScale }),

      desktopMode: false,
      setDesktopMode: (desktopMode) => set({ desktopMode }),

      periodYear: 2025,
      setPeriodYear: (periodYear) => set({ periodYear }),

      savedQuotes: [],
      addQuote: (customerId, items, memo) => {
        const seq = SEED_QUOTES.length + get().savedQuotes.length + 1;
        const quote: Quote = {
          id: `uq-${Date.now()}-${quoteSeq++}`,
          number: `Q-2025-${String(33 + seq).padStart(3, "0")}`,
          customerId,
          items,
          status: "작성중",
          createdAt: DEMO_TODAY,
          memo,
          source: "ax",
        };
        set({ savedQuotes: [quote, ...get().savedQuotes] });
        return quote;
      },

      activities: [],
      addActivity: (activity) => {
        set({
          activities: [
            {
              ...activity,
              id: `ua-${Date.now()}`,
              date: DEMO_TODAY,
            },
            ...get().activities,
          ],
        });
      },

      readAlertIds: [],
      markAlertsRead: (ids) =>
        set({
          readAlertIds: Array.from(new Set([...get().readAlertIds, ...ids])),
        }),

      alertsOpen: false,
      setAlertsOpen: (alertsOpen) => set({ alertsOpen }),
      moreOpen: false,
      setMoreOpen: (moreOpen) => set({ moreOpen }),

      tourDone: false,
      tourOpen: false,
      setTourOpen: (tourOpen) => set({ tourOpen }),
      finishTour: () => set({ tourDone: true, tourOpen: false }),

      toasts: [],
      pushToast: (message) => {
        const id = toastSeq++;
        set({ toasts: [...get().toasts, { id, message }] });
        setTimeout(() => get().dismissToast(id), 2600);
      },
      dismissToast: (id) =>
        set({ toasts: get().toasts.filter((t) => t.id !== id) }),

      resetDemo: () =>
        set({
          accountId: DEFAULT_ADMIN_ACCOUNT_ID,
          favorites: [],
          sampleRequests: [],
          quoteRequests: [],
          customerOrders: [],
          customerActivities: [],
          readNotificationIds: [],
          internalReturnPath: "/dashboard",
          savedQuotes: [],
          activities: [],
          readAlertIds: [],
          fontScale: "base",
          desktopMode: false,
          periodYear: 2025,
          tourDone: false,
        }),
    }),
    {
      name: "sunjin-ax-store",
      skipHydration: true,
      partialize: (state) => ({
        accountId: state.accountId,
        favorites: state.favorites,
        sampleRequests: state.sampleRequests,
        quoteRequests: state.quoteRequests,
        customerOrders: state.customerOrders,
        customerActivities: state.customerActivities,
        readNotificationIds: state.readNotificationIds,
        fontScale: state.fontScale,
        desktopMode: state.desktopMode,
        savedQuotes: state.savedQuotes,
        activities: state.activities,
        readAlertIds: state.readAlertIds,
        tourDone: state.tourDone,
      }),
    }
  )
);

/** 시드 + 사용자 생성 견적 통합 목록 */
export function useAllQuotes(): Quote[] {
  const saved = useAppStore((s) => s.savedQuotes);
  return [...saved, ...SEED_QUOTES];
}

/** 시드 + 사용자 생성 영업 활동 통합 목록 */
export function useAllActivities(): SalesActivity[] {
  const added = useAppStore((s) => s.activities);
  return [...added, ...SEED_ACTIVITIES];
}


/* ── 세션 / 고객 데이터 셀렉터 ────────────────────────────
   시드 데이터와 사용자 생성 데이터를 합쳐 한 벌로 돌려준다.
   화면은 어느 쪽에서 온 데이터인지 구분할 필요가 없다. */

/** 현재 로그인한 계정 */
export function useAccount(): UserAccount {
  const id = useAppStore((s) => s.accountId);
  return getAccount(id) ?? { id, role: "admin", name: "손순옥 대표", org: "선진산업" };
}

/** 내부 AX 접근 권한 — 관리자·직원만 */
export function useIsInternal(): boolean {
  const account = useAccount();
  return account.role === "admin" || account.role === "staff";
}

export function useFavorites(customerId?: string): Favorite[] {
  const added = useAppStore((s) => s.favorites);
  const all = [...added, ...SEED_FAVORITES];
  return customerId ? all.filter((f) => f.customerId === customerId) : all;
}

export function useAllSampleRequests(): SampleRequest[] {
  const added = useAppStore((s) => s.sampleRequests);
  return [...added, ...SEED_SAMPLE_REQUESTS];
}

export function useAllQuoteRequests(): QuoteRequest[] {
  const added = useAppStore((s) => s.quoteRequests);
  return [...added, ...SEED_QUOTE_REQUESTS];
}

export function useAllOrders(): CustomerOrder[] {
  const added = useAppStore((s) => s.customerOrders);
  return [...added, ...SEED_ORDERS];
}

export function useAllCustomerActivities(): CustomerActivity[] {
  const added = useAppStore((s) => s.customerActivities);
  return [...added, ...SEED_ACTIVITIES_CUSTOMER];
}

export function useCustomerNotifications(
  customerId?: string
): CustomerNotification[] {
  return customerId
    ? SEED_CUSTOMER_NOTIFICATIONS.filter((n) => n.customerId === customerId)
    : SEED_CUSTOMER_NOTIFICATIONS;
}

export type { Favorite, QuoteRequestItem };
