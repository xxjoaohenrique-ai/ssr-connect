import { useId } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none ring-primary transition hover:border-primary/40 focus:ring-2";

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Modal({ title, onClose, children, description, icon: Icon, className = "" }) {
  const titleId = useId();
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className={`ssr-admin-modal max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card shadow-float scrollbar-thin ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 mb-5 flex items-center justify-between rounded-t-3xl border-b border-border bg-card/95 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>}
            <div className="min-w-0"><h3 id={titleId} className="heading-font text-xl font-bold">{title}</h3>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 pb-6 sm:px-7 sm:pb-7">{children}</div>
      </motion.div>
    </div>
  );
}
