
import React, { useState } from 'react';
import { Settings, Info, AlertTriangle, Database, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserProfile } from '@/hooks/useUserPermissions';
import DatabaseCleanupDialog from '@/components/DatabaseCleanupDialog';
import UserManagement from '@/components/settings/UserManagement';

const SettingsPage = () => {
  const isMobile = useIsMobile();
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const { data: userProfile, isLoading: loadingProfile, error } = useUserProfile();

  console.log('User profile in settings:', userProfile);
  console.log('Loading profile:', loadingProfile);
  console.log('Profile error:', error);

  // Check if user is master or admin - show user management for these roles
  const canManageUsers = userProfile?.role === 'master' || userProfile?.role === 'admin';
  const isMasterUser = userProfile?.role === 'master';

  console.log('Can manage users:', canManageUsers);
  console.log('Is master user:', isMasterUser);

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-navy mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Erro ao carregar configurações</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-6 md:pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-hotel-navy">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie as configurações do sistema.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className={`grid w-full ${canManageUsers ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
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

          {isMasterUser && (
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
                  <Button variant="destructive" className="flex items-center gap-2" onClick={() => setIsCleanupDialogOpen(true)}>
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
          )}

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
                <p className="text-sm text-muted-foreground">1.1.0</p>
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
        </TabsContent>

        {canManageUsers && (
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
      
      <DatabaseCleanupDialog isOpen={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen} onCleanupComplete={() => {}} />
    </div>
  );
};

export default SettingsPage;
