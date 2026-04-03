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
import { Camera, Palette, Save, Loader2, User } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    themeColor: "#8b5cf6",
    bio: "Vendedor autônomo focado em resultados.",
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
            bio: data.bio || "Vendedor autônomo focado em resultados.",
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
      toast.success("Foto carregada com sucesso!");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      toast.success("Perfil atualizado! Recarregue para ver as mudanças.");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Personalização</h1>
        <p className="text-muted-foreground">Deixe o painel com a sua cara.</p>
      </header>

      <div className="bg-card p-6 rounded-3xl border shadow-xl space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <img src={formData.profilePic} className="w-32 h-32 rounded-full object-cover border-4 border-primary" alt="Profile" />
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:scale-110 transition-transform">
              <Camera size={20} />
              <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label className="flex items-center gap-2"><Palette size={16}/> Cor Principal do Tema</Label>
            <div className="flex gap-4">
              <input 
                type="color" 
                value={formData.themeColor} 
                onChange={(e) => setFormData(p => ({ ...p, themeColor: e.target.value }))}
                className="w-16 h-16 rounded-xl cursor-pointer bg-transparent border-none"
              />
              <Input value={formData.themeColor} readOnly className="font-mono text-center" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-2"><User size={16}/> Descrição (Bio)</Label>
            <Textarea 
              value={formData.bio} 
              onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
              placeholder="Ex: Consultora de Beleza | Pronta entrega"
              className="h-24"
            />
          </div>

          <Button onClick={handleSave} className="w-full h-12 rounded-xl gap-2" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
