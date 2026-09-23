import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, X } from "lucide-react";
import PageHero from "@/components/PageHero";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await base44.entities.GalleryImage.filter({ is_active: true });
        if (active) setPhotos(all);
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div>
      <PageHero
        eyebrow="Galeria"
        title="Momentos que contam histórias"
        description="Fotos dos eventos, projetos e do dia a dia no CETI Sebastião Soares Ribeiro."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : photos.length === 0 ? (
          <div className="py-16 text-center">
            <Camera className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhuma foto publicada ainda. As fotos da escola são enviadas pela administração.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {photos.map((p, i) => (
              <motion.button
                key={p.id}
                custom={i}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                onClick={() => setOpen(p)}
                className="group relative overflow-hidden rounded-3xl border border-border text-left transition hover:-translate-y-1 hover:shadow-card"
              >
                <Image src={p.image_url} alt={p.title} className="aspect-square w-full transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
                  <p className="text-sm font-semibold leading-snug text-white">{p.title}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Visualização ampliada */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-[75vh] overflow-hidden rounded-3xl bg-black">
              <Image src={open.image_url} alt={open.title} fittingType="fit" className="h-full w-full" />
            </div>
            <button
              onClick={() => setOpen(null)}
              aria-label="Fechar"
              className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="mt-3 text-center text-sm font-medium text-white/90">{open.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}