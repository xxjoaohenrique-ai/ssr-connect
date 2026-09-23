import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Code2, Megaphone, GraduationCap, ChevronRight, Clock, Users } from "lucide-react";
import PageHero from "@/components/PageHero";

const courses = [
  { icon: Code2, level: "Técnico", name: "Desenvolvimento de Sistemas", desc: "Programação, banco de dados e desenvolvimento web. Do back-end ao front-end, construindo projetos reais para o mercado de tecnologia.", duration: "3 anos", students: "Vagas limitadas", subjects: ["Lógica de Programação", "JavaScript", "Python", "Banco de Dados", "APIs REST", "Git"] },
  { icon: Megaphone, level: "Técnico", name: "Marketing", desc: "Branding, redes sociais, tráfego pago e estratégias de venda. Comunicação e mercado para formar profissionais prontos para o mundo digital.", duration: "3 anos", students: "Vagas limitadas", subjects: ["Branding", "Redes Sociais", "Tráfego Pago", "Copywriting", "Marketing Digital", "Vendas"] },
  { icon: GraduationCap, level: "Regular", name: "Ensino Médio Integrado", desc: "A formação regular que toda escola do Piauí oferece, integrada aos cursos técnicos. Base comum completa prevista na BNCC.", duration: "3 anos", students: "Turmas regulares", subjects: ["Português", "Matemática", "História", "Geografia", "Ciências", "Inglês"] },
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
    <div>
      <PageHero
        eyebrow="Cursos e Turmas"
        title="Uma jornada de aprendizado para cada etapa"
        description="Cursos técnicos em Desenvolvimento de Sistemas e Marketing integrados ao Ensino Médio, além da formação regular comum a toda escola do Piauí."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        {/* Pesquisa + filtros */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar curso, disciplina..."
              className="w-full rounded-full border border-border bg-card py-3 pl-12 pr-4 text-sm outline-none ring-primary transition focus:ring-2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => setFilter(l)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
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
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.article
              key={c.name}
              custom={i}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                  <c.icon className="h-7 w-7" />
                </span>
                <span className="mt-5 inline-block rounded-full bg-secondary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  {c.level}
                </span>
                <h3 className="heading-font mt-2 text-xl font-bold">{c.name}</h3>
              </div>
              <div className="flex flex-1 flex-col p-6 pt-0">
                <p className="text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {c.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" /> {c.students}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.subjects.map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">{s}</span>
                  ))}
                </div>
                <button className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Detalhes <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
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