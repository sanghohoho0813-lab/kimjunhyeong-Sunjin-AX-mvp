"use client";

import { ArrowRight, Bell, CalendarDays, ChevronDown, Globe, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { clsx } from "@/lib/utils/clsx";
import { COMPANY } from "@/lib/data/seed";
import { generateBusinessAlerts } from "@/lib/insights/alerts";
import { useAppStore, type PeriodYear } from "@/lib/store";
import { LiveClock } from "@/components/shared/LiveClock";

const PERIOD_LABELS: Record<PeriodYear, string> = {
  2025: "2025년 1월 ~ 12월 (누적)",
  2024: "2024년 1월 ~ 12월",
  2023: "2023년 1월 ~ 12월",
};

export function PeriodSelect() {
  const periodYear = useAppStore((s) => s.periodYear);
  const setPeriodYear = useAppStore((s) => s.setPeriodYear);
  const pushToast = useAppStore((s) => s.pushToast);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="btn btn-ghost !text-[0.82rem] !font-semibold"
      >
        <CalendarDays className="h-4 w-4 text-ink-400" aria-hidden />
        <span className="hidden 2xl:inline">{PERIOD_LABELS[periodYear]}</span>
        <span className="2xl:hidden">{periodYear}년 누적</span>
        <ChevronDown
          className={clsx(
            "h-3.5 w-3.5 text-ink-400 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 overflow-hidden rounded-card border border-surface-line bg-white py-1.5 shadow-modal"
        >
          {([2025, 2024, 2023] as PeriodYear[]).map((year) => (
            <li key={year}>
              <button
                role="option"
                aria-selected={periodYear === year}
                onClick={() => {
                  setPeriodYear(year);
                  setOpen(false);
                  pushToast(`${year}년 기준으로 조회합니다.`);
                }}
                className={clsx(
                  "w-full px-4 py-2.5 text-left text-[0.86rem] transition-colors hover:bg-surface-subtle",
                  periodYear === year
                    ? "font-bold text-brand-600"
                    : "text-ink-700"
                )}
              >
                {PERIOD_LABELS[year]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function IconButton({
  onClick,
  label,
  children,
  badge,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative flex h-11 w-11 items-center justify-center rounded-btn border border-surface-line bg-white text-ink-500 transition-all duration-200 hover:border-ink-300 hover:text-ink-800"
    >
      {children}
      {badge && badge > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-critical px-1 text-[0.78rem] font-bold text-white ring-2 ring-surface">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

/** 기획의도 진입 — 우측 상단에 은은하게 빛나는 버튼 */
export function IntentButton({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  if (pathname.startsWith("/intent")) return null;

  return (
    <Link
      href="/intent"
      aria-label="기획의도 보기"
      className={clsx(
        "btn btn-intent !font-bold",
        compact && "!min-h-[38px] !px-3 !text-[0.78rem]"
      )}
    >
      <Sparkles
        className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
        strokeWidth={2.2}
        aria-hidden
      />
      기획의도
    </Link>
  );
}

/** 데스크톱 헤더 우측 컨트롤 */
/**
 * 내부 AX 헤더 우측 — 고객 화면 열기.
 *
 * 사이드바 CTA는 스크롤 위치에 따라 시야 밖으로 나갈 수 있고 모바일에서는
 * 아예 보이지 않는다. 헤더는 어느 화면에서든 같은 자리에 있으므로
 * 여기에도 진입점을 둔다.
 */
function CustomerFrontButton() {
  return (
    <Link
      href="/"
      title="고객이 보는 화면 열기"
      className="group flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-btn border border-brand-200 bg-gradient-to-br from-brand-50 to-teal-50 px-3 text-[0.9rem] font-bold text-brand-700 transition-all duration-200 hover:border-teal-300 hover:shadow-card"
    >
      <Globe className="h-[1.05rem] w-[1.05rem] shrink-0" strokeWidth={2.1} aria-hidden />
      <span className="hidden xl:inline">고객 화면</span>
      <ArrowRight
        className="hidden h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 xl:inline"
        aria-hidden
      />
    </Link>
  );
}

export function HeaderControls({ withPeriod = false }: { withPeriod?: boolean }) {
  const pushToast = useAppStore((s) => s.pushToast);
  const setAlertsOpen = useAppStore((s) => s.setAlertsOpen);
  const readAlertIds = useAppStore((s) => s.readAlertIds);
  const [refreshing, setRefreshing] = useState(false);
  const unread = generateBusinessAlerts().filter(
    (a) => !readAlertIds.includes(a.id)
  ).length;

  return (
    <div className="flex items-center gap-2">
      {withPeriod ? <PeriodSelect /> : null}
      <IconButton
        label="데이터 업데이트"
        onClick={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
            pushToast("데이터가 최신 상태로 업데이트되었습니다.");
          }, 700);
        }}
      >
        <RefreshCw
          className={clsx("h-4 w-4", refreshing && "animate-spin")}
          aria-hidden
        />
      </IconButton>
      <IconButton
        label={`알림 ${unread}건`}
        onClick={() => setAlertsOpen(true)}
        badge={unread}
      >
        <Bell className="h-[1.05rem] w-[1.05rem]" aria-hidden />
      </IconButton>

      <CustomerFrontButton />

      <IntentButton />

      <div className="ml-1 hidden items-center gap-2.5 rounded-btn border border-surface-line bg-white py-1.5 pl-2 pr-3.5 xl:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-[0.76rem] font-bold text-white">
          손
        </span>
        {/* 제작 표기는 사이드바 하단·푸터·설정에 있다. 사용자 칩에 함께 두면
            손순옥 대표의 소속처럼 읽히고, 실시간 시계가 들어온 뒤로는 폭도 부족하다. */}
        <span className="whitespace-nowrap text-[0.82rem] font-bold leading-tight text-ink-900">
          {COMPANY.ceoTitle}
        </span>
      </div>
    </div>
  );
}

/**
 * 페이지 헤더 — 왼쪽 Title/Subtitle, 오른쪽 기간·알림·프로필.
 * 한 줄에 정보를 과하게 넣지 않는다.
 */
export function PageHeader({
  title,
  subtitle,
  withPeriod = false,
  actions,
  badge,
}: {
  title: string;
  subtitle?: string;
  withPeriod?: boolean;
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <header className="mb-7 lg:mb-8">
      {/* 1행 — 좌측 실시간 시계 + 우측 유틸리티 (기간·업데이트·알림·기획의도·프로필) */}
      {/* 1280px(모바일의 "PC 버전으로 보기" 폭)에서는 시계와 유틸리티가 한 줄에
          들어가지 않는다. 폭이 모자라면 유틸리티가 아랫줄로 내려가게 둔다. */}
      <div className="mb-5 hidden flex-wrap items-center gap-x-3 gap-y-2 lg:flex">
        <LiveClock />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {actions}
          <HeaderControls withPeriod={withPeriod} />
        </div>
      </div>


      {/* 2행 — 페이지 제목. 확대된 타이포에서 줄바꿈 없이 전체 폭 사용 */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="t-page-title whitespace-nowrap">{title}</h1>
          {badge}
        </div>
        {subtitle ? (
          <p className="mt-2 max-w-3xl text-[1rem] leading-relaxed text-ink-500">
            {subtitle}
          </p>
        ) : null}
      </div>

      {/* 모바일 — 필요한 액션만 별도 줄로 */}
      {withPeriod || actions ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 lg:hidden">
          {withPeriod ? <PeriodSelect /> : null}
          {actions}
        </div>
      ) : null}
    </header>
  );
}
