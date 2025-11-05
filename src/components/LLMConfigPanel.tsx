import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { reinitializeLLM } from "./ChatbotResponses";
import { 
  Brain, 
  Key, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Settings
} from "lucide-react";

interface LLMConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LLMConfigPanel({ isOpen, onClose }: LLMConfigPanelProps) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [llmEnabled, setLlmEnabled] = useState(!!localStorage.getItem('openai_api_key'));
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
      setLlmEnabled(true);
      reinitializeLLM(); // Re-inicializar o serviço LLM
      testConnection();
    } else {
      localStorage.removeItem('openai_api_key');
      setLlmEnabled(false);
      setConnectionStatus('idle');
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) return;

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setLlmEnabled(false);
    setConnectionStatus('idle');
    reinitializeLLM(); // Re-inicializar o serviço LLM
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Configurações de IA Avançada
            </h2>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>

          <div className="space-y-6">
            {/* Status atual */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Sistema de IA Avançada</div>
                    <div className="text-sm text-gray-600">
                      {llmEnabled ? 'Ativo - Respostas mais inteligentes e contextuais' : 'Inativo - Usando respostas básicas'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {llmEnabled ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Ativo</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Inativo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Configuração da API Key */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <label className="text-lg font-medium">
                  Chave da API OpenAI
                </label>
              </div>
              
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveApiKey}
                    disabled={!apiKey.trim()}
                    className="flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Salvar Chave
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={testConnection}
                    disabled={!apiKey.trim() || isTestingConnection}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                  
                  {llmEnabled && (
                    <Button 
                      variant="destructive"
                      onClick={handleRemoveApiKey}
                      className="flex items-center gap-2"
                    >
                      Remover Chave
                    </Button>
                  )}
                </div>
                
                {/* Status da conexão */}
                {connectionStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Conexão estabelecida com sucesso!
                  </div>
                )}
                
                {connectionStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Erro na conexão. Verifique sua chave API.
                  </div>
                )}
              </div>
            </div>

            {/* Benefícios da IA */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Benefícios da IA Avançada:
              </h3>
              <ul className="text-sm space-y-1 text-blue-800">
                <li>• Respostas mais personalizadas e contextuais</li>
                <li>• Compreensão melhor das suas dúvidas específicas</li>
                <li>• Adaptação automática ao seu nível de conhecimento</li>
                <li>• Análise de sentimentos para respostas mais empáticas</li>
                <li>• Memória de conversas anteriores para melhor continuidade</li>
                <li>• Detecção automática de frustração e necessidades especiais</li>
              </ul>
            </div>

            {/* Como obter API Key */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Como obter sua chave API:</h3>
              <ol className="text-sm space-y-2 text-gray-700">
                <li>1. Acesse <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">platform.openai.com</a></li>
                <li>2. Crie uma conta ou faça login</li>
                <li>3. Vá em "API Keys" no menu</li>
                <li>4. Clique em "Create new secret key"</li>
                <li>5. Copie a chave e cole aqui</li>
              </ol>
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>Importante:</strong> Sua chave API é armazenada apenas no seu navegador e não é compartilhada.
              </div>
            </div>

            {/* Informações técnicas */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3">Sistema NLP Integrado:</h3>
              <div className="text-sm space-y-2 text-gray-600">
                <div>✅ Análise de intenções ativa</div>
                <div>✅ Extração de entidades funcionando</div>
                <div>✅ Análise de sentimentos operacional</div>
                <div>✅ Gerenciamento de contexto ativo</div>
                <div>✅ Sistema de fallback robusto</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}