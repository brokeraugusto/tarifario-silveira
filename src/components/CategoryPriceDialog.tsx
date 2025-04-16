
import React, { useState, useEffect } from 'react';
import { X, Plus, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CategoryType, Accommodation, PriceOption } from '@/types';
import { getAllAccommodations, getAccommodationsByCategory, updatePricesByCategory } from '@/utils/accommodationService';

interface CategoryPriceDialogProps {
  category: CategoryType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const CategoryPriceDialog: React.FC<CategoryPriceDialogProps> = ({ 
  category, isOpen, onOpenChange, onUpdate 
}) => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [excludedAccommodations, setExcludedAccommodations] = useState<string[]>([]);
  const [periodId, setPeriodId] = useState<string>('1'); // Default to first period
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([
    { people: 2, withBreakfast: 0, withoutBreakfast: 0 }
  ]);
  
  useEffect(() => {
    if (isOpen) {
      const categoryAccommodations = getAccommodationsByCategory(category);
      setAccommodations(categoryAccommodations);
      setExcludedAccommodations([]);
      
      // Reset price options based on category
      if (category === 'Standard') {
        setPriceOptions([{ people: 2, withBreakfast: 0, withoutBreakfast: 0 }]);
      } else if (category === 'Luxo') {
        setPriceOptions([
          { people: 2, withBreakfast: 0, withoutBreakfast: 0 },
          { people: 4, withBreakfast: 0, withoutBreakfast: 0 }
        ]);
      } else if (category === 'Super Luxo') {
        setPriceOptions([
          { people: 2, withBreakfast: 0, withoutBreakfast: 0 },
          { people: 4, withBreakfast: 0, withoutBreakfast: 0 },
          { people: 5, withBreakfast: 0, withoutBreakfast: 0 }
        ]);
      }
    }
  }, [isOpen, category]);
  
  const handleToggleAccommodation = (id: string) => {
    setExcludedAccommodations(prev => 
      prev.includes(id) ? prev.filter(accId => accId !== id) : [...prev, id]
    );
  };
  
  const handlePriceChange = (index: number, field: keyof PriceOption, value: number) => {
    setPriceOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  
  const addPriceOption = () => {
    // Find the next logical number of people
    const lastOption = priceOptions[priceOptions.length - 1];
    const nextPeople = lastOption ? Math.min(lastOption.people + 1, 10) : 1;
    
    setPriceOptions([...priceOptions, { people: nextPeople, withBreakfast: 0, withoutBreakfast: 0 }]);
  };
  
  const removePriceOption = (index: number) => {
    setPriceOptions(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSave = () => {
    try {
      updatePricesByCategory(category, periodId, priceOptions, excludedAccommodations);
      toast.success(`Preços atualizados para categoria ${category}`);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar preços");
      console.error(error);
    }
  };
  
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Luxo':
        return 'bg-purple-100 text-purple-800';
      case 'Super Luxo':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-md text-sm ${getCategoryColor(category)}`}>
              {category}
            </span>
            <span>Definir Preços por Categoria</span>
          </DialogTitle>
          <DialogDescription>
            Configure os preços padrão para todos os apartamentos desta categoria.
            Desmarque os apartamentos que terão valores diferentes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={periodId} onValueChange={setPeriodId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Baixa Temporada</SelectItem>
                <SelectItem value="2">Alta Temporada</SelectItem>
                <SelectItem value="3">Natal e Ano Novo</SelectItem>
                <SelectItem value="4">Carnaval</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Preços por Ocupação</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addPriceOption}
                className="flex items-center gap-1"
                disabled={priceOptions.length >= 10}
              >
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
            
            {priceOptions.map((option, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center border p-3 rounded-md">
                <div className="space-y-1">
                  <Label htmlFor={`people-${index}`} className="text-xs text-muted-foreground">
                    Pessoas
                  </Label>
                  <Select 
                    value={String(option.people)} 
                    onValueChange={(value) => handlePriceChange(index, 'people', parseInt(value))}
                  >
                    <SelectTrigger id={`people-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor={`with-breakfast-${index}`} className="text-xs text-muted-foreground">
                    Com Café da Manhã
                  </Label>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    <Input
                      id={`with-breakfast-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={option.withBreakfast}
                      onChange={(e) => handlePriceChange(index, 'withBreakfast', Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor={`without-breakfast-${index}`} className="text-xs text-muted-foreground">
                    Sem Café da Manhã
                  </Label>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    <Input
                      id={`without-breakfast-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={option.withoutBreakfast}
                      onChange={(e) => handlePriceChange(index, 'withoutBreakfast', Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end items-center">
                  {priceOptions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePriceOption(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {accommodations.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Apartamentos ({accommodations.length})
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Desmarque os apartamentos que terão preços diferentes do padrão da categoria.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                {accommodations.map((acc) => (
                  <div key={acc.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`acc-${acc.id}`} 
                      checked={!excludedAccommodations.includes(acc.id)}
                      onCheckedChange={() => handleToggleAccommodation(acc.id)}
                    />
                    <Label 
                      htmlFor={`acc-${acc.id}`} 
                      className="text-sm cursor-pointer"
                    >
                      {acc.roomNumber} - {acc.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {excludedAccommodations.length} apartamentos excluídos da atualização em massa
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryPriceDialog;
