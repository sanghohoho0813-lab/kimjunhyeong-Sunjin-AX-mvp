"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clsx } from "@/lib/utils/clsx";
import { LeatherSwatch } from "@/components/inventory/LeatherSwatch";
import { getProduct } from "@/lib/data/derived";
import { useAccount, useAppStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils/format";
import type { LeatherProduct } from "@/types";

const EASE = [0.22, 1, 0.36, 1] as const;

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-center gap-1 text-[0.88rem] font-bold text-ink-600">
        {label}
        {required ? <span className="text-critical">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[0.82rem] text-ink-400">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "h-[2.9rem] w-full min-w-0 rounded-btn border border-ivory-line bg-white px-3.5 text-[0.95rem] text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-leather-400 focus:ring-2 focus:ring-leather-100";

function ProductRow({
  product,
  right,
}: {
  product: LeatherProduct;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-ivory-line bg-white p-3">
      <LeatherSwatch
        color={product.color}
        finish={product.finish}
        className="h-12 w-12"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.8rem] font-bold uppercase tracking-[0.08em] text-leather-500">
          {product.code}
        </p>
        <p className="truncate text-[0.94rem] font-bold text-ink-900">
          {product.material} · {product.color}
        </p>
        <p className="truncate text-[0.86rem] text-ink-500">
          {product.thicknessMm}mm · {product.grade} Grade · 재고{" "}
          {formatNumber(product.stockQty)}평
        </p>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/**
 * 샘플 / 견적 요청 다이얼로그.
 *
 * 제출하면 store에 쌓이고, 같은 데이터를 내부 AX의 요청 인박스가 읽는다.
 * 고객에게 확정 가격을 자동으로 주지 않는다 — 단가는 내부에서 판단한다.
 */
export function RequestDialog({
  open,
  onClose,
  kind,
  productIds,
}: {
  open: boolean;
  onClose: () => void;
  kind: "sample" | "quote";
  productIds: string[];
}) {
  const account = useAccount();
  const customerId = account.customerId ?? "c01";
  const addSample = useAppStore((s) => s.addSampleRequest);
  const addQuote = useAppStore((s) => s.addQuoteRequest);
  const pushToast = useAppStore((s) => s.pushToast);

  const products = productIds
    .map((id) => getProduct(id))
    .filter((p): p is LeatherProduct => Boolean(p));

  const [qty, setQty] = useState<Record<string, number>>({});
  const [contact, setContact] = useState(account.name);
  const [due, setDue] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState<{ number: string } | null>(null);

  // productIds는 부모에서 매 렌더 새 배열로 만들어진다. 배열 자체를 의존성에 두면
  // 제출 직후 store 갱신 → 부모 리렌더 → 이 effect 재실행 → 완료 화면이 즉시
  // 초기화된다. 내용이 바뀔 때만 반응하도록 문자열 키로 비교한다.
  const productKey = productIds.join(",");
  useEffect(() => {
    if (!open) return;
    setDone(null);
    setContact(account.name);
    setNote("");
    setDue("");
    setQty(
      Object.fromEntries(
        productKey
          .split(",")
          .filter(Boolean)
          .map((id) => [id, kind === "quote" ? 100 : 1])
      )
    );
  }, [open, productKey, kind, account.name]);

  // 열려 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submit = () => {
    if (!products.length) return;
    if (kind === "sample") {
      const req = addSample({
        customerId,
        productIds: products.map((p) => p.id),
        qty: products.length,
        contactName: contact.trim() || account.name,
        note: note.trim() || undefined,
      });
      setDone({ number: req.number });
      pushToast("샘플 요청이 접수되었습니다");
    } else {
      const req = addQuote({
        customerId,
        items: products.map((p) => ({ productId: p.id, qty: qty[p.id] ?? 100 })),
        dueDate: due || undefined,
        note: note.trim() || undefined,
      });
      setDone({ number: req.number });
      pushToast("견적 요청이 접수되었습니다");
    }
  };

  const title = kind === "sample" ? "샘플 요청" : "견적 요청";

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-navy-950/55"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[90dvh] overflow-y-auto rounded-t-[20px] bg-ivory p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg sm:rounded-card-lg sm:p-6"
          >
            {done ? (
              /* ── 완료 ── */
              <div className="py-4 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={2} aria-hidden />
                </span>
                <h2 className="mt-4 text-[1.3rem] font-extrabold tracking-[-0.02em] text-ink-900">
                  {title}이 접수되었습니다
                </h2>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">
                  요청번호{" "}
                  <span className="font-bold text-ink-800">{done.number}</span>
                  <br />
                  담당자가 확인 후 연락드립니다.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/portal?tab=requests"
                    className="flex min-h-[2.9rem] flex-1 items-center justify-center rounded-btn bg-navy-900 px-5 text-[0.95rem] font-bold text-white transition-colors hover:bg-navy-800"
                  >
                    요청 내역 보기
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex min-h-[2.9rem] flex-1 items-center justify-center rounded-btn border border-ivory-line bg-white px-5 text-[0.95rem] font-bold text-ink-700"
                  >
                    계속 둘러보기
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[1.25rem] font-extrabold tracking-[-0.02em] text-ink-900">
                      {title}
                    </h2>
                    <p className="mt-1 text-[0.9rem] text-ink-500">
                      {kind === "sample"
                        ? "선택하신 제품의 샘플을 보내드립니다."
                        : "수량과 납기를 알려주시면 맞춤 견적을 드립니다."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="닫기"
                    className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-btn text-ink-400 transition-colors hover:bg-ivory-deep"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {products.map((p) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      right={
                        kind === "quote" ? (
                          <span className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              value={qty[p.id] ?? 100}
                              onChange={(e) =>
                                setQty((prev) => ({
                                  ...prev,
                                  [p.id]: Math.max(1, Number(e.target.value) || 1),
                                }))
                              }
                              aria-label={`${p.code} 수량`}
                              className="h-[2.6rem] w-[5.5rem] rounded-btn border border-ivory-line bg-white px-2.5 text-right text-[0.92rem] font-bold tabular-nums text-ink-900 outline-none focus:border-leather-400"
                            />
                            <span className="text-[0.86rem] font-semibold text-ink-500">
                              평
                            </span>
                          </span>
                        ) : null
                      }
                    />
                  ))}
                </div>

                <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                  <Field label="회사명">
                    <input
                      className={clsx(inputCls, "bg-ivory-deep")}
                      value={account.org}
                      readOnly
                    />
                  </Field>
                  <Field label="담당자" required>
                    <input
                      className={inputCls}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="담당자명"
                    />
                  </Field>
                  {kind === "quote" ? (
                    <Field label="희망 납기" hint="비워두시면 협의 후 안내드립니다">
                      <input
                        type="date"
                        className={inputCls}
                        value={due}
                        onChange={(e) => setDue(e.target.value)}
                      />
                    </Field>
                  ) : null}
                </div>

                <div className="mt-3.5">
                  <Field label="요청사항">
                    <textarea
                      rows={3}
                      className="w-full min-w-0 resize-none rounded-btn border border-ivory-line bg-white px-3.5 py-2.5 text-[0.95rem] leading-relaxed text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-leather-400 focus:ring-2 focus:ring-leather-100"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        kind === "sample"
                          ? "예) 가방 본체용으로 검토 중입니다. 유사 색상도 함께 보내주세요."
                          : "예) 월 정기 발주 예정입니다. 수량 구간별 단가를 알려주세요."
                      }
                    />
                  </Field>
                </div>

                <p className="mt-3 text-[0.84rem] leading-relaxed text-ink-400">
                  {kind === "quote"
                    ? "견적 단가는 담당자 확인 후 회신됩니다. 화면에서 확정 가격을 안내하지 않습니다."
                    : "샘플은 재고 상황에 따라 발송 일정이 달라질 수 있습니다."}
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!products.length || !contact.trim()}
                    className="flex min-h-[3rem] flex-1 items-center justify-center rounded-btn bg-leather-600 px-5 text-[1rem] font-bold text-white transition-colors hover:bg-leather-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {title}하기
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex min-h-[3rem] items-center justify-center rounded-btn border border-ivory-line bg-white px-5 text-[0.95rem] font-bold text-ink-600 sm:flex-none"
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
