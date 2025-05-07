
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AccommodationForm from './AccommodationForm';
import { CategoryType } from '@/types';

interface AccommodationFormData {
  name: string;
  roomNumber: string;
  category: CategoryType;
  capacity: number;
  description: string;
  imageUrl: string;
  images: string[];
  albumUrl?: string;
  isBlocked?: boolean;
}

interface AccommodationFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AccommodationFormData;
  setFormData: React.Dispatch<React.SetStateAction<AccommodationFormData>>;
  editingAccommodationId: string | null;
  onSuccess: () => Promise<void>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AccommodationFormDialog: React.FC<AccommodationFormDialogProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  editingAccommodationId,
  onSuccess,
  loading,
  setLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{editingAccommodationId ? 'Editar Acomodação' : 'Nova Acomodação'}</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {editingAccommodationId ? 'editar' : 'criar'} uma nova acomodação.
          </DialogDescription>
        </DialogHeader>
        
        <AccommodationForm
          formData={formData}
          setFormData={setFormData}
          editingAccommodationId={editingAccommodationId}
          onSuccess={onSuccess}
          loading={loading}
          setLoading={setLoading}
          isDialog={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AccommodationFormDialog;
