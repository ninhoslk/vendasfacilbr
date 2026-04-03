import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, Trash2, Mail, Phone, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "brenoalves18110@gmail.com";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Segurança: Se não for admin, manda para a Home imediatamente
  useEffect(() => {
    if (user && user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      navigate("/");
    }
  }, [user, navigate]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      setClientes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error("Erro ao carregar dados.");
    }
    setLoading(false);
  };

  const deletarCliente = async (id: string) => {
    if (!window.confirm("Apagar conta? A pessoa perderá o acesso imediatamente.")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("Usuário deletado!");
      carregarDados();
    } catch (err) {
      toast.error("Erro ao deletar.");
    }
  };

  useEffect(() => {
    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      carregarDados();
    }
  }, [user]);

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-600 w-8 h-8" />
          <h1 className="text-2xl font-bold">Painel de Clientes</h1>
        </div>
        <Button onClick={carregarDados} variant="outline" size="sm">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="grid gap-4">
        {clientes.map((c) => (
          <div key={c.id} className="bg-card p-4 rounded-xl border flex justify-between items-center shadow-sm">
            <div>
              <h3 className="font-bold">{c.fullName}</h3>
              <p className="text-sm text-muted-foreground">{c.email}</p>
              <p className="text-sm text-muted-foreground">{c.phone}</p>
            </div>
            <Button variant="destructive" size="icon" onClick={() => deletarCliente(c.id)}>
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
