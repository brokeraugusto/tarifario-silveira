
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
  onCustomAction
}: MultiSelectTableProps<T>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [isContextMenuOpen, setIsContextMenuOpen] = React.useState(false);
  const [contextMenuRowId, setContextMenuRowId] = React.useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    getRowId,
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
  });

  // Context menu handler
  const handleContextMenu = (rowId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuRowId(rowId);
    setIsContextMenuOpen(true);
  };

  return (
    <div className="space-y-4">
      <ItemActions 
        selectedIds={Object.keys(rowSelection)}
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
            getRowId={getRowId}
            onRowClick={onRowClick}
            handleContextMenu={handleContextMenu}
            columns={columns.length}
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
