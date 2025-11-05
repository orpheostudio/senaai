import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Bot, User, Volume2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { AccessibilitySettings } from "./AccessibilityPanel";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
  onSpeakMessage?: (text: string) => void;
  settings: AccessibilitySettings;
}

export function ChatMessage({ message, isBot, timestamp, onSpeakMessage, settings }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSpeak = () => {
    if (onSpeakMessage) {
      onSpeakMessage(message);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {onSpeakMessage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSpeak}
          className={`flex items-center gap-1 text-xs opacity-70 hover:opacity-100 ${
            settings.largeClickTargets ? 'px-3 py-2' : 'px-2 py-1'
          }`}
          aria-label={`Ouvir ${isBot ? 'resposta da Sofia' : 'sua mensagem'}`}
          title="Clique para ouvir esta mensagem"
        >
          <Volume2 size={12} />
          <span>Ouvir</span>
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className={`flex items-center gap-1 text-xs opacity-70 hover:opacity-100 ${
          settings.largeClickTargets ? 'px-3 py-2' : 'px-2 py-1'
        }`}
        aria-label="Copiar mensagem"
        title="Copiar texto da mensagem"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        <span>{copied ? "Copiado!" : "Copiar"}</span>
      </Button>

      <span className="text-xs text-muted-foreground opacity-70">
        {timestamp.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </span>
    </div>
  );
}