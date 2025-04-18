
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
  onSelectionChange?: (selectedIds: string[]) => void; // Added this prop
}

function MultiSelectTable<T>({
  data,
  columns,
  getRowId,
  onEdit,
  onDelete,
  onRowClick,
  onSelectionChange
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
    setSelectedRowIds(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id];
      
      // Call the onSelectionChange callback if provided
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
      
      return newSelection;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? data.map(row => getRowId(row)) : [];
    setSelectedRowIds(newSelection);
    
    // Call the onSelectionChange callback if provided
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const handleClearSelection = () => {
    setSelectedRowIds([]);
    
    // Call the onSelectionChange callback with empty array
    if (onSelectionChange) {
      onSelectionChange([]);
    }
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

  const handleEditSingle = (id: string) => {
    if (onEdit) {
      onEdit([id]);
    }
  };

  const handleDeleteSingle = (id: string) => {
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

  // Update selected rows when data changes to prevent stale selections
  React.useEffect(() => {
    const validIds = data.map(row => getRowId(row));
    const validSelections = selectedRowIds.filter(id => validIds.includes(id));
    
    if (validSelections.length !== selectedRowIds.length) {
      setSelectedRowIds(validSelections);
      
      // Call onSelectionChange with the valid selections
      if (onSelectionChange) {
        onSelectionChange(validSelections);
      }
    }
  }, [data, getRowId]);

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
                    // We need to remove the indeterminate property since it's not supported by our Checkbox component
                    data-state={someSelected ? "indeterminate" : undefined}
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
                          onEdit={() => handleEditSingle(id)}
                          onDelete={() => handleDeleteSingle(id)}
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
