"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { clsx } from "@/lib/utils/clsx";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 실시간 시계 — 오늘 날짜 · 요일 · 현재 시각(초 단위).
 *
 * 대시보드의 "데이터 기준일"과는 성격이 다르다.
 * 기준일은 집계가 어디까지 반영됐는지를 말하고, 이 시계는 지금이 몇 시인지를 말한다.
 * 두 값이 다를 수 있으므로 라벨("현재")로 구분해 오해를 막는다.
 *
 * 서버와 클라이언트의 렌더 시각이 다르면 hydration 불일치가 나므로
 * 마운트 이후에만 값을 그린다. 그동안은 같은 크기의 빈 자리를 유지해
 * 레이아웃이 튀지 않게 한다.
 */
export function LiveClock({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dark = tone === "dark";

  const shell = clsx(
    "inline-flex min-h-[2.1rem] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-btn border px-2.5",
    dark
      ? "border-white/[0.12] bg-white/[0.06] text-navy-100"
      : "border-surface-line bg-white text-ink-600",
    className
  );

  if (!now) {
    // 마운트 전 — 자리만 잡아둔다
    return <span className={shell} aria-hidden />;
  }

  const dateText = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  const weekday = WEEKDAYS[now.getDay()];
  const hms = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <span
      className={shell}
      aria-label={`현재 시각 ${dateText} ${weekday}요일 ${hms}`}
      title={`${dateText} (${weekday}) ${hms}`}
    >
      <Clock
        className={clsx(
          "h-[0.95rem] w-[0.95rem] shrink-0",
          dark ? "text-teal-300" : "text-brand-500"
        )}
        strokeWidth={2.1}
        aria-hidden
      />
      <span
        className={clsx(
          "text-[0.8rem] font-bold uppercase tracking-[0.12em]",
          dark ? "text-navy-300" : "text-ink-400"
        )}
        aria-hidden
      >
        NOW
      </span>
      <span
        className={clsx(
          "hidden text-[0.84rem] font-semibold tabular-nums xl:inline",
          dark ? "text-navy-100" : "text-ink-600"
        )}
        aria-hidden
      >
        {dateText}
      </span>
      <span
        className={clsx(
          "text-[0.84rem] font-semibold",
          dark ? "text-navy-200" : "text-ink-500"
        )}
        aria-hidden
      >
        ({weekday})
      </span>
      <span
        className={clsx(
          "text-[0.9rem] font-extrabold tabular-nums tracking-[-0.01em]",
          dark ? "text-white" : "text-ink-900"
        )}
        aria-hidden
      >
        {hms}
      </span>
    </span>
  );
}

/**
 * 모바일용 — 날짜를 접지 않고 한 줄로 전부 보여준다.
 * 좁은 화면에서도 폭이 남는 자리(페이지 헤더 상단)에 놓는다.
 */
export function LiveClockMobile({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const shell = clsx(
    "inline-flex min-h-[1.9rem] items-center gap-1.5 whitespace-nowrap rounded-btn border border-surface-line bg-white px-2.5",
    className
  );

  if (!now) return <span className={shell} aria-hidden />;

  const dateText = `${now.getMonth() + 1}월 ${now.getDate()}일`;
  const weekday = WEEKDAYS[now.getDay()];
  const hms = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <span
      className={shell}
      aria-label={`현재 시각 ${dateText} ${weekday}요일 ${hms}`}
    >
      <Clock
        className="h-[0.9rem] w-[0.9rem] shrink-0 text-brand-500"
        strokeWidth={2.1}
        aria-hidden
      />
      <span className="text-[0.82rem] font-semibold text-ink-500" aria-hidden>
        {dateText} ({weekday})
      </span>
      <span
        className="text-[0.86rem] font-extrabold tabular-nums tracking-[-0.01em] text-ink-900"
        aria-hidden
      >
        {hms}
      </span>
    </span>
  );
}
