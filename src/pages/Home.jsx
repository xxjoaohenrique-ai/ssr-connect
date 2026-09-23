import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, BookOpen, CalendarDays, Newspaper, Image as ImageIcon, Users, GraduationCap, Megaphone, Code2, AlertTriangle, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import TestimonialSection from "@/components/TestimonialSection";
import TickerBanner from "@/components/TickerBanner";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";

const HERO_IMG = `${import.meta.env.BASE_URL}images/hero.svg`;
const STUDENTS_IMG = `${import.meta.env.BASE_URL}images/students.svg`;

const hubTiles = [
  { icon: BookOpen, title: "Biblioteca Digital", desc: "Vídeo-aulas e materiais de estudo publicados pelos professores.", to: "/biblioteca", color: "from-blue-500 to-blue-600" },
  { icon: CalendarDays, title: "Calendário Escolar", desc: "Provas, eventos, feriados e reuniões em um só lugar.", to: "/calendario", color: "from-emerald-500 to-emerald-600" },
  { icon: Newspaper, title: "Notícias e Avisos", desc: "Comunicados oficiais e atualizações da escola.", to: "/noticias", color: "from-amber-500 to-orange-500" },
  { icon: ImageIcon, title: "Galeria", desc: "Fotos e vídeos dos eventos e do dia a dia escolar.", to: "/galeria", color: "from-sky-500 to-indigo-500" },
  { icon: GraduationCap, title: "Portal do Aluno", desc: "Acesso a notas, materiais, aulas e avisos da turma.", to: "/portal-aluno", color: "from-violet-500 to-purple-600" },
  { icon: Users, title: "Sobre a Escola", desc: "Conheça a história, missão e estrutura do CETI.", to: "/sobre", color: "from-rose-500 to-pink-600" },
  { icon: Code2, title: "Cursos e Turmas", desc: "Cursos técnicos integrados e formação regular.", to: "/cursos", color: "from-emerald-500 to-teal-600" },
  { icon: Megaphone, title: "Fale Conosco", desc: "Dúvidas, matrículas e contato com a secretaria.", to: "/contato", color: "from-amber-500 to-orange-500" },
];

