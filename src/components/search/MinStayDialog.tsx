
import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MinStayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  maxMinStay: number;
  onClose?: () => void;
  onContinue?: () => void;
  onCancel?: () => void;
}

const MinStayDialog: React.FC<MinStayDialogProps> = ({
  isOpen,
  onOpenChange,
  maxMinStay,
  onClose,
  onContinue,
  onCancel,
}) => {
  // Handle the close button click
  const handleClose = () => {
    if (onClose) onClose();
    if (onCancel) onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estadia Mínima Requerida</DialogTitle>
          <DialogDescription>
            O período selecionado requer uma estadia mínima de {maxMinStay} {maxMinStay === 1 ? 'diária' : 'diárias'}.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              O período que você selecionou tem uma duração menor que o mínimo exigido.
              Por favor, ajuste as datas da sua pesquisa.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter className="gap-2">
          {onContinue && (
            <Button onClick={onContinue} variant="default">
              Prosseguir Mesmo Assim
            </Button>
          )}
          <Button variant={onContinue ? "outline" : "default"} onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MinStayDialog;
