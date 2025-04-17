
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Coffee, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { deleteAccommodation } from '@/utils/accommodationService';

interface AccommodationDialogProps {
  result?: SearchResult;
  isOpen: boolean;
  onClose: () => void;
  onReload?: () => void; // New prop for reloading data after deletion
}

const AccommodationDialog: React.FC<AccommodationDialogProps> = ({ 
  result, 
  isOpen, 
  onClose,
  onReload
}) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  const [isMinStayDialogOpen, setIsMinStayDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [proceedWithBooking, setProceedWithBooking] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Reset on dialog close
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('info');
      setProceedWithBooking(false);
    }
  }, [isOpen]);
  
  // Always define these values, preventing conditional hooks
  const isMinStayViolation = result?.isMinStayViolation || false;
  const minimumStay = result?.minimumStay || 0;
  const nights = result?.nights || 0;
  
  // Use an unconditional useEffect
  useEffect(() => {
    if (isMinStayViolation && !proceedWithBooking && isOpen) {
      setIsMinStayDialogOpen(true);
    }
  }, [isMinStayViolation, proceedWithBooking, isOpen]);

  const handleProceed = () => {
    setProceedWithBooking(true);
    setIsMinStayDialogOpen(false);
  };

  const handleCancel = () => {
    setIsMinStayDialogOpen(false);
    onClose();
  };

  // Handle permanent deletion
  const handleDeleteClick = () => {
    if (result?.accommodation) {
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!result?.accommodation) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteAccommodation(result.accommodation.id);
      if (success) {
        toast.success("Acomodação excluída com sucesso");
        setIsDeleteDialogOpen(false);
        if (onReload) onReload();
        onClose();
      } else {
        toast.error("Erro ao excluir acomodação");
      }
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      toast.error("Erro ao excluir acomodação");
    } finally {
      setIsDeleting(false);
    }
  };
  
  // If no result is provided, render dialog with empty content
  const hasResult = !!result;
  const accommodation = result?.accommodation;
  const pricePerNight = result?.pricePerNight || 0;
  const totalPrice = result?.totalPrice || 0;
  const includesBreakfast = result?.includesBreakfast || false;
  
  // Prepare the images array safely
  const images = hasResult && accommodation?.images && accommodation.images.length > 0 
    ? accommodation.images 
    : hasResult && accommodation ? [accommodation.imageUrl] : [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasResult ? accommodation?.name : 'Acomodação'}
                {hasResult && accommodation && (
                  <Badge variant="outline" className="ml-2">
                    {accommodation.category}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {hasResult ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="photos">Fotos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                  {accommodation && (
                    <img 
                      src={accommodation.imageUrl} 
                      alt={accommodation.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Detalhes</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {accommodation && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Capacidade: {accommodation.capacity} pessoas</span>
                      </div>
                    )}
                    
                    {nights !== null && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{nights} {nights === 1 ? 'noite' : 'noites'}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-muted-foreground" />
                      <span>{includesBreakfast ? 'Café da manhã incluso' : 'Café da manhã não incluso'}</span>
                    </div>
                    
                    {minimumStay > 0 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Mínimo de {minimumStay} {minimumStay === 1 ? 'diária' : 'diárias'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {accommodation && (
                  <>
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Descrição</h3>
                      <div className="text-sm text-muted-foreground">
                        <WhatsAppFormatter text={accommodation.description} />
                      </div>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Preços</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diária:</span>
                      <span>R$ {pricePerNight.toFixed(2)}</span>
                    </div>
                    
                    {nights !== null && nights > 0 && (
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
                        alt={`${accommodation?.name || 'Acomodação'} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma acomodação selecionada
            </div>
          )}
          
          <DialogFooter className="mt-4 flex flex-row justify-between">
            <div className="flex gap-2">
              {hasResult && accommodation && (
                <Button variant="destructive" onClick={handleDeleteClick} size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Fechar</Button>
              {hasResult && <Button>Reservar</Button>}
            </div>
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

      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente esta acomodação?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting} 
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir Permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccommodationDialog;
