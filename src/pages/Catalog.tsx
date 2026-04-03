import React, { useState } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Package, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  type: "product" | "expense";
  userId: string;
}

export default function Catalog() {
  const { data: catalogItems, add, update, remove } = useCollection<CatalogItem>("catalog");
  const [tab, setTab] = useState<"product" | "expense">("product");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const items = catalogItems.filter((i) => i.type === tab);

  const openAdd = () => { setEditId(null); setName(""); setPrice(""); setModalOpen(true); };
  const openEdit = (id: string) => {
    const item = catalogItems.find((i) => i.id === id);
    if (!item) return;
    setEditId(id); setName(item.name); setPrice(String(item.price)); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    const p = parseFloat(price) || 0;
    try {
      if (editId) {
        await update(editId, { name: name.trim(), price: p });
        toast.success("Item atualizado!");
      } else {
        await add({ name: name.trim(), price: p, type: tab } as any);
        toast.success("Item adicionado!");
      }
      setModalOpen(false);
    } catch { toast.error("Erro ao salvar"); }
  };

  const handleDelete = async (id: string) => {
    try { await remove(id); toast.success("Item removido!"); }
    catch { toast.error("Erro ao remover"); }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Itens</h1>
          <p className="text-sm text-muted-foreground">Pré-cadastre produtos e gastos frequentes</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("product")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${tab === "product" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          <Package className="h-4 w-4" /> Meus Produtos
        </button>
        <button onClick={() => setTab("expense")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${tab === "expense" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          <Receipt className="h-4 w-4" /> Gastos Frequentes
        </button>
      </div>

      {items.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">Nenhum item cadastrado. Clique em "Adicionar" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{fmt(item.price)}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item.id)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Item" : "Novo Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Brigadeiro Gourmet" className="mt-1" /></div>
            <div><Label>{tab === "product" ? "Preço Padrão (R$)" : "Custo Padrão (R$)"}</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="mt-1" /></div>
            <Button onClick={handleSave} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
