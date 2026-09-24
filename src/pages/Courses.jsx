import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Code2, Target, GraduationCap, ChevronRight, Clock, Users, BookOpen, GitFork } from "lucide-react";
import "@/styles/school-pages.css";

const courses = [
  { icon: Code2, accentIcon: GitFork, level: "Técnico", name: "Desenvolvimento de Sistemas", desc: "Programação, banco de dados e desenvolvimento web. Do back-end ao front-end, construindo projetos reais para o mercado de tecnologia.", duration: "3 anos", students: "Vagas limitadas", subjects: ["Lógica de Programação", "JavaScript", "Python", "Banco de Dados", "APIs REST", "Git"] },
  { icon: Target, level: "Técnico", name: "Marketing", desc: "Branding, redes sociais, tráfego pago e estratégias de venda. Comunicação e mercado para formar profissionais prontos para o mundo digital.", duration: "3 anos", students: "Vagas limitadas", subjects: ["Branding", "Redes Sociais", "Tráfego Pago", "Copywriting", "Marketing Digital", "Vendas"] },
  { icon: GraduationCap, accentIcon: BookOpen, level: "Regular", name: "Ensino Médio Integrado", desc: "A formação regular que toda escola do Piauí oferece, integrada aos cursos técnicos. Base comum completa prevista na BNCC.", duration: "3 anos", students: "Turmas regulares", subjects: ["Português", "Matemática", "História", "Geografia", "Ciências", "Inglês"] },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Courses() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");

  const levels = ["Todos", "Técnico", "Regular"];
  const filtered = courses.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.desc.toLowerCase().includes(query.toLowerCase()) ||
      c.subjects.join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "Todos" || c.level === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="ssr-courses-page">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <header className="ssr-courses-heading"><span className="ssr-courses-eyebrow">Cursos e turmas</span><h1>Cursos e turmas</h1><p>Encontre sua próxima oportunidade de aprender.</p></header>
        {/* Pesquisa + filtros */}
        <div className="ssr-courses-controls flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              aria-label="Buscar curso ou disciplina"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar curso ou disciplina..."
              className="w-full rounded-full border border-border bg-card py-3 pl-12 pr-4 text-sm outline-none ring-primary transition focus:ring-2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => setFilter(l)}
                type="button"
                aria-pressed={filter === l}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === l
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border border-border bg-card text-muted-foreground hover:text-primary"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de cursos */}
        <div className="ssr-courses-list mt-8 grid gap-5">
          {filtered.map((c, i) => (
            <motion.article
              key={c.name}
              custom={i}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="ssr-course-card group rounded-3xl border border-border bg-card transition hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="ssr-course-icon" aria-hidden="true">
                <c.icon className="h-7 w-7" />
                {c.accentIcon && <c.accentIcon className="ssr-course-icon-accent" />}
              </div>
              <div className="ssr-course-body">
                <span className="ssr-course-level">
                  {c.level}
                </span>
                <h2 className="heading-font mt-1 text-xl font-bold">{c.name}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {c.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" /> {c.students}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.subjects.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">{s}</span>
                  ))}
                </div>
                <details className="ssr-course-details mt-4"><summary className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary">Ver detalhes <ChevronRight className="h-4 w-4" /></summary><div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3"><span className="w-full text-sm font-medium">Disciplinas e temas</span>{c.subjects.map((s) => <span key={s} className="rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">{s}</span>)}</div></details>
              </div>
            </motion.article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-sm text-muted-foreground">Nenhum curso encontrado para sua busca.</p>
        )}
      </section>
    </div>
  );
}
