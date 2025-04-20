
import React from 'react';
import { Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface DuplicateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  nameLabel: string;
  originalName: string;
  onConfirm: (newName: string) => Promise<void>;
}

const DuplicateDialog: React.FC<DuplicateDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  nameLabel,
  originalName,
  onConfirm,
}) => {
  const [newName, setNewName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setNewName(`${originalName} (Cópia)`);
    }
  }, [isOpen, originalName]);

  const handleConfirm = async () => {
    if (!newName.trim()) {
      toast.error('Por favor, insira um nome válido');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(newName);
      onOpenChange(false);
      toast.success('Duplicado com sucesso!');
    } catch (error) {
      console.error('Error duplicating:', error);
      toast.error('Erro ao duplicar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{nameLabel}</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Digite o novo nome"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Duplicando...' : 'Duplicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateDialog;
