import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, Users, AlertTriangle } from "lucide-react";

// === ATENÇÃO: COLOQUE SEU E-MAIL DE ADMIN AQUI ===
const ADMIN_EMAIL = "brenoalves18110@gmail.com";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faturamento, setFaturamento] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Camada de Segurança 1: Expulsa do Front-end se não for o Admin
  useEffect(() => {
    if (!user) return; // Aguarda o Firebase carregar o usuário
    
    if (user.email !== ADMIN_EMAIL) {
      navigate("/"); // Chuta o invasor de volta para a tela inicial
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const buscarVendasGerais = async () => {
      try {
        // Tenta puxar TODAS as vendas do banco. Se não for o admin, o Firebase bloqueia aqui.
        const querySnapshot = await getDocs(collection(db, "sales"));
        const usuariosMapa: Record<string, number> = {};

        querySnapshot.forEach((doc) => {
          const venda = doc.data();
          const donoId = venda.userId || "Desconhecido";
          const valor = Number(venda.totalValue || 0);

          if (!usuariosMapa[donoId]) usuariosMapa[donoId] = 0;
          usuariosMapa[donoId] += valor;
        });

        const lista = Object.keys(usuariosMapa).map((id) => ({
          userId: id,
          totalGerado: usuariosMapa[id]
        }));

        setFaturamento(lista);
      } catch (err: any) {
        console.error("Tentativa de invasão bloqueada pelo Firebase:", err);
        setError("Acesso negado pelo servidor de segurança.");
      } finally {
        setLoading(false);
      }
    };

    buscarVendasGerais();
  }, [user]);

  // Segurança Visual: Não mostra nem o esqueleto da página se não for o admin
  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500/10 rounded-xl">
          <ShieldAlert className="text-red-500 w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Painel de Controle</h1>
          <p className="text-muted-foreground text-sm">Visão geral de todos os usuários do sistema</p>
        </div>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-2">
          <AlertTriangle />
          {error}
        </div>
      ) : loading ? (
        <p className="animate-pulse">Verificando credenciais e carregando dados...</p>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
            <Users /> Clientes Ativos ({faturamento.length})
          </div>
          {faturamento.length === 0 && <p className="text-muted-foreground">Nenhuma venda registrada ainda.</p>}
          <div className="space-y-3">
            {faturamento.map((cliente, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                <span className="font-mono text-xs text-muted-foreground">ID: {cliente.userId}</span>
                <span className="font-bold text-green-600">
                  R$ {cliente.totalGerado.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Admin;
