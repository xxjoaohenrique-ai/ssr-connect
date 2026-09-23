import { useEffect, useState } from "react";
import { Briefcase, Loader2, Check, X, Save } from "lucide-react";
import { adminList, adminUpdate } from "@/lib/adminApi";
import { Modal, Field, inputCls } from "./ui";

// Gestão de professores: aprova cadastros pendentes e define as turmas que cada
// professor pode acessar. Necessário porque o auto-registro cria a conta inativa
// e sem turmas (ver portalApi.teacherRegister) — só o admin libera o acesso.
export default function TeacherManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [turmas, setTurmas] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await adminList("Teacher", { sort: "-created_date" })); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (t) => {
    try { await adminUpdate("Teacher", t.id, { is_active: !t.is_active }); load(); }
    catch (e) { console.error(e); }
  };
  const openTurmas = (t) => { setEditing(t); setTurmas(t.turmas || ""); };
  const saveTurmas = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await adminUpdate("Teacher", editing.id, { turmas, is_active: true }); setEditing(null); load(); }
    catch (er) { console.error(er); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Briefcase className="h-6 w-6" /></span>
        <div>
          <h2 className="heading-font text-2xl font-bold">Professores</h2>
          <p className="text-sm text-muted-foreground">Aprove cadastros pendentes e defina as turmas de cada professor.</p>
        </div>
      </div>

      {loading ? (
        <Loader2 className="mt-10 h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${t.is_active ? "bg-secondary/10 text-secondary" : "bg-amber-500/10 text-amber-600"}`}>{t.is_active ? "Ativo" : "Pendente"}</span>
                  {t.disciplines && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{t.disciplines}</span>}
                </div>
                <h3 className="mt-1 font-semibold">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.email}</p>
                {t.turmas && <p className="mt-1 text-xs text-muted-foreground">Turmas: {t.turmas}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openTurmas(t)} className="rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-primary/10 hover:text-primary">Turmas</button>
                <button onClick={() => toggleActive(t)} className={`inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition ${t.is_active ? "text-destructive hover:bg-destructive/10" : "text-secondary hover:bg-secondary/10"}`}>
                  {t.is_active ? <><X className="h-4 w-4" /> Desativar</> : <><Check className="h-4 w-4" /> Aprovar</>}
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum professor cadastrado.</p>}
        </div>
      )}

      {editing && (
        <Modal title={`Turmas de ${editing.name}`} onClose={() => setEditing(null)}>
          <form onSubmit={saveTurmas} className="space-y-4">
            <Field label="Turmas (separadas por vírgula)"><input value={turmas} onChange={(e) => setTurmas(e.target.value)} placeholder="Ex.: 1º Ano A, 2º Ano B" className={inputCls} /></Field>
            <p className="text-xs text-muted-foreground">Salvar já aprova o professor (fica ativo) e libera o acesso aos alunos das turmas informadas.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar e aprovar"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}