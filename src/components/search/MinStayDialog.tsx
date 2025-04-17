
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
  onContinue: () => void;
  onCancel: () => void;
}

const MinStayDialog: React.FC<MinStayDialogProps> = ({
  isOpen,
  onOpenChange,
  maxMinStay,
  onContinue,
  onCancel,
}) => {
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
              Algumas acomodações estarão disponíveis somente para um período maior.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Ajustar Datas
          </Button>
          <Button onClick={onContinue}>
            Continuar Mesmo Assim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MinStayDialog;
