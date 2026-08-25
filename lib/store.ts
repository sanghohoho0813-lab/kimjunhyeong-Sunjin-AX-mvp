"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_ACTIVITIES, SEED_QUOTES } from "@/lib/data/seed";
import { DEMO_TODAY } from "@/lib/utils/format";
import type { Quote, QuoteItem, SalesActivity } from "@/types";

export type FontScale = "sm" | "base" | "lg";
export type PeriodYear = 2023 | 2024 | 2025;

interface ToastItem {
  id: number;
  message: string;
}

interface AppState {
  // 화면 설정
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;

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
      fontScale: "base",
      setFontScale: (fontScale) => set({ fontScale }),

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
          savedQuotes: [],
          activities: [],
          readAlertIds: [],
          fontScale: "base",
          periodYear: 2025,
          tourDone: false,
        }),
    }),
    {
      name: "sunjin-ax-store",
      skipHydration: true,
      partialize: (state) => ({
        fontScale: state.fontScale,
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
