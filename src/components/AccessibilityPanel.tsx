import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  ZoomOut,
  Palette,
  Accessibility,
  Type,
  MousePointer
} from "lucide-react";

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
}

export interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  ttsEnabled: boolean;
  autoReadMessages: boolean;
  reducedMotion: boolean;
  largeClickTargets: boolean;
  speechSpeed: number;
  speechVolume: number;
  keyboardNavigation: boolean;
}

export function AccessibilityPanel({ isOpen, onClose, settings, onSettingsChange }: AccessibilityPanelProps) {
  if (!isOpen) return null;

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Accessibility className="h-6 w-6" />
              Configurações de Acessibilidade
            </h2>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>

          <div className="space-y-6">
            {/* Tamanho da Fonte */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                <label className="text-lg font-medium">
                  Tamanho da Fonte: {settings.fontSize}px
                </label>
              </div>
              <div className="flex items-center gap-4">
                <ZoomOut className="h-4 w-4" />
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={14}
                  max={24}
                  step={1}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4" />
              </div>
              <p className="text-sm text-gray-600">
                Ajuste o tamanho do texto para melhor leitura
              </p>
            </div>

            {/* Alto Contraste */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5" />
                <div>
                  <div className="font-medium">Modo Alto Contraste</div>
                  <div className="text-sm text-gray-600">
                    Aumenta o contraste para melhor visibilidade
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>

            {/* Leitura Automática */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5" />
                <div>
                  <div className="font-medium">Leitura Automática</div>
                  <div className="text-sm text-gray-600">
                    Sofia lerá automaticamente suas respostas
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.autoReadMessages}
                onCheckedChange={(checked) => updateSetting('autoReadMessages', checked)}
              />
            </div>

            {/* Velocidade da Fala */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <label className="text-lg font-medium">
                  Velocidade da Fala: {settings.speechSpeed.toFixed(1)}x
                </label>
              </div>
              <Slider
                value={[settings.speechSpeed]}
                onValueChange={([value]) => updateSetting('speechSpeed', value)}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-gray-600">
                Ajuste a velocidade com que Sofia fala
              </p>
            </div>

            {/* Volume */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <label className="text-lg font-medium">
                  Volume: {Math.round(settings.speechVolume * 100)}%
                </label>
              </div>
              <Slider
                value={[settings.speechVolume]}
                onValueChange={([value]) => updateSetting('speechVolume', value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Movimento Reduzido */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <EyeOff className="h-5 w-5" />
                <div>
                  <div className="font-medium">Reduzir Animações</div>
                  <div className="text-sm text-gray-600">
                    Remove animações que podem causar desconforto
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
              />
            </div>

            {/* Botões Grandes */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MousePointer className="h-5 w-5" />
                <div>
                  <div className="font-medium">Botões Grandes</div>
                  <div className="text-sm text-gray-600">
                    Aumenta o tamanho dos botões para facilitar o clique
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.largeClickTargets}
                onCheckedChange={(checked) => updateSetting('largeClickTargets', checked)}
              />
            </div>

            {/* Navegação por Teclado */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5" />
                <div>
                  <div className="font-medium">Navegação por Teclado</div>
                  <div className="text-sm text-gray-600">
                    Melhora o foco visual para navegação por teclado
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">💡 Dicas de Acessibilidade:</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Use Tab para navegar entre os botões</li>
              <li>• Pressione Enter ou Espaço para ativar botões</li>
              <li>• Use Ctrl + para aumentar o zoom da página</li>
              <li>• Ative o leitor de tela do seu sistema para melhor experiência</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}