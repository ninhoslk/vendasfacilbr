import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ShieldAlert, Trash2, Mail, Phone, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
      toast.error("Erro ao carregar dados.");
    }
    setLoading(false);
  };

  useEffect(() => { 
    if (user?.email === 'brenoalves18110@gmail.com') {
      carregarDados(); 
    }
  }, [user]);

  if (user?.email !== 'brenoalves18110@gmail.com') {
    return <div className="h-screen flex items-center justify-center font-bold text-red-500">ACESSO NEGADO.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-card p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-red-600">Admin Control</h1>
            <p className="text-muted-foreground">{clientes.length} vendedores cadastrados</p>
          </div>
        </div>
        <Button onClick={carregarDados} variant="outline" className="rounded-xl">
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientes.map((c) => (
          <div key={c.id} className="bg-card p-5 rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
            
            <div className="flex items-center gap-4">
              <img src={c.profilePic || `https://ui-avatars.com/api/?name=${c.fullName}`} className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
              <div>
                <h3 className="font-bold text-lg">{c.fullName}</h3>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.themeColor || '#8b5cf6' }}></div>
                   <span className="text-xs font-mono">{c.themeColor || '#8b5cf6'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground border-t pt-4">
              <div className="flex items-center gap-2"><Mail size={14}/> {c.email}</div>
              <div className="flex items-center gap-2"><Phone size={14}/> {c.phone}</div>
              <p className="mt-2 text-xs bg-muted p-2 rounded-lg italic text-foreground">"{c.bio || 'Sem descrição.'}"</p>
            </div>

            <Button 
              variant="destructive" 
              className="w-full rounded-xl gap-2 mt-2"
              onClick={async () => {
                if(confirm(`ATENÇÃO: Deletar ${c.fullName}?`)) {
                  await deleteDoc(doc(db, "users", c.id));
                  carregarDados();
                  toast.success("Conta removida com sucesso!");
                }
              }}
            >
              <Trash2 size={16} /> Excluir Conta do Vendedor
            </Button>
          </div>
        ))}
        {clientes.length === 0 && !loading && <p className="text-center col-span-2 text-muted-foreground">Nenhum vendedor encontrado.</p>}
      </div>
    </div>
  );
}
