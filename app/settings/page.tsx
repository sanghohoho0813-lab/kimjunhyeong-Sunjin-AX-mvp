"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Building2,
  Database,
  MonitorSmartphone,
  Play,
  RotateCcw,
  Type,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ViewModeSetting } from "@/components/layout/ViewModeToggle";
import { COMPANY } from "@/lib/data/seed";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAppStore, type FontScale } from "@/lib/store";
import { clsx } from "@/lib/utils/clsx";

const FONT_OPTIONS: Array<{ value: FontScale; label: string }> = [
  { value: "sm", label: "작게" },
  { value: "base", label: "기본" },
  { value: "lg", label: "크게" },
];

export default function SettingsPage() {
  const fontScale = useAppStore((s) => s.fontScale);
  const setFontScale = useAppStore((s) => s.setFontScale);
  const setTourOpen = useAppStore((s) => s.setTourOpen);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const pushToast = useAppStore((s) => s.pushToast);
  const [confirmReset, setConfirmReset] = useState(false);
  const supabaseMode = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="설정"
        subtitle="화면 설정과 시연 도구, 시스템 정보를 관리합니다."
      />

      <div className="space-y-4">
        {/* 사용자 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card p-5"
        >
          <h2 className="flex items-center gap-2 text-[0.95rem] font-bold text-navy-900">
            <UserRound className="h-4 w-4 text-brand-600" aria-hidden />
            사용자
          </h2>
          <div className="mt-3 flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-lg font-bold text-white">
              손
            </span>
            <div>
              <p className="text-[1.02rem] font-extrabold text-navy-900">
                {COMPANY.ceoTitle}
              </p>
              <p className="text-[0.75rem] text-navy-400">{COMPANY.credit}</p>
            </div>
          </div>
        </motion.section>

        {/* 회사 정보 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.04 }}
          className="card p-5"
        >
          <h2 className="flex items-center gap-2 text-[0.95rem] font-bold text-navy-900">
            <Building2 className="h-4 w-4 text-brand-600" aria-hidden />
            기업 정보
          </h2>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-[0.85rem] sm:grid-cols-2">
            {[
              { label: "회사명", value: COMPANY.name },
              { label: "대표자", value: COMPANY.ceo },
              { label: "업종", value: COMPANY.bizType },
              { label: "지역", value: COMPANY.region },
              { label: "사업 시작", value: COMPANY.since },
              { label: "근로자", value: COMPANY.employees },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <dt className="w-16 shrink-0 text-navy-400">{row.label}</dt>
                <dd className="min-w-0 font-semibold text-navy-800">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.section>

        {/* 화면 설정 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="card p-5"
        >
          <h2 className="flex items-center gap-2 text-[0.95rem] font-bold text-navy-900">
            <Type className="h-4 w-4 text-brand-600" aria-hidden />
            글자 크기
          </h2>
          <p className="mt-1 text-[0.75rem] text-navy-400">
            전체 화면의 글자 크기가 함께 조정됩니다.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {FONT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFontScale(option.value);
                  pushToast(`글자 크기가 '${option.label}'로 변경되었습니다.`);
                }}
                aria-pressed={fontScale === option.value}
                className={clsx(
                  "h-12 rounded-btn border text-sm font-bold transition-colors",
                  fontScale === option.value
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-surface-line bg-white text-navy-600 hover:border-navy-300"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* 화면 모드 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="card p-5"
        >
          <h2 className="flex items-center gap-2 text-[0.95rem] font-bold text-navy-900">
            <MonitorSmartphone className="h-4 w-4 text-brand-600" aria-hidden />
            화면 모드
          </h2>
          <p className="mt-1 text-[0.75rem] text-navy-400">
            휴대폰에서도 PC와 동일한 화면으로 볼 수 있습니다. 설정은 다음 접속
            시에도 유지됩니다.
          </p>
          <div className="mt-3">
            <ViewModeSetting />
          </div>
        </motion.section>

        {/* 시연 도구 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
          className="card p-5"
        >
          <h2 className="flex items-center gap-2 text-[0.95rem] font-bold text-navy-900">
            <Play className="h-4 w-4 text-brand-600" aria-hidden />
            시연 도구
          </h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => setTourOpen(true)}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-btn border border-surface-line bg-white text-sm font-bold text-navy-700 transition-colors hover:border-navy-300"
            >
              AX 둘러보기 다시 보기
            </button>
            {confirmReset ? (
              <div className="flex flex-1 gap-2">
                <button
                  onClick={() => {
                    resetDemo();
                    setConfirmReset(false);
                    pushToast("데모 데이터가 초기 상태로 복원되었습니다.");
                  }}
                  className="h-11 flex-1 rounded-btn bg-rose-500 text-sm font-bold text-white transition-colors hover:bg-rose-600"
                >
                  초기화 확인
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="h-11 flex-1 rounded-btn border border-surface-line bg-white text-sm font-semibold text-navy-500"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-btn border border-surface-line bg-white text-sm font-bold text-navy-700 transition-colors hover:border-rose-200 hover:text-rose-600"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                데모 데이터 초기화
              </button>
            )}
          </div>
          <p className="mt-2 text-[0.7rem] text-navy-400">
            초기화 시 시연 중 생성한 견적·영업 활동·설정이 초기 상태로
            돌아갑니다.
          </p>
        </motion.section>

        {/* 시스템 정보 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.16 }}
          className="card p-5"
        >
          <h2 className="flex items-center gap-2 text-[0.95rem] font-bold text-navy-900">
            <Database className="h-4 w-4 text-brand-600" aria-hidden />
            시스템 정보
          </h2>
          <dl className="mt-3 space-y-2 text-[0.85rem]">
            <div className="flex items-center gap-3">
              <dt className="w-24 shrink-0 text-navy-400">제품</dt>
              <dd className="font-semibold text-navy-800">
                {COMPANY.productName} v0.1 (MVP)
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="w-24 shrink-0 text-navy-400">데이터 모드</dt>
              <dd className="font-semibold text-navy-800">
                {supabaseMode ? "Supabase Mode" : "Demo Mode (로컬 시연 데이터)"}
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="w-24 shrink-0 text-navy-400">기획·구축</dt>
              <dd className="font-semibold text-navy-800">{COMPANY.credit}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-center rounded-xl border border-surface-line bg-white px-4 py-3">
            <Image
              src="/brand/mirae-ai-lab.jpg"
              alt="미래에이아이랩 로고"
              width={414}
              height={125}
              className="h-9 w-auto"
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
