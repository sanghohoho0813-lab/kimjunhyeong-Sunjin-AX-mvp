"use client";

import { motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { RequestDialog } from "@/components/shop/RequestDialog";
import { clsx } from "@/lib/utils/clsx";
import { PRODUCTS } from "@/lib/data/seed";
import { leadTimeDays } from "@/lib/data/customer";
import { useAccount, useFavorites } from "@/lib/store";
import { formatNumber } from "@/lib/utils/format";

const EASE = [0.22, 1, 0.36, 1] as const;

const COPY = {
  sample: {
    eyebrow: "Sample Request",
    title: "샘플 요청",
    desc: "확인하고 싶은 제품을 선택하시면 샘플을 보내드립니다. 여러 종을 함께 요청하실 수 있습니다.",
    cta: "샘플 요청하기",
  },
  quote: {
    eyebrow: "Quote Request",
    title: "견적 문의",
    desc: "제품과 수량을 선택하시면 담당자가 확인 후 맞춤 견적으로 회신드립니다.",
    cta: "견적 요청하기",
  },
} as const;

export default function RequestPage() {
  const params = useParams<{ kind: string }>();
  const kind = params.kind === "quote" ? "quote" : params.kind === "sample" ? "sample" : null;
  const account = useAccount();
  const favorites = useFavorites(account.customerId ?? "c01");

  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const kw = query.trim().toLowerCase();
    const base = kw
      ? PRODUCTS.filter((p) =>
          `${p.code} ${p.name} ${p.material} ${p.color} ${p.grade}`
            .toLowerCase()
            .includes(kw)
        )
      : // 검색 전에는 관심 제품을 위로 올려 고르기 쉽게 한다
        [...PRODUCTS].sort((a, b) => {
          const fa = favorites.some((f) => f.productId === a.id) ? 1 : 0;
          const fb = favorites.some((f) => f.productId === b.id) ? 1 : 0;
          return fb - fa || b.stockQty - a.stockQty;
        });
    return base.slice(0, 24);
  }, [query, favorites]);

  if (!kind) notFound();
  const copy = COPY[kind];

  const toggle = (id: string) =>
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="mx-auto w-full max-w-shop px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="mb-6">
        <p className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-leather-500">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-[1.65rem] font-extrabold leading-tight tracking-[-0.025em] text-ink-900 sm:text-[2rem]">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-500">
          {copy.desc}
        </p>
      </header>

      {/* 검색 */}
      <div className="relative mb-4 max-w-md">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-ink-300"
          aria-hidden
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제품코드·소재·색상 검색"
          aria-label="제품 검색"
          className="h-[2.9rem] w-full rounded-btn border border-ivory-line bg-white pl-11 pr-3.5 text-[0.95rem] text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-leather-400 focus:ring-2 focus:ring-leather-100"
        />
      </div>

      {/* 제품 선택 */}
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p, i) => {
          const on = picked.includes(p.id);
          const fav = favorites.some((f) => f.productId === p.id);
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              aria-pressed={on}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, delay: Math.min(i, 10) * 0.03, ease: EASE }}
              className={clsx(
                "flex items-center gap-3 rounded-card-lg border p-3 text-left transition-all duration-200",
                on
                  ? "border-leather-400 bg-leather-50 ring-2 ring-leather-100"
                  : "border-ivory-line bg-white hover:border-leather-200"
              )}
            >
              <LeatherSwatch
                color={p.color}
                finish={p.finish}
                className="h-14 w-14 shrink-0"
              />
              {/* 제품코드·품명은 식별 정보라 자르지 않는다. 좁으면 흐르게 둔다. */}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className="text-[0.8rem] font-bold uppercase tracking-[0.08em] text-leather-500">
                    {p.code}
                  </span>
                  {fav ? (
                    <span className="shrink-0 rounded bg-leather-100 px-1.5 py-0.5 text-[0.72rem] font-bold text-leather-700">
                      관심
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[0.94rem] font-bold leading-snug text-ink-900">
                  {p.material} · {p.color}
                </span>
                <span className="mt-0.5 block text-[0.86rem] leading-snug text-ink-500">
                  {p.thicknessMm}mm · {p.grade} · 재고 {formatNumber(p.stockQty)}평
                </span>
              </span>
              <span
                aria-hidden
                className={clsx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                  on
                    ? "border-leather-500 bg-leather-500 text-white"
                    : "border-ivory-line bg-white text-transparent"
                )}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* 하단 고정 액션 */}
      <div className="sticky bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] z-30 mt-5 lg:bottom-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card-lg border border-ivory-line bg-white/95 p-3.5 shadow-card backdrop-blur">
          <p className="text-[0.95rem] font-bold text-ink-700">
            선택한 제품{" "}
            <span className="tabular-nums text-leather-600">{picked.length}종</span>
          </p>
          <button
            type="button"
            disabled={!picked.length}
            onClick={() => setOpen(true)}
            className="flex min-h-[3rem] items-center justify-center rounded-btn bg-leather-600 px-6 text-[1rem] font-bold text-white transition-colors hover:bg-leather-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {copy.cta}
          </button>
        </div>
      </div>

      <RequestDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setPicked([]);
        }}
        kind={kind}
        productIds={picked}
      />
    </div>
  );
}
