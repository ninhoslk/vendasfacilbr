import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        // 1. Cria o usuário no Auth
        const userCredential = await signUp(email, password);
        const newUser = userCredential.user;

        // 2. Salva Nome e Telefone no Firestore
        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email: email,
          fullName: fullName,
          phone: phone,
          createdAt: new Date().toISOString()
        });
        toast.success("Conta criada com sucesso!");
      }
    } catch (err: any) {
      toast.error("Erro na autenticação. Verifique os dados.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 border border-border shadow-xl bg-card">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl stat-gradient-blue text-white bg-primary">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">VendaFácil</h1>
            <p className="text-sm text-muted-foreground">{isLogin ? "Bem-vindo de volta!" : "Crie sua conta gratuita"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label>Nome Completo</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="João Silva" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label>Telefone (WhatsApp)</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" required />
                  </div>
                </div>
              </>
            )}
            <div>
              <Label>E-mail</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label>Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted-foreground">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? "Processando..." : isLogin ? "Entrar" : "Finalizar Cadastro"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm">
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-semibold">
              {isLogin ? "Criar uma nova conta" : "Já tenho uma conta"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
