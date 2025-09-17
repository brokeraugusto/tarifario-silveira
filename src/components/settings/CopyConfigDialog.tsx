import React, { useState, useEffect } from 'react';
import { Settings, Eye, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CopyConfig, COPY_CONFIG_TEMPLATES } from '@/types/copyConfig';
import { useCopyConfig } from '@/contexts/CopyConfigContext';
import { generatePreviewText } from '@/utils/copyFormatter';
import WhatsAppFormatter from '@/components/WhatsAppFormatter';
import { toast } from 'sonner';

interface CopyConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CopyConfigDialog: React.FC<CopyConfigDialogProps> = ({ isOpen, onOpenChange }) => {
  const { config, updateConfig, resetConfig } = useCopyConfig();
  const [tempConfig, setTempConfig] = useState<CopyConfig>(config);
  const [previewText, setPreviewText] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTempConfig(config);
    }
  }, [isOpen, config]);

  useEffect(() => {
    setPreviewText(generatePreviewText(tempConfig));
  }, [tempConfig]);

  const handleConfigChange = (key: keyof CopyConfig, value: boolean) => {
    setTempConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateConfig(tempConfig);
    toast.success('Configurações de cópia salvas com sucesso');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    onOpenChange(false);
  };

  const handleReset = () => {
    resetConfig();
    setTempConfig(config);
    toast.success('Configurações resetadas para o padrão');
  };

  const applyTemplate = (templateConfig: CopyConfig) => {
    setTempConfig(templateConfig);
  };

  const configOptions = [
    { key: 'includeName' as keyof CopyConfig, label: 'Nome da acomodação', description: 'Exibe o nome/título da acomodação' },
    { key: 'includeCategory' as keyof CopyConfig, label: 'Categoria', description: 'Exibe a categoria (Standard, Luxo, etc.)' },
    { key: 'includeCapacity' as keyof CopyConfig, label: 'Capacidade', description: 'Exibe o número de pessoas que a acomodação comporta' },
    { key: 'includeDescription' as keyof CopyConfig, label: 'Descrição', description: 'Exibe a descrição completa da acomodação' },
    { key: 'includeNights' as keyof CopyConfig, label: 'Número de diárias', description: 'Exibe quantas noites foram solicitadas' },
    { key: 'includeAlbumUrl' as keyof CopyConfig, label: 'Álbum de fotos', description: 'Exibe o link para o álbum de fotos' },
    { key: 'includePixPrice' as keyof CopyConfig, label: 'Valor PIX (diária)', description: 'Exibe o valor da diária para pagamento via PIX' },
    { key: 'includeCardPrice' as keyof CopyConfig, label: 'Valor Cartão (diária)', description: 'Exibe o valor da diária para pagamento com cartão' },
    { key: 'includePixTotal' as keyof CopyConfig, label: 'Valor total PIX', description: 'Exibe o valor total para pagamento via PIX' },
    { key: 'includeCardTotal' as keyof CopyConfig, label: 'Valor total Cartão', description: 'Exibe o valor total para pagamento com cartão' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Cópia
          </DialogTitle>
          <DialogDescription>
            Personalize quais informações aparecem quando você copia dados de uma acomodação.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configurações</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {configOptions.map((option) => (
                  <div key={option.key} className="flex items-start justify-between py-2">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">{option.label}</Label>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    <Switch
                      checked={tempConfig[option.key]}
                      onCheckedChange={(checked) => handleConfigChange(option.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Templates Predefinidos</Label>
              <div className="grid gap-3">
                {COPY_CONFIG_TEMPLATES.map((template) => (
                  <Card 
                    key={template.name} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => applyTemplate(template.config)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(template.config).map(([key, value]) => {
                          if (!value) return null;
                          const option = configOptions.find(opt => opt.key === key);
                          return option ? (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {option.label}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview da formatação:</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm">
                    {previewText ? (
                      <WhatsAppFormatter text={previewText} />
                    ) : (
                      <p className="text-muted-foreground italic">
                        Nenhum campo selecionado para exibição.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyConfigDialog;