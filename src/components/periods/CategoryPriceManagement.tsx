
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CategoryType, PricePeriod } from '@/types';
import { 
  getCategoryPricesByPeriod, 
  createCategoryPrice, 
  updateCategoryPrice, 
  deleteCategoryPrice,
  CategoryPriceEntry,
  CategoryPriceCreate
} from '@/integrations/supabase/services/categoryPriceService';
import { getAccommodationsByCategory } from '@/integrations/supabase/services/accommodations';
import CategoryPriceForm from './CategoryPriceForm';
import CategoryPriceList from './CategoryPriceList';

interface CategoryPriceManagementProps {
  selectedPeriod: PricePeriod | null;
}

const CATEGORIES: CategoryType[] = ['Standard', 'Luxo', 'Super Luxo', 'Master'];

const CategoryPriceManagement: React.FC<CategoryPriceManagementProps> = ({ selectedPeriod }) => {
  const [prices, setPrices] = useState<CategoryPriceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState<CategoryPriceEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [accommodationCapacities, setAccommodationCapacities] = useState<Record<CategoryType, number[]>>({} as any);
  const [formData, setFormData] = useState<CategoryPriceCreate>({
    category: 'Standard',
    numberOfPeople: 2,
    paymentMethod: 'pix',
    periodId: '',
    pricePerNight: 0,
    minNights: 1
  });

  useEffect(() => {
    if (selectedPeriod) {
      fetchData();
      setFormData(prev => ({ ...prev, periodId: selectedPeriod.id }));
    }
  }, [selectedPeriod]);

  const fetchData = async () => {
    if (!selectedPeriod) return;
    
    setLoading(true);
    try {
      // Buscar preços do período
      const pricesData = await getCategoryPricesByPeriod(selectedPeriod.id);
      setPrices(pricesData);

      // Buscar capacidades das acomodações por categoria
      const capacities: Record<CategoryType, number[]> = {} as any;
      
      for (const category of CATEGORIES) {
        try {
          const accommodations = await getAccommodationsByCategory(category);
          capacities[category] = [...new Set(accommodations.map(acc => acc.capacity))].sort((a, b) => a - b);
        } catch (error) {
          console.error(`Error fetching accommodations for category ${category}:`, error);
          capacities[category] = [];
        }
      }
      
      setAccommodationCapacities(capacities);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getAvailablePeopleOptions = (category: CategoryType) => {
    const capacities = accommodationCapacities[category] || [];
    if (capacities.length === 0) return [2]; // Fallback
    
    const maxCapacity = Math.max(...capacities);
    return Array.from({ length: maxCapacity }, (_, i) => i + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriod) return;

    const availableOptions = getAvailablePeopleOptions(formData.category);
    if (!availableOptions.includes(formData.numberOfPeople)) {
      toast.error(`Esta categoria não suporta ${formData.numberOfPeople} pessoas`);
      return;
    }

    try {
      if (editingPrice) {
        await updateCategoryPrice(editingPrice.id, formData);
        toast.success('Preço atualizado com sucesso');
      } else {
        await createCategoryPrice({ ...formData, periodId: selectedPeriod.id });
        toast.success('Preço criado com sucesso');
      }
      
      await fetchData(); // Refresh dados
      setShowAddForm(false);
      setEditingPrice(null);
      resetForm();
    } catch (error) {
      console.error('Error saving price:', error);
      toast.error('Erro ao salvar preço');
    }
  };

  const handleEdit = (price: CategoryPriceEntry) => {
    setEditingPrice(price);
    setFormData({
      category: price.category,
      numberOfPeople: price.numberOfPeople,
      paymentMethod: price.paymentMethod,
      periodId: price.periodId,
      pricePerNight: price.pricePerNight,
      minNights: price.minNights
    });
    setShowAddForm(true);
  };

  const handleDelete = async (priceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este preço?')) return;

    try {
      await deleteCategoryPrice(priceId);
      toast.success('Preço excluído com sucesso');
      await fetchData(); // Refresh dados
    } catch (error) {
      console.error('Error deleting price:', error);
      toast.error('Erro ao excluir preço');
    }
  };

  const handleCategoryEdit = async (oldCategory: CategoryType, newCategory: CategoryType) => {
    // Refresh dados após edição da categoria
    await fetchData();
  };

  const resetForm = () => {
    setFormData({
      category: 'Standard',
      numberOfPeople: 2,
      paymentMethod: 'pix',
      periodId: selectedPeriod?.id || '',
      pricePerNight: 0,
      minNights: 1
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingPrice(null);
    resetForm();
  };

  if (!selectedPeriod) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Selecione um período para gerenciar os preços por categoria
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Preços por Categoria - {selectedPeriod.name}</CardTitle>
            <Button 
              onClick={() => setShowAddForm(true)} 
              disabled={showAddForm}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Preço
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <CategoryPriceForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              editingPrice={editingPrice}
              accommodationCapacities={accommodationCapacities}
              getAvailablePeopleOptions={getAvailablePeopleOptions}
            />
          )}

          <CategoryPriceList
            prices={prices}
            accommodationCapacities={accommodationCapacities}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCategoryEdit={handleCategoryEdit}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryPriceManagement;
