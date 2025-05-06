
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Accommodation } from '@/types';
import { createAccommodation, updateAccommodation } from '@/integrations/supabase';

interface AccommodationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodation: Accommodation | null;
  onUpdate?: (accommodation: Accommodation) => void;
  loadAccommodations?: () => void;
}

const AccommodationForm: React.FC<AccommodationFormProps> = ({
  open,
  onOpenChange,
  accommodation,
  onUpdate,
  loadAccommodations,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    category: 'Standard',
    capacity: 2,
    description: '',
    imageUrl: '',
    images: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when accommodation changes
  useEffect(() => {
    if (accommodation) {
      setFormData({
        name: accommodation.name || '',
        roomNumber: accommodation.roomNumber || '',
        category: accommodation.category || 'Standard',
        capacity: accommodation.capacity || 2,
        description: accommodation.description || '',
        imageUrl: accommodation.imageUrl || '',
        images: accommodation.images || [],
      });
    } else {
      // Reset form for new accommodation
      setFormData({
        name: '',
        roomNumber: '',
        category: 'Standard',
        capacity: 2,
        description: '',
        imageUrl: '',
        images: [],
      });
    }
  }, [accommodation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;

      if (accommodation) {
        // Update existing accommodation
        result = await updateAccommodation(accommodation.id, formData);
        if (result) {
          toast.success('Acomodação atualizada com sucesso');
          if (onUpdate) onUpdate(result);
        } else {
          toast.error('Erro ao atualizar acomodação');
        }
      } else {
        // Create new accommodation
        result = await createAccommodation(formData);
        if (result) {
          toast.success('Acomodação criada com sucesso');
          if (loadAccommodations) loadAccommodations();
        } else {
          toast.error('Erro ao criar acomodação');
        }
      }

      if (result) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving accommodation:', error);
      toast.error('Erro ao salvar acomodação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {accommodation ? 'Editar Acomodação' : 'Nova Acomodação'}
          </SheetTitle>
          <SheetDescription>
            {accommodation
              ? 'Altere os detalhes da acomodação existente.'
              : 'Adicione uma nova acomodação ao sistema.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomNumber">Número</Label>
            <Input
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Luxo">Luxo</SelectItem>
                <SelectItem value="Super Luxo">Super Luxo</SelectItem>
                <SelectItem value="Master">Master</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidade</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => handleNumberChange('capacity', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL da Imagem Principal</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">URLs das Imagens Adicionais</Label>
            <Textarea
              id="images"
              name="images"
              value={formData.images.join('\n')}
              onChange={(e) => {
                const images = e.target.value.split('\n').filter(url => url.trim() !== '');
                setFormData(prev => ({ ...prev, images }));
              }}
              rows={3}
              className="resize-none"
              placeholder="Uma URL por linha"
            />
          </div>

          <SheetFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : accommodation ? 'Atualizar' : 'Criar'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AccommodationForm;
