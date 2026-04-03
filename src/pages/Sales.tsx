import React, { useState } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CatalogItem { id: string; name: string; price: number; type: string; userId: string; }
interface SaleDoc { id: string; productName: string; quantity: number; totalValue: number; status: string; date: string; userId: string; }

export default function Sales() {
  const { data: catalog } = useCollection<CatalogItem>("catalog");
  const { data: sales, add, remove } = useCollection<SaleDoc>("sales");
  const products = catalog.filter((i) => i.type === "product");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [totalValue, setTotalValue] = useState("");
  const [status, setStatus] = useState("Pago");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSelectProduct = (itemId: string) => {
    setSelectedItem(itemId);
    const product = products.find((p) => p.id === itemId);
    if (product) setTotalValue(String(product.price * (parseInt(quantity) || 1)));
  };

  const handleQtyChange = (v: string) => {
    setQuantity(v);
    const product = products.find((p) => p.id === selectedItem);
    if (product) setTotalValue(String(product.price * (parseInt(v) || 1)));
  };

  const handleSave = async () => {
    const product = products.find((p) => p.id === selectedItem);
    if (!product) { toast.error("Selecione um produto"); return; }
    try {
      await add({
        productName: product.name,
        quantity: parseInt(quantity) || 1,
        totalValue: parseFloat(totalValue) || 0,
        status,
        date,
      } as any);
      toast.success("Venda registrada!");
      setModalOpen(false); setSelectedItem(""); setQuantity("1"); setTotalValue("");
    } catch { toast.error("Erro ao salvar"); }
  };

  const handleDelete = async (id: string) => {
    try { await remove(id); toast.success("Venda removida"); }
    catch { toast.error("Erro ao remover"); }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const sorted = [...sales].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">Registre e acompanhe suas vendas</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Registrar Venda
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma venda registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sorted.map((s) => (
              <motion.div key={s.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="glass-card rounded-2xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{s.productName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm text-muted-foreground">{s.quantity} un · {new Date(s.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "Pago" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{fmt(s.totalValue)}</span>
                  <button onClick={() => handleDelete(s.id)}
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
          <DialogHeader><DialogTitle>Registrar Venda</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Produto</Label>
              <Select value={selectedItem} onValueChange={handleSelectProduct}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {fmt(p.price)}</SelectItem>)}
                  {products.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">Cadastre produtos no Catálogo primeiro</div>}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantidade</Label><Input type="number" min="1" value={quantity} onChange={(e) => handleQtyChange(e.target.value)} className="mt-1" /></div>
              <div><Label>Valor Total (R$)</Label><Input type="number" step="0.01" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div>
            </div>
            <Button onClick={handleSave} className="w-full">Salvar Venda</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
