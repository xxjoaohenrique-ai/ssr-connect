import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Save, Loader2, Users, RefreshCw, KeyRound, Copy, Check, X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { adminList, adminCreate, adminUpdate, adminDelete, adminBulkCreate } from "@/lib/adminApi";
import { Modal, Field, inputCls } from "./ui";
import { genLogin, genPassword, sha256 } from "@/lib/alunoAuth";
import { COURSE_OPTIONS } from "@/lib/courses";
import PdfNamesImport from "./PdfNamesImport";

const empty = { name: "", turma: "", course: "", enrollment: "", is_active: true };

export default function StudentManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [turmaFilter, setTurmaFilter] = useState("Todas");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState({ turma: "", course: "", names: "" });
  const [creds, setCreds] = useState(null); // [{name, login, password}]
  const [copied, setCopied] = useState(null);

  const load = async () => {
    setLoading(true);
    const all = await adminList("Student", { sort: "turma" });
    setItems(all);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const turmas = ["Todas", ...Array.from(new Set(items.map((i) => i.turma).filter(Boolean))).sort()];
  const filtered = turmaFilter === "Todas" ? items : items.filter((i) => i.turma === turmaFilter);
  const existingLogins = items.map((i) => i.student_login);

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (it) => { setForm({ name: it.name, turma: it.turma, course: it.course || "", enrollment: it.enrollment || "", is_active: it.is_active }); setEditing(it.id); };
  const close = () => setEditing(null);
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  // Criar / editar um aluno. Na criação, gera login + senha e mostra as credenciais.
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editing === "new") {
      const login = genLogin(form.name, existingLogins);
      const password = genPassword();
      const password_hash = await sha256(password);
      await adminCreate("Student", {
        name: form.name.trim(),
        turma: form.turma.trim(),
        course: form.course,
        student_login: login,
        password_hash,
        enrollment: form.enrollment.trim(),
        is_active: form.is_active,
      });
      setCreds([{ name: form.name.trim(), login, password }]);
    } else {
      await adminUpdate("Student", editing, {
        name: form.name.trim(),
        turma: form.turma.trim(),
        course: form.course,
        enrollment: form.enrollment.trim(),
        is_active: form.is_active,
      });
    }
    setSaving(false); setEditing(null); load();
  };

  // Gerar nova senha para um aluno e mostrar a senha em texto.
  const regenerate = async (it) => {
    const password = genPassword();
    const password_hash = await sha256(password);
    await adminUpdate("Student", it.id, { password_hash, password_changed: false });
    setCreds([{ name: it.name, login: it.student_login, password }]);
    load();
  };

  const remove = async (id) => {
    if (confirm("Excluir este aluno?")) { await adminDelete("Student", id); load(); }
  };

  // Adicionar uma turma inteira: cola nomes (um por linha), gera login+senha para todos.
  const saveBulk = async (e) => {
    e.preventDefault();
    const names = bulk.names.split("\n").map((n) => n.trim()).filter(Boolean);
    if (!bulk.turma.trim() || names.length === 0) return;
    setSaving(true);
    const used = [...existingLogins];
    const records = [];
    const generated = [];
    for (const name of names) {
      const login = genLogin(name, used);
      used.push(login);
      const password = genPassword();
      generated.push({ name, login, password });
      records.push({
        name,
        turma: bulk.turma.trim(),
        course: bulk.course,
        student_login: login,
        password_hash: await sha256(password),
        is_active: true,
      });
    }
    await adminBulkCreate("Student", records);
    setSaving(false); setBulkOpen(false); setBulk({ turma: "", course: "", names: "" });
    setCreds(generated);
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="heading-font text-2xl font-bold">Alunos</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setBulkOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-muted">
            <Users className="h-4 w-4" /> Adicionar turma
          </button>
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:scale-105">
            <Plus className="h-4 w-4" /> Novo aluno
          </button>
        </div>
      </div>

      {/* Caixa de credenciais geradas */}
      {creds && (
        <div className="mt-6 rounded-2xl border border-secondary/40 bg-secondary/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-secondary">Credenciais geradas — entregue ao aluno:</p>
            <button onClick={() => setCreds(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="whitespace-nowrap py-2 pr-4">Aluno</th>
                  <th className="whitespace-nowrap py-2 pr-4">Login</th>
                  <th className="whitespace-nowrap py-2 pr-4">Senha</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {creds.map((c, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="whitespace-nowrap py-2 pr-4">{c.name}</td>
                    <td className="whitespace-nowrap py-2 pr-4 font-mono">{c.login}</td>
                    <td className="whitespace-nowrap py-2 pr-4 font-mono">{c.password}</td>
                    <td className="py-2">
                      <button onClick={() => copy(`${c.login} / ${c.password}`, i)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted">
                        {copied === i ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />} Copiar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">A senha é exibida apenas agora. Guarde-a — ela não pode ser recuperada depois, apenas redefinida.</p>
        </div>
      )}

      {/* Filtro de turmas */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {turmas.map((t) => (
          <button key={t} onClick={() => setTurmaFilter(t)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${turmaFilter === t ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-primary"}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="mt-10 h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-secondary">{it.turma}</span>
                  {it.course && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-600">{it.course}</span>}
                  {it.password_changed && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">Senha trocada</span>}
                  {!it.is_active && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Inativo</span>}
                </div>
                <h3 className="mt-1 font-semibold">{it.name}</h3>
                <p className="break-all text-xs text-muted-foreground font-mono">login: {it.student_login}{it.enrollment ? ` · matrícula: ${it.enrollment}` : ""}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => regenerate(it)} title="Gerar nova senha" className="rounded-lg border border-border p-2 transition hover:bg-primary/10 hover:text-primary"><KeyRound className="h-4 w-4" /></button>
                <button onClick={() => openEdit(it)} className="rounded-lg border border-border p-2 transition hover:bg-primary/10 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(it.id)} className="rounded-lg border border-border p-2 text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum aluno cadastrado.</p>}
        </div>
      )}

      {/* Modal novo / editar aluno */}
      {editing && (
        <Modal title={editing === "new" ? "Novo aluno" : "Editar aluno"} onClose={close}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Nome do aluno"><input required value={form.name} onChange={set("name")} className={inputCls} /></Field>
            <Field label="Turma"><input required value={form.turma} onChange={set("turma")} placeholder="Ex.: 1º Ano A" list="turmas-list" className={inputCls} />
              <datalist id="turmas-list">{turmas.filter((t) => t !== "Todas").map((t) => <option key={t} value={t} />)}</datalist>
            </Field>
            <Field label="Curso"><select value={form.course} onChange={set("course")} className={inputCls}><option value="">Selecione o curso...</option>{COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="Matrícula (opcional)"><input value={form.enrollment} onChange={set("enrollment")} className={inputCls} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={set("is_active")} className="h-4 w-4 rounded" /> Ativo</label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={close} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}</button>
            </div>
            {editing === "new" && <p className="text-xs text-muted-foreground">O login e a senha serão gerados automaticamente ao salvar.</p>}
          </form>
        </Modal>
      )}

      {/* Modal adicionar turma inteira */}
      {bulkOpen && (
        <Modal title="Adicionar turma inteira" onClose={() => setBulkOpen(false)}>
          <form onSubmit={saveBulk} className="space-y-4">
            <Field label="Turma"><input required value={bulk.turma} onChange={(e) => setBulk((b) => ({ ...b, turma: e.target.value }))} placeholder="Ex.: 1º Ano A" className={inputCls} /></Field>
            <Field label="Curso"><select value={bulk.course} onChange={(e) => setBulk((b) => ({ ...b, course: e.target.value }))} className={inputCls}><option value="">Selecione o curso...</option>{COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="Importar ficha em PDF (opcional)">
              <PdfNamesImport onExtracted={(names) => setBulk((b) => ({ ...b, names: names.join("\n") }))} />
            </Field>
            <Field label="Nomes dos alunos (um por linha)">
              <textarea rows={8} required value={bulk.names} onChange={(e) => setBulk((b) => ({ ...b, names: e.target.value }))} placeholder={"João Silva\nMaria Souza\n..."} className={inputCls} />
            </Field>
            <p className="text-xs text-muted-foreground">Será gerado um login e uma senha automáticos para cada aluno. As credenciais aparecem logo após o cadastro para você copiar e entregar.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setBulkOpen(false)} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />} Cadastrar turma</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}