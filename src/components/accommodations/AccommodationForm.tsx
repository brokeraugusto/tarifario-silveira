
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from '@/components/ImageUploader';
import { Accommodation, CategoryType } from '@/types';
import { createAccommodation, updateAccommodation } from '@/integrations/supabase';

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

interface AccommodationFormProps {
  formData: AccommodationFormData;
  setFormData: React.Dispatch<React.SetStateAction<AccommodationFormData>>;
  editingAccommodationId: string | null;
  onSuccess: () => Promise<void>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isDialog?: boolean;
}

const AccommodationForm: React.FC<AccommodationFormProps> = ({
  formData,
  setFormData,
  editingAccommodationId,
  onSuccess,
  loading,
  setLoading,
  isDialog = false
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
  };

  const handleImagesUpload = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images
    }));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('Submitting accommodation form:', formData);
      const accommodationData = {
        ...formData,
        capacity: Number(formData.capacity),
        isBlocked: formData.isBlocked || false
      };
      
      if (editingAccommodationId) {
        const updated = await updateAccommodation(editingAccommodationId, accommodationData);
        if (updated) {
          toast.success("Acomodação atualizada com sucesso");
          await onSuccess();
        } else {
          toast.error("Erro ao atualizar acomodação");
        }
      } else {
        const created = await createAccommodation(accommodationData);
        if (created) {
          toast.success("Acomodação criada com sucesso");
          await onSuccess();
        } else {
          toast.error("Erro ao criar acomodação");
        }
      }
    } catch (error) {
      console.error("Error saving accommodation:", error);
      toast.error("Erro ao salvar acomodação");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
          />
        </div>
        <div>
          <Label htmlFor="roomNumber">Número do Quarto</Label>
          <Input 
            type="text" 
            id="roomNumber" 
            name="roomNumber" 
            value={formData.roomNumber} 
            onChange={handleInputChange} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as CategoryType }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categoria</SelectLabel>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Luxo">Luxo</SelectItem>
                <SelectItem value="Super Luxo">Super Luxo</SelectItem>
                <SelectItem value="Master">Master</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="capacity">Capacidade</Label>
          <Input 
            type="number" 
            id="capacity" 
            name="capacity" 
            value={formData.capacity} 
            onChange={handleInputChange} 
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="albumUrl">Link para Álbum Externo</Label>
        <Input 
          type="url" 
          id="albumUrl" 
          name="albumUrl" 
          placeholder="https://exemplo.com/album" 
          value={formData.albumUrl || ''} 
          onChange={handleInputChange} 
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleInputChange} 
        />
      </div>

      <div>
        <Label>Imagens</Label>
        <ImageUploader 
          onImageUploaded={handleImageUpload}
          initialImages={formData.images}
        />
      </div>
    </>
  );

  if (isDialog) {
    return (
      <div className="grid gap-4 py-4">
        {formContent}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingAccommodationId ? 'Editar Acomodação' : 'Nova Acomodação'}</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para {editingAccommodationId ? 'editar' : 'criar'} uma nova acomodação.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {formContent}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccommodationForm;
