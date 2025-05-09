
import React from 'react';
import { Copy, Pencil, Trash2 } from 'lucide-react';
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
  periods,
  selectedPeriodIds,
  setSelectedPeriodIds,
  handleEditPeriods,
  handleDeletePeriods,
  handleDuplicatePeriods,
  handleAddPeriod,
  isUpdatingPeriods,
  loading
}) => {
  const handleDuplicateClick = () => {
    handleDuplicatePeriods(selectedPeriodIds);
  };
  
  const handleEditClick = () => {
    handleEditPeriods(selectedPeriodIds);
  };
  
  const handleDeleteClick = () => {
    handleDeletePeriods(selectedPeriodIds);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleDuplicateClick}
            disabled={selectedPeriodIds.length !== 1 || isUpdatingPeriods || loading}
          >
            <Copy className="mr-2 h-4 w-4" /> Duplicar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleEditClick}
            disabled={selectedPeriodIds.length !== 1 || isUpdatingPeriods || loading}
          >
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDeleteClick}
            disabled={selectedPeriodIds.length === 0 || isUpdatingPeriods || loading}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
        
        <Button onClick={handleAddPeriod}>
          <Plus className="mr-2 h-4 w-4" /> Novo Período
        </Button>
      </div>
      
      <MultiSelectTable 
        data={periods} 
        columns={periodColumns} 
        getRowId={row => row.id} 
        onEdit={handleEditPeriods} 
        onDelete={handleDeletePeriods}
        onSelectedRowsChange={setSelectedPeriodIds}
      />
    </div>
  );
};

export default PeriodsList;
