import { useEffect, useState } from "react";
import { Loader2, Megaphone, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const fmtDate = (d) => {
  if (!d) return "";
  try { return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); } catch { return d; }
};

// turmas: null => mostra todos os avisos ativos. array => mostra os gerais + das turmas informadas.
export default function NoticesCard({ title = "Avisos", subtitle, turmas = null }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const all = await base44.entities.Notice.filter({ is_active: true }, "-date", 50);
        const list = turmas == null
          ? all
          : all.filter((n) => {
              const nt = (n.turma || "").trim().toLowerCase();
              return !nt || turmas.map((t) => (t || "").toLowerCase()).includes(nt);
            });
        if (active) setNotices(list);
      } catch (e) { console.error(e); } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [turmas]);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600"><Megaphone className="h-5 w-5" /></span>
        <div>
          <h3 className="heading-font text-base font-bold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : notices.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum aviso no momento.</p>
        ) : (
          notices.map((n) => {
            const urgent = n.priority === "urgente";
            return (
              <div key={n.id} className={`flex gap-3 rounded-2xl border p-4 ${urgent ? "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10" : "border-border bg-background"}`}>
                <span className={`mt-0.5 shrink-0 ${urgent ? "text-amber-500" : "text-primary"}`}>{urgent ? <AlertTriangle className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-semibold uppercase ${urgent ? "text-amber-600 dark:text-amber-400" : "text-primary"}`}>{urgent ? "Urgente" : n.priority === "alta" ? "Alta" : "Aviso"}</span>
                    {n.turma && <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">{n.turma}</span>}
                    {n.date && <span className="text-[11px] text-muted-foreground">{fmtDate(n.date)}</span>}
                  </div>
                  <p className="mt-0.5 text-sm font-semibold">{n.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}