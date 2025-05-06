
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { SearchResult } from '@/types';
import { toast } from 'sonner';
import { deleteAccommodation } from '@/integrations/supabase';

// Import refactored components
import DetailTab from './accommodation/DetailTab';
import PhotosTab from './accommodation/PhotosTab';
import DialogFooterActions from './accommodation/DialogFooterActions';
import DeleteConfirmDialog from './accommodation/DeleteConfirmDialog';
import MinStayAlertDialog from './accommodation/MinStayAlertDialog';

interface AccommodationDialogProps {
  result?: SearchResult;
  isOpen: boolean;
  onClose: () => void;
  onReload?: () => void;
  showDeleteButton?: boolean;
}

const AccommodationDialog: React.FC<AccommodationDialogProps> = ({ 
  result, 
  isOpen, 
  onClose,
  onReload,
  showDeleteButton = true
}) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  const [isMinStayDialogOpen, setIsMinStayDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [proceedWithBooking, setProceedWithBooking] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
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

  const hasResult = !!result;
  
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
          
          {hasResult && result ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="photos">Fotos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <DetailTab result={result} />
              </TabsContent>
              
              <TabsContent value="photos">
                <PhotosTab result={result} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma acomodação selecionada
            </div>
          )}
          
          <DialogFooter>
            <DialogFooterActions 
              result={result} 
              onClose={onClose} 
              onDelete={handleDeleteClick}
              showDeleteButton={showDeleteButton}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MinStayAlertDialog
        isOpen={isMinStayDialogOpen}
        onOpenChange={setIsMinStayDialogOpen}
        onProceed={handleProceed}
        onCancel={handleCancel}
        minimumStay={minimumStay}
        nights={nights}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default AccommodationDialog;
