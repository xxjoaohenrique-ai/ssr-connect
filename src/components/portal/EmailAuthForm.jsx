import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, KeyRound, AlertCircle, UserPlus, Info, Eye, EyeOff, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const inputCls = "w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none ring-primary transition focus:ring-2";

// Formulário de login/cadastro por e-mail e senha (professor e pai).
// extraFields: [{ key, label, placeholder }] — só aparece no cadastro.
export default function EmailAuthForm({ title, subtitle, onLogin, onRegister, extraFields = [] }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [extra, setExtra] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null); setSuccess(null);
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        if (password.length < 8) throw new Error("A senha deve ter ao menos 8 caracteres.");
        const res = await onRegister({ name, email, password, ...extra });
        // Cadastro pendente (ex.: professor): não loga, só confirma ao usuário.
        if (res?.pending) {
          setSuccess(res.message || "Cadastro recebido. Aguarde aprovação.");
          setMode("login");
          setName(""); setEmail(""); setPassword(""); setExtra({});
        }
      }
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };

  return (
    <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="ssr-access-card mx-auto max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><KeyRound className="h-6 w-6" /></span>
        <div>
          <h2 className="heading-font text-lg font-bold">{mode === "login" ? title : `Criar conta · ${title}`}</h2>
          <p className="text-xs text-muted-foreground">{mode === "login" ? subtitle : "Preencha seus dados para se cadastrar"}</p>
        </div>
      </div>

      <div className="space-y-4">
        {mode === "register" && (
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" className={inputCls} required />
          </div>
        )}
        <label className="ssr-access-label" htmlFor="portal-email">E-mail</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input id="portal-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className={inputCls} required />
        </div>
        <label className="ssr-access-label" htmlFor="portal-password">Senha</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input id="portal-password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" className={`${inputCls} !pr-12`} required />
          <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-primary">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
        </div>
        {mode === "register" && extraFields.map((f) => (
          <div key={f.key} className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={extra[f.key] || ""} onChange={(e) => setExtra((x) => ({ ...x, [f.key]: e.target.value }))} placeholder={f.placeholder} className={inputCls} />
          </div>
        ))}
      </div>

      {err && <p className="mt-4 flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> {err}</p>}
      {success && <p className="mt-4 flex items-center gap-2 text-sm text-secondary"><Info className="h-4 w-4" /> {success}</p>}

      <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? <KeyRound className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        {mode === "login" ? "Entrar" : "Cadastrar"}
      </button>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>Não tem conta? <button type="button" onClick={() => { setMode("register"); setErr(null); }} className="font-semibold text-primary hover:underline">Cadastrar-se</button></>
        ) : (
          <>Já tem conta? <button type="button" onClick={() => { setMode("login"); setErr(null); }} className="font-semibold text-primary hover:underline">Entrar</button></>
        )}
      </p>
      {mode === "login" && <div className="ssr-access-help"><MessageCircle className="h-5 w-5" /><span>Precisa de ajuda? <Link to="/contato">Fale com a escola</Link></span></div>}
    </motion.form>
  );
}
