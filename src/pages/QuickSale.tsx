import React, { useState } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  type: string;
  userId: string;
}

interface SaleDoc {
  id: string;
  productName: string;
  quantity: number;
  totalValue: number;
  status: string;
  date: string;
  userId: string;
}

export default function QuickSale() {
  const { data: catalog } = useCollection<CatalogItem>("catalog");
  const { add: addSale } = useCollection<SaleDoc>("sales");
  const products = catalog.filter((i) => i.type === "product");
  const [selected, setSelected] = useState<CatalogItem | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await addSale({
        productName: selected.name,
        quantity: 1,
        totalValue: selected.price,
        status: "Pago",
        date: new Date().toISOString().split("T")[0],
      } as any);
      toast.success(`Venda de ${selected.name} registrada!`);
    } catch {
      toast.error("Erro ao registrar venda");
    }
    setSaving(false);
    setSelected(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-warning" /> Venda Rápida
          </h1>
          <p className="text-sm text-muted-foreground">Toque no produto para registrar a venda</p>
        </div>
      </div>

      {products.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">Nenhum produto cadastrado no catálogo.</p>
          <Button onClick={() => navigate("/catalogo")} className="gap-2">
            <Plus className="h-4 w-4" /> Cadastrar Produtos
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {products.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(p)}
                className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[120px] hover:border-primary/50 hover:shadow-xl transition-all active:bg-primary/5 touch-manipulation"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl stat-gradient-blue">
                  <ShoppingBag className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground text-center text-sm leading-tight">{p.name}</span>
                <span className="text-primary font-bold text-lg">{fmt(p.price)}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AlertDialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <AlertDialogContent className="rounded-2xl max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Confirmar Venda</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Registrar venda de <strong>1x {selected?.name}</strong> por{" "}
              <strong className="text-primary">{selected ? fmt(selected.price) : ""}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto" disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={saving}
              className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving ? "Salvando..." : "Sim, Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
