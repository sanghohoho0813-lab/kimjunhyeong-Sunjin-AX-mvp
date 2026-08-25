/** 초소형 클래스 결합 유틸 (외부 의존성 없이 사용) */
export function clsx(
  ...args: Array<string | false | null | undefined>
): string {
  return args.filter(Boolean).join(" ");
}
