
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accommodation, SearchResult } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import AccommodationDetails from './AccommodationDetails';

interface AccommodationDialogProps {
  result?: SearchResult;
  isOpen: boolean;
  onClose: () => void;
}

const AccommodationDialog = ({ result, isOpen, onClose }: AccommodationDialogProps) => {
  if (!result) return null;

  const { accommodation, pricePerNight, totalPrice, nights, isMinStayViolation, minimumStay } = result;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Luxo':
        return 'bg-purple-100 text-purple-800';
      case 'Super Luxo':
        return 'bg-amber-100 text-amber-800';
      case 'De Luxe':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <DialogTitle className="text-xl">{accommodation.name}</DialogTitle>
            <Badge className={cn(getCategoryColor(accommodation.category))}>
              {accommodation.category}
            </Badge>
          </div>
          <DialogDescription>
            Capacidade para até {accommodation.capacity} pessoas
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <AccommodationDetails accommodation={accommodation} />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalhes da Reserva</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diária:</span>
                <span className="font-medium">R$ {pricePerNight.toFixed(2)}</span>
              </div>
              
              {nights !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Noites:</span>
                  <span>{nights}</span>
                </div>
              )}
              
              {isMinStayViolation && (
                <div className="text-amber-600 text-sm font-medium">
                  * Requer estadia mínima de {minimumStay} noites
                </div>
              )}
              
              <Separator />
              
              {totalPrice !== null && (
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccommodationDialog;
