import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { ShieldAlert, Users, Trash2, Mail, Phone, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "seuemail@gmail.com"; // COLOQUE SEU EMAIL AQUI

export default function Admin() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setClientes(lista);
    } catch (err) {
      toast.error("Erro ao carregar lista. Verifique as regras do Firebase.");
    }
    setLoading(false);
  };

  const deletarCliente = async (id: string) => {
    if (!window.confirm("Apagar este cliente PERMANENTEMENTE?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("Cliente removido do banco de dados!");
      carregarDados();
    } catch (err) {
      toast.error("Erro ao deletar.");
    }
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) carregarDados();
  }, [user]);

  if (user?.email !== ADMIN_EMAIL) return <div className="p-20 text-center font-bold text-red-500">ACESSO NEGADO</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-600 w-8 h-8" />
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
        </div>
        <Button onClick={carregarDados} variant="outline" size="sm">Atualizar Lista</Button>
      </div>

      <div className="grid gap-4">
        {loading ? <p className="text-center py-10">Carregando usuários...</p> : 
          clientes.length === 0 ? <p className="text-center py-10 text-muted-foreground">Nenhum usuário cadastrado.</p> :
          clientes.map((c) => (
            <div key={c.id} className="bg-card p-5 rounded-xl border border-border flex justify-between items-center shadow-md hover:border-primary/50 transition-all">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">{c.fullName || "Usuário sem nome"}</h3>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><Mail size={14}/> {c.email}</span>
                  <span className="flex items-center gap-2">
                    <Phone size={14}/> {c.phone || "Não informado"}
                    {c.phone && (
                      <a href={`https://wa.me/${c.phone.replace(/\D/g,'')}`} target="_blank" className="text-primary hover:underline flex items-center gap-1 ml-2">
                         WhatsApp <ExternalLink size={12}/>
                      </a>
                    )}
                  </span>
                </div>
              </div>
              <Button variant="destructive" size="icon" onClick={() => deletarCliente(c.id)} title="Apagar Conta">
                <Trash2 size={20} />
              </Button>
            </div>
          ))
        }
      </div>
    </motion.div>
  );
}
