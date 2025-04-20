
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Calendar, FileSpreadsheet, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MultiSelectTable, { Column } from '@/components/ui/multi-select-table';
import PeriodDialog from '@/components/PeriodDialog';
import CategoryPriceDialog from '@/components/CategoryPriceDialog';
import DuplicateDialog from '@/components/DuplicateDialog';
import CategoryPricesList from '@/components/CategoryPricesList';

import { 
  getAllPricePeriods, 
  deletePricePeriod,
  duplicatePricePeriod
} from '@/integrations/supabase/services/periodService';
import { PricePeriod, CategoryType } from '@/types';

const PeriodsPage: React.FC = () => {
  const [periods, setPeriods] = useState<PricePeriod[]>([]);
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
  const [selectedPeriodIds, setSelectedPeriodIds] = useState<string[]>([]);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null);
  const [isCategoryPriceDialogOpen, setIsCategoryPriceDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("periods");
  const [loading, setLoading] = useState(false);
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

  const handlePermanentDeletePeriods = (ids: string[]) => {
    setSelectedPeriodIds(ids);
    setIsPermanentDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    setLoading(true);
    try {
      for (const id of selectedPeriodIds) {
        await deletePricePeriod(id);
      }
      toast.success(`${selectedPeriodIds.length} período(s) excluído(s) com sucesso`);
      fetchPeriods();
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
      // Perform a hard delete or permanent deletion
      for (const id of selectedPeriodIds) {
        await deletePricePeriod(id);
      }
      toast.success(`${selectedPeriodIds.length} período(s) excluído(s) permanentemente`);
      fetchPeriods();
    } catch (error) {
      console.error("Error permanently deleting periods:", error);
      toast.error("Erro ao excluir permanentemente períodos");
    } finally {
      setLoading(false);
      setIsPermanentDeleteDialogOpen(false);
      setSelectedPeriodIds([]);
    }
  };
  
  const handleOpenCategoryPrice = (category: CategoryType) => {
    setCurrentCategory(category);
    setIsCategoryPriceDialogOpen(true);
  };
  
  const handlePeriodSuccess = () => {
    setIsPeriodDialogOpen(false);
    fetchPeriods();
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
        fetchPeriods();
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
  
  const periodColumns: Column<PricePeriod>[] = [
    {
      id: "name",
      header: "Nome",
      cell: (row) => (
        <div className="font-medium">{row.name}</div>
      ),
    },
    {
      id: "dateRange",
      header: "Período",
      cell: (row) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(row.startDate), 'dd/MM/yyyy')} - {format(new Date(row.endDate), 'dd/MM/yyyy')}
          </span>
        </div>
      ),
    },
    {
      id: "isHoliday",
      header: "Tipo",
      cell: (row) => (
        <div>
          {row.isHoliday ? 'Feriado/Especial' : 'Regular'}
        </div>
      ),
    },
    {
      id: "minimumStay",
      header: "Estadia Mínima",
      cell: (row) => (
        <div>
          {row.minimumStay} {row.minimumStay === 1 ? 'diária' : 'diárias'}
        </div>
      ),
    },
  ];

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
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={() => handlePermanentDeletePeriods(selectedPeriodIds)}
                disabled={selectedPeriodIds.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Exclusão Permanente
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleDuplicatePeriods(selectedPeriodIds)}
                disabled={selectedPeriodIds.length !== 1}
              >
                <Copy className="mr-2 h-4 w-4" /> Duplicar Período
              </Button>
            </div>
            
            <Button onClick={handleAddPeriod}>
              <Plus className="mr-2 h-4 w-4" /> Novo Período
            </Button>
          </div>
          
          <MultiSelectTable
            data={periods}
            columns={periodColumns}
            getRowId={(row) => row.id}
            onEdit={handleEditPeriods}
            onDelete={handleDeletePeriods}
            onSelectionChange={setSelectedPeriodIds}
          />
        </TabsContent>
        
        <TabsContent value="prices" className="space-y-6 mt-4">
          <p className="text-sm text-muted-foreground">
            Selecione uma categoria para definir os preços para todas as acomodações dessa categoria.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['Standard', 'Luxo', 'Super Luxo', 'Master'] as CategoryType[]).map(category => (
              <Button
                key={category}
                variant="outline"
                className="h-auto flex-col py-6 border-2"
                onClick={() => handleOpenCategoryPrice(category)}
              >
                <FileSpreadsheet className="mb-2 h-8 w-8" />
                <span className="text-lg font-semibold">{category}</span>
              </Button>
            ))}
          </div>
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
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedPeriodIds.length} período(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={loading}>
              {loading ? "Processando..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isPermanentDeleteDialogOpen} onOpenChange={setIsPermanentDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão Permanente</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-red-600">ATENÇÃO:</strong> Você está prestes a excluir permanentemente {selectedPeriodIds.length} período(s). 
              Esta ação não poderá ser revertida e pode afetar dados relacionados.
              
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                Os períodos excluídos permanentemente não poderão ser recuperados e todos 
                os preços e configurações associados também serão excluídos.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmPermanentDelete} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Excluindo..." : "Excluir Permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PeriodsPage;
