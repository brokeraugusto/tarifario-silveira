
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CategoryPrice, createCategoryPrice, updateCategoryPrice } from '@/integrations/supabase/services/categoryPriceService';
import { PricePeriod, CategoryType } from '@/types';

interface CategoryPriceFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingPrice?: CategoryPrice | null;
  periods: PricePeriod[];
  categories: CategoryType[];
  paymentMethods: { value: string; label: string }[];
}

const formSchema = z.object({
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
  number_of_people: z.number().int().min(1).max(6, { message: 'Número de pessoas deve ser entre 1 e 6' }),
  payment_method: z.enum(['pix', 'credit_card'], { required_error: 'Método de pagamento é obrigatório' }),
  period_id: z.string().min(1, { message: 'Período é obrigatório' }),
  price_per_night: z.number().min(0, { message: 'Preço deve ser maior que zero' }),
  min_nights: z.number().int().min(1, { message: 'Mínimo de noites deve ser pelo menos 1' }),
});

type FormValues = z.infer<typeof formSchema>;

const CategoryPriceForm: React.FC<CategoryPriceFormProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  editingPrice,
  periods,
  categories,
  paymentMethods
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      number_of_people: 1,
      payment_method: 'pix',
      period_id: '',
      price_per_night: 0,
      min_nights: 1,
    },
  });

  useEffect(() => {
    if (editingPrice) {
      form.reset({
        category: editingPrice.category,
        number_of_people: editingPrice.number_of_people,
        payment_method: editingPrice.payment_method as 'pix' | 'credit_card',
        period_id: editingPrice.period_id,
        price_per_night: Number(editingPrice.price_per_night),
        min_nights: editingPrice.min_nights,
      });
    } else {
      form.reset({
        category: '',
        number_of_people: 1,
        payment_method: 'pix',
        period_id: '',
        price_per_night: 0,
        min_nights: 1,
      });
    }
  }, [editingPrice, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      let result;

      if (editingPrice) {
        result = await updateCategoryPrice(editingPrice.id, {
          category: values.category,
          number_of_people: values.number_of_people,
          payment_method: values.payment_method,
          period_id: values.period_id,
          price_per_night: values.price_per_night,
          min_nights: values.min_nights,
        });
        if (result) {
          toast.success('Regra de preço atualizada com sucesso');
        }
      } else {
        result = await createCategoryPrice({
          category: values.category,
          number_of_people: values.number_of_people,
          payment_method: values.payment_method,
          period_id: values.period_id,
          price_per_night: values.price_per_night,
          min_nights: values.min_nights,
        });
        if (result) {
          toast.success('Regra de preço criada com sucesso');
        }
      }

      if (result) {
        form.reset();
        onSuccess();
      } else {
        toast.error('Erro ao salvar regra de preço');
      }
    } catch (error) {
      console.error('Error saving category price:', error);
      toast.error('Erro ao salvar regra de preço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingPrice ? 'Editar Regra de Preço' : 'Nova Regra de Preço'}
          </DialogTitle>
          <DialogDescription>
            {editingPrice 
              ? 'Edite as informações da regra de preço.' 
              : 'Adicione uma nova regra de preço por categoria.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number_of_people"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Pessoas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={6}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                        value={field.value}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_nights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mínimo de Noites</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                        value={field.value}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price_per_night"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço por Noite (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      value={field.value}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processando..." : editingPrice ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryPriceForm;
