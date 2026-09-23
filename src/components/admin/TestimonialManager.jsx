import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, Loader2, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { adminList, adminCreate, adminUpdate, adminDelete } from "@/lib/adminApi";
import { Modal, Field, inputCls } from "./ui";

const ROLES = ["Aluno", "Pai/Mãe", "Ex-Aluno", "Professor"];
const empty = { name: "", role: "Aluno", content: "", rating: 5, avatar_url: "", is_approved: true };

export default function TestimonialManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems(await adminList("Testimonial", { sort: "-created_date" }));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (it) => { setForm(it); setEditing(it.id); };
  const close = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editing === "new") await adminCreate("Testimonial", form);
    else await adminUpdate("Testimonial", editing, form);
    setSaving(false); setEditing(null); load();
  };
  const remove = async (id) => {
    if (confirm("Excluir este depoimento?")) { await adminDelete("Testimonial", id); load(); }
  };
  const toggleApprove = async (it) => {
    await adminUpdate("Testimonial", it.id, { is_approved: !it.is_approved });
    load();
  };
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="heading-font text-2xl font-bold">Depoimentos</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:scale-105"><Plus className="h-4 w-4" /> Novo depoimento</button>
      </div>

      {loading ? (
        <Loader2 className="mt-10 h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{it.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{it.role}</span>
                  {!it.is_approved && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">Pendente</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{it.content}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => toggleApprove(it)} title={it.is_approved ? "Desaprovar" : "Aprovar"} className={`rounded-lg border border-border p-2 transition ${it.is_approved ? "text-secondary hover:bg-secondary/10" : "text-muted-foreground hover:bg-muted"}`}>{it.is_approved ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</button>
                <button onClick={() => openEdit(it)} className="rounded-lg border border-border p-2 transition hover:bg-primary/10 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(it.id)} className="rounded-lg border border-border p-2 text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum depoimento cadastrado.</p>}
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Novo depoimento" : "Editar depoimento"} onClose={close}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome"><input required value={form.name} onChange={set("name")} className={inputCls} /></Field>
              <Field label="Papel"><select value={form.role} onChange={set("role")} className={inputCls}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
            </div>
            <Field label="Depoimento"><textarea required rows={4} value={form.content} onChange={set("content")} className={inputCls} /></Field>
            <Field label="Avaliação (1-5)"><input type="number" min={1} max={5} value={form.rating} onChange={set("rating")} className={inputCls} /></Field>
            <Field label="Avatar (URL)"><input value={form.avatar_url} onChange={set("avatar_url")} placeholder="https://..." className={inputCls} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_approved} onChange={set("is_approved")} className="h-4 w-4 rounded" /> Aprovado (visível no site)</label>
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