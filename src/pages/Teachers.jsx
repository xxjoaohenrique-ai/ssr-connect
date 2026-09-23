import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, BookMarked, Award } from "lucide-react";
import PageHero from "@/components/PageHero";

const teachers = [
  { name: "Profa. Helena Castro", subject: "Matemática", level: "Ensino Médio", exp: "15 anos", awards: ["Destaque Educador 2023", "Olimpíada de Matemática"] },
  { name: "Prof. Ricardo Lima", subject: "Física", level: "Ensino Médio", exp: "12 anos", awards: ["Mestre em Física - USP"] },
  { name: "Profa. Mariana Dias", subject: "Português e Redação", level: "Ensino Médio", exp: "18 anos", awards: ["Aprovações ITA/IME", "Doutora em Letras"] },
  { name: "Prof. André Souza", subject: "Química", level: "Ensino Médio", exp: "10 anos", awards: ["Especialista em Química Orgânica"] },
  { name: "Profa. Beatriz Reis", subject: "Biologia", level: "Fundamental II e Médio", exp: "14 anos", awards: ["Olimpíada Brasileira de Biologia"] },
  { name: "Prof. Carlos Nunes", subject: "História", level: "Fundamental II e Médio", exp: "20 anos", awards: ["Mestre em História do Brasil"] },
  { name: "Profa. Júlia Ferreira", subject: "Geografia", level: "Fundamental II e Médio", exp: "11 anos", awards: ["Especialista em Educação Ambiental"] },
  { name: "Prof. Lucas Almeida", subject: "Robótica & Programação", level: "Complementar", exp: "8 anos", awards: ["Mentor Liga de Robótica", "Eng. da Computação"] },
  { name: "Profa. Sofia Mendes", subject: "Inglês", level: "Fundamental e Médio", exp: "13 anos", awards: ["Certificação Cambridge", "Proficiente C2"] },
  { name: "Prof. Pedro Rocha", subject: "Educação Física", level: "Todas as etapas", exp: "9 anos", awards: ["Treinador CBF", "Especialista em Esporte Escolar"] },
  { name: "Profa. Carla Pinto", subject: "Artes", level: "Fundamental", exp: "16 anos", awards: ["Artista Plástica", "Especialista em Arte-Educação"] },
  { name: "Prof. Rodrigo Batista", subject: "Filosofia e Sociologia", level: "Ensino Médio", exp: "17 anos", awards: ["Mestre em Filosofia"] },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Teachers() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("Todas");

  const subjects = ["Todas", ...new Set(teachers.map((t) => t.subject))];
  const filtered = teachers.filter((t) => {
    const matchesQuery = t.name.toLowerCase().includes(query.toLowerCase()) || t.subject.toLowerCase().includes(query.toLowerCase());
    const matchesSubject = subject === "Todas" || t.subject === subject;
    return matchesQuery && matchesSubject;
  });

  return (
    <div>
      <PageHero
        eyebrow="Corpo Docente"
        title="Educadores que inspiram"
        description="Conheça os professores apaixonados que conduzem a jornada de aprendizado no CETI Sebastião Soares Ribeiro."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar professor ou disciplina..."
              className="w-full rounded-full border border-border bg-card py-3 pl-12 pr-4 text-sm outline-none ring-primary transition focus:ring-2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  subject === s
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border border-border bg-card text-muted-foreground hover:text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t, i) => (
            <motion.article
              key={t.name}
              custom={i}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="group overflow-hidden rounded-3xl border border-border bg-card text-center transition hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div className="flex flex-col items-center bg-gradient-to-b from-primary/10 to-transparent px-6 pt-8 pb-4">
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white shadow-xl">
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
              </div>
              <div className="p-6 pt-2">
                <h3 className="heading-font text-lg font-bold">{t.name}</h3>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary">
                  <BookMarked className="h-4 w-4" /> {t.subject}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{t.level} · {t.exp} de experiência</p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {t.awards.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 rounded-md bg-secondary/10 px-2 py-1 text-[10px] font-medium text-secondary">
                      <Award className="h-3 w-3" /> {a}
                    </span>
                  ))}
                </div>
                <button className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-primary">
                  <Mail className="h-3.5 w-3.5" /> Contato
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-sm text-muted-foreground">Nenhum professor encontrado.</p>
        )}
      </section>
    </div>
  );
}