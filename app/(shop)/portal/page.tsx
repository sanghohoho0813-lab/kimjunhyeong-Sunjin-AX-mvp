"use client";

import { motion } from "framer-motion";
import {
  Bell,
  ClipboardList,
  FileText,
  Heart,
  Package,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { ProductCard } from "@/components/shop/ProductCard";
import { clsx } from "@/lib/utils/clsx";
import { getProduct } from "@/lib/data/derived";
import { recommendForCustomer } from "@/lib/shop/finder";
import {
  useAccount,
  useAllCustomerActivities,
  useAllOrders,
  useAllQuoteRequests,
  useAllSampleRequests,
  useAppStore,
  useCustomerNotifications,
  useFavorites,
} from "@/lib/store";
import { daysBetween, formatDate, formatKRW, formatNumber } from "@/lib/utils/format";
import type { CustomerOrder, RequestStatus } from "@/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const TABS = [
  { key: "overview", label: "홈", icon: Sparkles },
  { key: "orders", label: "주문 내역", icon: Package },
  { key: "requests", label: "요청 내역", icon: FileText },
  { key: "favorites", label: "관심 제품", icon: Heart },
  { key: "notifications", label: "알림", icon: Bell },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_TONE: Record<string, string> = {
  접수: "bg-brand-50 text-brand-700",
  검토중: "bg-warning-soft text-warning",
  회신완료: "bg-positive-soft text-positive",
  취소: "bg-ink-200/60 text-ink-500",
  생산중: "bg-warning-soft text-warning",
  출고완료: "bg-brand-50 text-brand-700",
  배송중: "bg-teal-50 text-teal-700",
  완료: "bg-positive-soft text-positive",
};

function Status({ value }: { value: string }) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-1 text-[0.84rem] font-bold",
        STATUS_TONE[value] ?? "bg-ink-200/60 text-ink-500"
      )}
    >
      {value}
    </span>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-card-lg border border-ivory-line bg-white p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

function orderTotal(o: CustomerOrder) {
  return o.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
}

