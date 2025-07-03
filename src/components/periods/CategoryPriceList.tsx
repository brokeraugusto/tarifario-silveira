
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryType } from '@/types';
import { CategoryPriceEntry } from '@/integrations/supabase/services/categoryPriceService';
import InlineCategoryEditor from './InlineCategoryEditor';

interface CategoryPriceListProps {
  prices: CategoryPriceEntry[];
  accommodationCapacities: Record<CategoryType, number[]>;
  onEdit: (price: CategoryPriceEntry) => void;
  onDelete: (priceId: string) => void;
  onCategoryEdit: (oldCategory: CategoryType, newCategory: CategoryType) => void;
  loading: boolean;
}

const CategoryPriceList: React.FC<CategoryPriceListProps> = ({
  prices,
  accommodationCapacities,
  onEdit,
  onDelete,
  onCategoryEdit,
  loading
}) => {
  const getPaymentMethodBadge = (method: 'pix' | 'credit_card') => {
    if (method === 'pix') {
      return <Badge variant="default" className="bg-green-100 text-green-800">PIX</Badge>;
    }
    return <Badge variant="secondary">Cartão</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando preços...</p>
      </div>
    );
  }

  if (prices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhum preço configurado para este período
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prices.map((price) => (
        <div key={price.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <InlineCategoryEditor
                category={price.category}
                onSave={onCategoryEdit}
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
              onClick={() => onEdit(price)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(price.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryPriceList;
