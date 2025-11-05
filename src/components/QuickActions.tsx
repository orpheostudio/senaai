import { Button } from "./ui/button";
import { 
  Smartphone, 
  Wifi, 
  Mail, 
  MessageSquare, 
  Phone, 
  Camera,
  Settings,
  HelpCircle,
  ShoppingCart,
  CreditCard
} from "lucide-react";
import { AccessibilitySettings } from "./AccessibilityPanel";

interface QuickActionsProps {
  onActionClick: (action: string) => void;
  settings: AccessibilitySettings;
}

export function QuickActions({ onActionClick, settings }: QuickActionsProps) {
  const actions = [
    {
      icon: <Smartphone size={24} aria-hidden="true" />,
      label: "Como usar meu celular",
      action: "celular-basico",
      description: "Aprenda o básico sobre usar smartphone"
    },
    {
      icon: <Wifi size={24} aria-hidden="true" />,
      label: "Conectar WiFi",
      action: "wifi",
      description: "Como conectar na internet"
    },
    {
      icon: <MessageSquare size={24} aria-hidden="true" />,
      label: "Enviar mensagem",
      action: "whatsapp",
      description: "WhatsApp e mensagens"
    },
    {
      icon: <Mail size={24} aria-hidden="true" />,
      label: "E-mail",
      action: "email",
      description: "Como usar e-mail"
    },
    {
      icon: <Camera size={24} aria-hidden="true" />,
      label: "Tirar foto",
      action: "camera",
      description: "Usar câmera e enviar fotos"
    },
    {
      icon: <Phone size={24} aria-hidden="true" />,
      label: "Fazer ligação",
      action: "ligacao",
      description: "Como ligar para alguém"
    },
    {
      icon: <ShoppingCart size={24} aria-hidden="true" />,
      label: "Compras online",
      action: "compras",
      description: "Comprar na internet com segurança"
    },
    {
      icon: <CreditCard size={24} aria-hidden="true" />,
      label: "Banco digital",
      action: "banco",
      description: "Usar aplicativo do banco e PIX"
    },
    {
      icon: <Settings size={24} aria-hidden="true" />,
      label: "Configurações",
      action: "configuracoes",
      description: "Ajustar configurações do celular"
    },
    {
      icon: <HelpCircle size={24} aria-hidden="true" />,
      label: "Outra dúvida",
      action: "outros",
      description: "Outras questões sobre tecnologia"
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border mb-6 ${
      settings.highContrast ? 'border-2 border-gray-800 dark:border-white' : ''
    }`}>
      <h3 className={`text-xl font-medium mb-4 text-center ${
        settings.highContrast ? 'text-black dark:text-white' : 'text-gray-900 dark:text-white'
      }`} style={{ fontSize: `${settings.fontSize + 4}px` }}>
        Como posso te ajudar hoje?
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Opções de ajuda">
        {actions.map((action, index) => (
          <Button
            key={action.action}
            variant="outline"
            className={`flex items-center gap-3 text-left justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-500 ${
              settings.largeClickTargets ? 'p-8 h-auto text-lg' : 'p-6 h-auto text-lg'
            } ${
              settings.highContrast ? 'border-2 border-gray-800 dark:border-white bg-white dark:bg-black text-black dark:text-white' : ''
            } ${
              settings.keyboardNavigation ? 'focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-500' : ''
            }`}
            onClick={() => onActionClick(action.action)}
            aria-label={`${action.label}: ${action.description}`}
            aria-describedby={`action-desc-${index}`}
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${
                settings.highContrast ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-200'
              }`}>
                {action.label}
              </div>
              <div 
                id={`action-desc-${index}`}
                className={`text-sm mt-1 ${
                  settings.highContrast ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {action.description}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Dica para navegação por teclado */}
      {settings.keyboardNavigation && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Use Tab para navegar entre as opções e Enter para selecionar
          </p>
        </div>
      )}
    </div>
  );
}