import React, { useState, useEffect } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Receipt, FileBarChart,
  LogOut, Menu, X, Settings, ShieldCheck
} from "lucide-react";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // APLICAR O TEMA DO USUÁRIO
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().themeColor) {
          document.documentElement.style.setProperty('--primary', snap.data().themeColor);
        }
      }
    };
    loadUserTheme();
  }, [user]);

  const links = [
    { to: "/", label: "Venda Rápida", icon: ShoppingCart },
    { to: "/catalogo", label: "Catálogo", icon: Package },
    { to: "/vendas", label: "Vendas", icon: ShoppingCart },
    { to: "/despesas", label: "Despesas", icon: Receipt },
    { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
    { to: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  if (user?.email === 'brenoalves18110@gmail.com') {
    links.push({ to: "/admin", label: "Admin", icon: ShieldCheck });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card p-4">
        <div className="mb-8 p-4 font-bold text-2xl text-primary tracking-tight">VendaFácil</div>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted"}`}
            >
              <l.icon size={20} /> {l.label}
            </NavLink>
          ))}
        </nav>
        <Button onClick={() => signOut()} variant="ghost" className="justify-start gap-3 text-destructive hover:bg-destructive/10">
          <LogOut size={18} /> Sair
        </Button>
      </aside>

      {/* Mobile e Main */}
      <div className="flex flex-1 flex-col">
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
          <span className="font-bold text-primary">VendaFácil</span>
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        </header>
        
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="lg:hidden bg-card border-b overflow-hidden px-4 py-2">
               {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 text-sm font-medium">{l.label}</NavLink>
               ))}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
