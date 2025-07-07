import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Coffee, Trash2, ExternalLink, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
import { deleteAccommodation } from '@/integrations/supabase';

interface AccommodationDialogProps {
  result?: SearchResult;
  isOpen: boolean;
  onClose: () => void;
  onReload?: () => void;
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
  const [selectedPriceType, setSelectedPriceType] = useState<'pix' | 'card' | null>(null);
  
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('info');
      setProceedWithBooking(false);
    }
  }, [isOpen]);
  
  const accommodation = result?.accommodation;
  const isMinStayViolation = result?.isMinStayViolation || false;
  const minimumStay = result?.minimumStay || 0;
  const nights = result?.nights || 0;
  
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

  const handleDeleteClick = () => {
    if (result?.accommodation) {
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!result?.accommodation) return;
    
    setIsDeleting(true);
    try {
      console.log('Deleting accommodation from dialog:', result.accommodation.id);
      const success = await deleteAccommodation(result.accommodation.id);
      
      if (success) {
        toast.success("Acomodação excluída com sucesso");
        setIsDeleteDialogOpen(false);
        if (onReload) {
          await onReload(); // Ensure this actually awaits the reload
        }
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

  const handleCopyToClipboard = () => {
    if (!accommodation) return;
    
    let text = `*${accommodation.name}*\n\n`;
    text += `*Categoria:* ${accommodation.category}\n`;
    text += `*Capacidade:* ${accommodation.capacity} pessoas\n\n`;
    text += `${accommodation.description}\n\n`;
    
    if (accommodation.albumUrl && accommodation.albumUrl.trim() !== '') {
      text += `*Álbum de fotos:* ${accommodation.albumUrl}\n\n`;
    }
    
    // Add price information based on selected type
    const pixPrice = result?.pixPrice || 0;
    const cardPrice = result?.cardPrice || 0;
    const pixTotal = result?.pixTotalPrice;
    const cardTotal = result?.cardTotalPrice;
    
    if (pixPrice > 0 && cardPrice > 0) {
      if (selectedPriceType === 'pix') {
        text += `*Valor da diária (PIX):* R$ ${pixPrice.toFixed(2)}\n`;
        if (nights !== null && nights > 0 && pixTotal !== null) {
          text += `*Número de diárias:* ${nights}\n`;
          text += `*Valor total (PIX):* R$ ${pixTotal.toFixed(2)}\n`;
        }
      } else if (selectedPriceType === 'card') {
        text += `*Valor da diária (Cartão):* R$ ${cardPrice.toFixed(2)}\n`;
        if (nights !== null && nights > 0 && cardTotal !== null) {
          text += `*Número de diárias:* ${nights}\n`;
          text += `*Valor total (Cartão):* R$ ${cardTotal.toFixed(2)}\n`;
        }
      } else {
        text += `*Valor da diária (PIX):* R$ ${pixPrice.toFixed(2)}\n`;
        text += `*Valor da diária (Cartão):* R$ ${cardPrice.toFixed(2)}\n`;
        if (nights !== null && nights > 0) {
          if (pixTotal !== null) {
            text += `*Valor total (PIX):* R$ ${pixTotal.toFixed(2)}\n`;
          }
          if (cardTotal !== null) {
            text += `*Valor total (Cartão):* R$ ${cardTotal.toFixed(2)}\n`;
          }
        }
      }
    } else if (pricePerNight > 0) {
      text += `*Valor da diária:* R$ ${pricePerNight.toFixed(2)}\n`;
      
      if (nights !== null && nights > 0) {
        text += `*Número de diárias:* ${nights}\n`;
        
        if (totalPrice !== null) {
          text += `*Valor total:* R$ ${totalPrice.toFixed(2)}\n`;
        }
      }
    }
    
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Informações copiadas para o clipboard"))
      .catch(() => toast.error("Erro ao copiar informações"));
  };

  const handleShareWhatsApp = () => {
    if (!accommodation) return;
    
    let text = `*${accommodation.name}*\n\n`;
    text += `*Categoria:* ${accommodation.category}\n`;
    text += `*Capacidade:* ${accommodation.capacity} pessoas\n\n`;
    text += `${accommodation.description}\n\n`;
    
    if (accommodation.albumUrl && accommodation.albumUrl.trim() !== '') {
      text += `*Álbum de fotos:* ${accommodation.albumUrl}\n\n`;
    }
    
    // Add price information if available
    if (pricePerNight > 0) {
      text += `*Valor da diária:* R$ ${pricePerNight.toFixed(2)}\n`;
      
      if (nights !== null && nights > 0) {
        text += `*Número de diárias:* ${nights}\n`;
        
        if (totalPrice !== null) {
          text += `*Valor total:* R$ ${totalPrice.toFixed(2)}\n`;
        }
      }
    }
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const hasAlbumUrl = accommodation?.albumUrl && accommodation.albumUrl.trim() !== '';
  
  const hasResult = !!result;
  const pricePerNight = result?.pricePerNight || 0;
  const totalPrice = result?.totalPrice || 0;
  const includesBreakfast = result?.includesBreakfast || false;
  
  const images = hasResult && accommodation?.images && accommodation.images.length > 0 
    ? accommodation.images 
    : hasResult && accommodation ? [accommodation.imageUrl] : [];

  const renderContent = () => {
    return (
      <>
        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          {accommodation && (
            <img 
              src={accommodation.imageUrl} 
              alt={accommodation.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          {hasResult && accommodation && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyToClipboard}
                title="Copiar informações"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShareWhatsApp}
                title="Compartilhar via WhatsApp"
              >
                Compartilhar
              </Button>
              
              {hasAlbumUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(accommodation.albumUrl, '_blank')}
                  title="Ver álbum completo"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Álbum
                </Button>
              )}
            </>
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
            
            {hasAlbumUrl && (
              <div className="flex items-center gap-2 col-span-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={accommodation?.albumUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  Ver álbum completo
                </a>
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
          
          {result?.pixPrice && result?.cardPrice ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedPriceType === 'pix' 
                    ? "border-hotel-green bg-green-50" 
                    : "border-border hover:bg-muted"
                )}
                onClick={() => setSelectedPriceType('pix')}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-hotel-green">PIX</div>
                    <div className="text-lg font-bold">R$ {result.pixPrice.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">por noite</div>
                  </div>
                </div>
                
                <div className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedPriceType === 'card' 
                    ? "border-hotel-navy bg-blue-50" 
                    : "border-border hover:bg-muted"
                )}
                onClick={() => setSelectedPriceType('card')}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-hotel-navy">Cartão</div>
                    <div className="text-lg font-bold">R$ {result.cardPrice.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">por noite</div>
                  </div>
                </div>
              </div>
              
              {nights !== null && nights > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período:</span>
                    <span>{nights} {nights === 1 ? 'noite' : 'noites'}</span>
                  </div>
                  
                  {selectedPriceType === 'pix' && result.pixTotalPrice !== null && (
                    <div className="flex justify-between text-lg font-semibold text-hotel-green">
                      <span>Total PIX:</span>
                      <span>R$ {result.pixTotalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {selectedPriceType === 'card' && result.cardTotalPrice !== null && (
                    <div className="flex justify-between text-lg font-semibold text-hotel-navy">
                      <span>Total Cartão:</span>
                      <span>R$ {result.cardTotalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {!selectedPriceType && (
                    <div className="space-y-1">
                      {result.pixTotalPrice !== null && (
                        <div className="flex justify-between text-lg font-semibold text-hotel-green">
                          <span>Total PIX:</span>
                          <span>R$ {result.pixTotalPrice.toFixed(2)}</span>
                        </div>
                      )}
                      {result.cardTotalPrice !== null && (
                        <div className="flex justify-between text-lg font-semibold text-hotel-navy">
                          <span>Total Cartão:</span>
                          <span>R$ {result.cardTotalPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </>
    );
  };

  const renderActions = () => {
    return (
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Fechar
        </Button>
        
        {/* Note: Removed the Delete button as requested */}
      </div>
    );
  };

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
                {renderContent()}
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
            {renderActions()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
