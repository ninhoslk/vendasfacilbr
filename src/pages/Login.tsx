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
import { sendPasswordResetEmail } from "firebase/auth";

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

  const handleResetPassword = async () => {
    if (!email) return toast.error("Digite seu e-mail para recuperar a senha");
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
        await signIn(email, password);
      } else {
        const userCredential = await signUp(email, password);
        // SALVANDO NO BANCO DE DADOS SEMPRE NO CADASTRO
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email.toLowerCase(),
          fullName: fullName,
          phone: phone,
          createdAt: new Date().toISOString()
        });
        toast.success("Conta criada com sucesso!");
      }
    } catch (err: any) {
      toast.error("Erro. Verifique os dados e tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border">
        <img src="/logo.png" alt="Logo" className="mx-auto mb-4 h-20 w-20 object-contain" />
        <h1 className="text-2xl font-bold mb-6">VendaFácil</h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {!isLogin && (
            <>
              <div><Label>Nome Completo</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
              <div><Label>Telefone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 18 999999999" required /></div>
            </>
          )}
          <div>
            <Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {isLogin && (
            <div className="flex justify-end"><button type="button" onClick={handleResetPassword} className="text-xs text-primary underline">Esqueci minha senha</button></div>
          )}
          <div>
            <Label>Senha</Label>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted-foreground">{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
          </div>
          <Button type="submit" className="w-full h-12" disabled={loading}>{loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}</Button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-6 text-sm text-primary underline">{isLogin ? "Criar conta gratuita" : "Já tenho conta"}</button>
      </motion.div>
    </div>
  );
}
