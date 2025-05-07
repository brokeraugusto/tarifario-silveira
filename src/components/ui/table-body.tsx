
import React from "react";
import { flexRender, Row } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface TableBodyComponentProps<T> {
  rows: Row<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  handleContextMenu: (rowId: string, e: React.MouseEvent) => void;
  columns: number;
}

export default function TableBodyComponent<T>({
  rows,
  getRowId,
  onRowClick,
  handleContextMenu,
  columns,
}: TableBodyComponentProps<T>) {
  return (
    <TableBody>
      {rows.length ? (
        rows.map(row => (
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
                onClick={(e) => e.stopPropagation()}
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
          <TableCell colSpan={columns + 1} className="h-24 text-center">
            Sem resultados.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
