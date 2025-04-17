
import React from 'react';
import { MoreHorizontal, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface MultiSelectActionsProps {
  selectedIds: string[];
  onEdit: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

const MultiSelectActions: React.FC<MultiSelectActionsProps> = ({
  selectedIds,
  onEdit,
  onDelete,
  onClearSelection
}) => {
  if (selectedIds.length === 0) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-1 px-2 py-1 border-primary/20 bg-primary/5 text-primary">
        <span>{selectedIds.length} selecionado{selectedIds.length > 1 ? 's' : ''}</span>
        <button 
          onClick={onClearSelection} 
          className="text-primary hover:text-primary/80 cursor-pointer ml-1"
          aria-label="Limpar seleção"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              disabled={selectedIds.length === 0}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              disabled={selectedIds.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </TooltipTrigger>
          <TooltipContent>Excluir {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

interface ItemActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export const ItemActions: React.FC<ItemActionsProps> = ({ onEdit, onDelete, className }) => {
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MultiSelectActions;
