import { useState } from "react";
import { KeyRound, Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react";

const inputCls = "w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none ring-primary transition focus:ring-2";

// onSubmit(current, next) => Promise
export default function ChangePasswordCard({ onSubmit }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null); setOk(null);
    if (next.length < 6) { setErr("A nova senha deve ter ao menos 6 caracteres."); return; }
    if (next !== conf) { setErr("As senhas não conferem."); return; }
    setBusy(true);
    try {
      await onSubmit(cur, next);
      setOk("Senha alterada com sucesso!");
      setCur(""); setNext(""); setConf("");
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h3 className="heading-font text-base font-bold">Trocar minha senha</h3>
      <div className="mt-5 space-y-4">
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Senha atual" className={inputCls} required />
        </div>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Nova senha (mín. 6 caracteres)" className={inputCls} required />
        </div>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="password" value={conf} onChange={(e) => setConf(e.target.value)} placeholder="Confirmar nova senha" className={inputCls} required />
        </div>
      </div>
      {err && <p className="mt-4 flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> {err}</p>}
      {ok && <p className="mt-4 flex items-center gap-2 text-sm text-secondary"><CheckCircle2 className="h-4 w-4" /> {ok}</p>}
      <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Alterar senha
      </button>
    </form>
  );
}