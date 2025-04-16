
import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Accommodation, BlockReasonType } from '@/types';
import { blockAccommodation, unblockAccommodation } from '@/utils/accommodationService';

interface BlockDialogProps {
  accommodation: Accommodation | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (accommodation: Accommodation) => void;
}

const AccommodationBlockDialog: React.FC<BlockDialogProps> = ({ 
  accommodation, isOpen, onOpenChange, onUpdate 
}) => {
  const [reason, setReason] = useState<BlockReasonType>('Manutenção');
  const [note, setNote] = useState('');
  
  // If accommodation is null, don't render the dialog content
  if (!accommodation) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
            <DialogDescription>
              Não foi possível carregar os detalhes da acomodação.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  const handleBlock = () => {
    try {
      const updated = blockAccommodation(accommodation.id, reason, note);
      if (updated) {
        toast.success(`Acomodação ${accommodation.roomNumber} bloqueada com sucesso.`);
        onUpdate(updated);
        onOpenChange(false);
      } else {
        toast.error("Erro ao bloquear acomodação");
      }
    } catch (error) {
      toast.error("Erro ao bloquear acomodação");
      console.error(error);
    }
  };
  
  const handleUnblock = () => {
    try {
      const updated = unblockAccommodation(accommodation.id);
      if (updated) {
        toast.success(`Acomodação ${accommodation.roomNumber} desbloqueada com sucesso.`);
        onUpdate(updated);
        onOpenChange(false);
      } else {
        toast.error("Erro ao desbloquear acomodação");
      }
    } catch (error) {
      toast.error("Erro ao desbloquear acomodação");
      console.error(error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {accommodation.isBlocked 
              ? `Desbloquear Acomodação ${accommodation.roomNumber}`
              : `Bloquear Acomodação ${accommodation.roomNumber}`
            }
          </DialogTitle>
          <DialogDescription>
            {accommodation.isBlocked 
              ? 'Esta acomodação está atualmente bloqueada. Deseja liberá-la para reservas?'
              : 'Informe o motivo pelo qual esta acomodação não estará disponível para reservas.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {!accommodation.isBlocked && (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo do Bloqueio</Label>
                <Select 
                  value={reason} 
                  onValueChange={(value) => setReason(value as BlockReasonType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reforma">Reforma</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Locação Mensal">Locação Mensal</SelectItem>
                    <SelectItem value="Locação Anual">Locação Anual</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Observações (opcional)</Label>
                <Input 
                  id="note" 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Detalhes adicionais sobre o bloqueio"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBlock}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Bloquear
              </Button>
            </DialogFooter>
          </>
        )}
        
        {accommodation.isBlocked && (
          <>
            {accommodation.blockReason && (
              <div className="py-4">
                <p className="text-sm font-medium">Motivo atual: {accommodation.blockReason}</p>
                {accommodation.blockNote && (
                  <p className="text-sm text-muted-foreground mt-1">{accommodation.blockNote}</p>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                variant="default" 
                onClick={handleUnblock}
                className="flex items-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                Desbloquear
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccommodationBlockDialog;
