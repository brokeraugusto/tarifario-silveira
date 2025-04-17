import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Calendar, FileSpreadsheet } from 'lucide-react';
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
import { getAllPricePeriods, deletePricePeriod } from '@/utils/accommodationService';
import { PricePeriod, CategoryType } from '@/types';

const PeriodsPage: React.FC = () => {
  const [periods, setPeriods] = useState<PricePeriod[]>([]);
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPeriodIds, setSelectedPeriodIds] = useState<string[]>([]);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null);
  const [isCategoryPriceDialogOpen, setIsCategoryPriceDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("periods");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchPeriods();
  }, []);
  
  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const data = await getAllPricePeriods();
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
        </TabsList>
        
        <TabsContent value="periods" className="space-y-4 mt-4">
          <div className="flex justify-end">
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
          />
        </TabsContent>
        
        <TabsContent value="prices" className="space-y-6 mt-4">
          <p className="text-sm text-muted-foreground">
            Selecione uma categoria para definir os preços para todas as acomodações dessa categoria.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['Standard', 'Luxo', 'Super Luxo', 'De Luxe'] as CategoryType[]).map(category => (
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
    </div>
  );
};

export default PeriodsPage;
