
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CategoryPrice, getAllCategoryPrices, deleteCategoryPrice } from '@/integrations/supabase/services/categoryPriceService';
import { getAllPricePeriods } from '@/integrations/supabase/services/periodService';
import { PricePeriod, CategoryType } from '@/types';
import CategoryPriceForm from './CategoryPriceForm';

interface CategoryPriceManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES: CategoryType[] = ['Standard', 'Luxo', 'Super Luxo', 'Master'];
const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartão de Crédito' }
];

const CategoryPriceManagementDialog: React.FC<CategoryPriceManagementDialogProps> = ({
  isOpen,
  onOpenChange
}) => {
  const [categoryPrices, setCategoryPrices] = useState<CategoryPrice[]>([]);
  const [periods, setPeriods] = useState<PricePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<CategoryPrice | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pricesData, periodsData] = await Promise.all([
        getAllCategoryPrices(),
        getAllPricePeriods()
      ]);
      setCategoryPrices(pricesData);
      setPeriods(periodsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (price: CategoryPrice) => {
    setEditingPrice(price);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingPrice(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta regra de preço?')) {
      return;
    }

    try {
      const success = await deleteCategoryPrice(id);
      if (success) {
        toast.success('Regra de preço excluída com sucesso');
        fetchData();
      } else {
        toast.error('Erro ao excluir regra de preço');
      }
    } catch (error) {
      console.error('Error deleting price:', error);
      toast.error('Erro ao excluir regra de preço');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPrice(null);
    fetchData();
  };

  const getPeriodName = (periodId: string) => {
    const period = periods.find(p => p.id === periodId);
    return period ? period.name : 'Período não encontrado';
  };

  const formatPaymentMethod = (method: string) => {
    return PAYMENT_METHODS.find(pm => pm.value === method)?.label || method;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Preços por Categoria</DialogTitle>
            <DialogDescription>
              Configure preços específicos por categoria, número de pessoas e método de pagamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Regras de Preço</h3>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Regra
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Pessoas</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Preço/Noite</TableHead>
                    <TableHead>Min. Noites</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryPrices.map((price) => (
                    <TableRow key={price.id}>
                      <TableCell>
                        <Badge variant="outline">{price.category}</Badge>
                      </TableCell>
                      <TableCell>{price.number_of_people}</TableCell>
                      <TableCell>{formatPaymentMethod(price.payment_method)}</TableCell>
                      <TableCell>{getPeriodName(price.period_id)}</TableCell>
                      <TableCell>R$ {price.price_per_night.toFixed(2)}</TableCell>
                      <TableCell>{price.min_nights}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(price)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(price.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categoryPrices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Nenhuma regra de preço cadastrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CategoryPriceForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
        editingPrice={editingPrice}
        periods={periods}
        categories={CATEGORIES}
        paymentMethods={PAYMENT_METHODS}
      />
    </>
  );
};

export default CategoryPriceManagementDialog;
