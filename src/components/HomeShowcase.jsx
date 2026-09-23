import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, Bell, BookOpen, CalendarDays, GraduationCap,
  Home, School, UserRound,
} from "lucide-react";

const shortcuts = [
  { to: "/biblioteca", label: "Meus cursos", icon: BookOpen, accent: "green" },
  { to: "/noticias", label: "Comunicados", icon: Bell, accent: "blue" },
  { to: "/calendario", label: "Calendário", icon: CalendarDays, accent: "violet" },
  { to: "/portal-aluno", label: "Resultados", icon: BarChart3, accent: "gold" },
];

const panelNav = [
  { to: "/", label: "Início", icon: Home },
  { to: "/cursos", label: "Cursos", icon: BookOpen },
  { to: "/noticias", label: "Comunicados", icon: Bell },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
  { to: "/portal-aluno", label: "Resultados", icon: BarChart3 },
];

function eventDate(date) {
  if (!date) return { day: "—", month: "" };
  const parsed = new Date(date + "T00:00:00");
  if (Number.isNaN(parsed.getTime())) return { day: "—", month: "" };
  return {
    day: String(parsed.getDate()).padStart(2, "0"),
    month: parsed.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
  };
}

function SchoolArtwork() {
  return (
    <svg className="ssr-showcase-school" viewBox="0 0 440 305" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ssrSchoolStroke" x1="20" y1="55" x2="370" y2="305" gradientUnits="userSpaceOnUse">
          <stop stopColor="#91ECFE" /><stop offset="1" stopColor="#2DD4BF" />
        </linearGradient>
        <linearGradient id="ssrSchoolFill" x1="50" y1="60" x2="400" y2="310" gradientUnits="userSpaceOnUse">
          <stop stopColor="#167AB5" stopOpacity=".57" /><stop offset="1" stopColor="#0A324B" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <circle cx="270" cy="130" r="123" fill="#11C6E9" opacity=".07" />
      <path d="M55 275V136L183 76 311 136v139" fill="url(#ssrSchoolFill)" stroke="url(#ssrSchoolStroke)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M91 122V85L183 44 276 85v36" stroke="url(#ssrSchoolStroke)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M181 275v-84h45v84M80 181h34v34H80zm62 0h34v34h-34zm105 0h34v34h-34z" stroke="#80E4F8" strokeWidth="3" />
      <path d="M314 275V170l61-33 44 24v114M338 205h25v27h-25z" fill="url(#ssrSchoolFill)" stroke="url(#ssrSchoolStroke)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 276h411" stroke="#4FE4E4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Homepage illustration built from real links and live calendar data.
 * This is a navigation preview, not an authenticated user's dashboard.
 */
export default function HomeShowcase({ events, loading }) {
  return (
    <div className="ssr-showcase" aria-label="Prévia dos recursos do portal">
      <div className="ssr-showcase-orbit" aria-hidden="true" />
      <SchoolArtwork />
      <div className="ssr-showcase-glass" aria-hidden="true" />
      <div className="ssr-showcase-window">
        <aside className="ssr-showcase-sidebar" aria-label="Atalhos da prévia">
          <Link to="/" className="ssr-showcase-brand">
            <span className="ssr-showcase-brand-icon"><GraduationCap size={18} /></span>
            <span>SSR<span>CONNECT</span></span>
          </Link>
          <nav className="ssr-showcase-navigation">
            {panelNav.map(({ to, label, icon: Icon }, i) => (
              <Link className={i === 0 ? "ssr-showcase-nav-item is-current" : "ssr-showcase-nav-item"} key={label} to={to}>
                <Icon size={18} aria-hidden="true" /> <span>{label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <div className="ssr-showcase-content">
          <div className="ssr-showcase-heading">
            <div>
              <span className="ssr-showcase-eyebrow">SEU ESPAÇO ESCOLAR</span>
              <h2>Bem-vindo(a)!</h2>
              <p>Aprendizagem, conexão e novas oportunidades.</p>
            </div>
            <Link className="ssr-showcase-profile" to="/portal-aluno" aria-label="Abrir Portal Escolar"><UserRound size={19} /></Link>
          </div>
          <div className="ssr-showcase-shortcuts">
            {shortcuts.map(({ to, label, icon: Icon, accent }) => (
              <Link className={`ssr-showcase-shortcut ssr-showcase-shortcut--${accent}`} key={label} to={to}>
                <Icon size={25} aria-hidden="true" /><span>{label}</span>
              </Link>
            ))}
          </div>
          <div className="ssr-showcase-events">
            <div className="ssr-showcase-events-heading">
              <h3><CalendarDays size={17} aria-hidden="true" /> Próximos eventos</h3>
              <Link to="/calendario">Ver todos <ArrowRight size={15} /></Link>
            </div>
            {loading ? (
              <p className="ssr-showcase-no-events" role="status">Carregando calendário...</p>
            ) : events.length ? (
              events.slice(0, 2).map((event) => {
                const date = eventDate(event.date);
                return (
                  <Link key={event.id} className="ssr-showcase-event" to="/calendario">
                    <span className="ssr-showcase-date"><strong>{date.day}</strong><small>{date.month}</small></span>
                    <span className="ssr-showcase-event-text"><strong>{event.title}</strong><small>{event.location || event.description || "Confira os detalhes no calendário"}</small></span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                );
              })
            ) : <p className="ssr-showcase-no-events">Nenhum evento agendado no momento.</p>}
          </div>
        </div>
      </div>
      <Link to="/sobre" className="ssr-showcase-note">
        <School size={30} aria-hidden="true" />
        <span>Educação que conecta você ao futuro.</span>
        <i aria-hidden="true" />
      </Link>
    </div>
  );
}
