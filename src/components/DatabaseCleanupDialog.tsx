
import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { deleteAllAccommodations } from '@/integrations/supabase/services/accommodations';
import { deleteAllPricePeriods } from '@/integrations/supabase/services/periodService';
import { deleteAllPrices } from '@/integrations/supabase/services/priceService';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseCleanupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCleanupComplete: () => void;
}

type CleanupType = 'all' | 'accommodations' | 'periods' | 'prices';

const DatabaseCleanupDialog: React.FC<DatabaseCleanupDialogProps> = ({
  isOpen,
  onOpenChange,
  onCleanupComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [cleanupType, setCleanupType] = useState<CleanupType>('all');
  const [passwordError, setPasswordError] = useState('');
  const queryClient = useQueryClient();
  
  const validatePassword = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setPasswordError('Você precisa estar logado para realizar esta operação');
        return false;
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: session.user.email || '',
        password: password,
      });
      
      if (error) {
        setPasswordError('Senha incorreta');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error validating password:", error);
      setPasswordError('Erro ao validar senha');
      return false;
    }
  };

  const handleCleanup = async () => {
    setLoading(true);
    setPasswordError('');
    
    try {
      // First validate the password
      const isPasswordValid = await validatePassword();
      
      if (!isPasswordValid) {
        setLoading(false);
        return;
      }
      
      // Execute the cleanup based on the selected type
      if (cleanupType === 'prices' || cleanupType === 'all') {
        const pricesDeleted = await deleteAllPrices();
        if (!pricesDeleted) {
          throw new Error("Falha ao remover preços");
        }
      }
      
      const cleanupTasks = [];
      
      if (cleanupType === 'periods' || cleanupType === 'all') {
        cleanupTasks.push(deleteAllPricePeriods());
      }
      
      if (cleanupType === 'accommodations' || cleanupType === 'all') {
        cleanupTasks.push(deleteAllAccommodations());
      }
      
      if (cleanupTasks.length > 0) {
        const results = await Promise.all(cleanupTasks);
        if (results.some(result => !result)) {
          throw new Error("Falha em algumas operações de limpeza");
        }
      }
      
      // Force invalidate all relevant queries to refresh UI
      const queriesToInvalidate = [];
      
      if (cleanupType === 'accommodations' || cleanupType === 'all') {
        queriesToInvalidate.push(['accommodations']);
      }
      
      if (cleanupType === 'periods' || cleanupType === 'all') {
        queriesToInvalidate.push(['periods']);
      }
      
      if (cleanupType === 'prices' || cleanupType === 'all') {
        queriesToInvalidate.push(['prices']);
      }
      
      if (cleanupType === 'all') {
        queriesToInvalidate.push(['search']);
      }
      
      await Promise.all(
        queriesToInvalidate.map(query => queryClient.invalidateQueries({ queryKey: query }))
      );
      
      // Force refetch to ensure UI is updated
      await Promise.all(
        queriesToInvalidate.map(query => queryClient.refetchQueries({ queryKey: query }))
      );
      
      toast.success("Limpeza concluída com sucesso");
      onCleanupComplete();
      onOpenChange(false);
      setPassword('');
      setCleanupType('all');
    } catch (error) {
      console.error("Error cleaning database:", error);
      toast.error("Erro durante a limpeza: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setPassword('');
        setPasswordError('');
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Limpar Banco de Dados
          </DialogTitle>
          <DialogDescription>
            Esta ação irá remover permanentemente dados do sistema. 
            Esta operação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-amber-800 font-medium">Zona de perigo!</p>
            <p className="text-amber-700 text-sm mt-1">
              Dados selecionados serão removidos permanentemente do banco de dados. 
              Você precisará cadastrar novamente após esta operação.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>O que você deseja limpar?</Label>
            <RadioGroup value={cleanupType} onValueChange={(value) => setCleanupType(value as CleanupType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Todos os dados (acomodações, períodos e preços)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="accommodations" id="accommodations" />
                <Label htmlFor="accommodations">Apenas acomodações</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="periods" id="periods" />
                <Label htmlFor="periods">Apenas períodos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prices" id="prices" />
                <Label htmlFor="prices">Apenas preços</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Confirme sua senha para continuar</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="Digite sua senha"
              className={passwordError ? "border-red-500" : ""}
            />
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          </div>
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
            disabled={loading || !password}
            className="flex items-center"
          >
            {loading ? "Processando..." : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Confirmar Limpeza
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseCleanupDialog;
