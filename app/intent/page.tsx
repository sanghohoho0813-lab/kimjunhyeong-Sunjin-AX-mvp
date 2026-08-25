"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Info,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { clsx } from "@/lib/utils/clsx";
import { COMPANY } from "@/lib/data/seed";
import {
  INTENT_HERO,
  OUTCOMES,
  POLICY_DISCLAIMER,
  POLICY_ITEMS,
  SECTION_01,
  SECTION_02,
  SECTION_03,
  SECTION_04,
  SECTION_05,
  SECTION_06,
  SECTION_07,
  SECTION_08,
  SECTION_09,
  SECTION_10,
  SECTION_11,
} from "@/lib/content/intent";

function SectionShell({
  no,
  title,
  children,
}: {
  no: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-24"
    >
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-[0.86rem] font-extrabold tabular-nums tracking-[0.06em] text-teal-600">
          {no}
        </span>
        <h2 className="text-[1.15rem] font-extrabold tracking-[-0.015em] text-ink-900 lg:text-[1.4rem]">
          {title}
        </h2>
      </div>
      {children}
    </motion.section>
  );
}

/** 흐름 표시 — 칩 + 화살표 */
function FlowChips({
  items,
  tone = "ink",
}: {
  items: readonly string[];
  tone?: "ink" | "teal";
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {items.map((step, i) => (
        <span key={step} className="flex items-center gap-1.5">
          <span
            className={clsx(
              "inline-flex items-center rounded-md px-2.5 py-1.5 text-[0.78rem] font-semibold",
              tone === "teal"
                ? "bg-teal-50 text-teal-700"
                : "bg-surface-sunken text-ink-700"
            )}
          >
            {step}
          </span>
          {i < items.length - 1 ? (
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-300" aria-hidden />
          ) : null}
        </span>
      ))}
    </div>
  );
}