const courses = [
  { icon: Code2, name: "Desenvolvimento de Sistemas", desc: "Programação, banco de dados e projetos reais — formação técnica para o mercado de tecnologia." },
  { icon: Megaphone, name: "Marketing", desc: "Branding, redes sociais e estratégias de venda — comunicação e mercado para o mundo digital." },
  { icon: BookOpen, name: "Formação Regular", desc: "Ensino Médio e Fundamental com a base comum que toda escola do Piauí oferece." },
];

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const toParts = (dateStr) => {
  if (!dateStr) return { day: "", month: "" };
  const d = new Date(dateStr + "T00:00:00");
  return { day: String(d.getDate()), month: MONTHS_SHORT[d.getMonth()] };
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const [n, no, ev] = await Promise.all([
          base44.entities.News.filter({ is_published: true }, "-date", 3),
          base44.entities.Notice.filter({ is_active: true }, "-date", 4),
          base44.entities.CalendarEvent.filter({ is_active: true }, "date"),
        ]);
        setNews(n);
        setNotices(no);
        setEvents(ev.filter((e) => e.date && new Date(e.date + "T00:00:00") >= today).slice(0, 4));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.toLowerCase();
    if (q.match("biblio|livro|material")) navigate("/biblioteca");
    else if (q.match("curso|turma|ensino")) navigate("/cursos");
    else if (q.match("calend|prova|evento")) navigate("/calendario");
    else if (q.match("notic|avi|comunic")) navigate("/noticias");
    else if (q.match("foto|galer|video")) navigate("/galeria");
    else if (q.match("professor|docente")) navigate("/professores");
    else navigate("/sobre");
  };

  return (
    <div className="overflow-x-hidden">
      {/* BANNER DE AVISOS (editável pelo admin) */}
      <TickerBanner />

      {/* HERO */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 sm:min-h-[80vh]">
        <div className="absolute inset-0">
          <Image src={HERO_IMG} alt="Biblioteca moderna do CETI Sebastião Soares Ribeiro com estudantes colaborando" fittingType="fill" loading="eager" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full glass-ui px-5 py-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            CETI Sebastião Soares Ribeiro
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="heading-font mt-6 text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl text-balance">
            Onde o Conhecimento <br className="hidden sm:block" /> Encontra o <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text bg-[length:200%_auto] text-transparent italic animate-shimmer">Futuro.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg text-balance">
            Um ecossistema educacional completo, projetado para moldar mentes críticas e líderes globais através da tecnologia, inovação e acessibilidade para toda a comunidade escolar.
          </motion.p>

          <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="O que você procura hoje?" className="w-full rounded-full glass-ui py-4 pl-12 pr-4 text-sm text-foreground outline-none ring-primary transition focus:ring-2" />
            </div>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-secondary/30 transition hover:scale-105">
              Explorar <ArrowRight className="h-4 w-4" />
            </button>
          </motion.form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 0 alunos</span>
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-secondary" /> 0 títulos</span>
            <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> 0% aprovação</span>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 sm:block">
          <span className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-foreground/30 p-1">
            <span className="h-2 w-1 rounded-full bg-foreground/50 animate-scroll-down" />
          </span>
        </div>
      </section>

      {/* KNOWLEDGE HUB */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Hub do Conhecimento" title="Tudo o que você precisa, em um só lugar" description="Centralize o acesso às ferramentas e informações essenciais da vida escolar — para alunos, professores, pais e comunidade." />
        <div className="mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hubTiles.map((t, i) => (
            <motion.div key={t.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" whileHover={{ y: -6, scale: 1.02 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Link to={t.to} className="group flex h-full flex-col rounded-3xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-card sm:p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><t.icon className="h-6 w-6" /></span>
                <h3 className="heading-font mt-5 text-lg font-semibold">{t.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">Acessar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* APRESENTAÇÃO */}
      <section className="relative overflow-hidden border-y border-border bg-card/30 py-12 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <Image src={STUDENTS_IMG} alt="Estudantes colaborando em sala de aula moderna" fittingType="fill" className="aspect-[4/3] w-full" />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden animate-float-slow rounded-2xl border border-border bg-card p-6 shadow-card sm:block">
              <p className="heading-font text-3xl font-bold text-secondary">0 anos</p>
              <p className="text-xs text-muted-foreground">formando cidadãos</p>
            </div>
          </motion.div>

          <div>
            <SectionHeading align="left"               eyebrow="Sobre o CETI" title="Uma instituição construída sobre o futuro"               description="Há mais de duas décadas, o CETI Sebastião Soares Ribeiro une tradição acadêmica e inovação tecnológica para oferecer uma educação transformadora." />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Nossa metodologia integra tecnologias emergentes, aprendizado projetivo e um acompanhamento individualizado, preparando cada estudante para os desafios de um mundo em constante transformação.</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[{ n: "0", l: "Alunos" }, { n: "0", l: "Educadores" }, { n: "0%", l: "Aprovação" }].map((s) => (
                <div key={s.l} className="rounded-2xl border border-border bg-background p-4 text-center">
                  <p className="heading-font text-2xl font-bold text-primary">{s.n}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
            <Link to="/sobre" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-105">Conheça nossa história <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* CURSOS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Nossos Cursos" title="Técnico e formação regular, lado a lado" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {courses.map((c, i) => (
            <motion.div key={c.name} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="group rounded-3xl border border-border bg-card p-8 transition hover:border-primary/40 hover:shadow-xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-6 w-6" /></span>
              <h3 className="heading-font mt-5 text-xl font-semibold">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              <Link to="/cursos" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">Saiba mais <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NOTÍCIAS + AVISOS */}
      <section className="border-y border-border bg-card/30 py-12 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between">
              <SectionHeading align="left" eyebrow="Notícias" title="Atualizações recentes" />
              <Link to="/noticias" className="hidden text-sm font-semibold text-primary hover:underline sm:inline-flex">Ver todas</Link>
            </div>
            <div className="mt-8 space-y-5">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : news.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma notícia publicada ainda.</p>
              ) : (
                news.map((n, i) => {
                  const p = toParts(n.date);
                  return (
                    <motion.article key={n.id} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group flex gap-4 rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 hover:shadow-soft sm:p-5">
                      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-muted/40 sm:h-24 sm:w-28">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{p.month}</span>
                        <span className="heading-font text-2xl font-bold text-foreground">{p.day}</span>
                      </div>
                      <div>
                        <span className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">{n.category}</span>
                        <h3 className="heading-font mt-2 text-lg font-semibold leading-snug group-hover:text-primary">{n.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{n.excerpt}</p>
                      </div>
                    </motion.article>
                  );
                })
              )}
            </div>
          </div>

          {/* Mural de avisos */}
          <div>
            <SectionHeading align="left" eyebrow="Mural" title="Avisos importantes" />
            <div className="mt-8 space-y-4">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : notices.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Nenhum aviso no momento.</p>
              ) : (
                notices.map((n, i) => {
                  const urgent = n.priority === "urgente";
                  return (
                    <motion.div key={n.id} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className={`flex gap-3 rounded-2xl border p-4 ${urgent ? "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10" : "border-border bg-background"}`}>
                      <span className={`mt-0.5 ${urgent ? "text-amber-500" : "text-primary"}`}>{urgent ? <AlertTriangle className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}</span>
                      <div>
                        <span className={`text-[11px] font-semibold uppercase tracking-wide ${urgent ? "text-amber-600 dark:text-amber-400" : "text-primary"}`}>{urgent ? "Urgente" : "Aviso"}</span>
                        <p className="mt-0.5 text-sm leading-relaxed">{n.content}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CALENDÁRIO */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <SectionHeading align="left" eyebrow="Agenda" title="Próximos eventos" />
          <Link to="/calendario" className="hidden text-sm font-semibold text-primary hover:underline sm:inline-flex">Calendário completo</Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : events.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-muted-foreground">Nenhum evento próximo.</p>
          ) : (
            events.map((e, i) => {
              const p = toParts(e.date);
              return (
                <motion.div key={e.id} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <span className="heading-font text-2xl font-bold leading-none">{p.day}</span>
                    <span className="text-[11px] uppercase tracking-wide">{p.month}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-snug">{e.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{e.location || e.type}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <TestimonialSection />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-6 py-12 text-center text-primary-foreground shadow-card animate-gradient-pan sm:px-16 sm:py-16">
          <div className="absolute inset-0 opacity-30 prism-gradient" />
          <div className="relative">
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }} className="heading-font text-3xl font-bold sm:text-4xl text-balance">Pronto para fazer parte do CETI?</motion.h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85 text-balance">Matrículas abertas para 2027. Agende uma visita ou fale com nossa secretaria.</p>
            <Link to="/contato" className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 text-sm font-semibold text-primary shadow-soft transition hover:scale-105">Iniciar matrícula <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}