/** 재주문 — 과거 주문 조건을 그대로 불러오고 수량만 조정한다 */
function ReorderCard({ order }: { order: CustomerOrder }) {
  const addReorder = useAppStore((s) => s.addReorder);
  const pushToast = useAppStore((s) => s.pushToast);
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries(order.items.map((i) => [i.productId, i.qty]))
  );
  const [done, setDone] = useState(false);
  const first = getProduct(order.items[0]?.productId ?? "");
  const elapsed = daysBetween(order.orderedAt);

  if (!first) return null;

  return (
    <Card>
      <div className="flex items-start gap-3.5">
        <LeatherSwatch
          color={first.color}
          finish={first.finish}
          className="h-16 w-16 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[0.8rem] font-bold uppercase tracking-[0.08em] text-leather-500">
            {first.code}
          </p>
          <p className="mt-0.5 text-[1.02rem] font-extrabold leading-snug text-ink-900">
            {first.name}
            {order.items.length > 1 ? (
              <span className="ml-1 text-[0.88rem] font-bold text-ink-500">
                외 {order.items.length - 1}건
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-[0.88rem] text-ink-500">
            마지막 주문 {formatDate(order.orderedAt)} · {elapsed}일 경과
          </p>
        </div>
      </div>

      {done ? (
        <p className="mt-4 rounded-card bg-teal-50 px-4 py-3 text-[0.92rem] font-semibold text-teal-800">
          재주문 요청이 접수되었습니다. 담당자가 확인 후 연락드립니다.
        </p>
      ) : (
        <>
          <div className="mt-4 space-y-2">
            {order.items.map((it) => {
              const p = getProduct(it.productId);
              if (!p) return null;
              return (
                <div
                  key={it.productId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-card bg-ivory px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 truncate text-[0.9rem] font-semibold text-ink-700">
                    {p.material} · {p.color} · {p.thicknessMm}mm
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      value={qty[it.productId] ?? it.qty}
                      onChange={(e) =>
                        setQty((prev) => ({
                          ...prev,
                          [it.productId]: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      aria-label={`${p.code} 수량`}
                      className="h-[2.5rem] w-[5.5rem] rounded-btn border border-ivory-line bg-white px-2.5 text-right text-[0.9rem] font-bold tabular-nums outline-none focus:border-leather-400"
                    />
                    <span className="text-[0.86rem] font-semibold text-ink-500">평</span>
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              addReorder(
                order,
                order.items.map((i) => ({
                  ...i,
                  qty: qty[i.productId] ?? i.qty,
                }))
              );
              setDone(true);
              pushToast("재주문 요청이 접수되었습니다");
            }}
            className="mt-4 flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-btn bg-leather-600 text-[1rem] font-bold text-white transition-colors hover:bg-leather-700"
          >
            <RefreshCw className="h-[1.05rem] w-[1.05rem]" aria-hidden />
            다시 주문하기
          </button>
        </>
      )}
    </Card>
  );
}

function PortalContent() {
  const params = useSearchParams();
  const router = useRouter();
  const account = useAccount();
  const customerId = account.customerId ?? "c01";

  const tabParam = params.get("tab") as TabKey | null;
  const tab: TabKey =
    tabParam && TABS.some((t) => t.key === tabParam) ? tabParam : "overview";

  const orders = useAllOrders().filter((o) => o.customerId === customerId);
  const samples = useAllSampleRequests().filter((r) => r.customerId === customerId);
  const quotes = useAllQuoteRequests().filter((r) => r.customerId === customerId);
  const favorites = useFavorites(customerId);
  const activities = useAllCustomerActivities().filter(
    (a) => a.customerId === customerId
  );
  const notifications = useCustomerNotifications(customerId);
  const readIds = useAppStore((s) => s.readNotificationIds);
  const markRead = useAppStore((s) => s.markNotificationsRead);

  const purchasedIds = useMemo(
    () => orders.flatMap((o) => o.items.map((i) => i.productId)),
    [orders]
  );

  const recos = useMemo(
    () =>
      recommendForCustomer({
        purchasedIds,
        favorites,
        activities,
        limit: 4,
      }),
    [purchasedIds, favorites, activities]
  );

  const openRequests =
    samples.filter((r) => r.status !== "회신완료").length +
    quotes.filter((r) => r.status !== "회신완료").length;
  const activeOrders = orders.filter((o) => o.status !== "완료").length;
  const unread = notifications.filter((n) => !readIds.includes(n.id)).length;

  const setTab = (k: TabKey) =>
    router.push(k === "overview" ? "/portal" : `/portal?tab=${k}`, {
      scroll: false,
    });

  const summary = [
    { key: "requests" as TabKey, icon: FileText, label: "진행 중 요청", value: openRequests, unit: "건" },
    { key: "orders" as TabKey, icon: Package, label: "진행 중 주문", value: activeOrders, unit: "건" },
    { key: "favorites" as TabKey, icon: Heart, label: "관심 제품", value: favorites.length, unit: "개" },
    { key: "notifications" as TabKey, icon: Bell, label: "새 알림", value: unread, unit: "건" },
  ];

  return (
    <div className="mx-auto w-full max-w-shop px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* 인사 */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: EASE }}
        className="mb-6"
      >
        <p className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-leather-500">
          Customer Portal
        </p>
        <h1 className="mt-2 text-[1.65rem] font-extrabold leading-tight tracking-[-0.025em] text-ink-900 sm:text-[2rem]">
          안녕하세요, {account.org} {account.name}님
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">
          진행 중인 요청과 주문, 관심 제품을 한 곳에서 확인하실 수 있습니다.
        </p>
      </motion.header>

      {/* 요약 */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s, i) => (
          <motion.button
            key={s.label}
            type="button"
            onClick={() => setTab(s.key)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
            className="min-w-0 rounded-card-lg border border-ivory-line bg-white p-4 text-left transition-all duration-200 ease-premium hover:-translate-y-[2px] hover:border-leather-200 hover:shadow-card"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ivory-deep text-leather-600">
              <s.icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={2} aria-hidden />
            </span>
            <span className="mt-3 block truncate text-[0.88rem] font-semibold text-ink-500">
              {s.label}
            </span>
            <span className="mt-1 block text-[1.5rem] font-extrabold tabular-nums tracking-[-0.02em] text-ink-900">
              {s.value}
              <span className="ml-0.5 text-[0.88rem] font-bold text-ink-500">
                {s.unit}
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* 탭 */}
      <div className="mb-6 -mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key ? "page" : undefined}
              className={clsx(
                "inline-flex min-h-[2.7rem] items-center gap-1.5 whitespace-nowrap rounded-btn px-3.5 text-[0.92rem] font-bold transition-colors duration-200",
                tab === t.key
                  ? "bg-navy-900 text-white"
                  : "border border-ivory-line bg-white text-ink-600 hover:text-ink-900"
              )}
            >
              <t.icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 홈 ── */}
      {tab === "overview" ? (
        <div className="space-y-8">
          {orders.length ? (
            <section aria-label="재주문">
              <h2 className="mb-4 text-[1.25rem] font-extrabold tracking-[-0.02em] text-ink-900">
                다시 주문하기
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {orders.slice(0, 2).map((o) => (
                  <ReorderCard key={o.id} order={o} />
                ))}
              </div>
            </section>
          ) : null}

          <section aria-label="추천 제품">
            <h2 className="mb-4 text-[1.25rem] font-extrabold tracking-[-0.02em] text-ink-900">
              {account.org}님을 위한 추천
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
              {recos.map((r, i) => (
                <ProductCard
                  key={r.product.id}
                  product={r.product}
                  index={i}
                  recommended
                  reason={r.reasons[0]}
                />
              ))}
            </div>
          </section>

          <section aria-label="최근 활동">
            <h2 className="mb-4 text-[1.25rem] font-extrabold tracking-[-0.02em] text-ink-900">
              최근 활동
            </h2>
            <Card className="p-0">
              <ul className="divide-y divide-ivory-line">
                {activities.slice(0, 8).map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-[0.94rem] text-ink-700">
                      {a.label}
                    </span>
                    <span className="shrink-0 text-[0.86rem] tabular-nums text-ink-400">
                      {formatDate(a.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>
      ) : null}

      {/* ── 주문 내역 ── */}
      {tab === "orders" ? (
        <div className="space-y-4">
          {orders.map((o) => {
            const first = getProduct(o.items[0]?.productId ?? "");
            return (
              <Card key={o.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.86rem] font-bold text-ink-400">{o.number}</p>
                    <p className="mt-1 text-[1.05rem] font-extrabold text-ink-900">
                      {first?.name ?? "—"}
                      {o.items.length > 1 ? (
                        <span className="ml-1 text-[0.88rem] font-bold text-ink-500">
                          외 {o.items.length - 1}건
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-[0.9rem] text-ink-500">
                      주문 {formatDate(o.orderedAt)}
                      {o.deliveredAt ? ` · 납품 ${formatDate(o.deliveredAt)}` : ""}
                      {o.reorderOf ? ` · ${o.reorderOf} 재주문` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Status value={o.status} />
                    <p className="mt-2 text-[1.05rem] font-extrabold tabular-nums text-ink-900">
                      {formatKRW(orderTotal(o))}
                    </p>
                  </div>
                </div>
                <div className="mt-3.5 border-t border-ivory-line pt-3.5">
                  <ul className="space-y-1.5">
                    {o.items.map((it) => {
                      const p = getProduct(it.productId);
                      return (
                        <li
                          key={it.productId}
                          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                        >
                          <span className="min-w-0 flex-1 truncate text-[0.92rem] text-ink-600">
                            {p?.name ?? it.productId}
                          </span>
                          <span className="shrink-0 text-[0.9rem] font-semibold tabular-nums text-ink-700">
                            {formatNumber(it.qty)}평
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* ── 요청 내역 ── */}
      {tab === "requests" ? (
        <div className="space-y-6">
          <section aria-label="견적 요청">
            <h2 className="mb-3 flex items-center gap-2 text-[1.1rem] font-extrabold text-ink-900">
              <FileText className="h-[1.05rem] w-[1.05rem] text-leather-500" aria-hidden />
              견적 요청 {quotes.length}건
            </h2>
            <div className="space-y-3">
              {quotes.map((r) => (
                <Card key={r.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.86rem] font-bold text-ink-400">{r.number}</p>
                      <p className="mt-1 text-[0.98rem] font-bold text-ink-900">
                        {r.items
                          .map((i) => getProduct(i.productId)?.name ?? i.productId)
                          .join(", ")}
                      </p>
                      <p className="mt-1 text-[0.9rem] text-ink-500">
                        요청 {formatDate(r.createdAt)} ·{" "}
                        {r.items.map((i) => `${formatNumber(i.qty)}평`).join(" / ")}
                        {r.dueDate ? ` · 희망납기 ${formatDate(r.dueDate)}` : ""}
                      </p>
                      {r.note ? (
                        <p className="mt-2 rounded-card bg-ivory px-3 py-2 text-[0.88rem] leading-relaxed text-ink-600">
                          {r.note}
                        </p>
                      ) : null}
                    </div>
                    <Status value={r.status} />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section aria-label="샘플 요청">
            <h2 className="mb-3 flex items-center gap-2 text-[1.1rem] font-extrabold text-ink-900">
              <ClipboardList className="h-[1.05rem] w-[1.05rem] text-leather-500" aria-hidden />
              샘플 요청 {samples.length}건
            </h2>
            <div className="space-y-3">
              {samples.map((r) => (
                <Card key={r.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.86rem] font-bold text-ink-400">{r.number}</p>
                      <p className="mt-1 text-[0.98rem] font-bold text-ink-900">
                        {r.productIds
                          .map((id) => getProduct(id)?.name ?? id)
                          .join(", ")}
                      </p>
                      <p className="mt-1 text-[0.9rem] text-ink-500">
                        요청 {formatDate(r.createdAt)} · {r.contactName}
                      </p>
                      {r.note ? (
                        <p className="mt-2 rounded-card bg-ivory px-3 py-2 text-[0.88rem] leading-relaxed text-ink-600">
                          {r.note}
                        </p>
                      ) : null}
                    </div>
                    <Status value={r.status} />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* ── 관심 제품 ── */}
      {tab === "favorites" ? (
        favorites.length ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {favorites.map((f, i) => {
              const p = getProduct(f.productId);
              return p ? <ProductCard key={f.productId} product={p} index={i} /> : null;
            })}
          </div>
        ) : (
          <Card className="py-14 text-center">
            <p className="text-[1rem] font-bold text-ink-700">
              담아두신 관심 제품이 없습니다
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex min-h-[2.9rem] items-center rounded-btn bg-navy-900 px-5 text-[0.95rem] font-bold text-white"
            >
              제품 둘러보기
            </Link>
          </Card>
        )
      ) : null}

      {/* ── 알림 ── */}
      {tab === "notifications" ? (
        <div className="space-y-3">
          {notifications.length ? (
            <>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={() => markRead(notifications.map((n) => n.id))}
                  className="inline-flex min-h-[2.6rem] items-center rounded-btn border border-ivory-line bg-white px-3.5 text-[0.9rem] font-bold text-ink-600 transition-colors hover:text-ink-900"
                >
                  모두 읽음으로 표시
                </button>
              ) : null}
              {notifications.map((n) => {
                const isRead = readIds.includes(n.id);
                return (
                  <Link
                    key={n.id}
                    href={n.href ?? "/portal"}
                    onClick={() => markRead([n.id])}
                    className={clsx(
                      "block rounded-card-lg border p-5 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-card",
                      isRead
                        ? "border-ivory-line bg-white"
                        : "border-leather-200 bg-leather-50/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-[1rem] font-extrabold text-ink-900">
                        {n.title}
                      </p>
                      {!isRead ? (
                        <span
                          aria-label="읽지 않음"
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-leather-500"
                        />
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink-600">
                      {n.body}
                    </p>
                    <p className="mt-2 text-[0.84rem] tabular-nums text-ink-400">
                      {formatDate(n.date)}
                    </p>
                  </Link>
                );
              })}
            </>
          ) : (
            <Card className="py-14 text-center">
              <p className="text-[1rem] font-bold text-ink-700">새 알림이 없습니다</p>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <PortalContent />
    </Suspense>
  );
}
