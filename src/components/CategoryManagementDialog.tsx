
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategoryType, Accommodation } from '@/types';
import { toast } from 'sonner';
import { getAllAccommodations } from '@/integrations/supabase/accommodationService';

interface CategoryManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  isOpen,
  onOpenChange,
  onUpdate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Standard');
  const [description, setDescription] = useState<string>('');
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Predefined categories
  const categories: CategoryType[] = ['Standard', 'Luxo', 'Super Luxo', 'De Luxe'];

  useEffect(() => {
    if (isOpen) {
      fetchAccommodations();
    }
  }, [isOpen]);

  const fetchAccommodations = async () => {
    setLoading(true);
    try {
      const data = await getAllAccommodations();
      setAccommodations(data);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      toast.error("Erro ao carregar acomodações");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Luxo':
        return 'bg-purple-100 text-purple-800';
      case 'Super Luxo':
        return 'bg-amber-100 text-amber-800';
      case 'De Luxe':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryRooms = (category: CategoryType) => {
    return accommodations
      .filter(acc => acc.category === category)
      .map(acc => acc.roomNumber);
  };

  const handleSave = () => {
    // For now, just show a toast since we're not modifying category definitions yet
    toast.success(`Configurações da categoria ${selectedCategory} atualizadas`);
    onUpdate();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Visualize e gerencia as categorias de acomodações disponíveis
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge 
                key={category}
                className={`cursor-pointer px-3 py-1 text-sm ${
                  selectedCategory === category 
                    ? 'ring-2 ring-offset-2 ' + getCategoryColor(category)
                    : getCategoryColor(category)
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição da Categoria</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as características desta categoria de acomodação"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Acomodações nesta Categoria</Label>
            <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : (
                <>
                  {getCategoryRooms(selectedCategory).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {getCategoryRooms(selectedCategory).map(roomNumber => (
                        <Badge key={roomNumber} variant="outline">
                          {roomNumber}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma acomodação nesta categoria
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Opções de Preços</Label>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                onOpenChange(false);
                // Use setTimeout to avoid dialog transition conflicts
                setTimeout(() => {
                  document.dispatchEvent(new CustomEvent('open-category-price', { 
                    detail: { category: selectedCategory } 
                  }));
                }, 300);
              }}
            >
              Configurar Preços para {selectedCategory}
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagementDialog;
