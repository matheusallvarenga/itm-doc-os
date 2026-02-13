import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Moon, Globe, Shield, Smartphone, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function Configuracoes() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
    tips: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: true,
    language: "pt-BR",
    sounds: false,
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            <span className="accent-text">Configurações</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalize sua experiência no Código de Poder
          </p>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
              <p className="text-sm text-muted-foreground">Gerencie como você recebe atualizações</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-foreground">Notificações por email</p>
                  <p className="text-sm text-muted-foreground">Receba alertas importantes no seu email</p>
                </div>
              </div>
              <Switch 
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-foreground">Push notifications</p>
                  <p className="text-sm text-muted-foreground">Notificações no navegador</p>
                </div>
              </div>
              <Switch 
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-foreground">Resumo semanal</p>
                  <p className="text-sm text-muted-foreground">Receba um resumo do seu progresso toda semana</p>
                </div>
              </div>
              <Switch 
                checked={notifications.weekly}
                onCheckedChange={(checked) => setNotifications({...notifications, weekly: checked})}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-foreground">Dicas e tutoriais</p>
                  <p className="text-sm text-muted-foreground">Receba dicas para melhorar seus resultados</p>
                </div>
              </div>
              <Switch 
                checked={notifications.tips}
                onCheckedChange={(checked) => setNotifications({...notifications, tips: checked})}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Moon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Preferências</h2>
              <p className="text-sm text-muted-foreground">Ajuste a interface ao seu gosto</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-foreground">Modo escuro</p>
                  <p className="text-sm text-muted-foreground">Interface com tema escuro</p>
                </div>
              </div>
              <Switch 
                checked={preferences.darkMode}
                onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-foreground">Idioma</p>
                  <p className="text-sm text-muted-foreground">Português (Brasil)</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Alterar
              </Button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Segurança</h2>
              <p className="text-sm text-muted-foreground">Proteja sua conta</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div>
                <p className="text-foreground">Alterar senha</p>
                <p className="text-sm text-muted-foreground">Última alteração há 30 dias</p>
              </div>
              <Button variant="outline" size="sm">
                Alterar
              </Button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-foreground">Autenticação em dois fatores</p>
                <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
              </div>
              <Button variant="outline" size="sm">
                Ativar
              </Button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button className="glow-primary-sm">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
