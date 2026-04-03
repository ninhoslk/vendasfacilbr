import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Copy, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// === INFORMAÇÕES DO SEU PIX ===
const CHAVE_PIX = "44840223890"; // Seu CPF
const NOME_RECEBEDOR = "Breno Barbudo Alves"; // Seu Nome
const CIDADE_RECEBEDOR = "Dracena"; // Sua Cidade

// Função essencial para o Banco aceitar o PIX (Cálculo de Verificação CRC16)
function calcularCRC16(payload: string): string {
  let result = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    result ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((result & 0x8000) !== 0) result = (result << 1) ^ 0x1021;
      else result <<= 1;
    }
  }
  return (result & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

const Doacao = () => {
  const [valor, setValor] = useState<string>("10.00");
  const [copiado, setCopiado] = useState(false);

  // Função que monta o código "PIX Copia e Cola" oficial (Padrão EMV BR Code)
  const gerarPayloadPix = (valorDesejado: string) => {
    const v = parseFloat(valorDesejado).toFixed(2);
    const nomeLimitado = NOME_RECEBEDOR.substring(0, 25).toUpperCase();
    const cidadeLimitada = CIDADE_RECEBEDOR.substring(0, 15).toUpperCase();

    // Estrutura do Payload seguindo normas do Bacen
    let payload = "000201"; // Versão do payload
    // 26 (Tamanho da chave) + 0014 (padrão) + 01 (tamanho chave) + chave
    const merchantAccount = `0014br.gov.bcb.pix01${CHAVE_PIX.length.toString().padStart(2, "0")}${CHAVE_PIX}`;
    payload += `26${merchantAccount.length.toString().padStart(2, "0")}${merchantAccount}`;
    payload += "52040000"; // Merchant Category Code
    payload += "5303986"; // Transaction Currency (Real)
    payload += `54${v.length.toString().padStart(2, "0")}${v}`; // Valor da doação
    payload += "5802BR"; // Country Code
    payload += `59${nomeLimitado.length.toString().padStart(2, "0")}${nomeLimitado}`; // Nome
    payload += `60${cidadeLimitada.length.toString().padStart(2, "0")}${cidadeLimitada}`; // Cidade
    payload += "62070503***"; // Campo livre (Identificador)
    payload += "6304"; // Início do CRC

    const crc = calcularCRC16(payload);
    return payload + crc;
  };

  const pixCopiaECola = gerarPayloadPix(valor);

  const copiarPix = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 max-w-md mx-auto space-y-6"
    >
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
            <Button 
              key={v} 
              variant={valor === v.toFixed(2) ? "default" : "outline"} 
              onClick={() => setValor(v.toFixed(2))}
            >
              R$ {v}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Outro valor (R$)</label>
          <Input 
            type="number" 
            value={valor} 
            onChange={(e) => setValor(e.target.value)} 
            placeholder="Ex: 15.00" 
          />
        </div>

        {parseFloat(valor) > 0 && (
          <div className="pt-4 flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-xl border-2 border-primary/20 shadow-inner">
              <QRCodeSVG value={pixCopiaECola} size={220} />
            </div>
            
            <div className="w-full space-y-2">
              <p className="text-[10px] text-muted-foreground text-center break-all font-mono">
                {pixCopiaECola}
              </p>
              <Button 
                onClick={copiarPix} 
                className="w-full h-12 text-lg font-bold transition-all" 
                variant={copiado ? "secondary" : "default"}
              >
                {copiado ? (
                  <><CheckCircle className="mr-2 h-5 w-5" /> Código Copiado!</>
                ) : (
                  <><Copy className="mr-2 h-5 w-5" /> Copiar Código PIX</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Doacao;
