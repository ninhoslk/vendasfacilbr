import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";

export default function Login() {
  const { user, signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  if (user) return <Navigate to="/" />;

  const resetPassword = async () => {
    if (!email) return toast.error("Digite o email");
    await sendPasswordResetEmail(auth, email);
    toast.success("Email enviado");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const cred = await signUp(email, password);

        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email,
          fullName,
          phone,
          createdAt: new Date().toISOString(),
        });

        toast.success("Conta criada!");
      }
    } catch {
      toast.error("Erro");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 border rounded-xl w-full max-w-md">
        <img src="/logo.png" className="h-16 mx-auto mb-4" />

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <div>
                <Label>Nome</Label>
                <Input onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input onChange={(e) => setPhone(e.target.value)} />
              </div>
            </>
          )}

          <div>
            <Label>Email</Label>
            <Input onChange={(e) => setEmail(e.target.value)} />
          </div>

          {isLogin && (
            <button type="button" onClick={resetPassword}>
              Esqueci senha
            </button>
          )}

          <div>
            <Label>Senha</Label>
            <Input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button className="w-full">
            {isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="mt-4 text-sm">
          {isLogin ? "Criar conta" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}
