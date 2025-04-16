
import React, { useState } from 'react';
import { X, Calendar, User, Coffee, CoffeeOff } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SearchResult } from '@/types';
import WhatsAppFormatter from './WhatsAppFormatter';

interface AccommodationDialogProps {
  result?: SearchResult;
  isOpen: boolean;
  onClose: () => void;
}

const AccommodationDialog: React.FC<AccommodationDialogProps> = ({ result, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  const [isMinStayDialogOpen, setIsMinStayDialogOpen] = useState<boolean>(false);
  const [proceedWithBooking, setProceedWithBooking] = useState<boolean>(false);

  if (!result) return null;

  const { accommodation, pricePerNight, totalPrice, nights, isMinStayViolation, minimumStay, includesBreakfast } = result;
  const images = accommodation.images && accommodation.images.length > 0 
    ? accommodation.images 
    : [accommodation.imageUrl];

  // Verificar se violação de estadia mínima e não foi aprovado ainda
  React.useEffect(() => {
    if (isMinStayViolation && !proceedWithBooking && isOpen) {
      setIsMinStayDialogOpen(true);
    }
  }, [isMinStayViolation, proceedWithBooking, isOpen]);

  // Reset do estado quando o diálogo é fechado
  React.useEffect(() => {
    if (!isOpen) {
      setProceedWithBooking(false);
    }
  }, [isOpen]);

  const handleProceed = () => {
    setProceedWithBooking(true);
    setIsMinStayDialogOpen(false);
  };

  const handleCancel = () => {
    setIsMinStayDialogOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {accommodation.name}
                <Badge variant="outline" className="ml-2">
                  {accommodation.category}
                </Badge>
              </div>
              <Button variant="outline" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="photos">Fotos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img 
                  src={accommodation.imageUrl} 
                  alt={accommodation.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Detalhes</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Capacidade: {accommodation.capacity} pessoas</span>
                  </div>
                  
                  {nights !== null && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{nights} {nights === 1 ? 'noite' : 'noites'}</span>
                    </div>
                  )}
                  
                  {includesBreakfast ? (
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-muted-foreground" />
                      <span>Café da manhã incluso</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CoffeeOff className="h-4 w-4 text-muted-foreground" />
                      <span>Café da manhã não incluso</span>
                    </div>
                  )}
                  
                  {minimumStay && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Mínimo de {minimumStay} {minimumStay === 1 ? 'diária' : 'diárias'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Descrição</h3>
                <div className="text-sm text-muted-foreground">
                  <WhatsAppFormatter text={accommodation.description} />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Preços</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diária:</span>
                    <span>R$ {pricePerNight.toFixed(2)}</span>
                  </div>
                  
                  {nights !== null && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Período:</span>
                        <span>{nights} {nights === 1 ? 'noite' : 'noites'}</span>
                      </div>
                      
                      {totalPrice !== null && (
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total:</span>
                          <span>R$ {totalPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="photos" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${accommodation.name} - Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
            <Button>Reservar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de alerta para estadia mínima */}
      <AlertDialog open={isMinStayDialogOpen} onOpenChange={setIsMinStayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estadia Mínima Requerida</AlertDialogTitle>
            <AlertDialogDescription>
              Este período requer uma estadia mínima de {minimumStay} {minimumStay === 1 ? 'diária' : 'diárias'}.
              Sua seleção atual é de {nights} {nights === 1 ? 'diária' : 'diárias'}.
              Deseja prosseguir mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleProceed}>Prosseguir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccommodationDialog;
