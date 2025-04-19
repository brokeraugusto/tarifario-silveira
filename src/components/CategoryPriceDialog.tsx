
import React, { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CategoryType, PriceOption, PricePeriod, Accommodation } from '@/types';
import { getAccommodationsByCategory } from '@/integrations/supabase/services/accommodations';
import { updatePricesByCategory } from '@/integrations/supabase/services/priceService';
import { getAllPricePeriods } from '@/integrations/supabase/services/periodService';
import PeriodDialog from './PeriodDialog';
import PriceOptionForm from './prices/PriceOptionForm';
import ExcludedAccommodations from './prices/ExcludedAccommodations';

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
  const [periods, setPeriods] = useState<PricePeriod[]>([]);
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const periodData = await getAllPricePeriods();
      setPeriods(periodData);
      
      if (periodData.length > 0 && !periodId) {
        setPeriodId(periodData[0].id);
      }

      const categoryAccommodations = await getAccommodationsByCategory(category);
      setAccommodations(categoryAccommodations);
      setExcludedAccommodations([]);
      
      let defaultOptions: PriceOption[] = [];
      
      if (category === 'Standard') {
        defaultOptions = [{ people: 2, withBreakfast: 0, withoutBreakfast: 0 }];
      } else if (category === 'Luxo') {
        defaultOptions = [
          { people: 2, withBreakfast: 0, withoutBreakfast: 0 },
          { people: 4, withBreakfast: 0, withoutBreakfast: 0 }
        ];
      } else if (category === 'Super Luxo') {
        defaultOptions = [
          { people: 2, withBreakfast: 0, withoutBreakfast: 0 },
          { people: 4, withBreakfast: 0, withoutBreakfast: 0 },
          { people: 5, withBreakfast: 0, withoutBreakfast: 0 }
        ];
      } else {
        defaultOptions = [{ people: 2, withBreakfast: 0, withoutBreakfast: 0 }];
      }
      
      setPriceOptions(defaultOptions);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };
  
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
    const lastOption = priceOptions[priceOptions.length - 1];
    const nextPeople = lastOption ? Math.min(lastOption.people + 1, 10) : 1;
    
    setPriceOptions([...priceOptions, { people: nextPeople, withBreakfast: 0, withoutBreakfast: 0 }]);
  };
  
  const removePriceOption = (index: number) => {
    setPriceOptions(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSave = async () => {
    if (!periodId) {
      toast.error("Selecione um período");
      return;
    }
    
    setLoading(true);
    try {
      await updatePricesByCategory(category, periodId, priceOptions, excludedAccommodations);
      toast.success(`Preços atualizados para categoria ${category}`);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar preços");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodCreated = () => {
    fetchData();
    setIsPeriodDialogOpen(false);
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
    <>
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
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="flex gap-2">
                <Select value={periodId} onValueChange={setPeriodId} disabled={loading}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.length > 0 ? (
                      periods.map(period => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name} ({period.minimumStay} diária{period.minimumStay !== 1 ? 's' : ''} mín.)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>Nenhum período cadastrado</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPeriodDialogOpen(true)}
                  title="Adicionar novo período"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
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
                  disabled={priceOptions.length >= 10 || loading}
                >
                  <Plus className="h-4 w-4" /> Adicionar
                </Button>
              </div>
              
              {priceOptions.map((option, index) => (
                <PriceOptionForm
                  key={index}
                  option={option}
                  index={index}
                  onPriceChange={handlePriceChange}
                  onRemove={removePriceOption}
                  canRemove={priceOptions.length > 1}
                  disabled={loading}
                />
              ))}
            </div>

            <ExcludedAccommodations
              accommodations={accommodations}
              excludedAccommodations={excludedAccommodations}
              onToggle={handleToggleAccommodation}
              disabled={loading}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Processando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <PeriodDialog 
        isOpen={isPeriodDialogOpen}
        onOpenChange={setIsPeriodDialogOpen}
        onSuccess={handlePeriodCreated}
      />
    </>
  );
};

export default CategoryPriceDialog;
