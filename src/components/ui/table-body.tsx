import React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
interface TableBodyComponentProps<T> {
  rows: Row<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  handleContextMenu: (rowId: string, e: React.MouseEvent) => void;
  columns: number;
  getRowAttributes?: (rowId: string) => Record<string, string>;
}
const TableBodyComponent = <T,>({
  rows,
  getRowId,
  onRowClick,
  handleContextMenu,
  columns,
  getRowAttributes
}: TableBodyComponentProps<T>) => {
  const handleClick = (row: Row<T>) => {
    if (onRowClick) {
      onRowClick(row.original);
    }
  };
  return <TableBody>
      {rows.map(row => {
      const rowId = getRowId(row.original);
      const rowAttributes = getRowAttributes ? getRowAttributes(rowId) : {};
      return <TableRow key={rowId} className={onRowClick ? "cursor-pointer hover:bg-muted" : ""} onClick={() => handleClick(row)} onContextMenu={e => handleContextMenu(rowId, e)} data-row-id={rowId} {...rowAttributes}>
            <TableCell className="p-0 px-[15px]">
              <Checkbox checked={row.getIsSelected()} onCheckedChange={checked => row.toggleSelected(!!checked)} onClick={e => e.stopPropagation()} aria-label="Selecionar linha" />
            </TableCell>
            {row.getVisibleCells().map(cell => <TableCell key={cell.id}>
                {cell.column.columnDef.cell && typeof cell.column.columnDef.cell === 'function' && cell.column.columnDef.cell(cell.getContext())}
              </TableCell>)}
          </TableRow>;
    })}
      {rows.length === 0 && <TableRow>
          <TableCell colSpan={columns + 1} className="text-center py-4">
            Nenhum item encontrado
          </TableCell>
        </TableRow>}
    </TableBody>;
};
export default TableBodyComponent;