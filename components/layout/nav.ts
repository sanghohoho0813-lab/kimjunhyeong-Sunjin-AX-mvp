import {
  BarChart3,
  FileText,
  Home,
  Inbox,
  Layers,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** 메뉴별 아이콘 색조 — 은은한 톤으로 항목을 빠르게 구분한다 */
  tone: NavTone;
}

export type NavTone = "blue" | "teal" | "amber" | "violet" | "mint" | "sky" | "slate";

/** 사이드바 아이콘 색조 (Deep Navy 배경 기준) */
export const NAV_TONES: Record<
  NavTone,
  { idle: string; active: string; chip: string; chipActive: string }
> = {
  blue: {
    idle: "text-[#8FB4FF]",
    active: "text-[#B9D0FF]",
    chip: "bg-[#3B75F6]/12",
    chipActive: "bg-[#3B75F6]/24",
  },
  teal: {
    idle: "text-[#6BDACB]",
    active: "text-[#9CEBE0]",
    chip: "bg-[#14B8A6]/12",
    chipActive: "bg-[#14B8A6]/24",
  },
  amber: {
    idle: "text-[#E6C079]",
    active: "text-[#F2D9A6]",
    chip: "bg-[#D9A93F]/12",
    chipActive: "bg-[#D9A93F]/24",
  },
  violet: {
    idle: "text-[#B0A5F2]",
    active: "text-[#CFC7FA]",
    chip: "bg-[#8B7CF0]/12",
    chipActive: "bg-[#8B7CF0]/24",
  },
  mint: {
    idle: "text-[#7FE3B8]",
    active: "text-[#AAF0D2]",
    chip: "bg-[#34D399]/12",
    chipActive: "bg-[#34D399]/24",
  },
  sky: {
    idle: "text-[#7FCDEB]",
    active: "text-[#AEE2F5]",
    chip: "bg-[#38BDF8]/12",
    chipActive: "bg-[#38BDF8]/24",
  },
  slate: {
    idle: "text-[#A9BAD2]",
    active: "text-[#CBD8E8]",
    chip: "bg-[#94A3B8]/12",
    chipActive: "bg-[#94A3B8]/24",
  },
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "대시보드", icon: Home, tone: "blue" },
  { href: "/customers", label: "거래처/영업", icon: Users, tone: "teal" },
  { href: "/inventory", label: "피혁/재고", icon: Layers, tone: "amber" },
  { href: "/quotes", label: "견적/주문", icon: FileText, tone: "violet" },
  { href: "/requests", label: "고객 요청", icon: Inbox, tone: "sky" },
  { href: "/insights", label: "AX 추천", icon: Sparkles, tone: "mint" },
  { href: "/analytics", label: "경영분석", icon: BarChart3, tone: "sky" },
  { href: "/settings", label: "설정", icon: Settings, tone: "slate" },
];

/** 모바일 하단 내비게이션 (더보기 시트에 견적·경영분석·설정 배치) */
export const MOBILE_NAV = [
  { href: "/dashboard", label: "홈", icon: Home, tone: "blue" },
  { href: "/customers", label: "거래처", icon: Users, tone: "teal" },
  { href: "/inventory", label: "재고", icon: Layers, tone: "amber" },
  { href: "/insights", label: "AX 추천", icon: Sparkles, tone: "mint" },
] as const;

/** 모바일 하단 내비 아이콘 색조 (밝은 배경 기준) */
export const MOBILE_TONES: Record<string, string> = {
  blue: "text-brand-600",
  teal: "text-teal-600",
  amber: "text-gold-500",
  mint: "text-emerald-500",
};

export const MOBILE_MORE_ITEMS: NavItem[] = [
  { href: "/quotes", label: "견적/주문", icon: FileText, tone: "violet" },
  { href: "/analytics", label: "경영분석", icon: BarChart3, tone: "sky" },
  { href: "/settings", label: "설정", icon: Settings, tone: "slate" },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/" || pathname.startsWith("/dashboard");
  }
  return pathname.startsWith(href);
}
