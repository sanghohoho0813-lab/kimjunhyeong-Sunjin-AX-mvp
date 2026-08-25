"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

const STEPS = [
  {
    title: "회사 현황을 한눈에",
    body: "대시보드에서 매출·이익·재무 상태와 AI 경영 브리핑을 10초 안에 확인합니다.",
    href: "/dashboard",
  },
  {
    title: "오늘의 AX 추천",
    body: "AX가 장기재고·재접촉 거래처·마진 개선 기회 등 오늘 필요한 행동을 추천합니다.",
    href: "/insights",
  },
  {
    title: "장기재고 → 판매 거래처 연결",
    body: "오래 보유한 피혁을 클릭하면 구매 가능성이 높은 거래처와 추천 이유가 함께 표시됩니다.",
    href: "/inventory?status=장기재고",
  },
  {
    title: "거래처별 추천 견적",
    body: "거래처와 제품을 선택하면 추천 단가와 예상 매출·마진이 자동 계산됩니다.",
    href: "/quotes/new",
  },
  {
    title: "모바일에서도 동일하게",
    body: "외부에서도 스마트폰으로 같은 데이터를 확인하고 바로 영업 액션을 등록할 수 있습니다.",
    href: "/dashboard",
  },
] as const;

export function DemoTour() {
  const open = useAppStore((s) => s.tourOpen);
  const finishTour = useAppStore((s) => s.finishTour);
  const router = useRouter();
  const [step, setStep] = useState(0);

  const close = () => {
    finishTour();
    setStep(0);
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            className="absolute inset-0 bg-navy-950/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="AX 둘러보기"
            className="relative mb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] w-full max-w-md rounded-card bg-white p-6 shadow-modal sm:mb-0"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.26 }}
          >
            <button
              onClick={close}
              aria-label="둘러보기 닫기"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-surface hover:text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AX 둘러보기 {step + 1}/{STEPS.length}
            </span>
            <h3 className="mt-3 text-lg font-extrabold text-ink-900">
              {current.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {current.body}
            </p>

            <div className="mt-5 flex items-center justify-between gap-2">
              <div className="flex gap-1.5" aria-hidden>
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={
                      i === step
                        ? "h-1.5 w-5 rounded-full bg-brand-600 transition-all"
                        : "h-1.5 w-1.5 rounded-full bg-ink-200 transition-all"
                    }
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {step > 0 ? (
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="flex h-10 items-center gap-1 rounded-btn border border-surface-line px-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-surface"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden /> 이전
                  </button>
                ) : (
                  <button
                    onClick={close}
                    className="h-10 rounded-btn px-3 text-sm font-medium text-ink-400 transition-colors hover:text-ink-600"
                  >
                    건너뛰기
                  </button>
                )}
                <button
                  onClick={() => {
                    router.push(current.href);
                    if (step === STEPS.length - 1) close();
                    else setStep((s) => s + 1);
                  }}
                  className="flex h-10 items-center gap-1 rounded-btn bg-brand-600 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-700"
                >
                  {step === STEPS.length - 1 ? "시작하기" : "다음"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
