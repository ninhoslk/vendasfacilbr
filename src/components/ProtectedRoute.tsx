import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// COLOQUE SEU EMAIL AQUI COMO ESCAPE DE SEGURANÇA
const ADMIN_EMAIL = "brenoalves18110@gmail.com";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signOut } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!loading && user) {
        // ESCAPE: Se for o seu e-mail de admin, permite o acesso direto sem checar o banco
        if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAllowed(true);
          setIsVerifying(false);
          return;
        }

        try {
          // Verifica se o perfil dele existe no banco de dados
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          // Se o documento NÃO existe e NÃO é o admin, expulsa
          if (!userDoc.exists()) {
            console.log("Usuário não encontrado no banco, expulsando...");
            setIsAllowed(false);
            await signOut();
          } else {
            setIsAllowed(true);
          }
        } catch (error) {
          console.error("Erro ao verificar usuário:", error);
          // Em caso de erro de conexão, deixamos passar para não travar o app
          setIsAllowed(true);
        }
      }
      setIsVerifying(false);
    };

    checkUserStatus();
  }, [user, loading, signOut]);

  if (loading || isVerifying) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
