"use client";

import { Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import { AlertDrawer } from "./AlertDrawer";
import { DemoTour } from "./DemoTour";
import { BottomNav, MobileHeader } from "./MobileChrome";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/shared/Toaster";

/** 첫 방문 시 노출되는 작은 둘러보기 배너 (사용을 방해하지 않는 형태) */
function TourPrompt() {
  const tourDone = useAppStore((s) => s.tourDone);
  const tourOpen = useAppStore((s) => s.tourOpen);
  const setTourOpen = useAppStore((s) => s.setTourOpen);
  const finishTour = useAppStore((s) => s.finishTour);
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  // 견적 빌더의 하단 고정 저장 바와 겹치지 않도록 해당 화면에서는 숨김
  if (!hydrated || tourDone || tourOpen || pathname.startsWith("/quotes/new"))
    return null;

  return (
    <div className="fixed bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+14px)] right-4 z-50 lg:bottom-6 lg:right-6">
      <div className="flex items-center gap-1 rounded-full bg-navy-900 py-1.5 pl-4 pr-1.5 shadow-modal">
        <button
          onClick={() => setTourOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white"
        >
          <Sparkles className="h-4 w-4 text-gold-300" aria-hidden />
          AX 둘러보기
        </button>
        <button
          onClick={finishTour}
          aria-label="둘러보기 배너 닫기"
          className="flex h-8 w-8 items-center justify-center rounded-full text-navy-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const fontScale = useAppStore((s) => s.fontScale);
  const pathname = usePathname();

  // 저장된 상태 복원 (skipHydration 대응)
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  // 글자 크기 설정을 문서 루트에 반영
  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
  }, [fontScale]);

  // 페이지 전환 시 스크롤 상단 이동
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileHeader />
      <main className="pt-[54px] lg:pl-[236px] lg:pt-0">
        <div className="mx-auto w-full max-w-shell px-4 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+24px)] pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-7">
          {children}
        </div>
        <footer className="hidden pb-6 text-center text-[0.7rem] text-navy-300 lg:block">
          © 선진산업 Business AX · 미래에이아이랩 x 김준형
        </footer>
      </main>
      <BottomNav />
      <AlertDrawer />
      <DemoTour />
      <TourPrompt />
      <Toaster />
    </div>
  );
}
