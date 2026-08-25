"use client";

import { Bell, CalendarDays, ChevronDown, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { clsx } from "@/lib/utils/clsx";
import { COMPANY } from "@/lib/data/seed";
import { generateBusinessAlerts } from "@/lib/insights/alerts";
import { useAppStore, type PeriodYear } from "@/lib/store";

const PERIOD_LABELS: Record<PeriodYear, string> = {
  2025: "2025년 1월 ~ 12월 (누적)",
  2024: "2024년 1월 ~ 12월",
  2023: "2023년 1월 ~ 12월",
};

function PeriodSelect() {
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
        className="flex h-10 items-center gap-2 rounded-btn border border-surface-line bg-white px-3 text-[0.82rem] font-medium text-navy-700 shadow-sm transition-colors hover:border-navy-200"
      >
        <CalendarDays className="h-4 w-4 text-navy-400" aria-hidden />
        <span className="hidden whitespace-nowrap sm:inline">
          {PERIOD_LABELS[periodYear]}
        </span>
        <span className="whitespace-nowrap sm:hidden">{periodYear}년</span>
        <ChevronDown
          className={clsx(
            "h-3.5 w-3.5 text-navy-400 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-surface-line bg-white py-1 shadow-modal"
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
                  "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface",
                  periodYear === year
                    ? "font-bold text-brand-600"
                    : "text-navy-700"
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
      <button
        onClick={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
            pushToast("데이터가 최신 상태로 업데이트되었습니다.");
          }, 700);
        }}
        aria-label="데이터 업데이트"
        className="flex h-10 w-10 items-center justify-center rounded-btn border border-surface-line bg-white text-navy-500 shadow-sm transition-colors hover:border-navy-200 hover:text-navy-800"
      >
        <RefreshCw
          className={clsx("h-4 w-4", refreshing && "animate-spin")}
          aria-hidden
        />
      </button>
      <button
        onClick={() => setAlertsOpen(true)}
        aria-label={`알림 ${unread}건`}
        className="relative flex h-10 w-10 items-center justify-center rounded-btn border border-surface-line bg-white text-navy-500 shadow-sm transition-colors hover:border-navy-200 hover:text-navy-800"
      >
        <Bell className="h-[1.1rem] w-[1.1rem]" aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-bold text-white">
            {unread}
          </span>
        ) : null}
      </button>
      <div className="hidden items-center gap-2.5 rounded-btn border border-surface-line bg-white py-1.5 pl-2 pr-3 shadow-sm md:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-xs font-bold text-white">
          손
        </span>
        <span className="leading-tight">
          <span className="block text-[0.78rem] font-semibold text-navy-800">
            {COMPANY.ceoTitle}
          </span>
          <span className="block text-[0.62rem] text-navy-400">
            {COMPANY.credit}
          </span>
        </span>
      </div>
    </div>
  );
}

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
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3 lg:mb-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[1.35rem] font-extrabold leading-tight text-navy-900 lg:text-[1.7rem]">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle ? (
          <p className="mt-1 max-w-xl text-[0.82rem] leading-relaxed text-navy-500 lg:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        {actions}
        <HeaderControls withPeriod={withPeriod} />
      </div>
      {/* 모바일: 기간 선택 등 필요한 액션만 */}
      {withPeriod || actions ? (
        <div className="flex w-full items-center gap-2 lg:hidden">
          {actions}
          {withPeriod ? <PeriodSelect /> : null}
        </div>
      ) : null}
    </div>
  );
}
