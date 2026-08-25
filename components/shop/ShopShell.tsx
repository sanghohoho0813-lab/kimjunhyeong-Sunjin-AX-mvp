"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clsx } from "@/lib/utils/clsx";
import { SunjinMark } from "@/components/layout/BrandMark";
import {
  useAccount,
  useAppStore,
  useCustomerNotifications,
  useFavorites,
  useIsInternal,
} from "@/lib/store";
import { COMPANY } from "@/lib/data/seed";
import { Toaster } from "@/components/shared/Toaster";

/** 항상 보이는 1차 메뉴 */
const NAV_PRIMARY = [
  { href: "/products", label: "제품 찾기" },
  { href: "/request/sample", label: "샘플 요청" },
  { href: "/request/quote", label: "견적 문의" },
  { href: "/portal", label: "고객 포털" },
];

/** 넓은 화면에서만 펼치는 2차 메뉴 — 전부 제품 목록의 다른 진입점이다 */
const NAV_SECONDARY = [
  { href: "/products?material=Cow", label: "소재별" },
  { href: "/products?color=Black", label: "컬러별" },
  { href: "/products?usage=가방", label: "용도별" },
];

const NAV = [...NAV_PRIMARY, ...NAV_SECONDARY];

const MOBILE_NAV = [
  { href: "/", label: "홈", icon: Home },
  { href: "/products", label: "제품 찾기", icon: Search },
  { href: "/request/sample", label: "샘플", icon: FileText },
  { href: "/portal?tab=orders", label: "주문", icon: Package },
  { href: "/portal", label: "마이", icon: User },
];

/**
 * 관리자 AX 복귀 버튼.
 *
 * 일반 고객에게는 절대 노출하지 않는다. 역할이 admin/staff일 때만 렌더링되며,
 * 경로 보호는 InternalRouteGuard가 따로 맡는다(표시 숨김에만 의존하지 않는다).
 */
function AdminReturnPill({ className }: { className?: string }) {
  const isInternal = useIsInternal();
  const returnPath = useAppStore((s) => s.internalReturnPath);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated || !isInternal) return null;

  return (
    <Link
      href={returnPath || "/dashboard"}
      className={clsx(
        "inline-flex min-h-[2.6rem] shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border border-white/15 bg-navy-800/70 px-3.5 text-[0.88rem] font-bold text-white transition-all duration-200",
        "hover:border-brand-400 hover:bg-navy-700",
        className
      )}
      title="운영 시스템으로 돌아가기"
    >
      <LayoutDashboard className="h-4 w-4 text-teal-300" aria-hidden />
      관리자 AX
      <span aria-hidden className="text-navy-300">
        →
      </span>
    </Link>
  );
}

/** 모바일 헤더용 — 관리자에게만 보이는 운영 시스템 복귀 아이콘 */
function AdminReturnIconButton() {
  const isInternal = useIsInternal();
  const returnPath = useAppStore((s) => s.internalReturnPath);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated || !isInternal) return null;

  return (
    <Link
      href={returnPath || "/dashboard"}
      aria-label="관리자 AX로 이동"
      title="운영 시스템으로 돌아가기"
      className="relative flex h-11 w-11 items-center justify-center rounded-btn border border-teal-400/35 bg-teal-400/10 text-teal-200 transition-colors hover:bg-teal-400/20 hover:text-white lg:hidden"
    >
      <LayoutDashboard className="h-[1.2rem] w-[1.2rem]" strokeWidth={2.2} />
    </Link>
  );
}

