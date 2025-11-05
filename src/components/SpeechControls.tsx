import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play,
  Square,
  Headphones
} from "lucide-react";
import { AccessibilitySettings } from "./AccessibilityPanel";

interface SpeechControlsProps {
  onSpeechResult: (text: string) => void;
  onSpeakText: (text: string) => void;
  disabled?: boolean;
  settings: AccessibilitySettings;
}

export function SpeechControls({ onSpeechResult, onSpeakText, disabled = false, settings }: SpeechControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  // Verificar suporte a Speech APIs
  useEffect(() => {
    setSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setTtsSupported('speechSynthesis' in window);
  }, []);

  // Inicializar Speech Recognition
  useEffect(() => {
    if (speechSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        finalTranscriptRef.current = "";
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        finalTranscriptRef.current += finalTranscript;
        
        if (finalTranscript) {
          // Anunciar o que foi reconhecido
          speakText(`Entendi: ${finalTranscript}`, true);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          speakText("Por favor, permita o acesso ao microfone para usar a função de voz.", true);
        } else if (event.error === 'no-speech') {
          speakText("Não consegui ouvir nada. Tente falar mais alto ou verificar o microfone.", true);
        } else {
          speakText("Erro no reconhecimento de voz. Tente novamente.", true);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (finalTranscriptRef.current.trim()) {
          onSpeechResult(finalTranscriptRef.current.trim());
          speakText("Mensagem enviada!", true);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [speechSupported, onSpeechResult]);

  // Função para falar texto
  const speakText = useCallback((text: string, priority: boolean = false) => {
    if (!ttsSupported || (!settings.ttsEnabled && !priority)) return;

    // Parar fala atual se for prioridade
    if (priority && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = settings.speechSpeed;
    utterance.volume = settings.speechVolume;
    
    // Tentar usar uma voz feminina em português
    const voices = window.speechSynthesis.getVoices();
    const portugueseVoice = voices.find(voice => 
      voice.lang.startsWith('pt') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => voice.lang.startsWith('pt'));
    
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentUtterance(utterance);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [ttsSupported, settings.ttsEnabled, settings.speechSpeed, settings.speechVolume]);

  // Expor função para componente pai
  useEffect(() => {
    onSpeakText(speakText as any);
  }, [speakText, onSpeakText]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Seu navegador não suporta reconhecimento de voz. Tente usar Chrome, Edge ou Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      speakText("Parei de ouvir.", true);
    } else {
      if (disabled) {
        speakText("Aguarde, Sofia está respondendo.", true);
        return;
      }
      speakText("Pode falar agora. Quando terminar, clique novamente para enviar.", true);
      recognitionRef.current?.start();
    }
  };

  const toggleSpeaking = () => {
    if (!ttsSupported) return;

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Botão de Microfone/STT */}
      {speechSupported && (
        <Button
          onClick={toggleListening}
          variant={isListening ? "default" : "outline"}
          size={settings.largeClickTargets ? "lg" : "default"}
          className={`${settings.largeClickTargets ? 'h-14 w-14' : 'h-12 w-12'} p-0 ${
            isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''
          }`}
          disabled={disabled}
          aria-label={isListening ? "Parar gravação de voz" : "Iniciar gravação de voz"}
          title={isListening ? "Clique para parar de ouvir e enviar" : "Clique para falar sua mensagem"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </Button>
      )}

      {/* Controles de TTS */}
      {ttsSupported && settings.ttsEnabled && (
        <>
          <Button
            onClick={toggleSpeaking}
            variant="outline"
            size={settings.largeClickTargets ? "lg" : "default"}
            className={`${settings.largeClickTargets ? 'h-14 w-14' : 'h-12 w-12'} p-0`}
            disabled={!isSpeaking && !isPaused}
            aria-label={
              isSpeaking && !isPaused ? "Pausar leitura" : 
              isPaused ? "Continuar leitura" : "Controlar leitura"
            }
            title={
              isSpeaking && !isPaused ? "Pausar leitura" : 
              isPaused ? "Continuar leitura" : "Controlar leitura"
            }
          >
            {isSpeaking && !isPaused ? <Pause size={20} /> : 
             isPaused ? <Play size={20} /> : <Headphones size={20} />}
          </Button>

          <Button
            onClick={stopSpeaking}
            variant="outline"
            size={settings.largeClickTargets ? "lg" : "default"}  
            className={`${settings.largeClickTargets ? 'h-14 w-14' : 'h-12 w-12'} p-0`}
            disabled={!isSpeaking && !isPaused}
            aria-label="Parar leitura"
            title="Parar leitura completamente"
          >
            <Square size={20} />
          </Button>
        </>
      )}

      {/* Status de Fala */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-700">
            Ouvindo...
          </span>
        </div>
      )}

      {isSpeaking && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Volume2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {isPaused ? "Pausado" : "Falando..."}
          </span>
        </div>
      )}
    </div>
  );
}