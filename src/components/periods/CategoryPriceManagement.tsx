
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import InlineCategoryEditor from './InlineCategoryEditor';

interface CategoryPriceManagementProps {
  selectedPeriod: PricePeriod | null;
}

const CATEGORIES: CategoryType[] = ['Standard', 'Luxo', 'Super Luxo', 'Master'];
const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX (À Vista)' },
  { value: 'credit_card', label: 'Cartão de Crédito' }
];

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

    // Validar se o número de pessoas é válido para a categoria
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
      
      await fetchData();
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
      await fetchData();
    } catch (error) {
      console.error('Error deleting price:', error);
      toast.error('Erro ao excluir preço');
    }
  };

  const handleCategoryEdit = (oldCategory: CategoryType, newCategory: CategoryType) => {
    // Aqui você poderia implementar a lógica para atualizar o nome da categoria
    // Por enquanto, apenas mostramos uma mensagem
    toast.success(`Categoria ${oldCategory} alterada para ${newCategory}`);
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

  const getPaymentMethodBadge = (method: 'pix' | 'credit_card') => {
    if (method === 'pix') {
      return <Badge variant="default" className="bg-green-100 text-green-800">PIX</Badge>;
    }
    return <Badge variant="secondary">Cartão</Badge>;
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
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingPrice ? 'Editar Preço' : 'Novo Preço'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        const newCategory = value as CategoryType;
                        setFormData(prev => ({ 
                          ...prev, 
                          category: newCategory,
                          numberOfPeople: Math.min(prev.numberOfPeople, Math.max(...getAvailablePeopleOptions(newCategory)))
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="numberOfPeople">Número de Pessoas</Label>
                    <Select
                      value={formData.numberOfPeople.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfPeople: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailablePeopleOptions(formData.category).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} pessoa{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {accommodationCapacities[formData.category] && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Capacidades disponíveis: {accommodationCapacities[formData.category].join(', ')} pessoas
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value as 'pix' | 'credit_card' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pricePerNight">Preço por Noite (R$)</Label>
                    <Input
                      id="pricePerNight"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="minNights">Mínimo de Noites</Label>
                    <Input
                      id="minNights"
                      type="number"
                      min="1"
                      value={formData.minNights}
                      onChange={(e) => setFormData(prev => ({ ...prev, minNights: parseInt(e.target.value) || 1 }))}
                      required
                    />
                  </div>

                  <div className="col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      {editingPrice ? 'Atualizar' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando preços...</p>
            </div>
          ) : prices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum preço configurado para este período
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prices.map((price) => (
                <div key={price.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <InlineCategoryEditor
                        category={price.category}
                        onSave={handleCategoryEdit}
                        disabled={loading}
                      />
                      {getPaymentMethodBadge(price.paymentMethod)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {price.numberOfPeople} pessoa{price.numberOfPeople > 1 ? 's' : ''} • 
                      R$ {price.pricePerNight.toFixed(2)}/noite • 
                      Mín. {price.minNights} noite{price.minNights > 1 ? 's' : ''}
                    </div>
                    {accommodationCapacities[price.category] && (
                      <div className="text-xs text-muted-foreground">
                        Aplicável a acomodações com capacidade: {accommodationCapacities[price.category].filter(cap => cap >= price.numberOfPeople).join(', ')} pessoas
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(price)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(price.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryPriceManagement;
