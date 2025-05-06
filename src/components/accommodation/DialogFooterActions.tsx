
import React from 'react';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/types';
import { Share, Smartphone } from 'lucide-react';
import useSharingFunctions from './useSharingFunctions';

interface DialogFooterActionsProps {
  result?: SearchResult;
  onClose: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({ 
  result, 
  onClose, 
  onDelete,
  showDeleteButton = true
}) => {
  const { handleShare, handleWhatsApp, hasCopyFeature, hasShareFeature } = useSharingFunctions();
  
  if (!result) return null;
  
  return (
    <div className="flex justify-between w-full">
      <div>
        {showDeleteButton && onDelete && (
          <Button 
            variant="destructive" 
            onClick={onDelete} 
            className="mr-2"
          >
            Excluir
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
      
      <div className="flex gap-2">
        {hasShareFeature && (
          <Button 
            variant="outline"
            onClick={() => handleShare(result)}
            className="gap-1"
          >
            <Share className="h-4 w-4" />
            Compartilhar
          </Button>
        )}
        
        <Button 
          onClick={() => handleWhatsApp(result)}
          className="gap-1"
        >
          <Smartphone className="h-4 w-4" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default DialogFooterActions;
