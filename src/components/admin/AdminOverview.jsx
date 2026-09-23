import { useEffect, useState } from "react";
import { Newspaper, CalendarDays, Users, Megaphone } from "lucide-react";
import { adminList } from "@/lib/adminApi";
import AdminStatsGrid from "./AdminStatsGrid";
import AdminQuickActions from "./AdminQuickActions";

const stats = [
  { key: "news", icon: Newspaper, label: "Notícias", tone: "text-primary bg-primary/10" },
  { key: "events", icon: CalendarDays, label: "Eventos", tone: "text-secondary bg-secondary/10" },
  { key: "students", icon: Users, label: "Alunos", tone: "text-amber-600 bg-amber-500/10" },
  { key: "notices", icon: Megaphone, label: "Avisos ativos", tone: "text-primary bg-primary/10" },
];

const actions = [
  { key: "news", icon: Newspaper, label: "Nova notícia", description: "Publique um conteúdo no portal", tone: "text-primary bg-primary/10" },
  { key: "notices", icon: Megaphone, label: "Criar aviso", description: "Envie um comunicado escolar", tone: "text-secondary bg-secondary/10" },
  { key: "events", icon: CalendarDays, label: "Adicionar evento", description: "Atualize o calendário escolar", tone: "text-amber-600 bg-amber-500/10" },
];

export default function AdminOverview({ onNavigate }) {
  const [counts, setCounts] = useState({ news: 0, events: 0, students: 0, notices: 0 });

  useEffect(() => {
    Promise.all([
      adminList("News").then((items) => items.length), adminList("CalendarEvent").then((items) => items.length),
      adminList("Student").then((items) => items.length), adminList("Notice", { filter: { is_active: true } }).then((items) => items.length),
    ]).then(([news, events, students, notices]) => setCounts({ news, events, students, notices }));
  }, []);

  return <div className="space-y-6"><div><h2 className="heading-font text-2xl font-bold">Painel central</h2><p className="text-sm text-muted-foreground">Acompanhe o portal e acesse as tarefas mais comuns.</p></div><AdminStatsGrid stats={stats} counts={counts} /><div><h3 className="heading-font text-lg font-bold">Ações rápidas</h3><p className="mt-1 text-sm text-muted-foreground">Selecione uma ação para abrir a área correspondente.</p></div><AdminQuickActions actions={actions} onNavigate={onNavigate} /></div>;
}