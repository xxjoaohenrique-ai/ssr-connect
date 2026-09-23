import { useEffect, useState } from "react";
import { GraduationCap, BookOpen, Info } from "lucide-react";
import { portalApi } from "@/lib/portalApi";
import { setSession } from "@/lib/portalAuth";
import { changeAlunoPassword } from "@/lib/alunoAuth";
import { subjectsForCourse } from "@/lib/courses";
import MenuCard from "./MenuCard";
import NoticesCard from "./NoticesCard";
import ChangePasswordCard from "./ChangePasswordCard";
import QuickLinks from "./QuickLinks";
import DeadlinesCard from "./DeadlinesCard";
import LessonsCard from "./LessonsCard";
import MaterialsCard from "./MaterialsCard";
import UrgentAlertBanner from "./UrgentAlertBanner";
import PortalHeader from "./PortalHeader";
import DeleteAccountCard from "./DeleteAccountCard";
import PortalSectionTitle from "./PortalSectionTitle";

export default function AlunoDashboard({ session, onLogout }) {
  const [, setTick] = useState(0);
  // Atualiza automaticamente o perfil quando o professor edita o cadastro.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { student: s } = await portalApi({ action: "studentProfile", id: session.id });
        if (!active || !s) return;
        let changed = false;
        if ((s.name || "") !== (session.name || "")) { session.name = s.name; changed = true; }
        if ((s.turma || "") !== (session.turma || "")) { session.turma = s.turma || ""; changed = true; }
        if ((s.course || "") !== (session.course || "")) { session.course = s.course || ""; changed = true; }
        if (changed) { setSession(session); setTick((t) => t + 1); }
      } catch { /* offline ou indisponível — mantém sessão atual */ }
    })();
    return () => { active = false; };
  }, [session.id]);

  const subjects = subjectsForCourse(session.course);

  const chips = [
    <span key="t" className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"><GraduationCap className="h-3 w-3" /> {session.turma || "Sem turma"}</span>,
    session.course && <span key="c" className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">{session.course}</span>,
    <span key="d" className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><BookOpen className="h-3 w-3" /> {subjects.length} disciplina(s)</span>,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <UrgentAlertBanner audience="Alunos" />
      <PortalHeader
        name={session.name}
        meta={session.login}
        role="Painel do Aluno"
        avatarClass="bg-secondary text-secondary-foreground"
        chips={chips}
        mustChange={session.mustChange}
        onLogout={onLogout}
      />

      <QuickLinks />

      <PortalSectionTitle>Recursos de estudo</PortalSectionTitle>

      <div id="materiais" className="scroll-mt-4">
        <MaterialsCard />
      </div>

      <div id="videoaulas" className="scroll-mt-4">
        <LessonsCard turma={session.turma} />
      </div>

      <PortalSectionTitle>Comunicações da escola</PortalSectionTitle>

      {/* Avisos da turma */}
      <div id="avisos" className="scroll-mt-4">
        <NoticesCard title={`Avisos da turma ${session.turma || ""}`} subtitle="Comunicados oficiais e específicos para a sua turma" turmas={[session.turma]} />
      </div>

      {/* Cardápio */}
      <div id="cardapio" className="scroll-mt-4">
        <MenuCard />
      </div>

      <PortalSectionTitle>Acadêmico</PortalSectionTitle>

      {/* Disciplinas */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></span>
          <div>
            <h3 className="heading-font text-base font-bold">Minhas disciplinas</h3>
            <p className="text-xs text-muted-foreground">{session.course || "Curso não definido"}{session.turma ? ` · ${session.turma}` : ""}</p>
          </div>
        </div>
        {subjects.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {subjects.map((s, i) => (
              <div key={i} className="rounded-2xl border border-border bg-background p-4 text-center">
                <BookOpen className="mx-auto h-5 w-5 text-secondary" />
                <p className="mt-2 text-sm font-medium leading-snug">{s}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Nenhum curso técnico vinculado à sua matrícula ainda. Procure a secretaria para confirmar seu curso.
          </div>
        )}
      </div>

      <DeadlinesCard />

      <PortalSectionTitle>Conta e segurança</PortalSectionTitle>

      <ChangePasswordCard onSubmit={(cur, next) => changeAlunoPassword(session.id, cur, next)} />
      <DeleteAccountCard session={session} onLogout={onLogout} />
    </div>
  );
}