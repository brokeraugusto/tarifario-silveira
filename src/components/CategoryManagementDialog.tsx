import React, { useState, useEffect } from 'react';
import { Pencil, Plus, Trash } from 'lucide-react';
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
import { getAllAccommodations } from '@/integrations/supabase';
import CategoryDialog from './CategoryDialog';
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

interface CategoryManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

interface CategorySettings {
  name: CategoryType;
  description: string;
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
  const [categories, setCategories] = useState<CategoryType[]>(['Standard', 'Luxo', 'Super Luxo', 'Master']);
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryType | null>(null);

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
      case 'Master':
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
  
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryDialogOpen(true);
  };
  
  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };
  
  const handleDeleteCategory = (category: CategoryType) => {
    const roomsWithCategory = getCategoryRooms(category);
    if (roomsWithCategory.length > 0) {
      toast.error(`Esta categoria está em uso por ${roomsWithCategory.length} acomodações`);
      return;
    }
    
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCategory = () => {
    if (!deletingCategory) return;
    
    setCategories(prev => prev.filter(cat => cat !== deletingCategory));
    toast.success(`Categoria ${deletingCategory} excluída com sucesso`);
    
    if (selectedCategory === deletingCategory) {
      setSelectedCategory(categories.find(cat => cat !== deletingCategory) || 'Standard');
    }
    
    setIsDeleteDialogOpen(false);
    setDeletingCategory(null);
  };
  
  const handleSaveCategory = async (categoryData: { name: CategoryType, description: string }) => {
    if (editingCategory) {
      setCategories(prev => prev.map(cat => 
        cat === editingCategory ? categoryData.name : cat
      ));
      
      if (selectedCategory === editingCategory) {
        setSelectedCategory(categoryData.name);
      }
      
      setDescription(categoryData.description);
      
      toast.success(`Categoria atualizada: ${categoryData.name}`);
    } else {
      if (categories.includes(categoryData.name)) {
        toast.error("Esta categoria já existe");
        throw new Error("Category already exists");
      }
      
      setCategories(prev => [...prev, categoryData.name]);
      toast.success(`Nova categoria adicionada: ${categoryData.name}`);
    }
  };

  const handleSave = () => {
    toast.success(`Configurações da categoria ${selectedCategory} atualizadas`);
    onUpdate();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
            <DialogDescription>
              Visualize e gerencia as categorias de acomodações disponíveis
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-2 items-center">
              {categories.map(category => (
                <div key={category} className="flex items-center">
                  <Badge 
                    className={`cursor-pointer px-3 py-1 text-sm ${
                      selectedCategory === category 
                        ? 'ring-2 ring-offset-2 ' + getCategoryColor(category)
                        : getCategoryColor(category)
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                  
                  <div className="flex ml-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => handleEditCategory(category)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500 hover:text-red-700" 
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" onClick={handleAddCategory} className="ml-2">
                <Plus className="h-3 w-3 mr-1" /> Nova
              </Button>
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
      
      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        initialCategory={editingCategory || undefined}
        onSave={handleSaveCategory}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deletingCategory}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryManagementDialog;
