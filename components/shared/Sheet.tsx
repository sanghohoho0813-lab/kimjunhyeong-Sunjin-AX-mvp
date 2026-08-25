"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { clsx } from "@/lib/utils/clsx";

/**
 * 반응형 시트 — 모바일에서는 Bottom Sheet, 데스크톱에서는 우측 Drawer로 표시된다.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  side = "right",
  widthClass = "sm:max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: "right" | "bottom-only";
  widthClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const desktopRight = side === "right";

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
        >
          <motion.button
            aria-label="닫기"
            className="absolute inset-0 bg-navy-950/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={clsx(
              "absolute flex flex-col bg-white shadow-drawer",
              // 모바일: 바텀시트
              "inset-x-0 bottom-0 max-h-[86dvh] rounded-t-[20px]",
              // 데스크톱: 우측 드로어
              desktopRight &&
                clsx(
                  "sm:inset-y-0 sm:bottom-auto sm:left-auto sm:right-0 sm:h-full sm:max-h-full sm:w-full sm:rounded-none",
                  widthClass
                )
            )}
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-surface-line px-5 py-4">
              <div className="min-w-0 text-base font-bold text-navy-900">
                {title}
              </div>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy-400 transition-colors hover:bg-surface hover:text-navy-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-safe">
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
