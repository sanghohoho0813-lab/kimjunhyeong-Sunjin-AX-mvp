import { clsx } from "@/lib/utils/clsx";

/** public/card-art 에 있는 배경 일러스트 키 */
export type CardArtSrc =
  | "revenue"
  | "operating-profit"
  | "net-income"
  | "cash-assets"
  | "financial-trend"
  | "ai-briefing"
  | "ax-cow-black"
  | "ax-cow-navy"
  | "ax-goat-navy"
  | "inventory-alert"
  | "customer-top5"
  | "cashflow"
  | "asset-composition"
  | "equity-ratio"
  | "inventory-value"
  | "aging-stock"
  | "open-quotes"
  | "recontact";

export type CardArtProps = {
  src: CardArtSrc;
  /** CSS background-size */
  size?: string;
  /** CSS background-position */
  position?: string;
  opacity?: number;
  className?: string;
};

/**
 * 카드 배경 장식 레이어.
 *
 * 지표별 SVG를 카드 콘텐츠 뒤에 아주 낮은 대비로 깔아 카드의 성격을
 * 한눈에 구분하게 한다. 순수 장식이므로 스크린리더에서 감추고
 * 포인터 이벤트도 받지 않는다.
 *
 * 부모 카드에는 반드시 `isolate`를 함께 준다. (z-index:-1 기준점)
 */
export function CardArt({
  src,
  size = "46% auto",
  position = "right -14px bottom -12px",
  opacity = 0.55,
  className,
}: CardArtProps) {
  return (
    <span
      aria-hidden
      className={clsx("card-art", className)}
      style={{
        backgroundImage: `url("/card-art/${src}.svg")`,
        backgroundSize: size,
        backgroundPosition: position,
        opacity,
      }}
    />
  );
}
