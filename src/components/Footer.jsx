import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CONTACT_DEFAULTS } from "@/lib/contactDefaults";

const cols = [
  {
    title: "Escola",
    links: [
      { label: "Sobre o CETI", to: "/sobre" },
      { label: "Corpo Docente", to: "/professores" },
      { label: "Cursos e Turmas", to: "/cursos" },
      { label: "Calendário Escolar", to: "/calendario" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Biblioteca Digital", to: "/biblioteca" },
      { label: "Notícias e Avisos", to: "/noticias" },
      { label: "Galeria de Fotos", to: "/galeria" },
      { label: "Fale Conosco", to: "/contato" },
    ],
  },
];

// Rodapé institucional completo
export default function Footer() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const load = () =>
      base44.entities.ContactInfo
        .list()
        .then((rows) => setInfo(rows[0] ? { ...CONTACT_DEFAULTS, ...rows[0] } : { ...CONTACT_DEFAULTS }))
        .catch(() => setInfo({ ...CONTACT_DEFAULTS }));
    load();
    const unsubscribe = base44.entities.ContactInfo.subscribe(() => load());
    return unsubscribe;
  }, []);

  const c = info || CONTACT_DEFAULTS;
  return (
    <footer className="relative mt-24 border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-28 sm:px-6 sm:pb-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Marca + contato */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="heading-font text-xl font-extrabold tracking-tight">
                CETI<span className="text-secondary">.</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              O ecossistema digital do CETI Sebastião Soares Ribeiro — onde o conhecimento
              encontra o futuro. Uma plataforma organizada e acessível para alunos, professores,
              pais e comunidade escolar.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> {c.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> {c.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> {c.email}
              </p>
            </div>
          </div>

          {/* Colunas de links */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="heading-font text-sm font-semibold uppercase tracking-widest text-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-muted-foreground sm:justify-start">
            <p>© {new Date().getFullYear()} CETI Sebastião Soares Ribeiro. Todos os direitos reservados.</p>
            <Link to="/admin" className="transition-colors hover:text-primary">Painel Admin</Link>
          </div>
          <div className="flex items-center gap-3">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Facebook, label: "Facebook" },
              { Icon: Youtube, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}