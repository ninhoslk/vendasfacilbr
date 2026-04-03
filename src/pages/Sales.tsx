import React, { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Sales() {
  const { sales, catalogItems, addSale, deleteSale } = useData();
  const products = catalogItems.filter((i) => i.type === "product");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [totalValue, setTotalValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSelectProduct = (itemId: string) => {
    setSelectedItem(itemId);
    const product = products.find((p) => p.id === itemId);
    if (product) {
      const qty = parseInt(quantity) || 1;
      setTotalValue(String(product.defaultPrice * qty));
    }
  };

  const handleQtyChange = (v: string) => {
    setQuantity(v);
    const product = products.find((p) => p.id === selectedItem);
    if (product) setTotalValue(String(product.defaultPrice * (parseInt(v) || 1)));
  };

  const handleSave = () => {
    const product = products.find((p) => p.id === selectedItem);
    if (!product) { toast.error("Selecione um produto"); return; }
    addSale({ itemId: product.id, itemName: product.name, quantity: parseInt(quantity) || 1, totalValue: parseFloat(totalValue) || 0, date });
    toast.success("Venda registrada!");
    setModalOpen(false); setSelectedItem(""); setQuantity("1"); setTotalValue("");
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const sortedSales = [...sales].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">Registre e acompanhe suas vendas</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Registrar Venda
        </Button>
      </div>

      {sortedSales.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma venda registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedSales.map((s) => (
              <motion.div key={s.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="glass-card rounded-2xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{s.itemName}</p>
                  <p className="text-sm text-muted-foreground">{s.quantity} un · {new Date(s.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{fmt(s.totalValue)}</span>
                  <button onClick={() => { deleteSale(s.id); toast.success("Venda removida"); }}
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
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {fmt(p.defaultPrice)}</SelectItem>)}
                  {products.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">Cadastre produtos no Catálogo primeiro</div>}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantidade</Label><Input type="number" min="1" value={quantity} onChange={(e) => handleQtyChange(e.target.value)} className="mt-1" /></div>
              <div><Label>Valor Total (R$)</Label><Input type="number" step="0.01" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div>
            <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground">Salvar Venda</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
