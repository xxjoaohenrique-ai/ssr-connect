import { motion } from "framer-motion";

// Cabeçalho de seção reutilizável com eyebrow + título + descrição
export default function SectionHeading({ eyebrow, title, description, align = "center" }) {
  const alignment = align === "left" ? "text-left" : "text-center mx-auto";
  const accent = align === "left" ? "" : "mx-auto";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`max-w-2xl ${alignment}`}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {eyebrow}
        </span>
      )}
      <h2 className="heading-font mt-5 text-3xl font-bold tracking-tight sm:text-[2.5rem] text-balance">
        {title}
      </h2>
      <div className={`mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary ${accent}`} />
      {description && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      )}
    </motion.div>
  );
}