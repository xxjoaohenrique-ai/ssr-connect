import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { portalApi } from "@/lib/portalApi";

// Opção de exclusão da própria conta do portal (aluno/professor/pai),
// com folha de confirmação animada (bottom-sheet no mobile, centro no desktop).
const roleLabel = (type) =>
  type === "aluno" ? "aluno" : type === "professor" ? "professor" : "pai/responsável";

export default function DeleteAccountCard({ session, onLogout }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const confirm = async () => {
    setBusy(true);
    setErr(null);
    try {
      await portalApi({ action: "deleteAccount" });
      setOpen(false);
      onLogout?.();
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <>
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="heading-font text-base font-bold text-destructive">Excluir minha conta</h3>
            <p className="text-xs text-muted-foreground">
              Remove permanentemente seu acesso ao portal. Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" /> Excluir conta
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && setOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.6 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 shadow-float sm:rounded-3xl"
              style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border sm:hidden" />
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground transition hover:text-foreground"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h3 className="heading-font mt-4 text-xl font-bold">
                Excluir conta de {roleLabel(session.type)}?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Você perderá o acesso ao portal escolar e seus dados de login serão apagados.
                Esta ação é <strong className="text-foreground">definitiva e não pode ser desfeita</strong>.
              </p>
              {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                  className="rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-destructive px-5 py-3 text-sm font-semibold text-destructive-foreground transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Sim, excluir minha conta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}