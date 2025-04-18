
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
  
  const handleCleanup = async () => {
    setLoading(true);
    try {
      // Delete all prices first to avoid foreign key constraints
      await deleteAllPrices();
      
      // Then delete periods and accommodations (order doesn't matter now)
      await Promise.all([
        deleteAllPricePeriods(),
        deleteAllAccommodations()
      ]);
      
      toast.success("Banco de dados limpo com sucesso");
      onOpenChange(false);
      onCleanupComplete();
    } catch (error) {
      console.error("Error cleaning database:", error);
      toast.error("Erro ao limpar o banco de dados");
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
