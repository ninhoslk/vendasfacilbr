import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Copy, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// === COLOQUE SUAS INFORMAÇÕES DO PIX AQUI ===
const CHAVE_PIX = "seu-email-ou-cpf-aqui"; 
const NOME_RECEBEDOR = "Seu Nome Completo";
const CIDADE_RECEBEDOR = "Sua Cidade";

const Doacao = () => {
  const [valor, setValor] = useState<string>("10.00");
  const [copiado, setCopiado] = useState(false);

  // Função que monta o código "PIX Copia e Cola" (Padrão EMV BR Code)
  const gerarPayloadPix = (valor: string) => {
    const valorFormatado = parseFloat(valor).toFixed(2);
    const payloadFormat = `00020126360014br.gov.bcb.pix0114${CHAVE_PIX}520400005303986540${valorFormatado.length < 10 ? '0'+valorFormatado.length : valorFormatado.length}${valorFormatado}5802BR59${NOME_RECEBEDOR.length < 10 ? '0'+NOME_RECEBEDOR.length : NOME_RECEBEDOR.length}${NOME_RECEBEDOR}60${CIDADE_RECEBEDOR.length < 10 ? '0'+CIDADE_RECEBEDOR.length : CIDADE_RECEBEDOR.length}${CIDADE_RECEBEDOR}62070503***6304`;
    return payloadFormat; 
  };

  const pixCopiaECola = gerarPayloadPix(valor);

  const copiarPix = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Heart className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        <h1 className="text-2xl font-bold">Apoie o Projeto</h1>
        <p className="text-muted-foreground text-sm">
          Este sistema é gratuito! Se ele te ajuda nas suas vendas, considere fazer uma doação para manter os servidores no ar.
        </p>
      </div>

      <div className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex gap-2 justify-center">
          {[5, 10, 20, 50].map((v) => (
            <Button key={v} variant={valor === v.toFixed(2) ? "default" : "outline"} onClick={() => setValor(v.toFixed(2))}>
              R$ {v}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Outro valor (R$)</label>
          <Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Ex: 15.00" />
        </div>

        {parseFloat(valor) > 0 && (
          <div className="pt-4 flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-xl border-2 border-primary/20">
              <QRCodeSVG value={pixCopiaECola} size={200} />
            </div>
            <Button onClick={copiarPix} className="w-full h-12 text-lg font-bold" variant={copiado ? "secondary" : "default"}>
              {copiado ? <><CheckCircle className="mr-2" /> Copiado!</> : <><Copy className="mr-2" /> Copiar Código PIX</>}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Doacao;
