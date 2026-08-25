"use client";

import { Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import { AlertDrawer } from "./AlertDrawer";
import { DemoTour } from "./DemoTour";
import { BottomNav, MobileHeader } from "./MobileChrome";
import { Sidebar } from "./Sidebar";
import { DesktopModeButton, MobileModeReturnBar } from "./ViewModeToggle";
import { Toaster } from "@/components/shared/Toaster";

/** PC 버전으로 볼 때 적용하는 고정 viewport 폭 (데스크톱 레이아웃 최소 기준) */
const DESKTOP_VIEWPORT_WIDTH = 1280;

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
  const desktopMode = useAppStore((s) => s.desktopMode);
  const pathname = usePathname();

  // 저장된 상태 복원 (skipHydration 대응)
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  // 글자 크기 설정을 문서 루트에 반영
  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
  }, [fontScale]);

  // PC 버전으로 보기 — viewport 폭을 고정해 모바일에서도 데스크톱 레이아웃을 렌더링
  useEffect(() => {
    const desired = desktopMode
      ? `width=${DESKTOP_VIEWPORT_WIDTH}, viewport-fit=cover`
      : "width=device-width, initial-scale=1, viewport-fit=cover";

    const apply = () => {
      const meta = document.querySelector<HTMLMetaElement>(
        'meta[name="viewport"]'
      );
      // 값이 같으면 건드리지 않아 감시 → 재설정 루프를 방지한다.
      if (meta && meta.getAttribute("content") !== desired) {
        meta.setAttribute("content", desired);
      }
    };

    apply();
    document.documentElement.dataset.viewMode = desktopMode
      ? "desktop"
      : "responsive";

    // 페이지 이동 시 Next.js가 layout의 viewport 메타데이터를 다시 적용해
    // 선택한 화면 모드가 풀리므로, head 변경을 감시해 계속 유지한다.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["content"],
    });
    return () => observer.disconnect();
  }, [desktopMode]);

  // 페이지 전환 시 스크롤 상단 이동
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <MobileHeader />
      <main className="pt-[54px] lg:pl-[236px] lg:pt-0">
        <div className="mx-auto w-full max-w-shell px-4 pb-6 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-7">
          {children}
        </div>

        {/* 모바일 푸터 — PC 버전 전환 (견적 빌더는 자체 하단 CTA가 있어 제외) */}
        {pathname.startsWith("/quotes/new") ? (
          <div className="h-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] lg:hidden" />
        ) : (
          <div className="mx-auto w-full max-w-shell px-4 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+20px)] sm:px-6 lg:hidden">
            <DesktopModeButton />
            <p className="mt-3 text-center text-[0.68rem] text-navy-300">
              © 선진산업 Business AX · 미래에이아이랩 x 김준형
            </p>
          </div>
        )}

        <footer className="hidden pb-6 text-center text-[0.7rem] text-navy-300 lg:block">
          © 선진산업 Business AX · 미래에이아이랩 x 김준형
        </footer>
      </main>
      <BottomNav />
      <AlertDrawer />
      <DemoTour />
      <TourPrompt />
      <MobileModeReturnBar />
      <Toaster />
    </div>
  );
}
