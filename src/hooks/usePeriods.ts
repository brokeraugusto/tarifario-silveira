
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
      const data = await getAllPricePeriods();
      console.log('Fetched periods:', data);
      setPeriods(data);
    } catch (error) {
      console.error("Error fetching periods:", error);
      toast.error("Erro ao buscar períodos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = () => {
    setEditingPeriodId(null);
    setIsPeriodDialogOpen(true);
  };
  
  const handleEditPeriods = (ids: string[]) => {
    if (ids.length === 1) {
      setEditingPeriodId(ids[0]);
      setIsPeriodDialogOpen(true);
    } else {
      toast.error("Selecione apenas um período para editar");
    }
  };
  
  const handleDuplicatePeriods = (ids: string[]) => {
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
    setSelectedPeriodIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      for (const id of selectedPeriodIds) {
        await deletePricePeriod(id);
      }
      toast.success(`${selectedPeriodIds.length} período(s) excluído(s) com sucesso`);
      await fetchPeriods(); // Refresh após delete
    } catch (error) {
      console.error("Error deleting periods:", error);
      toast.error("Erro ao excluir períodos");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedPeriodIds([]);
    }
  };
  
  const confirmPermanentDelete = async () => {
    setLoading(true);
    try {
      for (const id of selectedPeriodIds) {
        await deletePricePeriod(id);
      }
      toast.success(`${selectedPeriodIds.length} período(s) excluído(s) permanentemente`);
      await fetchPeriods(); // Refresh após delete permanente
    } catch (error) {
      console.error("Error permanently deleting periods:", error);
      toast.error("Erro ao excluir permanentemente períodos");
    } finally {
      setLoading(false);
      setIsPermanentDeleteDialogOpen(false);
      setSelectedPeriodIds([]);
    }
  };

  const handlePeriodSuccess = async () => {
    setIsPeriodDialogOpen(false);
    await fetchPeriods(); // Refresh imediato após criação/edição
    setSelectedPeriodIds([]); // Limpar seleções
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
