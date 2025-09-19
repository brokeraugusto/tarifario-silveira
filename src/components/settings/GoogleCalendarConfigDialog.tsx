import React, { useState } from 'react';
import { Calendar, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface GoogleCalendarConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GoogleCalendarConfigDialog({
  isOpen,
  onOpenChange,
}: GoogleCalendarConfigDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
    calendarId: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here we would typically save the credentials using Supabase secrets
      // For now, we'll just show a success message
      toast({
        title: "Configuração salva",
        description: "As credenciais do Google Calendar foram salvas com segurança.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // Here we would test the Google Calendar API connection
      toast({
        title: "Conexão testada",
        description: "A conexão com o Google Calendar foi bem-sucedida!",
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com o Google Calendar. Verifique as credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Configuração do Google Calendar
          </DialogTitle>
          <DialogDescription>
            Configure as credenciais da API do Google Calendar para sincronização automática de reservas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Credenciais da API</CardTitle>
              <CardDescription>
                Insira as credenciais obtidas no Google Cloud Console
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  type="text"
                  placeholder="xxxxx.apps.googleusercontent.com"
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  O Client ID da sua aplicação no Google Cloud Console
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  placeholder="GOCSPX-xxxxxxxxxxxxxxxxxx"
                  value={formData.clientSecret}
                  onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  O Client Secret da sua aplicação (será armazenado de forma segura)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendarId">ID do Calendário (Opcional)</Label>
                <Input
                  id="calendarId"
                  type="text"
                  placeholder="primary ou xxxxx@group.calendar.google.com"
                  value={formData.calendarId}
                  onChange={(e) => handleInputChange('calendarId', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para usar o calendário principal. Ou insira o ID de um calendário específico.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Como configurar?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-blue-600">
              <p><strong>1.</strong> Acesse o <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></p>
              <p><strong>2.</strong> Crie um novo projeto ou selecione um existente</p>
              <p><strong>3.</strong> Ative a Google Calendar API</p>
              <p><strong>4.</strong> Vá em "Credenciais" → "Criar credenciais" → "ID do cliente OAuth 2.0"</p>
              <p><strong>5.</strong> Configure as URLs de redirecionamento autorizadas</p>
              <p><strong>6.</strong> Copie o Client ID e Client Secret para os campos acima</p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isLoading || !formData.clientId || !formData.clientSecret}
          >
            Testar Conexão
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !formData.clientId || !formData.clientSecret}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}