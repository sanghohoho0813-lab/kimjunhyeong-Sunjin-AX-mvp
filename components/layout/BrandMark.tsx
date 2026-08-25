import { clsx } from "@/lib/utils/clsx";

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
