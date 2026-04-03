import React from "react";
import { useData } from "@/contexts/DataContext";
import { motion } from "framer-motion";
import { DollarSign, TrendingDown, TrendingUp, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function Dashboard() {
  const { sales, expenses } = useData();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const today = now.toISOString().split("T")[0];

  const monthSales = sales.filter((s) => { const d = new Date(s.date); return d.getMonth() === month && d.getFullYear() === year; });
  const monthExpenses = expenses.filter((e) => { const d = new Date(e.date); return d.getMonth() === month && d.getFullYear() === year; });
  const todaySales = sales.filter((s) => s.date === today);

  const totalRevenue = monthSales.reduce((a, s) => a + s.totalValue, 0);
  const totalExpenses = monthExpenses.reduce((a, e) => a + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const todayRevenue = todaySales.reduce((a, s) => a + s.totalValue, 0);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const stats = [
    { label: "Receitas do Mês", value: fmt(totalRevenue), icon: DollarSign, gradient: "stat-gradient-blue" },
    { label: "Despesas do Mês", value: fmt(totalExpenses), icon: TrendingDown, gradient: "stat-gradient-red" },
    { label: "Lucro Líquido", value: fmt(profit), icon: TrendingUp, gradient: "stat-gradient-green" },
    { label: "Vendas Hoje", value: fmt(todayRevenue), icon: ShoppingCart, gradient: "stat-gradient-amber" },
  ];

  // Bar chart data - last 7 days
  const barData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("pt-BR", { weekday: "short" });
    const rev = sales.filter((s) => s.date === key).reduce((a, s) => a + s.totalValue, 0);
    const exp = expenses.filter((e) => e.date === key).reduce((a, e) => a + e.amount, 0);
    return { name: label, Receitas: rev, Despesas: exp };
  });

  // Pie chart data
  const catMap: Record<string, number> = {};
  monthExpenses.forEach((e) => { catMap[e.categoryName] = (catMap[e.categoryName] || 0) + e.amount; });
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5">
          <h3 className="mb-4 font-semibold text-foreground">Receitas vs Despesas (7 dias)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="Receitas" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5">
          <h3 className="mb-4 font-semibold text-foreground">Despesas por Categoria</h3>
          {pieData.length === 0 ? (
            <div className="flex h-[260px] items-center justify-center text-muted-foreground text-sm">Sem despesas este mês</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
