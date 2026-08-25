"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { clsx } from "@/lib/utils/clsx";
import { USAGES } from "@/lib/data/customer";
import {
  COLOR_OPTIONS,
  EMPTY_QUERY,
  GRADE_OPTIONS,
  MATERIAL_OPTIONS,
  searchProducts,
  type FinderQuery,
} from "@/lib/shop/finder";

const THICKNESS_RANGES: { label: string; value: [number, number] }[] = [
  { label: "0.8 ~ 1.0 mm", value: [0.8, 1.0] },
  { label: "1.0 ~ 1.2 mm", value: [1.0, 1.2] },
  { label: "1.2 ~ 1.4 mm", value: [1.2, 1.4] },
  { label: "1.4 ~ 1.6 mm", value: [1.4, 1.6] },
];

function Field({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[0.84rem] font-bold text-ink-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[2.9rem] w-full min-w-0 rounded-btn border border-ivory-line bg-white px-3 text-[0.95rem] font-semibold text-ink-800 outline-none transition-colors focus:border-leather-400 focus:ring-2 focus:ring-leather-100"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Hero Product Finder — 고객이 가장 먼저 만나는 검색.
 *
 * 조건을 고르는 즉시 결과 수를 보여준다. "검색해봐야 뭐가 나오는지 아는" 구조가
 * 아니라 "고르면서 바로 확인하는" 구조여야 B2B 담당자가 조건을 좁힌다.
 */
export function ProductFinder({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState<FinderQuery>(EMPTY_QUERY);
  const count = useMemo(() => searchProducts(q).length, [q]);

  const set = <K extends keyof FinderQuery>(k: K, v: FinderQuery[K]) =>
    setQ((prev) => ({ ...prev, [k]: v }));

  const submit = () => {
    const p = new URLSearchParams();
    if (q.usage) p.set("usage", q.usage);
    if (q.material) p.set("material", q.material);
    if (q.color) p.set("color", q.color);
    if (q.grade) p.set("grade", q.grade);
    if (q.thickness) p.set("thickness", `${q.thickness[0]}-${q.thickness[1]}`);
    router.push(`/products${p.toString() ? `?${p}` : ""}`);
  };

  const reset = () => setQ(EMPTY_QUERY);
  const dirty =
    Boolean(q.usage || q.material || q.color || q.grade || q.thickness);

  return (
    <div className="rounded-card-lg bg-white p-4 shadow-card sm:p-5">
      <div
        className={clsx(
          "grid gap-3",
          compact
            ? "sm:grid-cols-2"
            : "sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] lg:items-end"
        )}
      >
        <Field
          label="용도"
          placeholder="전체 용도"
          value={q.usage ?? ""}
          onChange={(v) => set("usage", v as FinderQuery["usage"])}
          options={USAGES.map((u) => ({ label: u, value: u }))}
        />
        <Field
          label="소재"
          placeholder="전체 소재"
          value={q.material ?? ""}
          onChange={(v) => set("material", v as FinderQuery["material"])}
          options={MATERIAL_OPTIONS.map((m) => ({ label: `${m} Leather`, value: m }))}
        />
        <Field
          label="색상"
          placeholder="전체 색상"
          value={q.color ?? ""}
          onChange={(v) => set("color", v as FinderQuery["color"])}
          options={COLOR_OPTIONS.map((c) => ({ label: c, value: c }))}
        />
        <Field
          label="두께"
          placeholder="전체 두께"
          value={q.thickness ? `${q.thickness[0]}-${q.thickness[1]}` : ""}
          onChange={(v) =>
            set(
              "thickness",
              v ? (v.split("-").map(Number) as [number, number]) : null
            )
          }
          options={THICKNESS_RANGES.map((t) => ({
            label: t.label,
            value: `${t.value[0]}-${t.value[1]}`,
          }))}
        />
        <Field
          label="등급"
          placeholder="전체 등급"
          value={q.grade ?? ""}
          onChange={(v) => set("grade", v as FinderQuery["grade"])}
          options={GRADE_OPTIONS.map((g) => ({ label: `${g} Grade`, value: g }))}
        />

        <button
          type="button"
          onClick={submit}
          className={clsx(
            "flex h-[2.9rem] min-w-0 items-center justify-center gap-2 rounded-btn bg-navy-900 px-6 text-[0.98rem] font-bold text-white transition-colors duration-200 hover:bg-navy-800",
            compact ? "sm:col-span-2" : "sm:col-span-2 lg:col-span-1"
          )}
        >
          <Search className="h-[1.1rem] w-[1.1rem]" strokeWidth={2.4} aria-hidden />
          검색하기
        </button>
      </div>

      {/* 조건에 맞는 결과 수 — 고르는 동안 바로 반응한다 */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-ivory-line pt-3.5">
        <p className="text-[0.92rem] font-semibold text-ink-600">
          조건에 맞는 피혁{" "}
          <span className="font-extrabold tabular-nums text-leather-600">
            {count}종
          </span>
        </p>
        {dirty ? (
          <button
            type="button"
            onClick={reset}
            className="min-h-[2.2rem] text-[0.88rem] font-bold text-ink-400 transition-colors hover:text-ink-700"
          >
            검색 조건 초기화
          </button>
        ) : null}
      </div>
    </div>
  );
}
