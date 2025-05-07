
import React from "react";
import { flexRender, Header, HeaderGroup } from "@tanstack/react-table";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TableHeaderComponentProps<T> {
  headerGroups: HeaderGroup<T>[];
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
}

export default function TableHeaderComponent<T>({
  headerGroups,
  onSelectAll,
  isAllSelected,
}: TableHeaderComponentProps<T>) {
  return (
    <TableHeader>
      {headerGroups.map(headerGroup => (
        <TableRow key={headerGroup.id}>
          <TableHead className="w-[50px]">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label="Selecionar todos"
            />
          </TableHead>
          {headerGroup.headers.map(header => (
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
                    {
                      {
                        asc: '▲',
                        desc: '▼',
                      }[header.column.getIsSorted() as string]
                    }
                  </Button>
                )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}
