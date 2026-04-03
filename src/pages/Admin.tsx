import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { ShieldAlert, Users, Trash2, Mail, Phone, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "brenoalves18110@gmail.com";

export default function Admin() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Tenta buscar a coleção "users"
      const snap = await getDocs(collection(db, "users"));
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setClientes(lista);
      console.log("Usuários carregados:", lista.length);
    } catch (err: any) {
      console.error("Erro do Firebase:", err);
      toast.error("O Firebase bloqueou a leitura. Verifique as Regras (Rules).");
    }
    setLoading(false);
  };

  useEffect(() => {
    // Verifica se o usuário logado é você (em minúsculo)
    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      carregarDados();
    }
  }, [user]);

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return (
      <div className="p-20 text-center">
        <ShieldAlert className="mx-auto w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">Logue com o e-mail de administrador.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
        </div>
        <Button onClick={carregarDados} variant="outline" size="sm" className="gap-2">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Atualizar
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-center py-10">Buscando clientes no banco de dados...</p>
        ) : clientes.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-xl">
            <Users className="mx-auto w-10 h-10 text-muted-foreground mb-2" />
            <p>Nenhum cliente encontrado na coleção 'users'.</p>
            <p className="text-sm text-muted-foreground">Cadastre um novo usuário para testar.</p>
          </div>
        ) : (
          clientes.map((c) => (
            <div key={c.id} className="bg-card p-5 rounded-xl border border-border flex justify-between items-center shadow-md">
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{c.fullName || "Sem Nome"}</h3>
                <div className="flex flex-col text-sm text-muted-foreground italic">
                  <span>ID: {c.id}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm pt-2">
                  <span className="flex items-center gap-2"><Mail size={14}/> {c.email}</span>
                  <span className="flex items-center gap-2">
                    <Phone size={14}/> {c.phone || "Não informado"}
                    {c.phone && (
                      <a 
                        href={`https://wa.me/${c.phone.replace(/\D/g,'')}`} 
                        target="_blank" 
                        className="text-primary font-bold ml-2 underline"
                      >
                        Chamar no Whats
                      </a>
                    )}
                  </span>
                </div>
              </div>
              <Button variant="destructive" size="icon" onClick={() => deletarCliente(c.id)}>
                <Trash2 size={20} />
              </Button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// Função de deletar separada para manter o código limpo
async function deletarCliente(id: string) {
  if (!window.confirm("Apagar permanentemente este usuário?")) return;
  try {
    await deleteDoc(doc(db, "users", id));
    toast.success("Removido com sucesso!");
    window.location.reload();
  } catch (err) {
    toast.error("Erro ao deletar.");
  }
}
