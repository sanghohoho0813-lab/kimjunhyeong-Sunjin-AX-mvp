"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+12px)] z-[80] flex flex-col items-center gap-2 px-4 lg:bottom-8"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full bg-navy-900 px-4 py-2.5 text-sm font-medium text-white shadow-modal"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" aria-hidden />
            <span className="truncate">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
