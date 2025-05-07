
import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Eye, Lock, LockOpen, Pencil, Trash2 } from "lucide-react";
import { CustomAction } from "./table-types";

interface TableContextMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rowId: string | null;
  onEdit?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  onBlock?: (ids: string[]) => void;
  onActivate?: (ids: string[]) => void;
  onRowClick?: (rowId: string) => void;
  customActions?: CustomAction[];
  onCustomAction?: (ids: string[], action: string) => void;
}

const TableContextMenu: React.FC<TableContextMenuProps> = ({
  isOpen,
  onOpenChange,
  rowId,
  onEdit,
  onDelete,
  onBlock,
  onActivate,
  onRowClick,
  customActions = [],
  onCustomAction,
}) => {
  if (!rowId) return null;

  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger>
        <span className="sr-only">Menu de contexto</span>
      </ContextMenuTrigger>
      {isOpen && (
        <ContextMenuContent className="w-40">
          {onRowClick && (
            <ContextMenuItem onClick={() => {
              onRowClick(rowId);
              onOpenChange(false);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Visualizar</span>
            </ContextMenuItem>
          )}
          {onEdit && (
            <ContextMenuItem onClick={() => {
              onEdit([rowId]);
              onOpenChange(false);
            }}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </ContextMenuItem>
          )}
          {onBlock && (
            <ContextMenuItem onClick={() => {
              onBlock([rowId]);
              onOpenChange(false);
            }}>
              <Lock className="mr-2 h-4 w-4" />
              <span>Bloquear</span>
            </ContextMenuItem>
          )}
          {onActivate && (
            <ContextMenuItem onClick={() => {
              onActivate([rowId]);
              onOpenChange(false);
            }}>
              <LockOpen className="mr-2 h-4 w-4" />
              <span>Ativar</span>
            </ContextMenuItem>
          )}
          {customActions.length > 0 && (
            <>
              <ContextMenuSeparator />
              {customActions.map((action) => (
                <ContextMenuItem
                  key={action.key}
                  onClick={() => {
                    if (onCustomAction) onCustomAction([rowId], action.key);
                    onOpenChange(false);
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
                  onDelete([rowId]);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
};

export default TableContextMenu;
