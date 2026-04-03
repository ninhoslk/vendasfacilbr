import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Mail, Lock, Eye, EyeOff, User, Phone, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";

export default function Login() {
  const { user, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  // Validação de Telefone Real (Formato BR)
  const validarTelefone = (t: string) => {
    const regex = /^\([1-9]{2}\) 9[0-9]{4}-[0-9]{4}$/;
    return regex.test(t);
  };

  const handleResetPassword = async () => {
    if (!email) return toast.error("Digite seu e-mail para recuperar a senha");
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("E-mail de recuperação enviado!");
    } catch (err) {
      toast.error("Erro ao enviar e-mail de recuperação.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && !validarTelefone(phone)) {
      toast.error("Telefone inválido! Use o formato (XX) 9XXXX-XXXX");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const userCredential = await signUp(email, password);
        const newUser = userCredential.user;
        
        // Envia verificação para garantir que o e-mail é real
        await sendEmailVerification(newUser);

        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email: email.toLowerCase(),
          fullName: fullName,
          phone: phone,
          createdAt: new Date().toISOString()
        });
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (err: any) {
      toast.error("Erro na autenticação. Verifique os dados.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-2xl font-bold">VendaFácil</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <Label>Nome Completo</Label>
                <Input placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <Label>Telefone (WhatsApp)</Label>
                <Input placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </>
          )}
          <div>
            <Label>E-mail</Label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {isLogin && (
            <div className="flex justify-end">
              <button type="button" onClick={handleResetPassword} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <HelpCircle size={12} /> Esqueci minha senha
              </button>
            </div>
          )}
          <div>
            <Label>Senha</Label>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted-foreground">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? "Processando..." : isLogin ? "Entrar" : "Criar Minha Conta"}
          </Button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-sm text-primary hover:underline">
          {isLogin ? "Ainda não tem conta? Cadastre-se" : "Já tem conta? Faça Login"}
        </button>
      </motion.div>
    </div>
  );
}
