import { useEffect, useState } from "react";
import { Newspaper, CalendarDays, Users, Megaphone, Images, UtensilsCrossed, ShieldCheck, ArrowUpRight, BookOpen, GraduationCap, Phone, MessageSquare, Radio, Sparkles } from "lucide-react";
import { adminList } from "@/lib/adminApi";

const stats = [
  { key: "news", icon: Newspaper, label: "Notícias", tone: "blue" },
  { key: "events", icon: CalendarDays, label: "Eventos", tone: "violet" },
  { key: "students", icon: Users, label: "Alunos cadastrados", tone: "amber" },
  { key: "notices", icon: Megaphone, label: "Avisos ativos", tone: "green" },
];

const actions = [
  { key: "news", icon: Newspaper, title: "Publicar notícia", detail: "Compartilhe novidades da escola", tone: "blue" },
  { key: "notices", icon: Megaphone, title: "Criar aviso", detail: "Envie um comunicado importante", tone: "green" },
  { key: "events", icon: CalendarDays, title: "Adicionar evento", detail: "Atualize o calendário escolar", tone: "amber" },
];

const areas = [
  { key: "history", icon: BookOpen, title: "História da escola", detail: "Apresentação e trajetória" },
  { key: "management_team", icon: Users, title: "Equipe gestora", detail: "Cargos e integrantes" },
  { key: "students", icon: GraduationCap, title: "Alunos e turmas", detail: "Cadastros e organização" },
  { key: "teachers", icon: Users, title: "Professores", detail: "Equipe e turmas atendidas" },
  { key: "gallery", icon: Images, title: "Galeria", detail: "Fotos e registros escolares" },
  { key: "menu", icon: UtensilsCrossed, title: "Cardápio", detail: "Refeições da semana" },
  { key: "contact", icon: Phone, title: "Contato", detail: "Informações para a comunidade" },
  { key: "testimonials", icon: MessageSquare, title: "Depoimentos", detail: "Mensagens da comunidade" },
  { key: "ticker", icon: Radio, title: "Faixa de avisos", detail: "Destaque no topo do site" },
  { key: "access", icon: ShieldCheck, title: "Acessos administrativos", detail: "Contas da equipe gestora" },
];

export default function AdminOverview({ onNavigate }) {
  const [counts, setCounts] = useState({ news: 0, events: 0, students: 0, notices: 0 });
  const [updated, setUpdated] = useState(false);
  const today = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date());

  useEffect(() => {
    let mounted = true;
    Promise.all([
      adminList("News").then((items) => items.length),
      adminList("CalendarEvent").then((items) => items.length),
      adminList("Student").then((items) => items.length),
      adminList("Notice", { filter: { is_active: true } }).then((items) => items.length),
    ]).then(([news, events, students, notices]) => {
      if (mounted) {
        setCounts({ news, events, students, notices });
        setUpdated(true);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <main className="ssr-new-admin">
      <section className="ssr-admin-hero">
        <div className="ssr-admin-hero-copy">
          <span className="ssr-admin-eyebrow"><Sparkles size={14} /> CENTRAL DE GESTÃO</span>
          <h1>Bom dia, equipe!</h1>
          <p>Gerencie o portal do CETI Sebastião Soares Ribeiro em um só lugar.</p>
          <div className="ssr-admin-hero-date"><CalendarDays size={16} /><span>{today}</span></div>
        </div>
        <div className="ssr-admin-hero-mark" aria-hidden="true"><GraduationCap size={82} strokeWidth={1.25} /></div>
      </section>

      <section className="ssr-admin-new-section" aria-labelledby="admin-summary-title">
        <div className="ssr-admin-new-heading">
          <div><span className="ssr-admin-eyebrow">ACOMPANHAMENTO</span><h2 id="admin-summary-title">Resumo do portal</h2></div>
          <span className="ssr-admin-sync">{updated ? "Dados atualizados" : "Carregando dados…"}</span>
        </div>
        <div className="ssr-admin-new-stats">
          {stats.map((stat) => (
            <button key={stat.key} type="button" onClick={() => onNavigate(stat.key)} className="ssr-admin-new-stat">
              <span className={`ssr-admin-new-icon tone-${stat.tone}`}><stat.icon size={21} /></span>
              <span className="ssr-admin-new-stat-copy"><small>{stat.label}</small><strong>{counts[stat.key]}</strong></span>
              <ArrowUpRight className="ssr-admin-new-arrow" size={17} />
            </button>
          ))}
        </div>
      </section>

      <section className="ssr-admin-new-section">
        <div className="ssr-admin-new-heading">
          <div><span className="ssr-admin-eyebrow">ATALHOS</span><h2>O que você quer fazer?</h2></div>
        </div>
        <div className="ssr-admin-new-actions">
          {actions.map((action) => (
            <button key={action.key} type="button" onClick={() => onNavigate(action.key)} className="ssr-admin-new-action">
              <span className={`ssr-admin-new-icon tone-${action.tone}`}><action.icon size={21} /></span>
              <span><strong>{action.title}</strong><small>{action.detail}</small></span>
              <ArrowUpRight size={18} className="ssr-admin-new-arrow" />
            </button>
          ))}
        </div>
      </section>

      <section className="ssr-admin-new-section">
        <div className="ssr-admin-new-heading">
          <div><span className="ssr-admin-eyebrow">ÁREAS DO PORTAL</span><h2>Gerenciar conteúdos e pessoas</h2></div>
        </div>
        <div className="ssr-admin-new-areas">
          {areas.map((area) => (
            <button key={area.key} type="button" onClick={() => onNavigate(area.key)} className="ssr-admin-new-area">
              <span className="ssr-admin-new-area-icon"><area.icon size={19} /></span>
              <span><strong>{area.title}</strong><small>{area.detail}</small></span>
              <ArrowUpRight size={16} className="ssr-admin-new-arrow" />
            </button>
          ))}
        </div>
      </section>
      <footer className="ssr-admin-new-footer">SSR-CONNECT <span>·</span> Painel administrativo escolar</footer>
    </main>
  );
}
