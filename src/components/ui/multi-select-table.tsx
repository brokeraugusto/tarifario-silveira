
import React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table } from "@/components/ui/table";
import { ItemActions } from "./multi-select-actions";
import TableHeaderComponent from "./table-header";
import TableBodyComponent from "./table-body";
import TableContextMenu from "./table-context-menu";
import { CustomAction, ActionHandlers } from "./table-types";

interface MultiSelectTableProps<T> extends ActionHandlers {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  customActions?: CustomAction[];
  getRowAttributes?: (row: T) => Record<string, string>;
  onSelectedRowsChange?: (ids: string[]) => void;
}

export default function MultiSelectTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  onBlock,
  onActivate,
  getRowId,
  onRowClick,
  customActions = [],
  onCustomAction,
  getRowAttributes,
  onSelectedRowsChange
}: MultiSelectTableProps<T>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [isContextMenuOpen, setIsContextMenuOpen] = React.useState(false);
  const [contextMenuRowId, setContextMenuRowId] = React.useState<string | null>(null);

  // Handler atualizado para calcular IDs corretamente
  const handleRowSelectionChange = React.useCallback((newSelection: any) => {
    console.log('Row selection changing:', newSelection);
    setRowSelection(newSelection);
    
    if (onSelectedRowsChange) {
      // Converter índices de seleção para IDs reais
      const selectedIds = Object.keys(newSelection)
        .filter(key => newSelection[key]) // Apenas selecionados (valor true)
        .map(index => {
          const rowData = data[parseInt(index)];
          return rowData ? getRowId(rowData) : '';
        })
        .filter(id => id !== '');
      
      console.log('Calculated selected IDs:', selectedIds);
      onSelectedRowsChange(selectedIds);
    }
  }, [data, getRowId, onSelectedRowsChange]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: handleRowSelectionChange,
    state: {
      rowSelection,
    },
    getRowId: (row, index) => index.toString(), // Usar índice como ID interno da tabela
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
  });

  // Calcular IDs selecionados para os botões de ação
  const selectedIds = React.useMemo(() => {
    return Object.keys(rowSelection)
      .filter(key => rowSelection[key])
      .map(index => {
        const rowData = data[parseInt(index)];
        return rowData ? getRowId(rowData) : '';
      })
      .filter(id => id !== '');
  }, [rowSelection, data, getRowId]);

  // Context menu handler
  const handleContextMenu = (rowId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuRowId(rowId);
    setIsContextMenuOpen(true);
  };

  return (
    <div className="space-y-4">
      <ItemActions 
        selectedIds={selectedIds}
        onEdit={onEdit} 
        onDelete={onDelete}
        onBlock={onBlock}
        onActivate={onActivate}
        customActions={customActions} 
        onCustomAction={onCustomAction}
      />
      
      <div className="rounded-md border">
        <Table>
          <TableHeaderComponent
            headerGroups={table.getHeaderGroups()}
            onSelectAll={(value) => table.toggleAllPageRowsSelected(!!value)}
            isAllSelected={table.getIsAllPageRowsSelected()}
          />
          <TableBodyComponent
            rows={table.getRowModel().rows}
            getRowId={(row) => getRowId(row)} // Usar o getRowId original para exibição
            onRowClick={onRowClick}
            handleContextMenu={handleContextMenu}
            columns={columns.length}
            getRowAttributes={getRowAttributes ? 
              (rowId) => {
                const row = data.find(item => getRowId(item) === rowId);
                return row && getRowAttributes ? getRowAttributes(row) : {};
              } : undefined}
          />
        </Table>
      </div>
      
      <TableContextMenu
        isOpen={isContextMenuOpen}
        onOpenChange={setIsContextMenuOpen}
        rowId={contextMenuRowId}
        onEdit={onEdit}
        onDelete={onDelete}
        onBlock={onBlock}
        onActivate={onActivate}
        onRowClick={rowId => {
          const row = data.find(item => getRowId(item) === rowId);
          if (row && onRowClick) onRowClick(row);
        }}
        customActions={customActions}
        onCustomAction={onCustomAction}
      />
    </div>
  );
}
