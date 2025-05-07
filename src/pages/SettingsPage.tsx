
import React, { useState } from 'react';
import { Settings, Info, AlertTriangle, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import DatabaseCleanupDialog from '@/components/DatabaseCleanupDialog';

const SettingsPage = () => {
  const isMobile = useIsMobile();
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);

  return (
    <div className="space-y-4 md:space-y-6 pb-6 md:pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-hotel-navy">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie as configurações do sistema.</p>
      </div>

      <Card>
        <CardHeader className={isMobile ? "p-4" : ""}>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Preferências Gerais
          </CardTitle>
          <CardDescription>
            Configure o comportamento padrão do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className={`space-y-4 md:space-y-6 ${isMobile ? "p-4 pt-0" : ""}`}>
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
              <p className="text-sm text-muted-foreground">Alternar entre modo claro e escuro (em breve)</p>
            </div>
            <Switch id="dark-mode" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader className={`${isMobile ? "p-4" : ""} border-b border-red-200 bg-red-50`}>
          <CardTitle className="flex items-center text-red-700">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription className="text-red-600">
            Ações destrutivas que podem resultar em perda de dados
          </CardDescription>
        </CardHeader>
        <CardContent className={`space-y-4 ${isMobile ? "p-4" : "py-4"}`}>
          <div>
            <Label className="text-base font-medium">Limpeza de Banco de Dados</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Remove permanentemente dados do sistema. Esta ação não pode ser desfeita.
            </p>
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={() => setIsCleanupDialogOpen(true)}
            >
              <Database className="h-4 w-4" />
              Limpar Banco de Dados
            </Button>
          </div>
          
          <Separator className="my-2" />
          
          <div>
            <Label className="text-base font-medium">Redefinir Preferências</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Restaura todas as preferências para as configurações padrão.
            </p>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              Redefinir Preferências
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className={isMobile ? "p-4" : ""}>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            Sobre o Sistema
          </CardTitle>
          <CardDescription>
            Informações do sistema Tarifário Silveira Eco Village
          </CardDescription>
        </CardHeader>
        <CardContent className={`space-y-2 ${isMobile ? "p-4 pt-0" : ""}`}>
          <div>
            <Label className="text-base">Versão</Label>
            <p className="text-sm text-muted-foreground">1.0.1</p>
          </div>
          
          <div>
            <Label className="text-base">Desenvolvido por</Label>
            <p className="text-sm text-muted-foreground">Augusto Gonçalves - Todos os direitos reservados 2025</p>
          </div>
          
          <div>
            <Label className="text-base">Contato</Label>
            <p className="text-sm text-muted-foreground">+55 48 9 9904-3764</p>
          </div>
        </CardContent>
      </Card>
      
      <DatabaseCleanupDialog 
        isOpen={isCleanupDialogOpen} 
        onOpenChange={setIsCleanupDialogOpen} 
        onCleanupComplete={() => {}} 
      />
    </div>
  );
};

export default SettingsPage;
