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
import { Plus, Pencil, Trash2, Search, Minus } from "lucide-react";

type LangObj = { uz: string; en: string; ru: string };
interface Cert { id: string; name: LangObj; subject: string; level: string; quantity: number; year: number }
const EMPTY: Omit<Cert, "id"> = { name: { uz: "", en: "", ru: "" }, subject: "", level: "International", quantity: 0, year: new Date().getFullYear() };

export default function AdminCertificates() {
  const { api } = useAdmin();
  const { toast } = useToast();
  const [items, setItems] = useState<Cert[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cert | null>(null);
  const [form, setForm] = useState<Omit<Cert, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => { api<{ ok: boolean; data: Cert[] }>("/certificates").then((d) => setItems(d.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (c: Cert) => { setEditing(c); setForm({ ...c }); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await api(`/certificates/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/certificates", { method: "POST", body: JSON.stringify(form) });
      toast({ title: editing ? "Yangilandi" : "Qo'shildi" }); setModalOpen(false); load();
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const adjustQty = async (id: string, delta: number) => {
    try {
      await api(`/certificates/${id}/quantity`, { method: "PATCH", body: JSON.stringify({ delta }) });
      setItems((prev) => prev.map((c) => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c));
    } catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try { await api(`/certificates/${deleteId}`, { method: "DELETE" }); toast({ title: "O'chirildi" }); setDeleteId(null); load(); }
    catch (e) { toast({ title: "Xato", description: (e as Error).message, variant: "destructive" }); }
  };

  const filtered = items.filter((c) => c.name.uz.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-xl font-bold text-white">Sertifikatlar</h1><p className="text-slate-400 text-sm">{items.length} ta</p></div>
          <Button onClick={openAdd} className="bg-amber-400 hover:bg-amber-500 text-[#0f1b4d] font-semibold"><Plus className="w-4 h-4 mr-1" /> Qo'shish</Button>
        </div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="pl-9 bg-white/5 border-white/10 text-white" /></div>

        <div className="bg-[#0c1428] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Nomi</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Fan</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Daraja</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Soni</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden lg:table-cell">Yil</th>
              <th className="px-4 py-3 w-24"></th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Yuklanmoqda...</td></tr>
                : filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Ma'lumot yo'q</td></tr>
                  : filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-slate-200 font-medium">{c.name.uz}</td>
                      <td className="px-4 py-3 text-slate-300 hidden md:table-cell">{c.subject}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.level === "International" ? "bg-blue-400/20 text-blue-400" : "bg-green-400/20 text-green-400"}`}>{c.level}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => adjustQty(c.id, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-slate-400"><Minus className="w-3 h-3" /></button>
                          <span className="text-white font-semibold w-8 text-center">{c.quantity}</span>
                          <button onClick={() => adjustQty(c.id, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-slate-400"><Plus className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{c.year}</td>
                      <td className="px-4 py-3"><div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(c)} className="w-7 h-7 hover:bg-amber-400/10 hover:text-amber-400 text-slate-400"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(c.id)} className="w-7 h-7 hover:bg-red-500/10 hover:text-red-400 text-slate-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0c1428] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Tahrirlash" : "Yangi sertifikat"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4 pt-2">
            <LangInput label="Nomi" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Fan</label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Daraja</label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0c1428] border-white/10 text-white">
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-slate-300">Soni</label><Input type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div className="space-y-1"><label className="text-sm text-slate-300">Yil</label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
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
