import {
  BarChart3,
  FileText,
  Home,
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
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "대시보드", icon: Home },
  { href: "/customers", label: "거래처/영업", icon: Users },
  { href: "/inventory", label: "피혁/재고", icon: Layers },
  { href: "/quotes", label: "견적/주문", icon: FileText },
  { href: "/insights", label: "AX 추천", icon: Sparkles },
  { href: "/analytics", label: "경영분석", icon: BarChart3 },
  { href: "/settings", label: "설정", icon: Settings },
];

/** 모바일 하단 내비게이션 (더보기 시트에 견적·경영분석·설정 배치) */
export const MOBILE_NAV = [
  { href: "/dashboard", label: "홈", icon: Home },
  { href: "/customers", label: "거래처", icon: Users },
  { href: "/inventory", label: "재고", icon: Layers },
  { href: "/insights", label: "AX 추천", icon: Sparkles },
] as const;

export const MOBILE_MORE_ITEMS: NavItem[] = [
  { href: "/quotes", label: "견적/주문", icon: FileText },
  { href: "/analytics", label: "경영분석", icon: BarChart3 },
  { href: "/settings", label: "설정", icon: Settings },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/" || pathname.startsWith("/dashboard");
  }
  return pathname.startsWith(href);
}
