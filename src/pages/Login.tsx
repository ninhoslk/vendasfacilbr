import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent, type: 'in' | 'up') => {
    e.preventDefault();
    if (!email || !password) return toast.error("Preencha todos os campos.");
    setLoading(true);
    try {
      if (type === 'in') await signIn(email, password);
      else await signUp(email, password, "Novo Vendedor");
      navigate("/");
    } catch (error) {
      toast.error("Erro na autenticação. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return toast.error("Digite seu e-mail para recuperar a senha.");
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (err) {
      toast.error("Erro ao enviar e-mail. Verifique se o e-mail está correto.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center border-b mb-4">
          <CardTitle className="text-3xl font-bold text-primary">VendaFácil BR</CardTitle>
          <CardDescription>Gestão simples para vendedores autônomos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" placeholder="exemplo@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Senha</Label>
              <button onClick={handleResetPassword} type="button" className="text-xs text-primary hover:underline font-medium">
                Esqueci minha senha
              </button>
            </div>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button onClick={(e) => handleSubmit(e, 'in')} disabled={loading}>Entrar</Button>
            <Button onClick={(e) => handleSubmit(e, 'up')} variant="outline" disabled={loading}>Cadastrar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