/** Before / After 대조 */
function BeforeAfter({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  before: readonly string[];
  after: readonly string[];
  beforeLabel?: string;
  afterLabel?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink-400">
          {beforeLabel}
        </p>
        <ul className="mt-3 space-y-2.5">
          {before.map((t) => (
            <li
              key={t}
              className="flex gap-2.5 text-[0.86rem] leading-relaxed text-ink-500"
            >
              <span
                aria-hidden
                className="mt-[0.55rem] h-1 w-2.5 shrink-0 rounded-full bg-ink-300"
              />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="card-insight p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-teal-700">
          {afterLabel}
        </p>
        <ul className="mt-3 space-y-2.5">
          {after.map((t) => (
            <li
              key={t}
              className="flex gap-2.5 text-[0.86rem] leading-relaxed text-ink-700"
            >
              <Check className="mt-[0.15rem] h-4 w-4 shrink-0 text-teal-500" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SunjinNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 rounded-card border-l-[3px] border-teal-400 bg-teal-50/60 px-4 py-3.5">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-teal-700">
        선진산업이라면
      </p>
      <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink-700">{children}</p>
    </div>
  );
}

function PolicyAccordion() {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div className="space-y-2.5">
      {POLICY_ITEMS.map((item) => {
        const isOpen = open === item.n;
        return (
          <div
            key={item.n}
            className={clsx(
              "card overflow-hidden transition-colors duration-200",
              isOpen && "border-teal-200"
            )}
          >
            <button
              onClick={() => setOpen(isOpen ? null : item.n)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors duration-200 hover:bg-surface-subtle"
            >
              <span
                className={clsx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[0.82rem] font-extrabold tabular-nums transition-colors",
                  isOpen ? "bg-teal-500 text-white" : "bg-surface-sunken text-ink-500"
                )}
              >
                {item.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.92rem] font-bold text-ink-900">
                  {item.org}
                </span>
                <span className="mt-0.5 block text-[0.78rem] text-ink-500">
                  {item.sub}
                </span>
              </span>
              <ChevronDown
                className={clsx(
                  "h-4 w-4 shrink-0 text-ink-400 transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
                aria-hidden
              />
            </button>

            {isOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-surface-line px-5 py-5">
                  <p className="text-[0.92rem] font-semibold leading-relaxed text-ink-800">
                    {item.lead}
                  </p>
                  {item.paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className="mt-3 text-[0.86rem] leading-relaxed text-ink-600"
                    >
                      {p}
                    </p>
                  ))}

                  {item.facts ? (
                    <dl className="mt-5 grid gap-2.5 sm:grid-cols-3">
                      {item.facts.map((f) => (
                        <div
                          key={f.label}
                          className="rounded-card bg-surface-subtle px-4 py-3"
                        >
                          <dt className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-ink-400">
                            {f.label}
                          </dt>
                          <dd className="mt-1 text-[0.84rem] font-bold text-ink-800">
                            {f.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {item.list ? (
                    <div className="mt-5">
                      <p className="t-eyebrow">{item.listTitle}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {item.list.map((l) => (
                          <span
                            key={l}
                            className="rounded-md border border-surface-line bg-white px-2.5 py-1.5 text-[0.78rem] font-semibold text-ink-700"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.flow ? (
                    <div className="no-scrollbar mt-5 overflow-x-auto">
                      <FlowChips items={item.flow} tone="teal" />
                    </div>
                  ) : null}

                  {item.cards ? (
                    <div className="mt-5">
                      <p className="t-eyebrow">{item.cardsTitle}</p>
                      <div className="mt-2.5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                        {item.cards.map((c) => (
                          <div
                            key={c.title}
                            className="rounded-card border border-surface-line bg-surface-subtle p-4"
                          >
                            <p className="text-[0.84rem] font-bold text-ink-900">
                              {c.title}
                            </p>
                            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-500">
                              {c.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.closing ? (
                    <p className="mt-5 text-[0.86rem] leading-relaxed text-ink-600">
                      {item.closing}
                    </p>
                  ) : null}

                  <SunjinNote>{item.sunjin}</SunjinNote>
                </div>
              </motion.div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function IntentPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-ink-400 transition-colors hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> 대시보드
      </Link>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-card-lg bg-navy-925 px-6 py-9 lg:px-10 lg:py-12"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-pill border border-white/10 bg-white/[0.06] px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" aria-hidden />
            <span className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-teal-200">
              {INTENT_HERO.eyebrow}
            </span>
          </span>

          <p className="mt-5 text-[0.86rem] font-semibold text-navy-200">
            {INTENT_HERO.title}
          </p>

          <h1 className="mt-3 text-[1.5rem] font-extrabold leading-[1.35] tracking-[-0.02em] text-white lg:text-[2.05rem]">
            {INTENT_HERO.headline.map((line, i) => (
              <span key={i} className="block">
                {i === INTENT_HERO.headline.length - 1 ? (
                  <span className="bg-gradient-to-r from-teal-300 to-brand-300 bg-clip-text text-transparent">
                    {line}
                  </span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p className="mt-5 max-w-2xl text-[0.9rem] leading-relaxed text-navy-200">
            {INTENT_HERO.body}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {INTENT_HERO.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[0.78rem] font-semibold text-navy-100"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="mt-10 space-y-12 lg:mt-12 lg:space-y-14">
        <SectionShell no={SECTION_01.no} title={SECTION_01.title}>
          <div className="space-y-3">
            {SECTION_01.paragraphs?.map((p, i) => (
              <p key={i} className="text-[0.9rem] leading-relaxed text-ink-600">
                {p}
              </p>
            ))}
          </div>
        </SectionShell>

        <SectionShell no={SECTION_02.no} title={SECTION_02.title}>
          <div className="space-y-3">
            {SECTION_02.paragraphs.map((p, i) => (
              <p key={i} className="text-[0.9rem] leading-relaxed text-ink-600">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-5">
            <BeforeAfter before={SECTION_02.before} after={SECTION_02.after} />
          </div>
          <p className="mt-5 rounded-card bg-surface-sunken px-5 py-4 text-[0.9rem] font-semibold leading-relaxed text-ink-800">
            {SECTION_02.closing}
          </p>
        </SectionShell>

        <SectionShell no={SECTION_03.no} title={SECTION_03.title}>
          <div className="space-y-3">
            {SECTION_03.paragraphs?.map((p, i) => (
              <p key={i} className="text-[0.9rem] leading-relaxed text-ink-600">
                {p}
              </p>
            ))}
          </div>
          {SECTION_03.note ? (
            <p className="mt-4 flex gap-2.5 rounded-card border border-warning/20 bg-warning-soft px-4 py-3.5 text-[0.84rem] leading-relaxed text-warning">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {SECTION_03.note}
            </p>
          ) : null}
        </SectionShell>

        {/* 정책 브리핑 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4">
            <span className="inline-flex items-center rounded-md bg-navy-925 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-teal-300">
              필독
            </span>
            <h2 className="mt-3 text-[1.15rem] font-extrabold tracking-[-0.015em] text-ink-900 lg:text-[1.4rem]">
              2026년 AX 정책 흐름 — 기관별 브리핑
            </h2>
            <p className="mt-1.5 text-[0.86rem] text-ink-500">
              정책자금·정부지원사업을 검토하신다면 9개 항목을 하나씩 확인해 보세요.
            </p>
          </div>
          <PolicyAccordion />
          <p className="mt-4 rounded-card border border-surface-line bg-surface-subtle px-4 py-3.5 text-[0.78rem] leading-relaxed text-ink-500">
            {POLICY_DISCLAIMER}
          </p>
        </motion.section>

        <SectionShell no={SECTION_04.no} title={SECTION_04.title}>
          <p className="mb-4 text-[0.9rem] leading-relaxed text-ink-600">
            선진산업의 일은 대략 이런 순서로 이어집니다.
          </p>
          <div className="no-scrollbar overflow-x-auto pb-1">
            <FlowChips items={SECTION_04.flow} />
          </div>
          <div className="mt-5 space-y-3">
            {SECTION_04.paragraphs.map((p, i) => (
              <p key={i} className="text-[0.9rem] leading-relaxed text-ink-600">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-5 rounded-card border-l-[3px] border-warning bg-warning-soft px-4 py-3.5 text-[0.88rem] leading-relaxed text-ink-800">
            {SECTION_04.highlight}
          </p>
        </SectionShell>

        <SectionShell no={SECTION_05.no} title={SECTION_05.title}>
          <p className="rounded-card bg-navy-925 px-5 py-4 text-[0.95rem] font-bold leading-relaxed text-white">
            {SECTION_05.principle}
          </p>
          <p className="mt-4 text-[0.9rem] leading-relaxed text-ink-600">
            {SECTION_05.intro}
          </p>
          <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {SECTION_05.steps.map((s) => (
              <li key={s.n} className="card p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-[0.78rem] font-extrabold tabular-nums text-brand-600">
                  {s.n}
                </span>
                <p className="mt-2.5 text-[0.88rem] font-bold text-ink-900">{s.title}</p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-500">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </SectionShell>

        <SectionShell no={SECTION_06.no} title={SECTION_06.title}>
          <BeforeAfter
            before={SECTION_06.before}
            after={SECTION_06.after}
            beforeLabel="지금까지"
            afterLabel="바뀌는 방향"
          />
          <p className="mt-5 rounded-card bg-surface-sunken px-5 py-4 text-[0.9rem] font-semibold leading-relaxed text-ink-800">
            {SECTION_06.closing}
          </p>
        </SectionShell>

        <SectionShell no={SECTION_07.no} title={SECTION_07.title}>
          <p className="text-[0.9rem] leading-relaxed text-ink-600">{SECTION_07.intro}</p>
          <div className="no-scrollbar mt-5 overflow-x-auto pb-1">
            <FlowChips items={SECTION_07.loop} tone="teal" />
          </div>
          <p className="mt-5 text-[0.9rem] leading-relaxed text-ink-600">
            {SECTION_07.body}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {SECTION_07.chips.map((c) => (
              <span
                key={c}
                className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[0.78rem] font-semibold text-teal-700"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="mt-5 text-[0.9rem] font-semibold leading-relaxed text-ink-800">
            {SECTION_07.closing}
          </p>
        </SectionShell>

        <SectionShell no={SECTION_08.no} title={SECTION_08.title}>
          <div className="grid gap-3 md:grid-cols-3">
            {SECTION_08.items.map((item, i) => {
              const Icon = [Target, TrendingUp, Wallet][i] ?? Target;
              return (
                <div key={item.n} className="card-data p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-[1.05rem] w-[1.05rem]" aria-hidden />
                  </span>
                  <p className="mt-3 text-[0.95rem] font-extrabold text-ink-900">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-[0.84rem] leading-relaxed text-ink-500">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-5 rounded-card bg-navy-925 px-5 py-4 text-[0.9rem] font-semibold leading-relaxed text-white">
            {SECTION_08.closing}
          </p>
        </SectionShell>

        <SectionShell no={SECTION_09.no} title={SECTION_09.title}>
          <p className="text-[0.9rem] leading-relaxed text-ink-600">{SECTION_09.intro}</p>
          <ul className="mt-4 space-y-2.5">
            {SECTION_09.points.map((p) => (
              <li
                key={p}
                className="flex gap-2.5 text-[0.88rem] leading-relaxed text-ink-700"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <div className="card-insight mt-5 p-5">
            <p className="t-eyebrow !text-teal-700">{SECTION_09.principleTitle}</p>
            <p className="mt-2 text-[1rem] font-extrabold text-ink-900">
              {SECTION_09.principle}
            </p>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-600">
              {SECTION_09.principleBody}
            </p>
          </div>
        </SectionShell>

        <SectionShell no={SECTION_10.no} title={SECTION_10.title}>
          <div className="space-y-3">
            {SECTION_10.paragraphs.map((p, i) => (
              <p key={i} className="text-[0.9rem] leading-relaxed text-ink-600">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-4 rounded-card border-l-[3px] border-brand-500 bg-brand-50 px-4 py-3.5 text-[0.9rem] font-semibold leading-relaxed text-ink-800">
            {SECTION_10.emphasis}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {SECTION_10.matrix.map((m) => (
              <div key={m.title} className="card p-4">
                <p className="text-[0.86rem] font-bold text-ink-900">{m.title}</p>
                <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-500">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 flex gap-2.5 rounded-card border border-warning/20 bg-warning-soft px-4 py-3.5 text-[0.84rem] leading-relaxed text-warning">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {SECTION_10.caution}
          </p>
          <Link href="/analytics" className="btn btn-ghost mt-4">
            경영분석 화면 보기
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </SectionShell>

        <SectionShell no={SECTION_11.no} title={SECTION_11.title}>
          <p className="text-[0.9rem] leading-relaxed text-ink-600">{SECTION_11.intro}</p>
          <ol className="mt-5 space-y-3">
            {SECTION_11.stages.map((s) => (
              <li
                key={s.tag}
                className={clsx(
                  "card flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:gap-5",
                  s.done && "border-teal-200 bg-teal-50/40"
                )}
              >
                <span className="flex shrink-0 items-center gap-2 sm:w-56">
                  {s.done ? (
                    <Check className="h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                  ) : (
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300"
                    />
                  )}
                  <span className="text-[0.88rem] font-bold text-ink-900">{s.tag}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={clsx(
                      "inline-block rounded-md px-2 py-0.5 text-[0.7rem] font-bold",
                      s.done ? "bg-teal-500 text-white" : "bg-surface-sunken text-ink-500"
                    )}
                  >
                    {s.status}
                  </span>
                  <span className="mt-2 block text-[0.85rem] leading-relaxed text-ink-600">
                    {s.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-[0.9rem] font-semibold leading-relaxed text-ink-800">
            {SECTION_11.closing}
          </p>
        </SectionShell>

        {/* 이 프로그램에서 시작되는 것들 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-[1.15rem] font-extrabold tracking-[-0.015em] text-ink-900 lg:text-[1.4rem]">
            {OUTCOMES.title}
          </h2>
          <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-500">
            {OUTCOMES.intro}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {OUTCOMES.items.map((o) => (
              <div key={o.n} className="card-data p-5">
                <span className="text-[0.76rem] font-extrabold tabular-nums tracking-[0.06em] text-teal-600">
                  {o.n}
                </span>
                <p className="mt-1.5 text-[0.95rem] font-bold text-ink-900">{o.title}</p>
                <p className="mt-2 text-[0.84rem] leading-relaxed text-ink-500">
                  {o.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-card bg-surface-sunken px-5 py-4 text-[0.88rem] leading-relaxed text-ink-600">
            {OUTCOMES.closing}
          </p>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-card-lg bg-navy-925 px-6 py-8 text-center lg:px-10 lg:py-10"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl"
          />
          <div className="relative">
            <p className="text-[1.02rem] font-bold text-white lg:text-[1.15rem]">
              지금 보고 계신 화면이 그 기록의 시작입니다.
            </p>
            <p className="mx-auto mt-2 max-w-xl text-[0.86rem] leading-relaxed text-navy-200">
              실제 업무에서 써 보시고 필요한 부분을 알려 주시면, 그 피드백이 다음 버전의
              설계도가 됩니다.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link href="/dashboard" className="btn btn-primary">
                대시보드로 이동
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/insights"
                className="btn border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.12]"
              >
                AX 추천 보기
              </Link>
            </div>
            <p className="mt-7 text-[0.72rem] text-navy-300">
              {COMPANY.productName} · {COMPANY.credit}
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
