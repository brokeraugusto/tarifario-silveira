
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Lock, LockOpen } from "lucide-react";

export interface ActionHandlers {
  onEdit?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  onBlock?: (ids: string[]) => void;
  onActivate?: (ids: string[]) => void;
  onCustomAction?: (ids: string[], action: string) => void;
}

export interface CustomAction {
  label: string;
  key: string;
  icon?: React.ReactNode;
}

export interface ItemActionsProps extends ActionHandlers {
  selectedIds: string[];
  customActions?: CustomAction[];
}

export const ItemActions: React.FC<ItemActionsProps> = ({ 
  selectedIds, 
  onEdit, 
  onDelete, 
  onBlock,
  onActivate,
  onCustomAction,
  customActions = [] 
}) => {
  const hasSelection = selectedIds.length > 0;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 text-sm text-muted-foreground">
        {hasSelection ? `${selectedIds.length} item(s) selecionado(s)` : ""}
      </div>
      <div className="flex items-center space-x-2">
        {hasSelection && (
          <>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onEdit(selectedIds)}
                disabled={selectedIds.length !== 1}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Editar
              </Button>
            )}
            
            {onBlock && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onBlock(selectedIds)}
                disabled={selectedIds.length !== 1}
              >
                <Lock className="h-3.5 w-3.5 mr-1" />
                Bloquear
              </Button>
            )}

            {onActivate && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onActivate(selectedIds)}
                disabled={selectedIds.length !== 1}
              >
                <LockOpen className="h-3.5 w-3.5 mr-1" />
                Ativar
              </Button>
            )}

            {customActions.length > 0 && customActions.map((action) => (
              <Button
                key={action.key}
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onCustomAction && onCustomAction(selectedIds, action.key)}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
            
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(selectedIds)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Excluir
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
