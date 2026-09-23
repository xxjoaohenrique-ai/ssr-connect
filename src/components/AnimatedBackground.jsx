// Fundo animado sutil: blobs de gradiente flutuantes em tons da marca.
// Fixo à viewport, atrás de todo o conteúdo, sem capturar cliques.
export default function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-blob1 absolute -top-32 -left-32 h-[42rem] w-[42rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="animate-blob2 absolute top-1/4 -right-40 h-[40rem] w-[40rem] rounded-full bg-secondary/10 blur-3xl" />
      <div className="animate-blob3 absolute -bottom-40 left-1/3 h-[38rem] w-[38rem] rounded-full bg-amber-400/[0.06] blur-3xl" />
      <div className="animate-blob1 absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-3xl" style={{ animationDelay: "-8s" }} />
    </div>
  );
}