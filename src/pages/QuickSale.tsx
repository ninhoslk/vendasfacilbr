import React, { useState } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function QuickSale() {
  const { data: catalog } = useCollection<any>("catalog");
  const { add: addSale } = useCollection<any>("sales");
  const products = catalog.filter((i: any) => i.type === "product");
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving] = useState(false);

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
        userId: selected.userId
      });
      toast.success("Venda registrada!");
      setSelected(null);
    } catch (e) {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="text-yellow-500 fill-yellow-500" />
        <h1 className="text-2xl font-bold italic uppercase tracking-tighter">Venda Rápida</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={p.id}
            onClick={() => setSelected(p)}
            className="flex flex-col items-center p-4 bg-card rounded-3xl border shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 overflow-hidden border">
              {p.imageUrl ? (
                <img src={p.imageUrl} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="text-primary" />
              )}
            </div>
            <span className="font-bold text-center text-sm line-clamp-1">{p.name}</span>
            <span className="text-primary font-black">{fmt(p.price)}</span>
          </motion.button>
        ))}
      </div>

      <AlertDialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <AlertDialogContent className="rounded-3xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Venda</AlertDialogTitle>
            <AlertDialogDescription>Registrar venda de 1x <b>{selected?.name}</b>?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={saving} className="bg-primary">
              {saving ? "Salvando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
