
import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { Accommodation, BlockReasonType } from '@/types';
import { blockAccommodation, unblockAccommodation } from '@/integrations/supabase/services/accommodations/blocking';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BlockDialogProps {
  accommodation: Accommodation | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (accommodation: Accommodation) => void;
}

const AccommodationBlockDialog: React.FC<BlockDialogProps> = ({ 
  accommodation, isOpen, onOpenChange, onUpdate 
}) => {
  const [reason, setReason] = useState<BlockReasonType>('maintenance');
  const [note, setNote] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)) // Padrão para 7 dias
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset do formulário quando o diálogo abre ou a acomodação muda
  useEffect(() => {
    if (isOpen && accommodation) {
      setReason(accommodation.blockReason || 'maintenance');
      setNote(accommodation.blockNote || '');
      
      // Se a acomodação tem período de bloqueio, utilize-o
      if (accommodation.blockPeriod && accommodation.blockPeriod.from && accommodation.blockPeriod.to) {
        setDateRange({
          from: new Date(accommodation.blockPeriod.from),
          to: new Date(accommodation.blockPeriod.to)
        });
      } else {
        setDateRange({
          from: new Date(),
          to: new Date(new Date().setDate(new Date().getDate() + 7))
        });
      }
    }
  }, [isOpen, accommodation]);
  
  // Renderização antecipada para caso em que accommodation é null
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

  const handleBlock = async () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      toast.error("Selecione um período de bloqueio válido");
      return;
    }
    
    setIsLoading(true);
    try {
      const blockPeriod = {
        from: dateRange.from,
        to: dateRange.to
      };
      
      const updated = await blockAccommodation(accommodation.id, reason, note, blockPeriod);
      if (updated) {
        toast.success(`Acomodação ${accommodation.roomNumber} bloqueada com sucesso.`);
        onUpdate(updated);
        onOpenChange(false);
      } else {
        toast.error("Erro ao bloquear acomodação");
      }
    } catch (error) {
      console.error("Erro ao bloquear acomodação:", error);
      toast.error("Erro ao bloquear acomodação. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUnblock = async () => {
    setIsLoading(true);
    try {
      const updated = await unblockAccommodation(accommodation.id);
      if (updated) {
        toast.success(`Acomodação ${accommodation.roomNumber} desbloqueada com sucesso.`);
        onUpdate(updated);
        onOpenChange(false);
      } else {
        toast.error("Erro ao desbloquear acomodação");
      }
    } catch (error) {
      console.error("Erro ao desbloquear acomodação:", error);
      toast.error("Erro ao desbloquear acomodação. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
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
              : 'Informe o motivo e período pelo qual esta acomodação não estará disponível para reservas.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {!accommodation.isBlocked ? (
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
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                    <SelectItem value="unavailable">Indisponível</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Período do Bloqueio</Label>
                <DatePickerWithRange 
                  dateRange={dateRange} 
                  onDateRangeChange={setDateRange}
                  disablePastDates={false}
                />
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
                disabled={isLoading}
              >
                <Lock className="h-4 w-4" />
                {isLoading ? 'Bloqueando...' : 'Bloquear'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4 space-y-2">
              {accommodation.blockReason && (
                <p className="text-sm font-medium">Motivo atual: {accommodation.blockReason}</p>
              )}
              
              {accommodation.blockPeriod && accommodation.blockPeriod.from && accommodation.blockPeriod.to && (
                <p className="text-sm font-medium">
                  Período: {format(new Date(accommodation.blockPeriod.from), 'dd/MM/yyyy', { locale: ptBR })} até {format(new Date(accommodation.blockPeriod.to), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              )}
              
              {accommodation.blockNote && (
                <p className="text-sm text-muted-foreground mt-1">{accommodation.blockNote}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                variant="default" 
                onClick={handleUnblock}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Unlock className="h-4 w-4" />
                {isLoading ? 'Desbloqueando...' : 'Desbloquear'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccommodationBlockDialog;
