"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { clsx } from "@/lib/utils/clsx";
import { USAGES, type Usage } from "@/lib/data/customer";
import {
  COLOR_OPTIONS,
  EMPTY_QUERY,
  GRADE_OPTIONS,
  MATERIAL_OPTIONS,
  THICKNESS_OPTIONS,
  searchProducts,
  sortForCustomer,
  type FinderQuery,
} from "@/lib/shop/finder";
import { useAccount, useAppStore } from "@/lib/store";
import type { LeatherColor, LeatherGrade, LeatherMaterial } from "@/types";

const EASE = [0.22, 1, 0.36, 1] as const;

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={clsx(
        "inline-flex min-h-[2.6rem] items-center whitespace-nowrap rounded-btn border px-3.5 text-[0.9rem] font-semibold transition-all duration-200",
        on
          ? "border-leather-400 bg-leather-50 text-leather-700"
          : "border-ivory-line bg-white text-ink-600 hover:border-leather-200 hover:text-ink-900"
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[0.86rem] font-bold text-ink-500">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ProductsContent() {
  const params = useSearchParams();
  const account = useAccount();
  const logActivity = useAppStore((s) => s.logActivity);

  const [q, setQ] = useState<FinderQuery>(EMPTY_QUERY);
  const [sheetOpen, setSheetOpen] = useState(false);

  // URL 조건을 초기값으로 받는다 (홈 Finder / 카테고리에서 넘어온다)
  useEffect(() => {
    const th = params.get("thickness");
    setQ({
      usage: (params.get("usage") as Usage) ?? "",
      material: (params.get("material") as LeatherMaterial) ?? "",
      color: (params.get("color") as LeatherColor) ?? "",
      grade: (params.get("grade") as LeatherGrade) ?? "",
      thickness: th ? (th.split("-").map(Number) as [number, number]) : null,
      keyword: params.get("q") ?? "",
    });
  }, [params]);

  const results = useMemo(() => sortForCustomer(searchProducts(q)), [q]);

  // 검색 행동을 내부 AX 신호로 남긴다
  const active = [q.usage, q.material, q.color, q.grade].filter(Boolean);
  useEffect(() => {
    if (!active.length && !q.thickness) return;
    const label = `${[
      q.usage && `${q.usage}용`,
      q.material,
      q.color,
      q.thickness && `${q.thickness[0]}~${q.thickness[1]}mm`,
      q.grade,
    ]
      .filter(Boolean)
      .join(" · ")} 검색`;
    const t = setTimeout(
      () =>
        logActivity({
          customerId: account.customerId ?? "c01",
          kind: "search",
          label,
        }),
      1200
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.usage, q.material, q.color, q.grade, q.thickness]);

  const set = <K extends keyof FinderQuery>(k: K, v: FinderQuery[K]) =>
    setQ((prev) => ({ ...prev, [k]: prev[k] === v ? (EMPTY_QUERY[k] as FinderQuery[K]) : v }));

  const dirty = Boolean(active.length || q.thickness || q.keyword);

  const filters = (
    <div className="space-y-5">
      <FilterGroup label="용도">
        {USAGES.map((u) => (
          <Chip key={u} on={q.usage === u} onClick={() => set("usage", u)}>
            {u}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="소재">
        {MATERIAL_OPTIONS.map((m) => (
          <Chip key={m} on={q.material === m} onClick={() => set("material", m)}>
            {m}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="색상">
        {COLOR_OPTIONS.map((c) => (
          <Chip key={c} on={q.color === c} onClick={() => set("color", c)}>
            {c}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="두께">
        {THICKNESS_OPTIONS.map((t) => (
          <Chip
            key={t}
            on={q.thickness?.[0] === t}
            onClick={() =>
              setQ((prev) => ({
                ...prev,
                thickness: prev.thickness?.[0] === t ? null : [t, t],
              }))
            }
          >
            {t}mm
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="등급">
        {GRADE_OPTIONS.map((g) => (
          <Chip key={g} on={q.grade === g} onClick={() => set("grade", g)}>
            {g}
          </Chip>
        ))}
      </FilterGroup>
      {dirty ? (
        <button
          type="button"
          onClick={() => setQ(EMPTY_QUERY)}
          className="inline-flex min-h-[2.6rem] items-center gap-1.5 text-[0.9rem] font-bold text-ink-400 transition-colors hover:text-ink-700"
        >
          <X className="h-4 w-4" aria-hidden />
          조건 초기화
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-shop px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="mb-6">
        <p className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-leather-500">
          Products
        </p>
        <h1 className="mt-2 text-[1.65rem] font-extrabold leading-tight tracking-[-0.025em] text-ink-900 sm:text-[2rem]">
          제품 찾기
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">
          소재·색상·두께·등급으로 조건을 좁혀 필요한 피혁을 찾으세요.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-8">
        {/* 데스크톱 좌측 필터 */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--shop-header-h)+1.5rem)] rounded-card-lg border border-ivory-line bg-white p-5">
            <p className="mb-4 flex items-center gap-2 text-[1rem] font-extrabold text-ink-900">
              <SlidersHorizontal className="h-[1.05rem] w-[1.05rem] text-leather-500" aria-hidden />
              검색 조건
            </p>
            {filters}
          </div>
        </aside>

        <div className="min-w-0">
          {/* 결과 헤더 */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[1rem] font-bold text-ink-800">
              조건에 맞는 피혁{" "}
              <span className="tabular-nums text-leather-600">{results.length}종</span>
            </p>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex min-h-[2.6rem] items-center gap-1.5 rounded-btn border border-ivory-line bg-white px-3.5 text-[0.9rem] font-bold text-ink-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              필터
              {dirty ? (
                <span className="flex h-[1.2rem] min-w-[1.2rem] items-center justify-center rounded-full bg-leather-500 px-1 text-[0.72rem] font-bold text-white">
                  {active.length + (q.thickness ? 1 : 0)}
                </span>
              ) : null}
            </button>
          </div>

          {results.length ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5 2xl:grid-cols-4">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-card-lg border border-dashed border-ivory-line bg-white px-6 py-16 text-center">
              <p className="text-[1rem] font-bold text-ink-700">
                조건에 맞는 제품이 없습니다
              </p>
              <p className="mt-1.5 text-[0.92rem] text-ink-500">
                조건을 줄이거나 다른 소재로 검색해보세요.
              </p>
              <button
                type="button"
                onClick={() => setQ(EMPTY_QUERY)}
                className="mt-5 inline-flex min-h-[2.8rem] items-center rounded-btn bg-navy-900 px-5 text-[0.94rem] font-bold text-white"
              >
                조건 초기화
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 필터 시트 */}
      {sheetOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSheetOpen(false)}
            className="fixed inset-0 z-50 bg-navy-950/50 lg:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[82dvh] overflow-y-auto rounded-t-[20px] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[1.1rem] font-extrabold text-ink-900">검색 조건</p>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="닫기"
                className="flex h-11 w-11 items-center justify-center rounded-btn text-ink-400 hover:bg-ivory-deep"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filters}
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="mt-6 flex min-h-[3rem] w-full items-center justify-center rounded-btn bg-navy-900 text-[1rem] font-bold text-white"
            >
              {results.length}종 보기
            </button>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ProductsContent />
    </Suspense>
  );
}
