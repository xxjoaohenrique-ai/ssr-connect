// Gera um link "Adicionar ao Google Agenda" para um evento escolar.
// Funciona para qualquer usuário (aluno/pai/professor) sem necessidade de
// login ou conector OAuth — abre o evento no Google Calendar para salvar.
function allDayRange(date, endDate) {
  const start = (date || "").replace(/-/g, "");
  let end = (endDate || "").replace(/-/g, "");
  if (!end) {
    const d = new Date((date || "") + "T00:00:00");
    d.setDate(d.getDate() + 1);
    end = d.toISOString().slice(0, 10).replace(/-/g, "");
  }
  return `${start}/${end}`;
}

export function googleCalendarLink(ev) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title || "Evento escolar",
    dates: allDayRange(ev.date, ev.end_date),
  });
  if (ev.description) params.set("details", ev.description);
  if (ev.location) params.set("location", ev.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}