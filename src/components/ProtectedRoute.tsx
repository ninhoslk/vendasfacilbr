import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signOut } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!loading && user) {
        // Verifica se o perfil dele ainda existe no banco de dados
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        // Se o documento não existe (você apagou no admin), expulsa ele
        if (!userDoc.exists()) {
          setIsAllowed(false);
          await signOut(); // Desloga ele automaticamente
        }
      }
      setIsVerifying(false);
    };

    checkUserStatus();
  }, [user, loading, signOut]);

  if (loading || isVerifying) {
    return <div className="h-screen w-screen flex items-center justify-center">Verificando acesso...</div>;
  }

  if (!user || !isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
