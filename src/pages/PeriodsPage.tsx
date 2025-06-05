
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PeriodDialog from '@/components/PeriodDialog';
import CategoryPriceDialog from '@/components/CategoryPriceDialog';
import DuplicateDialog from '@/components/DuplicateDialog';
import CategoryPricesList from '@/components/CategoryPricesList';
import { duplicatePricePeriod } from '@/integrations/supabase/services/periodService';
import { CategoryType } from '@/types';
import usePeriods from '@/hooks/usePeriods';
import PeriodsList from '@/components/periods/PeriodsList';
import CategoryPricesGrid from '@/components/periods/CategoryPricesGrid';
import DeletePeriodDialog from '@/components/periods/DeletePeriodDialog';

const PeriodsPage: React.FC = () => {
  const {
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
    handlePeriodSuccess
  } = usePeriods();

  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null);
  const [isCategoryPriceDialogOpen, setIsCategoryPriceDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("periods");

  const handleOpenCategoryPrice = (category: CategoryType) => {
    setCurrentCategory(category);
    setIsCategoryPriceDialogOpen(true);
  };

  const handleCategoryPriceUpdate = () => {
    toast.success("Preços atualizados com sucesso");
  };

  const handleDuplicatePeriod = async (newName: string) => {
    if (!periodToDuplicate) return;
    try {
      const result = await duplicatePricePeriod(periodToDuplicate.id, newName);
      if (result) {
        toast.success(`Período duplicado com sucesso`);
        return Promise.resolve();
      } else {
        throw new Error('Falha ao duplicar período');
      }
    } catch (error) {
      console.error("Error duplicating period:", error);
      toast.error("Erro ao duplicar período");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Períodos e Preços</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os períodos de preços e configure valores por categoria de acomodação.
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="periods">Períodos</TabsTrigger>
          <TabsTrigger value="prices">Preços por Categoria</TabsTrigger>
          <TabsTrigger value="prices-list">Lista de Preços</TabsTrigger>
        </TabsList>
        
        <TabsContent value="periods" className="space-y-4 mt-4">
          <PeriodsList 
            periods={periods}
            selectedPeriodIds={selectedPeriodIds}
            setSelectedPeriodIds={setSelectedPeriodIds}
            handleEditPeriods={handleEditPeriods}
            handleDeletePeriods={handleDeletePeriods}
            handleDuplicatePeriods={handleDuplicatePeriods}
            handleAddPeriod={handleAddPeriod}
            isUpdatingPeriods={isUpdatingPeriods}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="prices" className="space-y-6 mt-4">
          <CategoryPricesGrid handleOpenCategoryPrice={handleOpenCategoryPrice} />
        </TabsContent>
        
        <TabsContent value="prices-list" className="space-y-6 mt-4">
          <CategoryPricesList />
        </TabsContent>
      </Tabs>
      
      <PeriodDialog 
        isOpen={isPeriodDialogOpen} 
        onOpenChange={setIsPeriodDialogOpen} 
        onSuccess={handlePeriodSuccess} 
        periodId={editingPeriodId || undefined} 
      />
      
      <CategoryPriceDialog 
        category={currentCategory as CategoryType} 
        isOpen={isCategoryPriceDialogOpen} 
        onOpenChange={setIsCategoryPriceDialogOpen} 
        onUpdate={handleCategoryPriceUpdate} 
      />
      
      {periodToDuplicate && (
        <DuplicateDialog 
          isOpen={isDuplicateDialogOpen} 
          onOpenChange={setIsDuplicateDialogOpen} 
          title="Duplicar Período" 
          description={`Duplicar o período "${periodToDuplicate.name}" com todos os seus preços associados.`} 
          nameLabel="Nome do Novo Período" 
          originalName={periodToDuplicate.name} 
          onConfirm={handleDuplicatePeriod} 
        />
      )}
      
      <DeletePeriodDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        loading={loading}
        count={selectedPeriodIds.length}
      />
      
      <DeletePeriodDialog 
        isOpen={isPermanentDeleteDialogOpen}
        onOpenChange={setIsPermanentDeleteDialogOpen}
        onConfirm={confirmPermanentDelete}
        loading={loading}
        count={selectedPeriodIds.length}
        isPermanentDelete
      />
    </div>
  );
};

export default PeriodsPage;
