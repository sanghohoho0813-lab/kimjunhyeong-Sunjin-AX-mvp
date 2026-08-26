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
import { LiveClockMobile } from "@/components/shared/LiveClock";
import { COMPANY } from "@/lib/data/seed";

/** PC 버전으로 볼 때 적용하는 고정 viewport 폭 */
const DESKTOP_VIEWPORT_WIDTH = 1280;

/** 첫 방문 시 노출되는 작은 둘러보기 배너 */
function TourPrompt() {
  const tourDone = useAppStore((s) => s.tourDone);
  const tourOpen = useAppStore((s) => s.tourOpen);
  const setTourOpen = useAppStore((s) => s.setTourOpen);
  const finishTour = useAppStore((s) => s.finishTour);
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  if (!hydrated || tourDone || tourOpen || pathname.startsWith("/quotes/new"))
    return null;

  return (
    <div className="fixed bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+14px)] right-4 z-50 lg:hidden">
      <div className="flex items-center gap-1 rounded-pill bg-navy-900 py-1.5 pl-4 pr-1.5 shadow-modal">
        <button
          onClick={() => setTourOpen(true)}
          className="flex items-center gap-2 text-[0.84rem] font-bold text-white"
        >
          <Sparkles className="h-4 w-4 text-teal-300" aria-hidden />
          AX 둘러보기
        </button>
        <button
          onClick={finishTour}
          aria-label="둘러보기 배너 닫기"
          className="flex h-8 w-8 items-center justify-center rounded-full text-navy-200 transition-colors hover:bg-white/10 hover:text-white"
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

  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
  }, [fontScale]);

  // PC 버전으로 보기 — viewport 폭 고정
  useEffect(() => {
    const desired = desktopMode
      ? `width=${DESKTOP_VIEWPORT_WIDTH}, viewport-fit=cover`
      : "width=device-width, initial-scale=1, viewport-fit=cover";

    const apply = () => {
      const meta = document.querySelector<HTMLMetaElement>(
        'meta[name="viewport"]'
      );
      if (meta && meta.getAttribute("content") !== desired) {
        meta.setAttribute("content", desired);
      }
    };

    apply();
    document.documentElement.dataset.viewMode = desktopMode
      ? "desktop"
      : "responsive";

    // 페이지 이동 시 Next.js가 viewport 메타데이터를 재적용하므로 감시해 유지한다.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["content"],
    });
    return () => observer.disconnect();
  }, [desktopMode]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const isQuoteBuilder = pathname.startsWith("/quotes/new");

  return (
    <div className="flex min-h-dvh bg-surface">
      <Sidebar />
      <MobileHeader />

      {/* Main Workspace — 사이드바를 제외한 남은 폭을 전부 사용 */}
      <div className="flex min-w-0 flex-1 flex-col pt-[var(--mobile-header-height)] lg:pl-sidebar lg:pt-0">
        <main className="flex-1">
          <div className="mx-auto w-full max-w-workspace px-4 pb-7 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-8 2xl:px-8">
            {/* 모바일 실시간 시계 — 대시보드처럼 PageHeader를 쓰지 않는 화면에도
                같은 자리에 보이도록 셸에서 한 번만 그린다.
                데스크톱은 PageHeader 우측 상단 유틸리티 줄에 있다. */}
            <div className="mb-3 lg:hidden">
              <LiveClockMobile />
            </div>
            {children}
          </div>
        </main>

        {/* 모바일 푸터 — PC 버전 전환 */}
        {isQuoteBuilder ? (
          <div className="h-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] lg:hidden" />
        ) : (
          <div className="mx-auto w-full max-w-workspace px-4 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+20px)] sm:px-5 lg:hidden">
            <DesktopModeButton />
            <p className="mt-3 text-center text-[0.82rem] leading-relaxed text-ink-400">
              © {COMPANY.name} {COMPANY.industryEn} Business AX
              <br />
              {COMPANY.creditRole} {COMPANY.credit}
            </p>
          </div>
        )}

        <footer className="hidden px-6 pb-7 text-[0.84rem] text-ink-400 lg:block 2xl:px-8">
          <div className="mx-auto flex w-full max-w-workspace items-center justify-between border-t border-surface-line pt-5">
            <span>
              © {COMPANY.name} {COMPANY.industryEn} Business AX
            </span>
            <span>
              <span className="font-semibold uppercase tracking-[0.1em] text-ink-500">
                {COMPANY.creditRole}
              </span>{" "}
              {COMPANY.credit}
            </span>
          </div>
        </footer>
      </div>

      <BottomNav />
      <AlertDrawer />
      <DemoTour />
      <TourPrompt />
      <MobileModeReturnBar />
      <Toaster />
    </div>
  );
}
