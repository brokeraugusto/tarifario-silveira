
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { SearchResult } from '@/types';

interface DialogFooterActionsProps {
  result?: SearchResult;
  onClose: () => void;
  onDelete: () => void;
}

const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({ 
  result, 
  onClose, 
  onDelete 
}) => {
  const hasResult = !!result;
  
  return (
    <div className="mt-4 flex flex-row justify-between">
      <div className="flex gap-2">
        {hasResult && result?.accommodation && (
          <Button variant="destructive" onClick={onDelete} size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        {hasResult && <Button>Reservar</Button>}
      </div>
    </div>
  );
};

export default DialogFooterActions;
