import Image from "next/image";
import { clsx } from "@/lib/utils/clsx";

/**
 * 선진산업 로고 락업 (심볼 + 워드마크).
 *
 * 워드마크가 Deep Navy라 남색 배경 위에 그대로 올리면 글자가 읽히지 않는다.
 * 어두운 배경에서는 plate(흰 판)를 켜서 대비를 확보한다.
 */
export function SunjinLogo({
  className,
  plate = false,
  plateClassName,
}: {
  /** 로고 이미지 크기 — 높이만 지정하고 폭은 비율대로 둔다 (예: "h-[26px]") */
  className?: string;
  plate?: boolean;
  plateClassName?: string;
}) {
  const img = (
    <Image
      src="/brand/sunjin-logo.png"
      alt="선진산업"
      width={720}
      height={229}
      priority
      className={clsx("w-auto select-none", className ?? "h-[26px]")}
    />
  );

  if (!plate) return img;

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center rounded-[8px] bg-white px-2 py-1 shadow-[0_1px_0_rgba(255,255,255,0.4)]",
        plateClassName
      )}
    >
      {img}
    </span>
  );
}

/** 선진산업 심볼 마크 — 블루·틸·골드 서클 */
export function SunjinMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={clsx("h-9 w-9", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sj-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#598eff" />
          <stop offset="100%" stopColor="#2050e8" />
        </linearGradient>
        <linearGradient id="sj-teal" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#0e9f9e" />
          <stop offset="100%" stopColor="#54d8d0" />
        </linearGradient>
      </defs>
      <path
        d="M20 4a16 16 0 0 1 15.6 12.5"
        fill="none"
        stroke="url(#sj-blue)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M34.9 24.6A16 16 0 0 1 8.7 31.5"
        fill="none"
        stroke="url(#sj-teal)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M6.2 26.4A16 16 0 0 1 12 8.2"
        fill="none"
        stroke="#dfb548"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="5.2" fill="#0b1426" />
      <circle cx="20" cy="20" r="2.4" fill="#eace74" />
    </svg>
  );
}
