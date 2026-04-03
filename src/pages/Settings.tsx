import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { uploadImage } from "@/lib/imageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, Palette, Save, Loader2, User as UserIcon } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    themeColor: "#8b5cf6",
    bio: "Bem-vindo ao meu painel de vendas!",
    profilePic: ""
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            themeColor: data.themeColor || "#8b5cf6",
            bio: data.bio || "Bem-vindo ao meu painel de vendas!",
            profilePic: data.profilePic || `https://ui-avatars.com/api/?name=${data.fullName}`
          });
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    const url = await uploadImage(e.target.files[0]);
    if (url) {
      setFormData(prev => ({ ...prev, profilePic: url }));
      toast.success("Foto atualizada!");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      toast.success("Perfil salvo! A cor será aplicada ao recarregar.");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Personalize as cores e informações do seu painel.</p>
      </header>

      <div className="bg-card p-8 rounded-3xl border shadow-xl space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <img src={formData.profilePic} className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg" alt="Profile" />
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
              <Camera size={20} />
              <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-2">
            <Label className="text-lg flex items-center gap-2"><Palette size={18} className="text-primary"/> Cor do Painel</Label>
            <div className="flex gap-4 items-center">
              <input 
                type="color" 
                value={formData.themeColor} 
                onChange={(e) => setFormData(p => ({ ...p, themeColor: e.target.value }))}
                className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-muted bg-transparent"
              />
              <Input value={formData.themeColor} readOnly className="font-mono text-center text-lg" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-lg flex items-center gap-2"><UserIcon size={18} className="text-primary"/> Bio / Descrição</Label>
            <Textarea 
              value={formData.bio} 
              onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
              placeholder="Fale um pouco sobre você ou seu negócio..."
              className="h-32 rounded-2xl resize-none"
            />
          </div>

          <Button onClick={handleSave} className="w-full h-12 text-lg rounded-2xl gap-2 shadow-lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
