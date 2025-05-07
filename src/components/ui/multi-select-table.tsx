
import React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye, Lock } from "lucide-react"
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator, 
  ContextMenuTrigger 
} from "@/components/ui/context-menu"

import { cn } from "@/lib/utils"
import { ItemActions } from "./multi-select-actions"

export interface CustomAction {
  label: string;
  key: string;
  icon?: React.ReactNode;
}

interface MultiSelectTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onEdit?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  onBlock?: (ids: string[]) => void;  
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  customActions?: CustomAction[];
  onCustomAction?: (ids: string[], action: string) => void;
}

export default function MultiSelectTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  onBlock,
  getRowId,
  onRowClick,
  customActions = [],
  onCustomAction
}: MultiSelectTableProps<T>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [isContextMenuOpen, setIsContextMenuOpen] = React.useState(false);
  const [contextMenuPosition, setContextMenuPosition] = React.useState({ x: 0, y: 0 });
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
    sortingMode: "basic",
  })

  // Context menu handler
  const handleContextMenu = (rowId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
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
        customActions={customActions} 
        onCustomAction={onCustomAction}
      />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      table.getIsAllPageRowsSelected()
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : (
                          <Button
                            variant="ghost"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              "flex h-8 items-center p-0 text-sm hover:no-underline",
                              header.column.getIsSorted() && "font-medium",
                            )}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {/* <ArrowDownUp className="ml-2 h-4 w-4" /> */}
                            {
                              {
                                asc: '▲',
                                desc: '▼',
                              }[header.column.getIsSorted() as string]
                            }
                          </Button>
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  onContextMenu={(e) => handleContextMenu(getRowId(row.original), e)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  <TableCell className="w-[50px]">
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Selecionar linha"
                    />
                  </TableCell>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Context Menu */}
      {isContextMenuOpen && contextMenuRowId && (
        <ContextMenu onOpenChange={setIsContextMenuOpen}>
          <ContextMenuContent className="w-40">
            {onRowClick && (
              <ContextMenuItem onClick={() => {
                const row = data.find(item => getRowId(item) === contextMenuRowId);
                if (row) onRowClick(row);
                setIsContextMenuOpen(false);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Visualizar</span>
              </ContextMenuItem>
            )}
            {onEdit && (
              <ContextMenuItem onClick={() => {
                onEdit([contextMenuRowId]);
                setIsContextMenuOpen(false);
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </ContextMenuItem>
            )}
            {onBlock && (
              <ContextMenuItem onClick={() => {
                onBlock([contextMenuRowId]);
                setIsContextMenuOpen(false);
              }}>
                <Lock className="mr-2 h-4 w-4" />
                <span>Bloquear</span>
              </ContextMenuItem>
            )}
            {customActions.length > 0 && (
              <>
                <ContextMenuSeparator />
                {customActions.map((action) => (
                  <ContextMenuItem
                    key={action.key}
                    onClick={() => {
                      if (onCustomAction) onCustomAction([contextMenuRowId], action.key);
                      setIsContextMenuOpen(false);
                    }}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </ContextMenuItem>
                ))}
              </>
            )}
            {onDelete && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  className="text-red-600"
                  onClick={() => {
                    onDelete([contextMenuRowId]);
                    setIsContextMenuOpen(false);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Excluir</span>
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
      )}
    </div>
  );
}
