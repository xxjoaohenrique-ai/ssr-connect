import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Mail, Trash2, KeyRound, UserPlus } from "lucide-react";
import { adminList, adminCreate, adminUpdate, adminDelete } from "@/lib/adminApi";
import { sha256, genPassword } from "@/lib/alunoAuth";

const MAX_ADMINS = 5;

export default function AdminAccessManager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [revealed, setRevealed] = useState(null); // { label, password }
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setAccounts(await adminList("AdminAccount"));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const addAdmin = async (e) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (accounts.length >= MAX_ADMINS) {
      setErr(`Máximo de ${MAX_ADMINS} administradores.`);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const password = genPassword(10);
      const rec = await adminCreate("AdminAccount", {
        email,
        password_hash: await sha256(password),
        password_changed: false,
        is_active: true,
      });
      setAccounts((p) => [...p, rec]);
      setNewEmail("");
      setRevealed({ label: email, password });
    } catch (e2) {
      setErr(e2.message);
    }
    setBusy(false);
  };

  const resetPassword = async (acc) => {
    setBusy(true);
    setErr(null);
    try {
      const password = genPassword(10);
      await adminUpdate("AdminAccount", acc.id, {
        password_hash: await sha256(password),
        password_changed: false,
      });
      setRevealed({ label: acc.email, password });
    } catch (e2) {
      setErr(e2.message);
    }
    setBusy(false);
  };

  const removeAdmin = async (acc) => {
    if (accounts.length <= 1) {
      setErr("Mantenha pelo menos um administrador com acesso ao painel.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await adminDelete("AdminAccount", acc.id);
      setAccounts((p) => p.filter((a) => a.id !== acc.id));
    } catch (e2) {
      setErr(e2.message);
    }
    setBusy(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h2 className="heading-font text-xl font-bold">Contas de administrador</h2>
          <p className="text-sm text-muted-foreground">
            Até {MAX_ADMINS} contas com e-mail e senha entram no painel — o login não usa mais o Google.
          </p>
        </div>
      </div>

      {revealed && (
        <div className="mt-5 rounded-2xl border border-secondary/40 bg-secondary/10 p-4">
          <p className="text-sm font-semibold">Senha gerada para {revealed.label}</p>
          <p className="mt-1 break-all font-mono text-lg font-bold text-foreground">{revealed.password}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Copie agora e entregue ao administrador — ela não será exibida novamente.
          </p>
        </div>
      )}
      {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

      <div className="mt-6 space-y-2">
        {accounts.map((acc, idx) => (
          <div key={acc.id} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
              {idx + 1}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium">{acc.email}</p>
            <button
              type="button"
              onClick={() => resetPassword(acc)}
              disabled={busy}
              title="Gerar nova senha"
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => removeAdmin(acc)}
              disabled={busy}
              title="Remover administrador"
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {accounts.length < MAX_ADMINS && (
        <form onSubmit={addAdmin} className="mt-6 flex max-w-lg flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novo.admin@escola.com"
              className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none ring-primary transition focus:ring-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-105 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Adicionar
          </button>
        </form>
      )}

      <p className="mt-6 rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground">
        O acesso ao painel é feito com e-mail e senha na tela de login do painel. Ao adicionar um administrador, uma
        senha é gerada e exibida apenas uma vez — use o botão de chave para gerar uma nova senha quando precisar.
      </p>
    </div>
  );
}