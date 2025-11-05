import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MessageSquare, Sparkles, History } from "lucide-react";

interface ChatTabsProps {
  children: React.ReactNode;
}

export function ChatTabs({ children }: ChatTabsProps) {
  return (
    <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
      <TabsList className="w-full bg-transparent border-b border-[#E8D5F5] dark:border-[#3D2A4D] rounded-none p-0 h-auto">
        <TabsTrigger 
          value="chat" 
          className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5F0FF] data-[state=active]:to-[#FFE5EC] dark:data-[state=active]:from-[#2A2035] dark:data-[state=active]:to-[#3D2A4D] data-[state=active]:border-b-2 data-[state=active]:border-[#B894E8] rounded-none py-3 text-sm font-medium transition-all"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Conversa
        </TabsTrigger>
        <TabsTrigger 
          value="quick-help" 
          className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5F0FF] data-[state=active]:to-[#FFE5EC] dark:data-[state=active]:from-[#2A2035] dark:data-[state=active]:to-[#3D2A4D] data-[state=active]:border-b-2 data-[state=active]:border-[#B894E8] rounded-none py-3 text-sm font-medium transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ajuda Rápida
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="chat" className="flex-1 overflow-hidden m-0 focus-visible:outline-none focus-visible:ring-0">
        {children}
      </TabsContent>
      
      <TabsContent value="quick-help" className="flex-1 overflow-auto m-0 p-4 focus-visible:outline-none focus-visible:ring-0">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold gradient-text mb-6 text-center">
            Ajuda Rápida 💜
          </h2>
          
          <div className="grid gap-4">
            <QuickHelpCard
              emoji="📱"
              title="Usar o Celular"
              description="Aprenda o básico: ligar, desligar, tocar na tela, e navegar pelos apps."
            />
            <QuickHelpCard
              emoji="💬"
              title="WhatsApp"
              description="Enviar mensagens, áudios, fotos e fazer chamadas de vídeo."
            />
            <QuickHelpCard
              emoji="📧"
              title="E-mail"
              description="Ler, enviar e organizar seus e-mails de forma segura."
            />
            <QuickHelpCard
              emoji="🏦"
              title="PIX e Banco Digital"
              description="Fazer transferências, pagar contas e consultar saldo com segurança."
            />
            <QuickHelpCard
              emoji="🛒"
              title="Compras Online"
              description="Comprar com segurança, identificar sites confiáveis e evitar golpes."
            />
            <QuickHelpCard
              emoji="📸"
              title="Fotos e Câmera"
              description="Tirar fotos, fazer selfies, e compartilhar momentos especiais."
            />
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#F5F0FF] to-[#FFE5EC] dark:from-[#2A2035] dark:to-[#3D2A4D] border-2 border-[#E8D5F5] dark:border-[#3D2A4D]">
            <p className="text-center text-[#4A3B5C] dark:text-[#E8D5F5] leading-relaxed">
              💡 <strong>Dica:</strong> Volte para a aba "Conversa" para fazer perguntas específicas. 
              Estou aqui para te ajudar com paciência e carinho! 🌸
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function QuickHelpCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#2A2035] border-2 border-[#E8D5F5] dark:border-[#3D2A4D] hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{emoji}</span>
        <div>
          <h3 className="font-semibold text-[#4A3B5C] dark:text-[#F5F0FF] mb-1">
            {title}
          </h3>
          <p className="text-sm text-[#9B8BB4] dark:text-[#B894E8]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
