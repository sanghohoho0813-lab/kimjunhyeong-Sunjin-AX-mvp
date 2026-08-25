"use client";

import { ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAccount, useAppStore } from "@/lib/store";

/**
 * 내부 AX 접근 제어.
 *
 * 고객용 버튼을 CSS로 숨기는 것만으로 끝내지 않는다. 고객 역할로 내부 경로에
 * 직접 들어오면 화면 자체를 내주지 않고 고객 포털로 안내한다.
 * (시연 수준의 역할 분기이며 실제 인증을 대체하지는 않는다.)
 */
export function InternalRouteGuard({ children }: { children: ReactNode }) {
  const account = useAccount();
  const pathname = usePathname();
  const setInternalReturnPath = useAppStore((s) => s.setInternalReturnPath);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  // 고객 Front에서 "관리자 AX"로 돌아올 때 마지막 내부 화면으로 복귀시킨다.
  useEffect(() => {
    if (pathname) setInternalReturnPath(pathname);
  }, [pathname, setInternalReturnPath]);

  const allowed = account.role === "admin" || account.role === "staff";

  // 하이드레이션 전에는 판단하지 않는다. 저장된 역할이 아직 복원되지 않은
  // 상태에서 차단 화면이 번쩍이는 것을 막는다.
  if (!hydrated || allowed) return <>{children}</>;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-5">
      <div className="card-data w-full max-w-md p-7 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-[1.3rem] font-extrabold tracking-[-0.02em] text-ink-900">
          접근 권한이 없습니다
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">
          이 화면은 선진산업 내부 운영 시스템입니다. 고객 계정으로는 열 수
          없습니다.
        </p>
        <Link
          href="/portal"
          className="mt-6 inline-flex min-h-[2.9rem] w-full items-center justify-center gap-1.5 rounded-btn bg-brand-600 px-5 text-[0.95rem] font-bold text-white transition-colors hover:bg-brand-700"
        >
          고객 포털로 이동
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/"
          className="mt-3 inline-flex min-h-[2.6rem] w-full items-center justify-center text-[0.92rem] font-bold text-ink-500 transition-colors hover:text-ink-700"
        >
          제품 둘러보기
        </Link>
      </div>
    </main>
  );
}
