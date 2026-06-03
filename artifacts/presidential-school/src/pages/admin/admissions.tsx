import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { LangInput } from "@/components/admin/LangInput";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface Stage { id: string; order: number; name: LangObj; description: LangObj; deadline: string; status: string }
const STATUSES = ["active", "upcoming", "completed", "closed"];
const STATUS_COLOR: Record<string, string> = { active: "bg-green-500/20 text-green-400", upcoming: "bg-blue-500/20 text-blue-400", completed: "bg-slate-500/20 text-slate-400", closed: "bg-red-500/20 text-red-400" };
const EMPTY: Omit<Stage, "id" | "order"> = { name: { uz: "", en: "", ru: "" }, description: { uz: "", en: "", ru: "" }, deadline: "", status: "upcoming" };

export default function AdminAdmissions() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const [items, setItems] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Stage | null>(null);
  const [form, setForm] = useState<Omit<Stage, "id" | "order">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => { api<{ ok: boolean; data: Stage[] }>("/admissions").then((d) => setItems(d.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (s: Stage) => { setEditing(s); setForm({ name: s.name, description: s.description, deadline: s.deadline, status: s.status }); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api(`/admissions/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/admissions", { method: "POST", body: JSON.stringify(form) });
      toast({ title: editing ? "Yangilandi" : "Qo'shildi" }); setModalOpen(false); load();
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try { await api(`/admissions/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); load(); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const reorder = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const ids = [...items];
    [ids[index], ids[next]] = [ids[next], ids[index]];
    try {
      await api("/admissions/reorder", { method: "PATCH", body: JSON.stringify({ ids: ids.map((s) => s.id) }) });
      toast({ title: "Tartib yangilandi" });
      load();
    } catch (e) {
      toast({ title: "Xato", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-xl font-bold text-white">Qabul bosqichlari</h1><p className="text-slate-400 text-sm">Qabul jarayonini boshqaring</p></div>
          <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold"><Plus className="w-4 h-4 mr-1" /> Bosqich qo'shish</Button>
        </div>

        {loading ? <div className="py-8 text-center text-slate-500">Yuklanmoqda...</div>
          : items.length === 0 ? <div className="py-8 text-center text-slate-500">Ma'lumot yo'q</div>
            : <div className="space-y-3">
              {items.map((s, idx) => (
                <div key={s.id} className="bg-[#0c1428] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <GripVertical className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-white">{s.name.uz}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[s.status] || "bg-slate-500/20 text-slate-400"}`}>{s.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">{s.description.uz}</p>
                    {s.deadline && <p className="text-xs text-amber-400">📅 Muddat: {s.deadline}</p>}
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => reorder(idx, -1)} className="w-7 h-7 text-slate-400 hover:text-amber-400"><ChevronUp className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" disabled={idx === items.length - 1} onClick={() => reorder(idx, 1)} className="w-7 h-7 text-slate-400 hover:text-amber-400"><ChevronDown className="w-3.5 h-3.5" /></Button>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(s.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Bosqichni tahrirlash" : "Yangi bosqich"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 pt-2">
            <LangInput label="Bosqich nomi" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <LangInput label="Tavsif" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Muddat</label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Holat</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select></div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-slate-400">Bekor</Button>
              <Button type="submit" disabled={saving} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold">{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)} onConfirm={remove} />
    </AdminLayout>
  );
}
