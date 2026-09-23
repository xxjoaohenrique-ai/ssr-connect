import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULT = "Aulas procedendo normalmente · Resultados do Simulado ENEM publicados · Inscrições abertas para 2027";

// Banner de avisos editável pelo administrador (entidade Ticker).
export default function TickerBanner() {
  const [text, setText] = useState(DEFAULT);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await base44.entities.Ticker.filter({ is_active: true });
        if (active && rows[0]?.content) setText(rows[0].content);
      } catch { /* mantém texto padrão */ }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#1e88e5] to-[#00897b] px-4 py-2.5 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white align-middle" />
      {text}
    </div>
  );
}