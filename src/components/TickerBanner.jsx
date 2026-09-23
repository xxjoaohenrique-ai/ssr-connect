import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULT = "Bem-vindo ao SSR-CONNECT · Notícias, calendário e informações da escola em um só lugar";

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
    <div className="ssr-ticker bg-gradient-to-r from-[#1e88e5] to-[#00897b] px-4 py-2.5 text-xs font-medium tracking-wide text-white sm:text-sm" role="status">
      <div className="ssr-ticker-content"><Megaphone size={17} aria-hidden="true" /><span>{text}</span></div>
    </div>
  );
}