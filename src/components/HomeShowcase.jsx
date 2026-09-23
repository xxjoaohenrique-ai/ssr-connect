import { Link } from "react-router-dom";
import {
  ArrowRight, Bell, BookOpen, CalendarDays, Code2, GraduationCap,
  Lightbulb, Newspaper, UserRound, Users, Clock3,
} from "lucide-react";

function dateParts(value) {
  if (!value) return { day: "--", month: "" };
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return { day: "--", month: "" };
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
  };
}

function MiniPage({ title, subtitle, to, children, className = "" }) {
  return (
    <article className={"ssr-multipage-window " + className}>
      <div className="ssr-multipage-window-head">
        <Link to="/" className="ssr-multipage-mini-brand" aria-label="SSR-CONNECT — início">
          <BookOpen size={18} aria-hidden="true" />
          <span><strong>CETI</strong><small>SSR-CONNECT</small></span>
        </Link>
        <Link to={to} className="ssr-multipage-mini-head-link">Abrir página <ArrowRight size={13} aria-hidden="true" /></Link>
      </div>
      <div className="ssr-multipage-window-body">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        {children}
      </div>
      <Link className="ssr-multipage-window-cta" to={to}>
        {title} <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}

/** Vitrine de quatro páginas reais: não é um painel com dados fictícios de aluno. */
export default function HomeShowcase({ events = [], news = [], loading = false }) {
  return (
    <div className="ssr-multipage-showcase" aria-label="Explore as páginas do SSR-CONNECT">
      <div className="ssr-multipage-orbit" aria-hidden="true" />
      <div className="ssr-multipage-grid">
        <MiniPage title="Notícias" subtitle="Fique por dentro do que acontece na escola." to="/noticias" className="ssr-multipage-news">
          <div className="ssr-multipage-news-feature"><Newspaper size={27} aria-hidden="true" /><span>Informações da comunidade escolar</span></div>
          {loading ? <p className="ssr-multipage-loading" role="status">Carregando notícias...</p> : news.length ? (
            <ul className="ssr-multipage-news-list">
              {news.slice(0, 2).map((item) => <li key={item.id}><Link to="/noticias"><span className="ssr-multipage-dot" />{item.title}</Link></li>)}
            </ul>
          ) : <p className="ssr-multipage-empty">Confira as novidades na página de notícias.</p>}
        </MiniPage>

        <MiniPage title="Eventos" subtitle="Acompanhe o calendário da escola." to="/calendario" className="ssr-multipage-events">
          {loading ? <p className="ssr-multipage-loading" role="status">Carregando eventos...</p> : events.length ? (
            <ul className="ssr-multipage-event-list">
              {events.slice(0, 3).map((item) => {
                const date = dateParts(item.date);
                return <li key={item.id}><Link to="/calendario">
                  <span className="ssr-multipage-date"><strong>{date.day}</strong><small>{date.month}</small></span>
                  <span className="ssr-multipage-event-info"><strong>{item.title}</strong><small>{item.location || item.type || "Confira no calendário"}</small></span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link></li>;
              })}
            </ul>
          ) : <div className="ssr-multipage-event-empty"><CalendarDays size={25} aria-hidden="true" /><p>Nenhum evento próximo. Consulte o calendário completo.</p></div>}
        </MiniPage>

        <MiniPage title="Cursos" subtitle="Conheça as áreas de aprendizagem." to="/cursos" className="ssr-multipage-courses">
          <div className="ssr-multipage-course-grid">
            <Link to="/cursos"><BookOpen size={23} aria-hidden="true" /><span>Ensino regular</span></Link>
            <Link to="/cursos"><Code2 size={23} aria-hidden="true" /><span>Desenvolvimento de Sistemas</span></Link>
            <Link to="/cursos"><Lightbulb size={23} aria-hidden="true" /><span>Projetos</span></Link>
            <Link to="/cursos"><Users size={23} aria-hidden="true" /><span>Vida escolar</span></Link>
          </div>
        </MiniPage>

        <MiniPage title="Portal Escolar" subtitle="Um espaço exclusivo para a comunidade escolar." to="/portal-aluno" className="ssr-multipage-portal">
          <div className="ssr-multipage-portal-body">
            <div className="ssr-multipage-portal-menu">
              <span><BookOpen size={15} aria-hidden="true" /> Aulas e materiais</span>
              <span><Bell size={15} aria-hidden="true" /> Comunicados</span>
              <span><Clock3 size={15} aria-hidden="true" /> Horários</span>
            </div>
            <div className="ssr-multipage-portal-profile"><UserRound size={37} aria-hidden="true" /><strong>Seu espaço na escola</strong><small>Entre com sua conta escolar</small></div>
          </div>
        </MiniPage>
      </div>
    </div>
  );
}
