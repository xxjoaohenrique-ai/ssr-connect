import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { KeyRound, Loader2, AlertCircle, Lock, Mail } from "lucide-react";
import PageHero from "@/components/PageHero";
import { getAdmin, loginAdminAccount } from "@/lib/adminAuth";

const inputCls = "w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none ring-primary transition focus:ring-2";

// Login do Painel Administrativo — e-mail e senha da conta de administrador,
// igual ao Portal Escolar (sem conta Google).
export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await loginAdminAccount(email, password);
      navigate("/admin", { replace: true });
    } catch (e2) {
      setErr(e2.message);
    }
    setBusy(false);
  };

  // Já com sessão ativa, vai direto ao painel (o AdminGuard valida no servidor).
  if (getAdmin()) return <Navigate to="/admin" replace />;

  return (
    <div>
      <PageHero
        eyebrow="Painel Administrativo"
        title="Acesso restrito"
        description="Entre com o e-mail e a senha da conta de administrador."
      />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="mb-2 space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail do administrador"
                className={inputCls}
                type="email"
                required
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className={inputCls}
                required
              />
            </div>
          </div>
          {err && (
            <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> {err}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Entrar no painel
          </button>
        </motion.form>
      </section>
    </div>
  );
}