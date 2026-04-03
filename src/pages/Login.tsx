import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, Phone, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleResetPassword = async () => {
    if (!email) return toast.error("Digite seu e-mail");
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("E-mail de recuperação enviado!");
    } catch (err) {
      toast.error("Erro ao enviar e-mail.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN NORMAL
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Bem-vindo!");
      } else {
        // CADASTRO NOVO
        console.log("Iniciando cadastro para:", email);
        
        // 1. Cria o usuário na Autenticação
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        console.log("Usuário criado no Auth com ID:", newUser.uid);

        // 2. Tenta gravar no Firestore (users)
        try {
          await setDoc(doc(db, "users", newUser.uid), {
            uid: newUser.uid,
            email: email.toLowerCase(),
            fullName: fullName || "Usuário Novo",
            phone: phone || "Não informado",
            createdAt: new Date().toISOString()
          });
          console.log("Dados gravados no Firestore com sucesso!");
          toast.success("Conta criada e dados salvos!");
        } catch (firestoreError: any) {
          console.error("Erro ao gravar no Firestore:", firestoreError);
          toast.error("Conta criada, mas houve um erro ao salvar seus dados de perfil.");
        }
      }
    } catch (authError: any) {
      console.error("Erro na Autenticação:", authError.code);
      const msg = authError.code === "auth/email-already-in-use" ? "Este e-mail já está em uso." : "Erro ao autenticar. Verifique os dados.";
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border">
        <img src="/logo.png" alt="Logo" className="mx-auto mb-4 h-20 w-20 object-contain" />
        <h1 className="text-2xl font-bold mb-6 text-center">VendaFácil</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <Label>Nome Completo</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Seu Nome" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Ex: 11 999999999" />
              </div>
            </>
          )}
          <div>
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
          </div>
          <div>
            <Label>Senha</Label>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted-foreground">
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          
          {isLogin && (
            <div className="text-right">
              <button type="button" onClick={handleResetPassword} className="text-xs text-primary hover:underline">Esqueci minha senha</button>
            </div>
          )}

          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
          </Button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-sm text-primary hover:underline">
          {isLogin ? "Ainda não tem conta? Cadastre-se" : "Já tem conta? Faça Login"}
        </button>
      </motion.div>
    </div>
  );
}
