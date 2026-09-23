import { useEffect, useState } from "react";
import { Users, GraduationCap, BookOpen, UserPlus, Loader2, AlertCircle, Info } from "lucide-react";
import { portalApi } from "@/lib/portalApi";
import { subjectsForCourse } from "@/lib/courses";
import { changeParentPassword } from "@/lib/portalAuth";
import MenuCard from "./MenuCard";
import NoticesCard from "./NoticesCard";
import ChangePasswordCard from "./ChangePasswordCard";
import EventsCard from "./EventsCard";
import UrgentAlertBanner from "./UrgentAlertBanner";
import PortalHeader from "./PortalHeader";
import DeleteAccountCard from "./DeleteAccountCard";
import PortalSectionTitle from "./PortalSectionTitle";

export default function PaiDashboard({ session, onLogout }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childLogin, setChildLogin] = useState("");
  const [childPwd, setChildPwd] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkErr, setLinkErr] = useState(null);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const ids = session.student_ids || [];
      if (ids.length === 0) { setChildren([]); return; }
      const data = await portalApi({ action: "parentChildren", ids });
      setChildren(data.students);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { loadChildren(); }, []);

  const linkChild = async (e) => {
    e.preventDefault();
    setLinking(true); setLinkErr(null);
    try {
      const data = await portalApi({ action: "linkChild", parentId: session.id, studentLogin: childLogin, studentPassword: childPwd });
      session.student_ids = data.student_ids;
      setChildLogin(""); setChildPwd("");
      await loadChildren();
    } catch (e2) { setLinkErr(e2.message); }
    setLinking(false);
  };

  const turmas = children.map((c) => c.turma).filter(Boolean);

  const chips = [
    <span key="n" className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"><Users className="h-3 w-3" /> {children.length} filho(s)</span>,
    ...turmas.map((t) => (
      <span key={`t-${t}`} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><GraduationCap className="h-3 w-3" /> {t}</span>
    )),
  ];

  return (
    <div className="space-y-6">
      <UrgentAlertBanner audience="Pais" />
      <PortalHeader
        name={session.name}
        meta={session.email}
        role="Painel dos Pais"
        avatarClass="bg-secondary text-secondary-foreground"
        chips={chips}
        onLogout={onLogout}
      />

      <PortalSectionTitle>Família</PortalSectionTitle>

      {/* Vincular filho */}
      <form onSubmit={linkChild} className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserPlus className="h-5 w-5" /></span>
          <div>
            <h3 className="heading-font text-base font-bold">Vincular filho(a)</h3>
            <p className="text-xs text-muted-foreground">Informe o login escolar do aluno para ver dados e avisos</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <input value={childLogin} onChange={(e) => setChildLogin(e.target.value)} placeholder="Login do aluno (ex.: joao.silva)" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2" />
          <input type="password" value={childPwd} onChange={(e) => setChildPwd(e.target.value)} placeholder="Senha do aluno" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Para vincular, informe o login e a senha escolar do aluno (comprovação de parentesco).</p>
        <button type="submit" disabled={linking} className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60">
          {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Vincular
        </button>
        {linkErr && <p className="mt-3 flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> {linkErr}</p>}
      </form>

      {/* Filhos vinculados */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="h-5 w-5" /></span>
          <div>
            <h3 className="heading-font text-base font-bold">Filhos vinculados</h3>
            <p className="text-xs text-muted-foreground">Dados e disciplinas dos alunos vinculados</p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : children.length === 0 ? (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Nenhum filho vinculado ainda. Use o campo acima para vincular pelo login escolar do aluno.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {children.map((c) => {
              const subjects = subjectsForCourse(c.course);
              return (
                <div key={c.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-secondary">{c.turma || "Sem turma"}</span>
                    {c.course && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-600">{c.course}</span>}
                  </div>
                  <p className="mt-1 font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.student_login}</p>
                  {subjects.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {subjects.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary"><BookOpen className="h-3 w-3" /> {s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PortalSectionTitle>Comunicações da escola</PortalSectionTitle>

      <EventsCard subtitle="Datas importantes da escola" />

      <NoticesCard title="Avisos" subtitle="Comunicados gerais e das turmas dos seus filhos" turmas={turmas} />

      <MenuCard />

      <PortalSectionTitle>Conta e segurança</PortalSectionTitle>

      <ChangePasswordCard onSubmit={(cur, next) => changeParentPassword(session.id, cur, next)} />
      <DeleteAccountCard session={session} onLogout={onLogout} />
    </div>
  );
}