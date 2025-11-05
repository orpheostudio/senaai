import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";
import { SpeechControls } from "./SpeechControls";
import { AccessibilitySettings } from "./AccessibilityPanel";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSpeakText: (speakFunction: (text: string) => void) => void;
  disabled?: boolean;
  settings: AccessibilitySettings;
}

export function ChatInput({
  onSendMessage,
  onSpeakText,
  disabled = false,
  settings,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      // Focar no textarea após enviar
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [message, disabled, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Esc para limpar campo
    if (e.key === "Escape") {
      setMessage("");
    }
  };

  const handleSpeechResult = (text: string) => {
    setMessage(text);
    // Auto-enviar se a mensagem não estiver vazia
    if (text.trim()) {
      setTimeout(() => {
        onSendMessage(text.trim());
        setMessage("");
      }, 500);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="w-full">
      {/* Instruções para usuários de leitor de tela */}
      <div className="sr-only" aria-live="polite">
        Digite sua mensagem ou use os controles de voz para
        falar. Pressione Enter para enviar ou Shift+Enter para
        nova linha.
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="message-input" className="sr-only">
            Sua mensagem para Sofia
          </label>
          <Textarea
            ref={textareaRef}
            id="message-input"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta aqui... Ou use o microfone para falar"
            className={`min-h-[60px] max-h-[120px] resize-none focus:border-ring focus:ring-2 focus:ring-ring ${
              settings.highContrast
                ? "border-4 border-gray-800 dark:border-white bg-white dark:bg-black text-black dark:text-white"
                : ""
            }`}
            style={{
              fontSize: `${settings.fontSize}px`,
              overflowY:
                message.split("\n").length > 3
                  ? "auto"
                  : "hidden",
            }}
            disabled={disabled}
            aria-describedby="input-help"
          />
          <div id="input-help" className="sr-only">
            Pressione Enter para enviar, Shift+Enter para nova
            linha, ou use os controles de voz
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Controles de Fala */}
          <SpeechControls
            onSpeechResult={handleSpeechResult}
            onSpeakText={onSpeakText}
            disabled={disabled}
            settings={settings}
          />

          {/* Botão Enviar */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size={
              settings.largeClickTargets ? "lg" : "default"
            }
            className={`${settings.largeClickTargets ? "h-12 w-12" : "h-10 w-10"} p-0 ${
              settings.highContrast
                ? "border-2 border-gray-800 dark:border-white"
                : ""
            }`}
            aria-label="Enviar mensagem"
            title="Enviar mensagem (Enter)"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Atalhos de Teclado */}
      {settings.keyboardNavigation && (
        <div className="mt-2 text-xs text-muted-foreground">
          💡 Atalhos: Enter=Enviar • Shift+Enter=Nova linha •
          Tab=Navegar • Esc=Limpar
        </div>
      )}
    </div>
  );
}