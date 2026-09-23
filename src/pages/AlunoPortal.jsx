import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, KeyRound, Loader2, AlertCircle, Lock, User, Briefcase, Users } from "lucide-react";
import PageHero from "@/components/PageHero";
import { getSession, setSession, clearSession, loginTeacher, registerTeacher, loginParent, registerParent } from "@/lib/portalAuth";
import { loginAluno } from "@/lib/alunoAuth";
import AlunoDashboard from "@/components/portal/AlunoDashboard";
import ProfessorDashboard from "@/components/portal/ProfessorDashboard";
import PaiDashboard from "@/components/portal/PaiDashboard";
import EmailAuthForm from "@/components/portal/EmailAuthForm";

const inputCls = "w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none ring-primary transition focus:ring-2";

const TABS = [
  { key: "aluno", label: "Aluno", icon: GraduationCap },
  { key: "professor", label: "Professor", icon: Briefcase },
  { key: "pai", label: "Pai / Mãe", icon: Users },
];

export default function AlunoPortal() {
  const [session, setSessionState] = useState(getSession());
  const [tab, setTab] = useState("aluno");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const switchTab = (t) => { setTab(t); setErr(null); };
  const onLogout = () => { clearSession(); setSessionState(null); };

  const doAlunoLogin = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const a = await loginAluno(login, password);
      setSession({
        type: "aluno", id: a.id, name: a.name, login: a.student_login,
        turma: a.turma, course: a.course || "", mustChange: !a.password_changed, token: a.token,
      });
      setSessionState(getSession());
      setLogin(""); setPassword("");
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };

  const profLogin = async (email, pw) => {
    const t = await loginTeacher(email, pw);
    setSession({ type: "professor", id: t.id, name: t.name, email: t.email, disciplines: t.disciplines || "", turmas: t.turmas || "", token: t.token });
    setSessionState(getSession());
  };
  const profRegister = async ({ name, email, password, disciplines }) => {
    // Cadastro de professor fica pendente de aprovação: não cria sessão.
    return await registerTeacher({ name, email, password, disciplines });
  };

  const paiLogin = async (email, pw) => {
    const p = await loginParent(email, pw);
    setSession({ type: "pai", id: p.id, name: p.name, email: p.email, student_ids: p.student_ids || [], token: p.token });
    setSessionState(getSession());
  };
  const paiRegister = async ({ name, email, password }) => {
    const p = await registerParent({ name, email, password });
    setSession({ type: "pai", id: p.id, name: p.name, email: p.email, student_ids: p.student_ids || [], token: p.token });
    setSessionState(getSession());
  };

  if (session) {
    return (
      <div>
        <PageHero eyebrow="Portal Escolar" title={`Olá, ${session.name}`} description="Sua área personalizada no portal escolar." />
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          {session.type === "aluno" && <AlunoDashboard session={session} onLogout={onLogout} />}
          {session.type === "professor" && <ProfessorDashboard session={session} onLogout={onLogout} />}
          {session.type === "pai" && <PaiDashboard session={session} onLogout={onLogout} />}
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero eyebrow="Portal Escolar" title="Acesse sua conta" description="Selecione seu perfil para entrar. Alunos usam o e-mail gerado pela escola; professores e pais usam e-mail e senha." />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-6 grid max-w-md grid-cols-3 gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => switchTab(t.key)} className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-semibold transition ${tab === t.key ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-primary"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "aluno" && (
          <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={doAlunoLogin} className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-2 space-y-4">
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="E-mail (Gmail)" className={inputCls} type="email" required />
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className={inputCls} required />
              </div>
            </div>
            {err && <p className="mt-4 flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> {err}</p>}
            <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Entrar
            </button>
          </motion.form>
        )}

        {tab === "professor" && (
          <EmailAuthForm
            title="Portal do Professor"
            subtitle="Entre com seu e-mail e senha"
            onLogin={profLogin}
            onRegister={profRegister}
            extraFields={[
              { key: "disciplines", label: "Disciplinas", placeholder: "Ex.: Matemática, Física" },
            ]}
          />
        )}

        {tab === "pai" && (
          <EmailAuthForm
            title="Portal dos Pais"
            subtitle="Entre com seu e-mail e senha"
            onLogin={paiLogin}
            onRegister={paiRegister}
          />
        )}
      </section>
    </div>
  );
}