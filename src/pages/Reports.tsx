import React from "react";
import { useCollection } from "@/hooks/useFirestore";
import { motion } from "framer-motion";
import { Download, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SaleDoc { id: string; productName: string; quantity: number; totalValue: number; status: string; date: string; userId: string; }
interface ExpenseDoc { id: string; description: string; amount: number; date: string; userId: string; }

export default function Reports() {
  const { data: sales } = useCollection<SaleDoc>("sales");
  const { data: expenses } = useCollection<ExpenseDoc>("expenses");

  const allEntries = [
    ...sales.map((s) => ({ date: s.date, description: s.productName, type: "Receita" as const, value: s.totalValue })),
    ...expenses.map((e) => ({ date: e.date, description: e.description, type: "Despesa" as const, value: -e.amount })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const exportCSV = () => {
    const header = "Data,Descrição,Tipo,Valor\n";
    const rows = allEntries.map((e) => `${e.date},"${e.description}",${e.type},${e.value}`).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "relatorio_vendafacil.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado!");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Fluxo de caixa completo</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {allEntries.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Sem dados para exibir.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody>
                {allEntries.map((e, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground">{new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3 text-foreground">{e.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${e.type === "Receita" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                        {e.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${e.value >= 0 ? "text-accent" : "text-destructive"}`}>{fmt(Math.abs(e.value))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
