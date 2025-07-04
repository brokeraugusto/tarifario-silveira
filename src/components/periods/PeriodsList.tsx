
import React from 'react';
import { Copy, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MultiSelectTable from '@/components/ui/multi-select-table';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { PricePeriod } from '@/types';

interface PeriodsListProps {
  periods: PricePeriod[];
  selectedPeriodIds: string[];
  setSelectedPeriodIds: (ids: string[]) => void;
  handleEditPeriods: (ids: string[]) => void;
  handleDeletePeriods: (ids: string[]) => void;
  handleDuplicatePeriods: (ids: string[]) => void;
  handleAddPeriod: () => void;
  isUpdatingPeriods: boolean;
  loading: boolean;
}

const PeriodsList: React.FC<PeriodsListProps> = ({
  periods = [],
  selectedPeriodIds = [],
  setSelectedPeriodIds,
  handleEditPeriods,
  handleDeletePeriods,
  handleDuplicatePeriods,
  handleAddPeriod,
  isUpdatingPeriods,
  loading
}) => {
  console.log('PeriodsList render - periods:', periods.length, 'selected:', selectedPeriodIds.length);

  const handleDuplicateClick = () => {
    console.log('Duplicate button clicked with selected periods:', selectedPeriodIds);
    if (selectedPeriodIds.length === 1) {
      handleDuplicatePeriods(selectedPeriodIds);
    }
  };
  
  const handleEditClick = () => {
    console.log('Edit button clicked with selected periods:', selectedPeriodIds);
    if (selectedPeriodIds.length === 1) {
      handleEditPeriods(selectedPeriodIds);
    }
  };
  
  const handleDeleteClick = () => {
    console.log('Delete button clicked with selected periods:', selectedPeriodIds);
    if (selectedPeriodIds.length > 0) {
      handleDeletePeriods(selectedPeriodIds);
    }
  };

  const handleAddClick = () => {
    console.log('Add Period button clicked');
    handleAddPeriod();
  };

  // Callback para quando a seleção mudar na tabela
  const handleSelectionChange = (ids: string[]) => {
    console.log('Selection changed in table:', ids);
    setSelectedPeriodIds(ids);
  };

  const periodColumns: ColumnDef<PricePeriod>[] = [
    {
      id: "name",
      header: "Nome",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
    }, 
    {
      id: "dateRange",
      header: "Período",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(row.original.startDate), 'dd/MM/yyyy')} - {format(new Date(row.original.endDate), 'dd/MM/yyyy')}
          </span>
        </div>
      )
    },
    {
      id: "isHoliday",
      header: "Tipo",
      cell: ({ row }) => (
        <div>
          {row.original.isHoliday ? 'Feriado/Especial' : 'Regular'}
        </div>
      )
    },
    {
      id: "minimumStay",
      header: "Estadia Mínima",
      cell: ({ row }) => (
        <div>
          {row.original.minimumStay} {row.original.minimumStay === 1 ? 'diária' : 'diárias'}
        </div>
      )
    }
  ];

  const isButtonsDisabled = loading || isUpdatingPeriods;
  const isDuplicateDisabled = isButtonsDisabled || selectedPeriodIds.length !== 1;
  const isEditDisabled = isButtonsDisabled || selectedPeriodIds.length !== 1;
  const isDeleteDisabled = isButtonsDisabled || selectedPeriodIds.length === 0;

  console.log('Button states:', {
    isButtonsDisabled,
    isDuplicateDisabled,
    isEditDisabled,
    isDeleteDisabled,
    selectedCount: selectedPeriodIds.length
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleDuplicateClick}
            disabled={isDuplicateDisabled}
            title={isDuplicateDisabled ? "Selecione exatamente um período para duplicar" : "Duplicar período selecionado"}
            className="bg-white hover:bg-gray-50"
          >
            <Copy className="mr-2 h-4 w-4" /> Duplicar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleEditClick}
            disabled={isEditDisabled}
            title={isEditDisabled ? "Selecione exatamente um período para editar" : "Editar período selecionado"}
            className="bg-white hover:bg-gray-50"
          >
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDeleteClick}
            disabled={isDeleteDisabled}
            title={isDeleteDisabled ? "Selecione pelo menos um período para excluir" : `Excluir ${selectedPeriodIds.length} período(s) selecionado(s)`}
            className="bg-white hover:bg-gray-50"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
        
        <Button 
          onClick={handleAddClick}
          disabled={isButtonsDisabled}
          title="Adicionar novo período"
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Período
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando períodos...</p>
        </div>
      ) : (
        <MultiSelectTable 
          data={periods} 
          columns={periodColumns} 
          getRowId={row => row.id} 
          onEdit={handleEditPeriods} 
          onDelete={handleDeletePeriods}
          onSelectedRowsChange={handleSelectionChange}
        />
      )}
    </div>
  );
};

export default PeriodsList;
