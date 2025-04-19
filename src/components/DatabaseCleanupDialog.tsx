
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deleteAllAccommodations } from '@/integrations/supabase/services/accommodationService';
import { deleteAllPricePeriods } from '@/integrations/supabase/services/periodService';
import { deleteAllPrices } from '@/integrations/supabase/services/priceService';
import { useQueryClient } from '@tanstack/react-query';

interface DatabaseCleanupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCleanupComplete: () => void;
}

const DatabaseCleanupDialog: React.FC<DatabaseCleanupDialogProps> = ({
  isOpen,
  onOpenChange,
  onCleanupComplete
}) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const handleCleanup = async () => {
    setLoading(true);
    try {
      // Delete prices first (to avoid foreign key constraint issues)
      const pricesDeleted = await deleteAllPrices();
      if (!pricesDeleted) {
        throw new Error("Falha ao remover preços");
      }
      
      // Then delete periods and accommodations in parallel
      const [periodsDeleted, accommodationsDeleted] = await Promise.all([
        deleteAllPricePeriods(),
        deleteAllAccommodations()
      ]);
      
      if (!periodsDeleted || !accommodationsDeleted) {
        throw new Error("Falha ao remover períodos ou acomodações");
      }
      
      // Force invalidate all relevant queries to refresh UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['accommodations'] }),
        queryClient.invalidateQueries({ queryKey: ['periods'] }),
        queryClient.invalidateQueries({ queryKey: ['prices'] }),
        queryClient.invalidateQueries({ queryKey: ['search'] })
      ]);
      
      // Force refetch to ensure UI is updated
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['accommodations'] }),
        queryClient.refetchQueries({ queryKey: ['periods'] }),
        queryClient.refetchQueries({ queryKey: ['prices'] }),
        queryClient.refetchQueries({ queryKey: ['search'] })
      ]);
      
      toast.success("Banco de dados limpo com sucesso");
      onCleanupComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error cleaning database:", error);
      toast.error("Erro ao limpar o banco de dados: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Limpar Banco de Dados
          </DialogTitle>
          <DialogDescription>
            Esta ação irá remover permanentemente todos os dados de acomodações, períodos e preços.
            Esta operação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-4">
          <p className="text-amber-800 font-medium">Atenção!</p>
          <p className="text-amber-700 text-sm mt-1">
            Todos os dados serão removidos permanentemente do banco de dados. 
            Após esta operação, você precisará cadastrar manualmente todas as acomodações, 
            períodos e preços novamente.
          </p>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCleanup} 
            disabled={loading}
          >
            {loading ? "Processando..." : "Confirmar Limpeza"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseCleanupDialog;
