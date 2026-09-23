import { useEffect, useState } from "react";
import { CalendarDays, Loader2, MapPin, CalendarPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { googleCalendarLink } from "@/lib/googleCalendar";

const fmt = (d) => {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch { return d; }
};

// Mostra os próximos eventos ativos do calendário escolar (novos a partir de hoje).
export default function EventsCard({ title = "Próximos eventos", subtitle, limit = 4 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await base44.entities.CalendarEvent.filter({ is_active: true }, "date", 50);
        const today = new Date().toISOString().slice(0, 10);
        const upcoming = all.filter((e) => (e.date || "") >= today).slice(0, limit);
        if (active) setEvents(upcoming);
      } catch (e) { console.error(e); } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="h-5 w-5" /></span>
        <div>
          <h3 className="heading-font text-base font-bold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : events.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum evento próximo no momento.</p>
        ) : (
          events.map((ev) => {
            const [day, month] = fmt(ev.date).split(" ");
            return (
              <div key={ev.id} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="text-sm font-extrabold leading-none">{day}</span>
                  <span className="text-[10px] uppercase">{month}</span>
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-secondary">{ev.type || "Evento"}</span>
                    {ev.location && <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" /> {ev.location}</span>}
                  </div>
                  <p className="mt-0.5 text-sm font-semibold">{ev.title}</p>
                  {ev.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">{ev.description}</p>}
                  <a href={googleCalendarLink(ev)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"><CalendarPlus className="h-3 w-3" /> Adicionar ao Google Agenda</a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}