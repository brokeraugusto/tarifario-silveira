
import React from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryType } from '@/types';
import { CategoryPriceEntry, CategoryPriceCreate } from '@/integrations/supabase/services/categoryPriceService';

interface CategoryPriceFormProps {
  formData: CategoryPriceCreate;
  setFormData: React.Dispatch<React.SetStateAction<CategoryPriceCreate>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  editingPrice: CategoryPriceEntry | null;
  accommodationCapacities: Record<CategoryType, number[]>;
  getAvailablePeopleOptions: (category: CategoryType) => number[];
}

const CATEGORIES: CategoryType[] = ['Standard', 'Luxo', 'Super Luxo', 'Master'];
const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX (À Vista)' },
  { value: 'credit_card', label: 'Cartão de Crédito' }
];

const CategoryPriceForm: React.FC<CategoryPriceFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingPrice,
  accommodationCapacities,
  getAvailablePeopleOptions
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {editingPrice ? 'Editar Preço' : 'Novo Preço'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
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
            <Button type="button" variant="outline" onClick={onCancel}>
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
  );
};

export default CategoryPriceForm;
