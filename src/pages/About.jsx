import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Shield, Users2, Lightbulb, MapPin, Award, Building2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";
import { HISTORY_DEFAULTS } from "@/lib/historyDefaults";

const ABOUT_IMG = `${import.meta.env.BASE_URL}images/about.svg`;

const values = [
  { icon: Target, title: "Missão", text: "Educar com excelência, formando cidadãos críticos, éticos e protagonistas de sua própria história." },
  { icon: Eye, title: "Visão", text: "Ser referência regional em educação inovadora, integrando tecnologia e valores humanos até 2030." },
  { icon: Heart, title: "Valores", text: "Respeito, responsabilidade, criatividade e compromisso com a aprendizagem contínua." },
];

const pillars = [
  { icon: Shield, title: "Excelência Acadêmica", text: "Currículo alinhado à BNCC com complementos de robótica, idiomas e vestibular." },
  { icon: Users2, title: "Comunidade Acolhedora", text: "Ambiente seguro e inclusivo que valoriza a diversidade e o bem-estar." },
  { icon: Lightbulb, title: "Inovação Pedagógica", text: "Metodologias ativas, laboratórios e projetos interdisciplinares." },
  { icon: Building2, title: "Estrutura Completa", text: "Laboratórios, biblioteca, quadras e espaços maker de última geração." },
];

const structure = [
  "Laboratórios de Ciências, Física e Química equipados",
  "Biblioteca com mais de 50.000 títulos e salas de estudo",
  "Espaço Maker com impressoras 3D e robótica educacional",
  "Quadras poliesportivas cobertas e campo society",
  "Auditório com 400 lugares para eventos e palestras",
  "Salas climatizadas com lousas interativas",
];

const team = [
  { name: "Dra. Helena Ribeiro", role: "Diretora Geral", bio: "Doutora em Educação, 20 anos de experiência em gestão escolar." },
  { name: "Prof. Marcos Tavares", role: "Coordenador Pedagógico", bio: "Especialista em metodologias ativas e currículo digital." },
  { name: "Profa. Ana Beatriz Souza", role: "Coordenadora do Ensino Médio", bio: "Mestre em Matemática, orienta o preparatório vestibular." },
  { name: "Sr. Paulo Mendes", role: "Orientador Educacional", bio: "Psicólogo, responsável pelo bem-estar socioemocional dos alunos." },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

export default function About() {
  const [history, setHistory] = useState(HISTORY_DEFAULTS);

  useEffect(() => {
    let mounted = true;
    const load = () => base44.entities.ContactInfo.list()
      .then((rows) => { if (mounted) setHistory({ ...HISTORY_DEFAULTS, ...rows[0] }); })
      .catch(() => {});
    load();
    const unsubscribe = base44.entities.ContactInfo.subscribe(load);
    return () => { mounted = false; unsubscribe(); };
  }, []);

  return (
    <div>
      <PageHero
        eyebrow="Sobre a Escola"
        title="Uma instituição construída sobre o futuro"
        description="Conheça a história, a missão e a estrutura que fazem do CETI um ecossistema educacional de excelência."
      />

      {/* História */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-14 sm:py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl shadow-2xl"
        >
          <Image src={ABOUT_IMG} alt="Ilustração de atividades escolares" fittingType="fill" className="aspect-[4/3] w-full" />
        </motion.div>
        <div>
          <SectionHeading align="left" eyebrow="Nossa História" title={history.history_title || HISTORY_DEFAULTS.history_title} />
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {(history.history_text || HISTORY_DEFAULTS.history_text).split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="border-y border-border bg-card/30 py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Pilares Institucionais" title="O que nos move" />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                custom={i}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-3xl border border-border bg-background p-8 text-center transition hover:shadow-xl"
              >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
                  <v.icon className="h-8 w-8" />
                </span>
                <h3 className="heading-font mt-6 text-2xl font-semibold">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-24 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Diferenciais" title="Por que escolher o CETI" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              custom={i}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="rounded-3xl border border-border bg-card p-8 transition hover:border-primary/40 hover:shadow-xl"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="heading-font mt-5 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Estrutura */}
      <section className="border-y border-border bg-card/30 py-14 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading align="left" eyebrow="Infraestrutura" title="Espaços que inspiram aprendizado" />
            <ul className="mt-8 space-y-4">
              {structure.map((s, i) => (
                <motion.li
                  key={s}
                  custom={i}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                    <Award className="h-3.5 w-3.5" />
                  </span>
                  {s}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Equipe gestora */}
          <div>
            <SectionHeading align="left" eyebrow="Equipe Gestora" title="Liderança que conduz" />
            <div className="mt-8 space-y-4">
              {team.map((m, i) => (
                <motion.div
                  key={m.name}
                  custom={i}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="flex gap-4 rounded-2xl border border-border bg-background p-5"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
                    {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <h3 className="heading-font font-semibold">{m.name}</h3>
                    <p className="text-sm font-medium text-primary">{m.role}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-24 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Onde estamos" title="Venha nos visitar" description="Estamos no coração da cidade, com fácil acesso e estrutura completa." />
        <div className="mt-12 overflow-hidden rounded-3xl border border-border shadow-xl">
          <iframe
            title="Localização do CETI"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-46.6593%2C-23.5613%2C-46.6373%2C-23.5413&layer=mapnik&marker=-23.5513%2C-46.6483"
            className="h-[400px] w-full grayscale-[20%]"
            loading="lazy"
          />
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" /> Av. do Conhecimento, 1822 — Centro, São Paulo/SP
        </div>
      </section>
    </div>
  );
}
