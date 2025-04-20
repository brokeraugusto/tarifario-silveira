
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createPricePeriod, updatePricePeriod, getAllPricePeriods } from '@/integrations/supabase/services/periodService';
import { PricePeriod } from '@/types';

interface PeriodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editPeriod?: PricePeriod;
  periodId?: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  startDate: z.date({ required_error: 'Data de início é obrigatória' }),
  endDate: z.date({ required_error: 'Data de fim é obrigatória' }),
  minimumStay: z.number().int().min(1, { message: 'Mínimo de diárias deve ser pelo menos 1' }),
  isHoliday: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const PeriodDialog: React.FC<PeriodDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  editPeriod,
  periodId
}) => {
  const [loading, setLoading] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<PricePeriod | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      startDate: new Date(),
      endDate: new Date(),
      minimumStay: 1,
      isHoliday: false,
    },
  });
  
  useEffect(() => {
    if (periodId && isOpen) {
      fetchPeriod(periodId);
    } else if (editPeriod) {
      setCurrentPeriod(editPeriod);
      form.reset({
        name: editPeriod.name,
        startDate: new Date(editPeriod.startDate),
        endDate: new Date(editPeriod.endDate),
        minimumStay: editPeriod.minimumStay || 1,
        isHoliday: editPeriod.isHoliday || false,
      });
    } else {
      form.reset({
        name: '',
        startDate: new Date(),
        endDate: new Date(),
        minimumStay: 1,
        isHoliday: false,
      });
    }
  }, [isOpen, editPeriod, periodId]);

  const fetchPeriod = async (id: string) => {
    try {
      const periods = await getAllPricePeriods();
      const period = periods.find(p => p.id === id);
      
      if (period) {
        setCurrentPeriod(period);
        form.reset({
          name: period.name,
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
          minimumStay: period.minimumStay || 1,
          isHoliday: period.isHoliday || false,
        });
      }
    } catch (error) {
      console.error("Error fetching period:", error);
      toast.error("Erro ao buscar período");
    }
  };

  const onSubmit = async (values: FormValues) => {
    console.log('Submitting period form with values:', values);
    
    if (values.endDate < values.startDate) {
      form.setError('endDate', { 
        type: 'manual', 
        message: 'Data de fim deve ser após a data de início' 
      });
      return;
    }

    setLoading(true);
    try {
      let result;
      
      // Format dates properly to prevent timezone issues
      const formatDateToYYYYMMDD = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // Create date objects that don't have timezone information to avoid date shifts
      const startDate = new Date(formatDateToYYYYMMDD(values.startDate));
      const endDate = new Date(formatDateToYYYYMMDD(values.endDate));
      
      if (currentPeriod || periodId) {
        const id = periodId || currentPeriod?.id || '';
        console.log(`Updating period with id ${id}:`, values);
        console.log(`Start date (formatted): ${formatDateToYYYYMMDD(values.startDate)}`);
        console.log(`End date (formatted): ${formatDateToYYYYMMDD(values.endDate)}`);
        
        result = await updatePricePeriod(id, {
          name: values.name,
          startDate,
          endDate,
          minimumStay: values.minimumStay,
          isHoliday: values.isHoliday
        });
        
        if (result) {
          toast.success("Período atualizado com sucesso");
        }
      } else {
        console.log("Creating new period:", values);
        console.log(`Start date (formatted): ${formatDateToYYYYMMDD(values.startDate)}`);
        console.log(`End date (formatted): ${formatDateToYYYYMMDD(values.endDate)}`);
        
        result = await createPricePeriod({
          name: values.name,
          startDate,
          endDate,
          minimumStay: values.minimumStay,
          isHoliday: values.isHoliday
        });
        
        if (result) {
          toast.success("Período criado com sucesso");
          console.log("Created period:", result);
        }
      }
      
      if (result) {
        form.reset();
        onSuccess();
      } else {
        toast.error("Erro ao salvar período");
      }
    } catch (error) {
      console.error("Error saving period:", error);
      toast.error("Erro ao salvar período");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editPeriod ? 'Editar Período' : 'Novo Período'}</DialogTitle>
          <DialogDescription>
            {editPeriod 
              ? 'Edite as informações do período existente.' 
              : 'Adicione um novo período para definição de preços.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Período</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Alta Temporada, Natal, Carnaval" 
                      {...field} 
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={loading}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Fim</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={loading}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="minimumStay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mínimo de Diárias</FormLabel>
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

            <FormField
              control={form.control}
              name="isHoliday"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Período de Feriado/Especial</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Períodos especiais têm precedência sobre períodos regulares.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
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
                {loading ? "Processando..." : editPeriod ? "Atualizar Período" : "Salvar Período"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PeriodDialog;
