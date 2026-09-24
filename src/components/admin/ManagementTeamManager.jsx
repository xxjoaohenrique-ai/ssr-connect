import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Loader2, Plus, Save, Trash2, Users } from "lucide-react";
import { adminCreate, adminList, adminUpdate } from "@/lib/adminApi";
import { Field, inputCls } from "./ui";

const blankMember = () => ({ name: "", role: "", bio: "" });

export default function ManagementTeamManager() {
  const [record, setRecord] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminList("ContactInfo")
      .then((rows) => {
        const current = rows[0] || null;
        setRecord(current);
        setMembers(Array.isArray(current?.management_team) ? current.management_team : []);
      })
      .catch(() => setError("Não foi possível carregar a equipe gestora."))
      .finally(() => setLoading(false));
  }, []);

  const updateMember = (index, field, value) => {
    setSaved(false);
    setMembers((current) => current.map((member, i) => i === index ? { ...member, [field]: value } : member));
  };
  const moveMember = (index, direction) => {
    setSaved(false);
    setMembers((current) => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  };

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const management_team = members.map(({ name, role, bio }) => ({
        name: name.trim(), role: role.trim(), bio: bio.trim(),
      }));
      const updated = record?.id
        ? await adminUpdate("ContactInfo", record.id, { management_team })
        : await adminCreate("ContactInfo", { management_team });
      setRecord(updated);
      setMembers(management_team);
      setSaved(true);
    } catch {
      setError("Não foi possível salvar a equipe. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Carregando equipe" />;

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></span>
        <div><h2 className="heading-font text-2xl font-bold">Equipe Gestora</h2><p className="text-sm text-muted-foreground">Atualize os integrantes exibidos em Sobre a Escola.</p></div>
      </div>

      {members.map((member, index) => (
        <fieldset key={index} className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <legend className="px-2 text-sm font-semibold">Integrante {index + 1}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome"><input className={inputCls} value={member.name} maxLength={120} required onChange={(e) => updateMember(index, "name", e.target.value)} /></Field>
            <Field label="Cargo"><input className={inputCls} value={member.role} maxLength={120} required onChange={(e) => updateMember(index, "role", e.target.value)} /></Field>
          </div>
          <Field label="Descrição"><textarea className={inputCls} rows={3} value={member.bio || ""} maxLength={500} onChange={(e) => updateMember(index, "bio", e.target.value)} /></Field>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={index === 0} onClick={() => moveMember(index, -1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-40"><ArrowUp className="h-3.5 w-3.5" /> Subir</button>
            <button type="button" disabled={index === members.length - 1} onClick={() => moveMember(index, 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:opacity-40"><ArrowDown className="h-3.5 w-3.5" /> Descer</button>
            <button type="button" onClick={() => { setSaved(false); setMembers((current) => current.filter((_, i) => i !== index)); }} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive"><Trash2 className="h-3.5 w-3.5" /> Remover</button>
          </div>
        </fieldset>
      ))}

      {!members.length && <p className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">Nenhum integrante cadastrado. Adicione a equipe real da escola.</p>}
      {members.length < 12 && <button type="button" onClick={() => { setSaved(false); setMembers((current) => [...current, blankMember()]); }} className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"><Plus className="h-4 w-4" /> Adicionar integrante</button>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {saved && <p role="status" className="flex items-center gap-2 text-sm text-secondary"><CheckCircle2 className="h-4 w-4" /> Equipe salva com sucesso.</p>}
      <div><button type="submit" disabled={saving || !!error && !record} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar equipe</button></div>
    </form>
  );
}
