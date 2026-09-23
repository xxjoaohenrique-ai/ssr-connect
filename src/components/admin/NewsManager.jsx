import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { adminList, adminCreate, adminUpdate, adminDelete } from "@/lib/adminApi";
import { Modal, Field, inputCls } from "./ui";

const CATEGORIES = ["Eventos", "Acadêmico", "Esportes", "Cultura", "Comunicado"];
const empty = {
  title: "", category: "Comunicado", excerpt: "", content: "",
  image_url: "", author: "Equipe CETI", date: "", is_published: true,
};

export default function NewsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems(await adminList("News", { sort: "-created_date" }));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (it) => {
    setForm({ ...it, date: it.date ? it.date.slice(0, 10) : "" });
    setEditing(it.id);
  };
  const close = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editing === "new") await adminCreate("News", form);
    else await adminUpdate("News", editing, form);
    setSaving(false); setEditing(null); load();
  };
  const remove = async (id) => {
    if (confirm("Excluir esta notícia?")) { await adminDelete("News", id); load(); }
  };
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="heading-font text-2xl font-bold">Notícias</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:scale-105">
          <Plus className="h-4 w-4" /> Nova notícia
        </button>
      </div>

      {loading ? (
        <Loader2 className="mt-10 h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-secondary">{it.category}</span>
                  {!it.is_published && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Rascunho</span>}
                </div>
                <h3 className="mt-1 font-semibold">{it.title}</h3>
                <p className="text-xs text-muted-foreground">{it.excerpt}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEdit(it)} className="rounded-lg border border-border p-2 transition hover:bg-primary/10 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(it.id)} className="rounded-lg border border-border p-2 text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma notícia cadastrada.</p>}
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Nova notícia" : "Editar notícia"} onClose={close}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Título"><input required value={form.title} onChange={set("title")} className={inputCls} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoria"><select value={form.category} onChange={set("category")} className={inputCls}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Data"><input type="date" value={form.date} onChange={set("date")} className={inputCls} /></Field>
            </div>
            <Field label="Resumo"><input value={form.excerpt} onChange={set("excerpt")} className={inputCls} /></Field>
            <Field label="Conteúdo"><textarea rows={5} value={form.content} onChange={set("content")} className={inputCls} /></Field>
            <Field label="Imagem (URL)"><input value={form.image_url} onChange={set("image_url")} placeholder="https://..." className={inputCls} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Autor"><input value={form.author} onChange={set("author")} className={inputCls} /></Field>
              <label className="flex items-center gap-2 self-end pb-3 text-sm"><input type="checkbox" checked={form.is_published} onChange={set("is_published")} className="h-4 w-4 rounded" /> Publicado</label>
            </div>
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