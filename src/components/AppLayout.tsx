import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  FileBarChart,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Heart,
} from "lucide-react";

const links = [
  { to: "/", label: "Venda Rápida", icon: ShoppingCart },
  { to: "/visao-geral", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/catalogo", label: "Catálogo", icon: Package },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/despesas", label: "Despesas", icon: Receipt },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/doacao", label: "Apoiar Projeto", icon: Heart },
];

export default function AppLayout() {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card p-4">
        <div className="mb-8 flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-10 rounded-lg" />
          <span className="text-lg font-bold">VendaFácil</span>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`
              }
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t pt-4 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-muted"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </button>

          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-500/10"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* MOBILE */}
      <div className="flex flex-1 flex-col">
        <header className="lg:hidden flex justify-between items-center p-3 border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="h-8 w-8" />
            <span className="font-bold">VendaFácil</span>
          </div>

          <button onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </header>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden p-4 border-b bg-card"
            >
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block py-2"
                >
                  {l.label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
