import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "./ui/sheet";
import { Menu, Sun, Moon, Volume2, VolumeX, Accessibility, HelpCircle } from "lucide-react";
import { AccessibilitySettings } from "./AccessibilityPanel";

interface MenuHamburgerProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  settings: AccessibilitySettings;
  onToggleTTS: () => void;
  onOpenAccessibility: () => void;
  onClearChat: () => void;
}

export function MenuHamburger({
  isDarkMode,
  onToggleDarkMode,
  settings,
  onToggleTTS,
  onOpenAccessibility,
  onClearChat
}: MenuHamburgerProps) {
  const [open, setOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-[#F5F0FF] dark:hover:bg-[#2A2035] transition-all"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="bg-gradient-to-br from-[#FAF8FF] via-[#FFF5F8] to-[#F5F0FF] dark:from-[#1A1625] dark:via-[#221933] dark:to-[#1A1625] border-l-2 border-[#E8D5F5] dark:border-[#3D2A4D]"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl gradient-text flex items-center gap-2">
            Menu 🌸
          </SheetTitle>
          <SheetDescription>
            Configurações e opções do chatbot Sena
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          {/* Toggle Voz */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl border-2 border-[#E8D5F5] dark:border-[#3D2A4D] hover:bg-[#F5F0FF] dark:hover:bg-[#2A2035] transition-all h-14"
            onClick={() => handleAction(onToggleTTS)}
          >
            {settings.ttsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            <div className="flex flex-col items-start">
              <span className="font-semibold">
                {settings.ttsEnabled ? 'Desativar Voz' : 'Ativar Voz'}
              </span>
              <span className="text-xs text-muted-foreground">
                Leitura automática de mensagens
              </span>
            </div>
          </Button>

          {/* Toggle Modo Escuro */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl border-2 border-[#E8D5F5] dark:border-[#3D2A4D] hover:bg-[#F5F0FF] dark:hover:bg-[#2A2035] transition-all h-14"
            onClick={() => handleAction(onToggleDarkMode)}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <div className="flex flex-col items-start">
              <span className="font-semibold">
                {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
              </span>
              <span className="text-xs text-muted-foreground">
                Alternar tema do aplicativo
              </span>
            </div>
          </Button>

          {/* Acessibilidade */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl border-2 border-[#E8D5F5] dark:border-[#3D2A4D] hover:bg-[#F5F0FF] dark:hover:bg-[#2A2035] transition-all h-14"
            onClick={() => handleAction(onOpenAccessibility)}
          >
            <Accessibility className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Acessibilidade</span>
              <span className="text-xs text-muted-foreground">
                Ajustar tamanho, contraste e mais
              </span>
            </div>
          </Button>

          {/* Nova Conversa */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl border-2 border-[#E8D5F5] dark:border-[#3D2A4D] hover:bg-[#F5F0FF] dark:hover:bg-[#2A2035] transition-all h-14"
            onClick={() => handleAction(onClearChat)}
          >
            <HelpCircle className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Nova Conversa</span>
              <span className="text-xs text-muted-foreground">
                Recomeçar do início
              </span>
            </div>
          </Button>

          {/* Divider */}
          <div className="border-t-2 border-[#E8D5F5] dark:border-[#3D2A4D] my-2" />

          {/* Info */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F0FF] to-[#FFE5EC] dark:from-[#2A2035] dark:to-[#3D2A4D] border-2 border-[#E8D5F5] dark:border-[#3D2A4D]">
            <p className="text-sm text-center text-[#4A3B5C] dark:text-[#E8D5F5] leading-relaxed">
              💜 Atalhos de teclado:
              <br />
              <span className="font-mono text-xs">F1</span> - Acessibilidade
              <br />
              <span className="font-mono text-xs">Ctrl+Enter</span> - Nova conversa
              <br />
              <span className="font-mono text-xs">Esc</span> - Fechar painéis
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
