import { useState } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, Check, Shield, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onAccept: () => void;
}

export function WelcomeScreen({ onAccept }: WelcomeScreenProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#FAF8FF] via-[#FFF5F8] to-[#F5F0FF] dark:from-[#1A1625] dark:via-[#221933] dark:to-[#1A1625] p-4">
      <div className="w-full max-w-2xl bg-white/95 dark:bg-[#2A2035]/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-[#E8D5F5] dark:border-[#3D2A4D]">
        {/* Header com Logo */}
        <div className="bg-gradient-to-r from-[#B894E8] to-[#FFB3C6] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src="https://i.imgur.com/Dc3f5ZQ.jpeg" 
                alt="Sena - Assistente Digital"
                className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <Sparkles className="w-6 h-6 text-[#B894E8]" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Sena ✨
          </h1>
          <p className="text-white/90 text-xl font-medium">
            Tecnologia com alma gentil
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Mensagem de Boas-Vindas */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold text-[#4A3B5C] dark:text-[#F5F0FF]">
              Bem-vinda(o)! 💜
            </h2>
            <p className="text-[#4A3B5C] dark:text-[#E8D5F5] leading-relaxed">
              Olá! Eu sou a Sena, sua assistente digital kawaii. Estou aqui para 
              tornar a tecnologia mais simples e acessível para você, com paciência, 
              carinho e muita gentileza. 🌸
            </p>
            <p className="text-[#4A3B5C] dark:text-[#E8D5F5] leading-relaxed">
              Posso te ajudar com celular, WhatsApp, e-mail, PIX, compras online 
              e muito mais! Tudo explicado de forma clara e com todo o tempo que você precisar.
            </p>
          </div>

          {/* Disclaimer de Erros */}
          <div className="bg-gradient-to-br from-[#FFF3CD] to-[#FFE5B4] dark:from-[#4A3B2A] dark:to-[#3D2F1A] p-4 rounded-2xl border-2 border-[#FFD700] dark:border-[#8B7355]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#D97706] dark:text-[#FCD34D] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-[#92400E] dark:text-[#FCD34D] mb-1">
                  ⚠️ Importante saber
                </h3>
                <p className="text-sm text-[#78350F] dark:text-[#FDE68A] leading-relaxed">
                  Como sou uma assistente digital, posso ocasionalmente cometer erros ou 
                  fornecer informações imprecisas. Por favor, sempre confirme informações 
                  importantes com fontes oficiais ou pessoas de confiança. Estou aqui para 
                  ajudar da melhor forma possível! 💛
                </p>
              </div>
            </div>
          </div>

          {/* O que posso fazer */}
          <div className="bg-gradient-to-br from-[#F5F0FF] to-[#FFE5EC] dark:from-[#2A2035] dark:to-[#3D2A4D] p-4 rounded-2xl border-2 border-[#E8D5F5] dark:border-[#3D2A4D]">
            <h3 className="font-semibold text-[#4A3B5C] dark:text-[#F5F0FF] mb-3 text-center">
              💝 Como posso te ajudar
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span className="text-[#4A3B5C] dark:text-[#E8D5F5]">Usar o celular</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span className="text-[#4A3B5C] dark:text-[#E8D5F5]">WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span className="text-[#4A3B5C] dark:text-[#E8D5F5]">E-mail</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏦</span>
                <span className="text-[#4A3B5C] dark:text-[#E8D5F5]">PIX e banco</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🛒</span>
                <span className="text-[#4A3B5C] dark:text-[#E8D5F5]">Compras online</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📸</span>
                <span className="text-[#4A3B5C] dark:text-[#E8D5F5]">Fotos e câmera</span>
              </div>
            </div>
          </div>

          {/* Termos e Políticas */}
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#4A3B5C] dark:text-[#F5F0FF]">
              <Shield className="w-5 h-5 text-[#B894E8]" />
              Privacidade e Termos
            </h2>
            
            <div className="flex items-start gap-3 p-4 bg-[#F5F0FF] dark:bg-[#2A2035] rounded-xl border-2 border-[#E8D5F5] dark:border-[#3D2A4D]">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-[#B894E8] text-[#B894E8] focus:ring-2 focus:ring-[#B894E8] cursor-pointer mt-0.5 flex-shrink-0"
              />
              <label htmlFor="terms" className="text-sm text-[#4A3B5C] dark:text-[#E8D5F5] cursor-pointer flex-1 leading-relaxed">
                Li e aceito os{" "}
                <a
                  href="https://termos.orpheostudio.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B894E8] hover:text-[#9B7BC8] underline font-semibold"
                >
                  Termos de Uso
                </a>
                {" "}e as{" "}
                <a
                  href="https://politicas.orpheostudio.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B894E8] hover:text-[#9B7BC8] underline font-semibold"
                >
                  Políticas de Privacidade
                </a>
                . Entendo que a Sena pode cometer erros e devo confirmar informações importantes.
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-r from-[#F5F0FF] to-[#FFE5EC] dark:from-[#2A2035] dark:to-[#3D2A4D] border-t-2 border-[#E8D5F5] dark:border-[#3D2A4D]">
          <Button
            onClick={onAccept}
            disabled={!termsAccepted}
            className="w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{
              background: termsAccepted 
                ? 'linear-gradient(135deg, #B894E8 0%, #FFB3C6 100%)'
                : 'linear-gradient(135deg, #E8D5F5 0%, #FFE5EC 100%)',
              color: termsAccepted ? 'white' : '#9B8BB4',
              boxShadow: termsAccepted 
                ? '0 4px 20px rgba(184, 148, 232, 0.4)'
                : 'none',
            }}
          >
            {termsAccepted ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Começar a conversar com a Sena! 💜
              </span>
            ) : (
              <span>Aceite os termos para continuar</span>
            )}
          </Button>
          
          {/* Versão no rodapé da welcome screen */}
          <p className="text-center text-xs text-[#9B8BB4] dark:text-[#B894E8] mt-4">
            Sena - V6.0 Powered by AmplaAI
          </p>
        </div>
      </div>
    </div>
  );
}
