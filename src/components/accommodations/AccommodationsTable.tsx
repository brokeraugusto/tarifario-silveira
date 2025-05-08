
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Accommodation } from '@/types';
import MultiSelectTable from '@/components/ui/multi-select-table';

interface AccommodationsTableProps {
  accommodations: Accommodation[];
  onEdit: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onBlock: (id: string) => void;
  onActivate: (ids: string[]) => void;
  onViewDetails: (id: string) => void;
}

const AccommodationsTable: React.FC<AccommodationsTableProps> = ({
  accommodations,
  onEdit,
  onDelete,
  onBlock,
  onActivate,
  onViewDetails,
}) => {
  // Column definitions for the accommodation table
  const accommodationColumns: ColumnDef<Accommodation>[] = [
    {
      id: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      id: "roomNumber",
      header: "Número",
      cell: ({ row }) => (
        <div>{row.original.roomNumber}</div>
      ),
    },
    {
      id: "category",
      header: "Categoria",
      cell: ({ row }) => (
        <div>{row.original.category}</div>
      ),
    },
    {
      id: "capacity",
      header: "Capacidade",
      cell: ({ row }) => (
        <div>{row.original.capacity}</div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div>
          {row.original.isBlocked ? (
            <Badge variant="destructive" className="whitespace-nowrap">Bloqueado</Badge>
          ) : (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 whitespace-nowrap">
              Ativo
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "albumLink",
      header: "Álbum",
      cell: ({ row }) => (
        <div>
          {row.original.albumUrl ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                window.open(row.original.albumUrl, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <MultiSelectTable
      data={accommodations}
      columns={accommodationColumns}
      getRowId={(row) => row.id}
      onEdit={onEdit}
      onDelete={onDelete}
      onBlock={(ids) => onBlock(ids[0])}
      onActivate={onActivate}
      onRowClick={(row) => onViewDetails(row.id)}
      getRowAttributes={(rowId: string) => {
        const accommodation = accommodations.find(acc => acc.id === rowId);
        return {
          'data-is-blocked': accommodation ? (accommodation.isBlocked ? 'true' : 'false') : 'false'
        };
      }}
    />
  );
};

export default AccommodationsTable;
