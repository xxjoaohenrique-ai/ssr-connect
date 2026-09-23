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
    <section className="ssr-page-hero relative overflow-hidden border-b border-border bg-card/35">
      <div className="ssr-hero-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {canGoBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="mb-6 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
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
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              {eyebrow}
            </span>
          )}
          <h1 className="heading-font mt-5 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl text-balance">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}