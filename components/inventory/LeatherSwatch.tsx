import { clsx } from "@/lib/utils/clsx";
import type { LeatherColor, LeatherFinish } from "@/types";

/**
 * 피혁 Material Swatch — 실제 이미지 없이 CSS Gradient + Grain으로 가죽 질감을 표현한다.
 * 화면 전체를 텍스처로 도배하지 않고, 재고 항목의 식별자 역할만 한다.
 */
const TONES: Record<LeatherColor, { base: string; hi: string; lo: string }> = {
  Black: { base: "#23242A", hi: "#43454E", lo: "#0D0E12" },
  "Dark Brown": { base: "#4B3527", hi: "#6E5038", lo: "#2A1C13" },
  Camel: { base: "#B98A50", hi: "#D6AE79", lo: "#8A6234" },
  Navy: { base: "#26344F", hi: "#3F5476", lo: "#141D2E" },
  Burgundy: { base: "#6B2735", hi: "#8F3B4B", lo: "#42151F" },
  Ivory: { base: "#E4DAC6", hi: "#F4EEE1", lo: "#C7B99E" },
  Gray: { base: "#828892", hi: "#A5ABB4", lo: "#5C626B" },
};

/** 가공 방식에 따른 광택 차이 */
const SHEEN: Record<LeatherFinish, number> = {
  Aniline: 0.34,
  "Semi-Aniline": 0.26,
  Pigmented: 0.18,
  Nubuck: 0.08,
  Embossed: 0.22,
};

export function LeatherSwatch({
  color,
  finish = "Pigmented",
  className,
  rounded = "rounded-[11px]",
}: {
  color: LeatherColor;
  finish?: LeatherFinish;
  className?: string;
  rounded?: string;
}) {
  const t = TONES[color];
  const sheen = SHEEN[finish] ?? 0.2;

  return (
    <span
      aria-hidden
      className={clsx(
        "relative block shrink-0 overflow-hidden ring-1 ring-inset ring-black/10",
        rounded,
        className
      )}
      style={{
        background: `radial-gradient(120% 100% at 26% 18%, ${t.hi} 0%, ${t.base} 46%, ${t.lo} 100%)`,
      }}
    >
      {/* 광택 하이라이트 */}
      <span
        className="absolute inset-0"
        style={{
          background: `linear-gradient(146deg, rgba(255,255,255,${sheen}) 0%, rgba(255,255,255,0) 42%)`,
        }}
      />
      {/* 가죽 결(grain) — 미세 노이즈 */}
      <span
        className="absolute inset-0 opacity-[0.5] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.5) 0.5px, transparent 0.6px), radial-gradient(rgba(0,0,0,0.5) 0.5px, transparent 0.6px)",
          backgroundSize: "5px 5px, 7px 7px",
          backgroundPosition: "0 0, 2px 3px",
        }}
      />
      {/* 하단 그림자로 두께감 */}
      <span
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.24), transparent)",
        }}
      />
    </span>
  );
}
