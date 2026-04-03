import React, { useState } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Plus, Trash2, Camera, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { uploadImage } from "@/lib/imageUpload";

export default function Catalog() {
  const { user } = useAuth();
  const { data: items, add, remove } = useCollection<any>("catalog");
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [tempImage, setTempImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!newName || !newPrice) return toast.error("Preencha o nome e o preço.");
    setUploading(true);
    
    let imageUrl = "";
    if (tempImage) {
      imageUrl = await uploadImage(tempImage);
    }

    try {
      await add({
        name: newName,
        price: parseFloat(newPrice),
        type: "product",
        imageUrl,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setModalOpen(false);
      setNewName(""); setNewPrice(""); setTempImage(null);
      toast.success("Produto adicionado!");
    } catch (e) {
      toast.error("Erro ao salvar produto.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catálogo de Produtos</h1>
        <Button onClick={() => setModalOpen(true)} className="gap-2 rounded-full">
          <Plus size={18} /> Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-card p-4 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
              {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-primary font-bold">R$ {item.price.toFixed(2)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(item.id)} className="text-destructive"><Trash2 size={18}/></Button>
          </div>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>Cadastrar Produto</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4 text-center">
             <label className="w-24 h-24 mx-auto border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted overflow-hidden">
                {tempImage ? <img src={URL.createObjectURL(tempImage)} className="w-full h-full object-cover" /> : <><Camera className="text-muted-foreground"/><span className="text-xs">Foto</span></>}
                <input type="file" className="hidden" onChange={e => setTempImage(e.target.files?.[0] || null)} accept="image/*" />
             </label>
             <div className="text-left space-y-4">
               <div><Label>Nome do Produto</Label><Input value={newName} onChange={e => setNewName(e.target.value)} /></div>
               <div><Label>Preço de Venda (R$)</Label><Input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} /></div>
             </div>
             <Button onClick={handleSave} className="w-full" disabled={uploading}>
               {uploading ? <Loader2 className="animate-spin mr-2"/> : "Salvar Produto"}
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
