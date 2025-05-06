
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MinStayAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
  onCancel: () => void;
  minimumStay: number;
  nights: number;
}

const MinStayAlertDialog: React.FC<MinStayAlertDialogProps> = ({
  isOpen,
  onOpenChange,
  onProceed,
  onCancel,
  minimumStay,
  nights
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Estadia Mínima Requerida</AlertDialogTitle>
          <AlertDialogDescription>
            Este período requer uma estadia mínima de {minimumStay} {minimumStay === 1 ? 'diária' : 'diárias'}.
            Sua seleção atual é de {nights} {nights === 1 ? 'diária' : 'diárias'}.
            Deseja prosseguir mesmo assim?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onProceed}>Prosseguir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MinStayAlertDialog;
