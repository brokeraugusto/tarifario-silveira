
import React, { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createPricePeriod } from '@/integrations/supabase/accommodationService';
import { PricePeriod } from '@/types';

interface PeriodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editPeriod?: PricePeriod;
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
  editPeriod
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editPeriod?.name || '',
      startDate: editPeriod?.startDate || new Date(),
      endDate: editPeriod?.endDate || new Date(),
      minimumStay: editPeriod?.minimumStay || 1,
      isHoliday: editPeriod?.isHoliday || false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Validate end date is after start date
    if (values.endDate < values.startDate) {
      form.setError('endDate', { 
        type: 'manual', 
        message: 'Data de fim deve ser após a data de início' 
      });
      return;
    }

    setLoading(true);
    try {
      await createPricePeriod({
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        minimumStay: values.minimumStay,
        isHoliday: values.isHoliday
      });
      
      toast.success("Período criado com sucesso");
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating period:", error);
      toast.error("Erro ao criar período");
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
                {loading ? "Processando..." : "Salvar Período"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PeriodDialog;
