import { BookOpen, GraduationCap } from "lucide-react";
import { changeTeacherPassword } from "@/lib/portalAuth";
import MenuCard from "./MenuCard";
import NoticesCard from "./NoticesCard";
import ChangePasswordCard from "./ChangePasswordCard";
import EventsCard from "./EventsCard";
import UrgentAlertBanner from "./UrgentAlertBanner";
import TurmaStudentsTable from "./TurmaStudentsTable";
import LessonManager from "./LessonManager";
import PortalHeader from "./PortalHeader";
import DeleteAccountCard from "./DeleteAccountCard";
import PortalSectionTitle from "./PortalSectionTitle";

export default function ProfessorDashboard({ session, onLogout }) {
  const disciplines = session.disciplines ? session.disciplines.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const turmas = session.turmas ? session.turmas.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const chips = [
    ...disciplines.map((d) => (
      <span key={`d-${d}`} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><BookOpen className="h-3 w-3" /> {d}</span>
    )),
    ...turmas.map((t) => (
      <span key={`t-${t}`} className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"><GraduationCap className="h-3 w-3" /> {t}</span>
    )),
  ];

  return (
    <div className="space-y-6">
      <UrgentAlertBanner audience="Professores" />
      <PortalHeader
        name={session.name}
        meta={session.email}
        role="Painel do Professor"
        avatarClass="bg-primary text-primary-foreground"
        chips={chips}
        onLogout={onLogout}
      />

      <PortalSectionTitle>Minhas turmas</PortalSectionTitle>

      <TurmaStudentsTable turmas={turmas} teacherId={session.id} />

      <PortalSectionTitle>Aulas e materiais</PortalSectionTitle>

      <LessonManager turmas={turmas} disciplines={disciplines} author={session.name} teacherId={session.id} />

      <PortalSectionTitle>Comunicações da escola</PortalSectionTitle>

      <EventsCard subtitle="Compromissos e datas do calendário escolar" />

      <NoticesCard title="Avisos e comunicados" subtitle="Todos os avisos ativos da escola" turmas={null} />

      <MenuCard />

      <PortalSectionTitle>Conta e segurança</PortalSectionTitle>

      <ChangePasswordCard onSubmit={(cur, next) => changeTeacherPassword(session.id, cur, next)} />
      <DeleteAccountCard session={session} onLogout={onLogout} />
    </div>
  );
}