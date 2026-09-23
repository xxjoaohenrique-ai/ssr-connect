import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Cabeçalho de página interno (breadcrumb visual)
export default function PageHero({ eyebrow, title, description }) {
  const location = useLocation();
  const navigate = useNavigate();
  const canGoBack =
    location.pathname !== "/" &&
    typeof window !== "undefined" &&
    window.history.length > 1;

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 prism-gradient opacity-80" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
        {canGoBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              {eyebrow}
            </span>
          )}
          <h1 className="heading-font mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}