
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategoryType } from '@/types';

// Define a category settings interface for editing
interface CategoryFormData {
  name: CategoryType;
  description: string;
}

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: CategoryType;
  onSave: (category: CategoryFormData) => Promise<void>;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  initialCategory,
  onSave
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: 'Standard',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (isOpen && initialCategory) {
      setFormData({
        name: initialCategory,
        description: '', // You could fetch this from an API if available
      });
    } else if (isOpen) {
      // Reset form when opening for a new category
      setFormData({
        name: 'Standard',
        description: ''
      });
    }
  }, [isOpen, initialCategory]);
  
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Categoria salva com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialCategory ? 'Editar' : 'Nova'} Categoria</DialogTitle>
          <DialogDescription>
            {initialCategory ? 'Altere os detalhes da categoria selecionada.' : 'Configure os detalhes para a nova categoria.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="name" className="col-span-1">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Nome da categoria"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-2">
            <Label htmlFor="description" className="col-span-1 pt-2">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Descrição da categoria"
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
