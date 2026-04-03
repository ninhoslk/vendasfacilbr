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
import { Camera, Palette, Save, Loader2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    themeColor: "#8b5cf6", // Roxo padrão
    bio: "Vendedor autônomo focado em resultados.",
    profilePic: "https://ui-avatars.com/api/?name=User"
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    const url = await uploadImage(e.target.files[0]);
    if (url) {
      setFormData(prev => ({ ...prev, profilePic: url }));
      toast.success("Foto carregada!");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      toast.success("Perfil e Tema atualizados!");
      window.location.reload(); // Recarrega para aplicar a cor em tudo
    } catch (err) {
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Palette className="text-primary" /> Personalização
      </h1>

      <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
        {/* Foto de Perfil */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <img src={formData.profilePic} className="w-32 h-32 rounded-full object-cover border-4 border-primary" />
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer">
              <Camera size={20} />
              <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
            </label>
          </div>
        </div>

        {/* Escolha da Cor */}
        <div className="space-y-2">
          <Label>Cor do seu Painel</Label>
          <div className="flex gap-4">
            <input 
              type="color" 
              value={formData.themeColor} 
              onChange={(e) => setFormData(p => ({ ...p, themeColor: e.target.value }))}
              className="w-16 h-16 rounded-lg cursor-pointer bg-transparent border-none"
            />
            <Input value={formData.themeColor} readOnly className="font-mono" />
          </div>
        </div>

        {/* Biografia */}
        <div className="space-y-2">
          <Label>Descrição do Perfil</Label>
          <Textarea 
            value={formData.bio} 
            onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
            className="h-24"
          />
        </div>

        <Button onClick={handleSave} className="w-full gap-2" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
          Salvar Tudo
        </Button>
      </div>
    </div>
  );
}
