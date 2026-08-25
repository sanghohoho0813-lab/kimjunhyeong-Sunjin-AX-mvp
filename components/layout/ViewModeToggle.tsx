"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { clsx } from "@/lib/utils/clsx";

/**
 * PC 버전 / 모바일 버전 전환
 * — desktopMode가 켜지면 AppShell이 viewport 폭을 고정폭으로 바꿔
 *   휴대폰에서도 데스크톱 레이아웃(사이드바 + 넓은 그리드)이 그대로 표시된다.
 */

/** 모바일 UI에서 노출되는 'PC 버전으로 보기' 버튼 */
export function DesktopModeButton({
  className,
  onSwitched,
}: {
  className?: string;
  onSwitched?: () => void;
}) {
  const setDesktopMode = useAppStore((s) => s.setDesktopMode);
  const pushToast = useAppStore((s) => s.pushToast);

  return (
    <button
      onClick={() => {
        setDesktopMode(true);
        pushToast("PC 버전으로 전환했습니다.");
        onSwitched?.();
      }}
      className={clsx(
        "flex h-11 w-full items-center justify-center gap-2 rounded-btn border border-surface-line bg-white text-[0.85rem] font-bold text-navy-700 transition-colors hover:border-navy-300",
        className
      )}
    >
      <Monitor className="h-4 w-4 text-brand-600" aria-hidden />
      PC 버전으로 보기
    </button>
  );
}

/**
 * PC 버전으로 보는 중일 때만 표시되는 복귀 바.
 * desktopMode에서는 CSS 뷰포트가 넓어져 모바일 전용 UI가 모두 숨겨지므로,
 * 데스크톱 레이아웃 안에서 항상 보이도록 별도 렌더링한다.
 */
export function MobileModeReturnBar() {
  const desktopMode = useAppStore((s) => s.desktopMode);
  const setDesktopMode = useAppStore((s) => s.setDesktopMode);
  const pushToast = useAppStore((s) => s.pushToast);

  if (!desktopMode) return null;

  // 하단 중앙(토스트)·우측(둘러보기 배너)과 겹치지 않도록 사이드바 오른쪽 아래에 고정
  return (
    <div className="fixed bottom-5 left-[256px] z-[55]">
      <button
        onClick={() => {
          setDesktopMode(false);
          pushToast("모바일 버전으로 전환했습니다.");
        }}
        className="flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-bold text-white shadow-modal transition-colors hover:bg-navy-800"
      >
        <Smartphone className="h-4 w-4 text-teal-300" aria-hidden />
        모바일 버전으로 보기
      </button>
    </div>
  );
}

/** 설정 화면용 세그먼트 토글 */
export function ViewModeSetting() {
  const desktopMode = useAppStore((s) => s.desktopMode);
  const setDesktopMode = useAppStore((s) => s.setDesktopMode);
  const pushToast = useAppStore((s) => s.pushToast);

  const options = [
    { value: false, label: "모바일 버전", icon: Smartphone },
    { value: true, label: "PC 버전", icon: Monitor },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const Icon = option.icon;
        const active = desktopMode === option.value;
        return (
          <button
            key={option.label}
            onClick={() => {
              setDesktopMode(option.value);
              pushToast(`${option.label}으로 전환했습니다.`);
            }}
            aria-pressed={active}
            className={clsx(
              "flex h-12 items-center justify-center gap-2 rounded-btn border text-sm font-bold transition-colors",
              active
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-surface-line bg-white text-navy-600 hover:border-navy-300"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
