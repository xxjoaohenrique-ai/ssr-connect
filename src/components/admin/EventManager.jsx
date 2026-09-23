import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { adminList, adminCreate, adminUpdate, adminDelete } from "@/lib/adminApi";
import { Modal, Field, inputCls } from "./ui";

const TYPES = ["Prova", "Evento", "Feriado", "Reunião", "Atividade"];
const empty = { title: "", description: "", date: "", end_date: "", type: "Evento", location: "", is_active: true };

export default function EventManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems(await adminList("CalendarEvent", { sort: "date" }));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (it) => {
    setForm({
      ...it,
      date: it.date ? it.date.slice(0, 10) : "",
      end_date: it.end_date ? it.end_date.slice(0, 10) : "",
    });
    setEditing(it.id);
  };
  const close = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editing === "new") await adminCreate("CalendarEvent", form);
    else await adminUpdate("CalendarEvent", editing, form);
    setSaving(false); setEditing(null); load();
  };
  const remove = async (id) => {
    if (confirm("Excluir este evento?")) { await adminDelete("CalendarEvent", id); load(); }
  };
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="heading-font text-2xl font-bold">Eventos</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:scale-105"><Plus className="h-4 w-4" /> Novo evento</button>
      </div>

      {loading ? (
        <Loader2 className="mt-10 h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-primary">{it.type}</span>
                  <span className="text-xs text-muted-foreground">{it.date ? new Date(it.date + "T00:00:00").toLocaleDateString("pt-BR") : ""}</span>
                </div>
                <h3 className="mt-1 font-semibold">{it.title}</h3>
                {it.location && <p className="text-xs text-muted-foreground">{it.location}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEdit(it)} className="rounded-lg border border-border p-2 transition hover:bg-primary/10 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(it.id)} className="rounded-lg border border-border p-2 text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum evento cadastrado.</p>}
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Novo evento" : "Editar evento"} onClose={close}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Título"><input required value={form.title} onChange={set("title")} className={inputCls} /></Field>
            <Field label="Descrição"><textarea rows={3} value={form.description} onChange={set("description")} className={inputCls} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Data de início"><input required type="date" value={form.date} onChange={set("date")} className={inputCls} /></Field>
              <Field label="Data de fim (opcional)"><input type="date" value={form.end_date} onChange={set("end_date")} className={inputCls} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo"><select value={form.type} onChange={set("type")} className={inputCls}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Local"><input value={form.location} onChange={set("location")} className={inputCls} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={set("is_active")} className="h-4 w-4 rounded" /> Ativo</label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={close} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}