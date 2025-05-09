
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DeletePeriodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  count: number;
  isPermanentDelete?: boolean;
}

const DeletePeriodDialog: React.FC<DeletePeriodDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  loading,
  count,
  isPermanentDelete = false
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPermanentDelete 
              ? "Confirmar Exclusão Permanente" 
              : "Confirmar Exclusão"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPermanentDelete ? (
              <>
                <strong className="text-red-600">ATENÇÃO:</strong> Você está prestes a excluir permanentemente {count} período(s). 
                Esta ação não poderá ser revertida e pode afetar dados relacionados.
                
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  Os períodos excluídos permanentemente não poderão ser recuperados e todos 
                  os preços e configurações associados também serão excluídos.
                </div>
              </>
            ) : (
              <>
                Tem certeza que deseja excluir {count} período(s)? Esta ação não pode ser desfeita.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={loading}
            className={isPermanentDelete ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {loading 
              ? (isPermanentDelete ? "Excluindo..." : "Processando...") 
              : (isPermanentDelete ? "Excluir Permanentemente" : "Excluir")
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePeriodDialog;
