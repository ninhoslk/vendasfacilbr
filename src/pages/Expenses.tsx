import React, { useState } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ExpenseDoc {
  id: string;
  description: string;
  amount: number;
  date: string;
  userId: string;
}

export default function Expenses() {
  const { data: expenses, add, remove } = useCollection<ExpenseDoc>("expenses");
  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSave = async () => {
    if (!description.trim()) { toast.error("Descrição é obrigatória"); return; }
    try {
      await add({ description: description.trim(), amount: parseFloat(amount) || 0, date } as any);
      toast.success("Despesa registrada!");
      setModalOpen(false); setDescription(""); setAmount("");
    } catch { toast.error("Erro ao salvar"); }
  };

  const handleDelete = async (id: string) => {
    try { await remove(id); toast.success("Despesa removida"); }
    catch { toast.error("Erro ao remover"); }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Despesas</h1>
          <p className="text-sm text-muted-foreground">Controle seus gastos</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Registrar Gasto
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma despesa registrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sorted.map((e) => (
              <motion.div key={e.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="glass-card rounded-2xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{e.description}</p>
                  <p className="text-sm text-muted-foreground">{new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-destructive">{fmt(e.amount)}</span>
                  <button onClick={() => handleDelete(e.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Registrar Despesa</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Descrição</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Leite condensado" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1" /></div>
              <div><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div>
            </div>
            <Button onClick={handleSave} className="w-full">Salvar Despesa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