export function ShopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const account = useAccount();
  const fontScale = useAppStore((s) => s.fontScale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const favorites = useFavorites(account.customerId);
  const notifications = useCustomerNotifications(account.customerId);
  const readIds = useAppStore((s) => s.readNotificationIds);
  const unread = notifications.filter((n) => !readIds.includes(n.id)).length;

  useEffect(() => {
    useAppStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
  }, [fontScale]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-navy-925 text-white">
        <div className="mx-auto flex h-[var(--shop-header-h)] w-full max-w-shop items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
          {/* 모바일 메뉴 */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="메뉴 열기"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-btn text-navy-100 transition-colors hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-[1.35rem] w-[1.35rem]" />
          </button>

          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 sm:gap-2.5"
            aria-label={`${COMPANY.name} 홈`}
          >
            <SunjinMark className="h-[34px] w-[34px]" />
            <span className="hidden sm:block">
              <span className="block text-[1.02rem] font-extrabold leading-tight tracking-[-0.01em]">
                {COMPANY.name}
              </span>
              <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-navy-300">
                Sunjin Industry
              </span>
            </span>
          </Link>

          {/* 데스크톱 내비 */}
          <nav
            className="ml-3 hidden min-w-0 flex-1 items-center gap-0.5 overflow-hidden lg:flex"
            aria-label="주요 메뉴"
          >
            {NAV_PRIMARY.map((item) => {
              const base = item.href.split("?")[0];
              const active =
                base === "/products"
                  ? pathname === "/products"
                  : pathname.startsWith(base);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={clsx(
                    "flex min-h-[2.6rem] shrink-0 items-center whitespace-nowrap rounded-btn px-3 text-[0.92rem] font-semibold transition-colors duration-200",
                    active
                      ? "bg-white/[0.12] text-white"
                      : "text-navy-100 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {NAV_SECONDARY.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hidden min-h-[2.6rem] shrink-0 items-center whitespace-nowrap rounded-btn px-3 text-[0.92rem] font-semibold text-navy-100 transition-colors duration-200 hover:bg-white/[0.07] hover:text-white 2xl:flex"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <AdminReturnPill className="hidden lg:inline-flex" />
            <AdminReturnIconButton />

            <Link
              href="/portal?tab=favorites"
              aria-label="관심 제품"
              className="relative flex h-11 w-11 items-center justify-center rounded-btn text-navy-100 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Heart className="h-[1.2rem] w-[1.2rem]" />
              {hydrated && favorites.length > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-leather-400 px-1 text-[0.7rem] font-bold text-navy-950">
                  {favorites.length}
                </span>
              ) : null}
            </Link>

            <Link
              href="/portal?tab=notifications"
              aria-label="알림"
              className="relative flex h-11 w-11 items-center justify-center rounded-btn text-navy-100 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Bell className="h-[1.2rem] w-[1.2rem]" />
              {hydrated && unread > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-critical px-1 text-[0.7rem] font-bold text-white">
                  {unread}
                </span>
              ) : null}
            </Link>

            <Link
              href="/portal"
              className="flex h-11 min-h-[2.75rem] items-center justify-center gap-2.5 rounded-btn transition-colors hover:bg-white/[0.07] sm:ml-1 sm:border sm:border-white/12 sm:px-2.5 sm:pr-3.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-leather-400 to-leather-600 text-[0.8rem] font-bold text-white">
                {account.org.slice(0, 1)}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block truncate text-[0.86rem] font-bold leading-tight text-white">
                  {account.org}
                </span>
                <span className="block truncate text-[0.76rem] text-navy-300">
                  {account.name}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── 모바일 드로어 ── */}
      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-navy-950/55 lg:hidden"
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[19rem] max-w-[86vw] flex-col bg-navy-925 lg:hidden"
              aria-label="전체 메뉴"
            >
              <div className="flex h-[var(--shop-header-h)] items-center justify-between px-4">
                <span className="flex items-center gap-2.5">
                  <SunjinMark className="h-[30px] w-[30px]" />
                  <span className="text-[1rem] font-extrabold text-white">
                    {COMPANY.name}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="메뉴 닫기"
                  className="flex h-11 w-11 items-center justify-center rounded-btn text-navy-200 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* 관리자에게만. 메뉴를 스크롤해 내려가지 않아도 보이도록 위에 둔다 */}
              <div className="px-3 pb-3">
                <AdminReturnPill className="w-full justify-center" />
              </div>
              <ul className="flex-1 overflow-y-auto px-3 pb-4">
                {NAV.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex min-h-[3rem] items-center rounded-btn px-3 text-[1rem] font-semibold text-navy-100 transition-colors hover:bg-white/[0.07] hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>

      {/* ── Main ── */}
      <main className="flex-1 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-navy-925 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] text-navy-200 lg:pb-0">
        <div className="mx-auto w-full max-w-shop px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
            <div className="min-w-0">
              <span className="flex items-center gap-2.5">
                <SunjinMark className="h-[34px] w-[34px]" />
                <span>
                  <span className="block text-[1rem] font-extrabold text-white">
                    {COMPANY.name}
                  </span>
                  <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-navy-300">
                    Sunjin Industry
                  </span>
                </span>
              </span>
              <dl className="mt-4 space-y-1 text-[0.86rem] leading-relaxed">
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 text-navy-400">대표자</dt>
                  <dd>{COMPANY.ceo}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 text-navy-400">업종</dt>
                  <dd className="min-w-0">피혁 제조·도소매</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 text-navy-400">주소</dt>
                  <dd className="min-w-0">{COMPANY.region}</dd>
                </div>
              </dl>
            </div>

            {[
              {
                title: "제품",
                links: [
                  { label: "제품 찾기", href: "/products" },
                  { label: "소재별", href: "/products?tab=material" },
                  { label: "컬러별", href: "/products?tab=color" },
                  { label: "용도별", href: "/products?tab=usage" },
                ],
              },
              {
                title: "서비스",
                links: [
                  { label: "샘플 요청", href: "/request/sample" },
                  { label: "견적 문의", href: "/request/quote" },
                  { label: "재주문", href: "/portal?tab=orders" },
                  { label: "고객 포털", href: "/portal" },
                ],
              },
              {
                title: "고객지원",
                links: [
                  { label: "주문 내역", href: "/portal?tab=orders" },
                  { label: "요청 내역", href: "/portal?tab=requests" },
                  { label: "관심 제품", href: "/portal?tab=favorites" },
                  { label: "알림", href: "/portal?tab=notifications" },
                ],
              },
            ].map((col) => (
              <div key={col.title} className="min-w-0">
                <p className="text-[0.92rem] font-bold text-white">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="inline-flex min-h-[1.9rem] items-center text-[0.88rem] transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/[0.08] pt-5 text-[0.82rem] text-navy-400">
            <span>© {COMPANY.name}. All rights reserved.</span>
            <span>{COMPANY.credit}</span>
          </div>
        </div>
      </footer>

      {/* ── 모바일 하단 내비 ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory-line bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-8px_rgba(15,23,42,0.16)] lg:hidden"
        aria-label="하단 메뉴"
      >
        <ul className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const base = item.href.split("?")[0];
            const active =
              base === "/" ? pathname === "/" : pathname.startsWith(base);
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex h-[var(--bottom-nav-height)] flex-col items-center justify-center gap-1 whitespace-nowrap px-1 text-[0.78rem] font-bold transition-colors",
                    active ? "text-leather-600" : "text-ink-400"
                  )}
                >
                  <Icon
                    className="h-[1.3rem] w-[1.3rem]"
                    strokeWidth={active ? 2.4 : 2}
                    aria-hidden
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Toaster />
    </div>
  );
}
