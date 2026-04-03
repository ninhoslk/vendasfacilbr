import React from "react";
import { useCollection } from "@/hooks/useFirestore";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, TrendingUp, ShoppingCart, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SaleDoc { id: string; productName: string; quantity: number; totalValue: number; status: string; date: string; userId: string; }
interface ExpenseDoc { id: string; description: string; amount: number; date: string; userId: string; }

export default function Dashboard() {
  const { data: sales } = useCollection<SaleDoc>("sales");
  const { data: expenses } = useCollection<ExpenseDoc>("expenses");

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const today = now.toISOString().split("T")[0];

  const monthSales = sales.filter((s) => { const d = new Date(s.date); return d.getMonth() === month && d.getFullYear() === year; });
  const monthExpenses = expenses.filter((e) => { const d = new Date(e.date); return d.getMonth() === month && d.getFullYear() === year; });
  const todaySales = sales.filter((s) => s.date === today);
  const pendingSales = sales.filter((s) => s.status === "Pendente");

  const totalRevenue = monthSales.reduce((a, s) => a + s.totalValue, 0);
  const totalExpenses = monthExpenses.reduce((a, e) => a + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const todayRevenue = todaySales.reduce((a, s) => a + s.totalValue, 0);
  const pendingTotal = pendingSales.reduce((a, s) => a + s.totalValue, 0);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const stats = [
    { label: "Vendas Hoje", value: fmt(todayRevenue), icon: ShoppingCart, gradient: "stat-gradient-blue" },
    { label: "A Receber (Pendentes)", value: fmt(pendingTotal), icon: Clock, gradient: "stat-gradient-amber" },
    { label: "Despesas do Mês", value: fmt(totalExpenses), icon: TrendingDown, gradient: "stat-gradient-red" },
    { label: "Lucro Líquido", value: fmt(profit), icon: TrendingUp, gradient: "stat-gradient-green" },
  ];

  const barData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("pt-BR", { weekday: "short" });
    const rev = sales.filter((s) => s.date === key).reduce((a, s) => a + s.totalValue, 0);
    const exp = expenses.filter((e) => e.date === key).reduce((a, e) => a + e.amount, 0);
    return { name: label, Receitas: rev, Despesas: exp };
  });

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-sm text-muted-foreground">Resumo do seu negócio este mês</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.gradient}`}>
                <s.icon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-lg md:text-2xl font-bold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-5">
        <h3 className="mb-4 font-semibold text-foreground">Receitas vs Despesas (7 dias)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }} />
            <Bar dataKey="Receitas" fill="hsl(199, 89%, 48%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Despesas" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
