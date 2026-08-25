"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  ExternalLink,
  FileText,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { Badge, DemoBadge, EmptyState } from "@/components/shared/ui";
import { clsx } from "@/lib/utils/clsx";
import { getCustomer, getCustomerStats, getProduct } from "@/lib/data/derived";
import { quoteRequestValue } from "@/lib/insights/customerSignals";
import {
  useAllCustomerActivities,
  useAllQuoteRequests,
  useAllSampleRequests,
  useAppStore,
} from "@/lib/store";
import { daysBetween, formatDate, formatKRW, formatNumber } from "@/lib/utils/format";

const EASE = [0.22, 1, 0.36, 1] as const;

type Tab = "all" | "quote" | "sample" | "reorder";

const TABS: { key: Tab; label: string; icon: typeof FileText }[] = [
  { key: "all", label: "전체", icon: ClipboardList },
  { key: "quote", label: "견적 요청", icon: FileText },
  { key: "sample", label: "샘플 요청", icon: ClipboardList },
  { key: "reorder", label: "재주문", icon: RefreshCw },
];

function CustomerLine({ customerId }: { customerId: string }) {
  const customer = getCustomer(customerId);
  const stats = getCustomerStats(customerId);
  if (!customer) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Link
        href={`/customers/${customerId}`}
        className="text-[1.02rem] font-extrabold text-ink-900 transition-colors hover:text-brand-700"
      >
        {customer.name}
      </Link>
      <span className="text-[0.88rem] text-ink-500">
        {customer.segment} · 누적 {formatKRW(stats.totalRevenue)}
        {stats.lastPurchaseDate
          ? ` · 최근 거래 ${formatDate(stats.lastPurchaseDate)}`
          : ""}
      </span>
    </div>
  );
}

