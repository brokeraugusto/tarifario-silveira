
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PricePeriod } from '@/types';
import { getAllPricePeriods, deletePricePeriod } from '@/integrations/supabase/services/periodService';

export const usePeriods = () => {
  const [periods, setPeriods] = useState<PricePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
  const [selectedPeriodIds, setSelectedPeriodIds] = useState<string[]>([]);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false);
  const [isUpdatingPeriods, setIsUpdatingPeriods] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [periodToDuplicate, setPeriodToDuplicate] = useState<PricePeriod | null>(null);

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      console.log('Fetching periods...');
      const data = await getAllPricePeriods();
      console.log('Fetched periods:', data);
      setPeriods(data || []);
      // Clear selection after refresh to avoid stale state
      setSelectedPeriodIds([]);
    } catch (error) {
      console.error("Error fetching periods:", error);
      toast.error("Erro ao buscar períodos");
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = () => {
    console.log('Opening add period dialog');
    setEditingPeriodId(null);
    setIsPeriodDialogOpen(true);
  };
  
  const handleEditPeriods = (ids: string[]) => {
    console.log('Edit periods called with:', ids);
    if (ids.length === 1) {
      setEditingPeriodId(ids[0]);
      setIsPeriodDialogOpen(true);
    } else {
      toast.error("Selecione apenas um período para editar");
    }
  };
  
  const handleDuplicatePeriods = (ids: string[]) => {
    console.log('Duplicate periods called with:', ids);
    if (ids.length === 1) {
      const periodId = ids[0];
      const period = periods.find(p => p.id === periodId);
      if (period) {
        setPeriodToDuplicate(period);
        setIsDuplicateDialogOpen(true);
      }
    } else {
      toast.error("Selecione apenas um período para duplicar");
    }
  };
  
  const handleDeletePeriods = (ids: string[]) => {
    console.log('Delete periods called with:', ids);
    setSelectedPeriodIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedPeriodIds.length === 0) {
      toast.error("Nenhum período selecionado para exclusão");
      return;
    }

    setLoading(true);
    setIsUpdatingPeriods(true);
    
    try {
      console.log('Confirming delete for periods:', selectedPeriodIds);
      
      let deletedCount = 0;
      let failedCount = 0;
      
      // Delete each period and count successful deletions
      for (const id of selectedPeriodIds) {
        console.log('Deleting period:', id);
        const success = await deletePricePeriod(id);
        if (success) {
          deletedCount++;
          console.log(`Period ${id} deleted successfully`);
        } else {
          failedCount++;
          console.error(`Failed to delete period ${id}`);
        }
      }
      
      console.log(`Deletion summary: ${deletedCount} successful, ${failedCount} failed`);
      
      if (deletedCount > 0) {
        console.log('Showing success toast and refreshing...');
        toast.success(`${deletedCount} período(s) excluído(s) com sucesso`);
        
        // Clear selection immediately
        setSelectedPeriodIds([]);
        
        // Refresh the periods list
        console.log('Calling fetchPeriods to refresh...');
        await fetchPeriods();
        console.log('Refresh completed');
      } else {
        toast.error("Nenhum período foi excluído");
      }
      
    } catch (error) {
      console.error("Error deleting periods:", error);
      toast.error("Erro ao excluir períodos");
    } finally {
      setLoading(false);
      setIsUpdatingPeriods(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const confirmPermanentDelete = async () => {
    setLoading(true);
    setIsUpdatingPeriods(true);
    try {
      console.log('Confirming permanent delete for periods:', selectedPeriodIds);
      
      for (const id of selectedPeriodIds) {
        const success = await deletePricePeriod(id);
        if (!success) {
          throw new Error(`Failed to permanently delete period ${id}`);
        }
      }
      
      toast.success(`${selectedPeriodIds.length} período(s) excluído(s) permanentemente`);
      
      // Refresh the periods list
      await fetchPeriods();
      
    } catch (error) {
      console.error("Error permanently deleting periods:", error);
      toast.error("Erro ao excluir permanentemente períodos");
    } finally {
      setLoading(false);
      setIsUpdatingPeriods(false);
      setIsPermanentDeleteDialogOpen(false);
      setSelectedPeriodIds([]);
    }
  };

  const handlePeriodSuccess = async () => {
    console.log('Period success callback triggered');
    setIsPeriodDialogOpen(false);
    setEditingPeriodId(null);
    
    // Refresh the periods list
    await fetchPeriods();
    
    toast.success("Operação realizada com sucesso");
  };

  return {
    periods,
    loading,
    selectedPeriodIds,
    setSelectedPeriodIds,
    editingPeriodId,
    isPeriodDialogOpen,
    setIsPeriodDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isPermanentDeleteDialogOpen,
    setIsPermanentDeleteDialogOpen,
    isDuplicateDialogOpen,
    setIsDuplicateDialogOpen,
    periodToDuplicate,
    setPeriodToDuplicate,
    isUpdatingPeriods,
    handleAddPeriod,
    handleEditPeriods,
    handleDuplicatePeriods,
    handleDeletePeriods,
    confirmDelete,
    confirmPermanentDelete,
    handlePeriodSuccess,
    fetchPeriods
  };
};

export default usePeriods;
