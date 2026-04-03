import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { ShieldAlert, Users, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

const ADMIN_EMAIL = "seuemail@gmail.com";

export default function Admin() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      setClientes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error("Erro ao carregar lista de clientes.");
    }
    setLoading(false);
  };

  const deletarCliente = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja apagar este cliente? Os dados de vendas dele continuarão no banco, mas o perfil será removido.")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("Perfil removido!");
      carregarDados();
    } catch (err) {
      toast.error("Erro ao deletar.");
    }
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) carregarDados();
  }, [user]);

  if (user?.email !== ADMIN_EMAIL) return <div className="p-10 text-center">Acesso Proibido</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="text-red-500 w-8 h-8" />
        <h1 className="text-2xl font-bold">Painel de Clientes</h1>
      </div>

      <div className="grid gap-4">
        {loading ? <p>Carregando...</p> : clientes.map((c) => (
          <div key={c.id} className="bg-card p-4 rounded-xl border border-border flex justify-between items-center shadow-sm">
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{c.fullName || "Sem Nome"}</h3>
              <div className="flex flex-col text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Mail size={14}/> {c.email}</span>
                <span className="flex items-center gap-2"><Phone size={14}/> {c.phone || "Sem Telefone"}</span>
              </div>
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
