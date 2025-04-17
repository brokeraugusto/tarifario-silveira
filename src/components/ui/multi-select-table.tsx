
import React, { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import MultiSelectActions, { ItemActions } from './multi-select-actions';

export interface Column<T> {
  id: string;
  header: string;
  accessorFn?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;
}

interface MultiSelectTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  onEdit?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
}

function MultiSelectTable<T>({
  data,
  columns,
  getRowId,
  onEdit,
  onDelete,
  onRowClick
}: MultiSelectTableProps<T>) {
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(col => col.id));

  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedRowIds(prev => 
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(data.map(row => getRowId(row)));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedRowIds([]);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(selectedRowIds);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(selectedRowIds);
    }
  };

  const handleEditSingle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit([id]);
    }
  };

  const handleDeleteSingle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete([id]);
    }
  };

  const toggleColumnVisibility = (columnId: string, isVisible: boolean) => {
    setVisibleColumns(prev =>
      isVisible
        ? [...prev, columnId]
        : prev.filter(id => id !== columnId)
    );
  };

  const visibleColumnsData = columns.filter(col => visibleColumns.includes(col.id));
  const allSelected = data.length > 0 && selectedRowIds.length === data.length;
  const someSelected = selectedRowIds.length > 0 && !allSelected;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <MultiSelectActions
          selectedIds={selectedRowIds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClearSelection={handleClearSelection}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((column) => {
              const isVisible = visibleColumns.includes(column.id);
              
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={isVisible}
                  onCheckedChange={(checked) => toggleColumnVisibility(column.id, checked)}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onEdit || onDelete ? (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
              ) : null}
              
              {visibleColumnsData.map((column) => (
                <TableHead key={column.id}>{column.header}</TableHead>
              ))}
              
              {(onEdit || onDelete) && <TableHead className="w-10"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnsData.length + (onEdit || onDelete ? 2 : 0)}
                  className="h-24 text-center"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const id = getRowId(row);
                const isSelected = selectedRowIds.includes(id);
                
                return (
                  <TableRow
                    key={id}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      isSelected && "bg-muted/50"
                    )}
                    onClick={() => handleRowClick(row)}
                    data-state={isSelected ? "selected" : undefined}
                  >
                    {(onEdit || onDelete) && (
                      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRowIds((prev) => [...prev, id]);
                            } else {
                              setSelectedRowIds((prev) =>
                                prev.filter((rowId) => rowId !== id)
                              );
                            }
                          }}
                          aria-label={`Selecionar linha ${id}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    
                    {visibleColumnsData.map((column) => (
                      <TableCell key={`${id}-${column.id}`}>
                        {column.cell 
                          ? column.cell(row) 
                          : column.accessorFn 
                            ? column.accessorFn(row) 
                            : null}
                      </TableCell>
                    ))}
                    
                    {(onEdit || onDelete) && (
                      <TableCell className="w-10 p-0 pr-2 text-right">
                        <ItemActions
                          onEdit={(e) => handleEditSingle(e, id)}
                          onDelete={(e) => handleDeleteSingle(e, id)}
                          className="justify-end"
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default MultiSelectTable;