export default function RequestsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const quotes = useAllQuoteRequests();
  const samples = useAllSampleRequests();
  const activities = useAllCustomerActivities();
  const addQuote = useAppStore((s) => s.addQuote);
  const pushToast = useAppStore((s) => s.pushToast);
  const [converted, setConverted] = useState<string[]>([]);

  const reorders = useMemo(
    () => activities.filter((a) => a.kind === "reorder"),
    [activities]
  );

  const pendingQuotes = quotes.filter((q) => q.status !== "회신완료").length;
  const pendingSamples = samples.filter((s) => s.status !== "회신완료").length;

  return (
    <div>
      <PageHeader
        title="고객 요청"
        subtitle="고객 화면에서 들어온 견적·샘플·재주문 요청입니다. 요청에서 바로 내부 견적으로 이어집니다."
        badge={<DemoBadge />}
        actions={
          <Link
            href="/"
            className="flex h-10 items-center gap-1.5 rounded-btn border border-surface-line bg-white px-4 text-sm font-bold text-ink-700 transition-colors hover:bg-surface-subtle"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            고객 화면 보기
          </Link>
        }
      />

      {/* 요약 */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          { l: "미회신 견적 요청", v: pendingQuotes, u: "건", tone: "text-warning" },
          { l: "미회신 샘플 요청", v: pendingSamples, u: "건", tone: "text-warning" },
          { l: "최근 재주문", v: reorders.length, u: "건", tone: "text-teal-700" },
          {
            l: "요청 금액 (참고가)",
            v: quotes
              .filter((q) => q.status !== "회신완료")
              .reduce((s, q) => s + quoteRequestValue(q), 0),
            u: "",
            tone: "text-ink-900",
            money: true,
          },
        ].map((x, i) => (
          <motion.div
            key={x.l}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
            className="card-kpi min-w-0 px-4 py-4"
          >
            <p className="truncate text-[0.88rem] font-semibold text-ink-500">{x.l}</p>
            <p
              className={clsx(
                "mt-2 text-[1.5rem] font-extrabold tabular-nums tracking-[-0.02em]",
                x.tone
              )}
            >
              {x.money ? formatKRW(x.v) : x.v}
              {x.u ? (
                <span className="ml-0.5 text-[0.88rem] font-bold text-ink-500">
                  {x.u}
                </span>
              ) : null}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 탭 */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={clsx("chip", tab === t.key && "chip-on")}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* 견적 요청 */}
        {(tab === "all" || tab === "quote") &&
          quotes.map((q, i) => {
            const done = converted.includes(q.id);
            return (
              <motion.section
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04, ease: EASE }}
                className="card-data p-5 lg:p-6"
                aria-label={`견적 요청 ${q.number}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-[0.8rem] font-bold text-brand-700">
                        <FileText className="h-3.5 w-3.5" aria-hidden />
                        견적 요청
                      </span>
                      <span className="text-[0.86rem] font-bold text-ink-400">
                        {q.number}
                      </span>
                    </span>
                    <div className="mt-2">
                      <CustomerLine customerId={q.customerId} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge>{q.status}</Badge>
                    <p className="mt-2 text-[0.86rem] text-ink-400">
                      {daysBetween(q.createdAt)}일 전 요청
                    </p>
                  </div>
                </div>

                {/* 요청 품목 */}
                <ul className="mt-4 space-y-2">
                  {q.items.map((it) => {
                    const p = getProduct(it.productId);
                    if (!p) return null;
                    return (
                      <li
                        key={it.productId}
                        className="flex items-center gap-3 rounded-card bg-surface-sunken p-3"
                      >
                        <LeatherSwatch
                          color={p.color}
                          finish={p.finish}
                          className="h-11 w-11"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.94rem] font-bold text-ink-900">
                            {p.name}
                          </span>
                          <span className="block truncate text-[0.86rem] text-ink-500">
                            재고 {formatNumber(p.stockQty)}평 · 참고가{" "}
                            {formatNumber(p.listPricePerUnit)}원/평
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[0.98rem] font-extrabold tabular-nums text-ink-900">
                            {formatNumber(it.qty)}평
                          </span>
                          <span className="block text-[0.84rem] text-ink-400">
                            요청 수량
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {q.note ? (
                  <p className="mt-3 rounded-card border border-surface-line px-4 py-3 text-[0.92rem] leading-relaxed text-ink-600">
                    {q.note}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-line pt-4">
                  <div className="min-w-0">
                    <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-ink-400">
                      참고가 기준 규모
                    </p>
                    <p className="mt-0.5 text-[1.15rem] font-extrabold tabular-nums text-ink-900">
                      {formatKRW(quoteRequestValue(q))}
                    </p>
                    <p className="mt-1 text-[0.84rem] text-ink-400">
                      확정 단가는 견적 작성 화면에서 추천가를 확인해 결정합니다.
                    </p>
                  </div>
                  {done ? (
                    <Link
                      href="/quotes"
                      className="btn btn-ghost !font-bold text-teal-700"
                    >
                      견적 생성됨 · 견적함 보기
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        addQuote(
                          q.customerId,
                          q.items.map((i) => {
                            const p = getProduct(i.productId);
                            return {
                              productId: i.productId,
                              qty: i.qty,
                              unitPrice: p?.listPricePerUnit ?? 0,
                            };
                          }),
                          `고객 요청 ${q.number}에서 생성`
                        );
                        setConverted((prev) => [...prev, q.id]);
                        pushToast(`${q.number} 요청으로 견적을 만들었습니다`);
                      }}
                      className="flex min-h-[2.9rem] shrink-0 items-center gap-1.5 rounded-btn bg-brand-600 px-4 text-[0.94rem] font-bold text-white transition-colors hover:bg-brand-700"
                    >
                      이 요청으로 견적 만들기
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
              </motion.section>
            );
          })}

        {/* 샘플 요청 */}
        {(tab === "all" || tab === "sample") &&
          samples.map((r, i) => (
            <motion.section
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04, ease: EASE }}
              className="card-data p-5 lg:p-6"
              aria-label={`샘플 요청 ${r.number}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-[0.8rem] font-bold text-teal-700">
                      <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                      샘플 요청
                    </span>
                    <span className="text-[0.86rem] font-bold text-ink-400">
                      {r.number}
                    </span>
                  </span>
                  <div className="mt-2">
                    <CustomerLine customerId={r.customerId} />
                  </div>
                  <p className="mt-1.5 text-[0.9rem] text-ink-500">
                    담당자 {r.contactName} · 요청 품목 {r.productIds.length}종
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge>{r.status}</Badge>
                  <p className="mt-2 text-[0.86rem] text-ink-400">
                    {daysBetween(r.createdAt)}일 전 요청
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2">
                {r.productIds.map((id) => {
                  const p = getProduct(id);
                  if (!p) return null;
                  return (
                    <Link
                      key={id}
                      href={`/inventory/${id}`}
                      className="inline-flex items-center gap-2 rounded-card border border-surface-line bg-white px-3 py-2 transition-colors hover:border-brand-200"
                    >
                      <LeatherSwatch
                        color={p.color}
                        finish={p.finish}
                        className="h-8 w-8"
                      />
                      <span className="text-[0.9rem] font-semibold text-ink-800">
                        {p.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {r.note ? (
                <p className="mt-3 rounded-card border border-surface-line px-4 py-3 text-[0.92rem] leading-relaxed text-ink-600">
                  {r.note}
                </p>
              ) : null}
            </motion.section>
          ))}

        {/* 재주문 */}
        {(tab === "all" || tab === "reorder") &&
          reorders.map((a, i) => (
            <motion.section
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04, ease: EASE }}
              className="card-data p-5"
              aria-label="재주문 요청"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-md bg-gold-100 px-2 py-1 text-[0.8rem] font-bold text-gold-600">
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    재주문
                  </span>
                  <div className="mt-2">
                    <CustomerLine customerId={a.customerId} />
                  </div>
                  <p className="mt-1.5 text-[0.92rem] text-ink-600">{a.label}</p>
                </div>
                <p className="shrink-0 text-[0.86rem] text-ink-400">
                  {formatDate(a.date)}
                </p>
              </div>
            </motion.section>
          ))}

        {tab === "reorder" && !reorders.length ? (
          <EmptyState
            message="재주문 요청이 없습니다"
            hint="고객 포털의 '다시 주문하기'로 들어온 요청이 여기 표시됩니다."
          />
        ) : null}
      </div>
    </div>
  );
}
