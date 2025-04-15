import React from 'react';
import { Settings, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
const SettingsPage = () => {
  return <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-hotel-navy">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie as configurações do sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Preferências Gerais
          </CardTitle>
          <CardDescription>
            Configure o comportamento padrão do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="text-base">Notificações</Label>
              <p className="text-sm text-muted-foreground">Receber notificações do sistema</p>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-save" className="text-base">Salvamento automático</Label>
              <p className="text-sm text-muted-foreground">Salvar alterações automaticamente</p>
            </div>
            <Switch id="auto-save" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="text-base">Modo escuro</Label>
              <p className="text-sm text-muted-foreground">Alternar entre modo claro e escuro</p>
            </div>
            <Switch id="dark-mode" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            Sobre o Sistema
          </CardTitle>
          <CardDescription>
            Informações do sistema AcomodaValor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-base">Versão</Label>
            <p className="text-sm text-muted-foreground">1.0.0</p>
          </div>
          
          <div>
            <Label className="text-base">Desenvolvido por</Label>
            <p className="text-sm text-muted-foreground">Augusto Gonçalves</p>
          </div>
          
          <div>
            <Label className="text-base">Contato</Label>
            <p className="text-sm text-muted-foreground">+55 48 9 9904-3764</p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default SettingsPage;