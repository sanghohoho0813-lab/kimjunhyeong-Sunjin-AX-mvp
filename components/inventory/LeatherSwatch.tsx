import { clsx } from "@/lib/utils/clsx";
import type { LeatherColor } from "@/types";

/** 피혁 컬러 스와치 — 이미지 없이 가죽 질감 느낌의 그라데이션 표현 */
const COLOR_STYLES: Record<LeatherColor, string> = {
  Black: "from-[#2b2b30] via-[#1a1a1e] to-[#101014]",
  "Dark Brown": "from-[#5b4132] via-[#46311f] to-[#33241a]",
  Camel: "from-[#c99e6b] via-[#b88b52] to-[#a1743f]",
  Navy: "from-[#2c3e63] via-[#22304e] to-[#182238]",
  Burgundy: "from-[#7a3040] via-[#63212f] to-[#4c1a25]",
  Ivory: "from-[#efe8da] via-[#e6dcc8] to-[#d8cbb2]",
  Gray: "from-[#9aa0ab] via-[#82888f] to-[#6a7078]",
};

export function LeatherSwatch({
  color,
  className,
  rounded = "rounded-[10px]",
}: {
  color: LeatherColor;
  className?: string;
  rounded?: string;
}) {
  return (
    <span
      aria-hidden
      className={clsx(
        "relative block shrink-0 overflow-hidden bg-gradient-to-br shadow-inner",
        COLOR_STYLES[color],
        rounded,
        className
      )}
    >
      <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_20%,rgba(255,255,255,0.28),transparent_55%)]" />
      <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_85%,rgba(0,0,0,0.22),transparent_60%)]" />
    </span>
  );
}
