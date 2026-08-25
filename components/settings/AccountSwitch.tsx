"use client";

import { motion } from "framer-motion";
import { Check, Globe, LayoutDashboard, ShieldCheck, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "@/lib/utils/clsx";
import { ACCOUNTS } from "@/lib/data/customer";
import { useAccount, useAppStore } from "@/lib/store";

/**
 * 시연용 계정 전환.
 *
 * 실제 인증 대신 역할만 바꾼다. 고객 계정으로 전환하면 내부 경로가 막히고
 * 고객 화면의 "관리자 AX" 버튼도 사라지는 것을 그 자리에서 확인할 수 있다.
 * 운영 화면에서는 시연 도구 안쪽에 두어 자연스럽게 감춘다.
 */
export function AccountSwitch() {
  const account = useAccount();
  const setAccountId = useAppStore((s) => s.setAccountId);
  const pushToast = useAppStore((s) => s.pushToast);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const admins = ACCOUNTS.filter((a) => a.role !== "customer");
  const customers = ACCOUNTS.filter((a) => a.role === "customer").slice(0, 4);

  const switchTo = (id: string, isCustomer: boolean) => {
    setAccountId(id);
    if (isCustomer) {
      pushToast("고객 계정으로 전환했습니다. 고객 화면으로 이동합니다.");
      router.push("/portal");
    } else {
      pushToast("내부 계정으로 전환했습니다.");
    }
  };

  const Row = ({
    id,
    name,
    org,
    role,
  }: {
    id: string;
    name: string;
    org: string;
    role: string;
  }) => {
    const on = hydrated && account.id === id;
    const isCustomer = role === "customer";
    return (
      <button
        type="button"
        onClick={() => switchTo(id, isCustomer)}
        aria-pressed={on}
        className={clsx(
          "flex min-h-[3.2rem] w-full items-center gap-3 rounded-card border px-3.5 text-left transition-all duration-200",
          on
            ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
            : "border-surface-line bg-white hover:border-brand-200"
        )}
      >
        <span
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
            isCustomer ? "bg-gold-100 text-gold-600" : "bg-navy-50 text-navy-700"
          )}
        >
          {isCustomer ? (
            <Store className="h-[1.05rem] w-[1.05rem]" aria-hidden />
          ) : (
            <ShieldCheck className="h-[1.05rem] w-[1.05rem]" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.95rem] font-bold text-ink-900">
            {org}
          </span>
          <span className="block truncate text-[0.86rem] text-ink-500">
            {name} · {isCustomer ? "고객" : role === "admin" ? "관리자" : "직원"}
          </span>
        </span>
        {on ? (
          <Check className="h-[1.05rem] w-[1.05rem] shrink-0 text-brand-600" aria-hidden />
        ) : null}
      </button>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.14 }}
      className="card-data p-6"
      aria-label="시연 계정 전환"
    >
      <h2 className="flex items-center gap-2 text-[0.95rem] font-bold text-ink-900">
        <LayoutDashboard className="h-4 w-4 text-brand-600" aria-hidden />
        시연 계정 전환
      </h2>
      <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-500">
        고객 계정으로 전환하면 내부 화면 접근이 차단되고 고객 화면의 관리자 버튼도
        사라집니다. 시연 편의를 위한 기능입니다.
      </p>

      <div className="mt-4 space-y-2">
        <p className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-ink-400">
          내부
        </p>
        {admins.map((a) => (
          <Row key={a.id} id={a.id} name={a.name} org={a.org} role={a.role} />
        ))}

        <p className="pt-2 text-[0.82rem] font-bold uppercase tracking-[0.1em] text-ink-400">
          고객
        </p>
        {customers.map((a) => (
          <Row key={a.id} id={a.id} name={a.name} org={a.org} role={a.role} />
        ))}
      </div>

      <a
        href="/"
        className="mt-4 inline-flex min-h-[2.8rem] items-center gap-2 rounded-btn border border-surface-line bg-white px-4 text-[0.9rem] font-bold text-ink-700 transition-colors hover:border-brand-200 hover:text-brand-700"
      >
        <Globe className="h-4 w-4" aria-hidden />
        고객용 B2B Front 열기
      </a>
    </motion.section>
  );
}
