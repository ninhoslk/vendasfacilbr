import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const ADMIN_EMAIL = "brenoalves18110@gmail.com";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signOut } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAllowed, setIsAllowed] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUserStatus = async () => {
      // Se não tem usuário logado, não precisa verificar nada
      if (!user) {
        setIsVerifying(false);
        return;
      }

      // ESCAPE PARA ADMIN: Você nunca é bloqueado
      if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAllowed(true);
        setIsVerifying(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          console.log("Perfil não encontrado no Firestore. Expulsando...");
          setIsAllowed(false);
          await signOut(); // Remove o acesso de quem foi deletado
        } else {
          setIsAllowed(true);
        }
      } catch (error) {
        console.error("Erro na verificação:", error);
        // Em caso de erro de rede, permite o acesso para não travar o usuário legítimo
        setIsAllowed(true);
      }
      setIsVerifying(false);
    };

    if (!loading) {
      checkUserStatus();
    }
  }, [user, loading, signOut, location.pathname]);

  if (loading || isVerifying) {
    return <div className="h-screen flex items-center justify-center">Carregando...</div>;
  }

  // Se não estiver logado ou se foi banido (isAllowed = false)
  if (!user || !isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
