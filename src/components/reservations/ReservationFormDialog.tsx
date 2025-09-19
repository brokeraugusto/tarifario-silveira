import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Reservation, CreateReservationData, PaymentMethod } from "@/types";
import { getAllAccommodations } from "@/integrations/supabase/services/accommodations";
import { createReservation, updateReservation } from "@/integrations/supabase/services/reservationService";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  accommodation_id: z.string().min(1, "Selecione uma acomodação"),
  guest_name: z.string().min(1, "Nome do hóspede é obrigatório"),
  guest_email: z.string().email("Email inválido"),
  guest_phone: z.string().optional(),
  check_in_date: z.string().min(1, "Data de check-in é obrigatória"),
  check_out_date: z.string().min(1, "Data de check-out é obrigatória"),
  number_of_guests: z.number().min(1, "Número de hóspedes deve ser maior que 0"),
  payment_method: z.enum(["pix", "credit_card", "debit_card", "cash", "transfer"]),
  total_price: z.number().min(0, "Valor deve ser maior ou igual a 0"),
  includes_breakfast: z.boolean(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ReservationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation?: Reservation;
}

export const ReservationFormDialog = ({
  open,
  onOpenChange,
  reservation,
}: ReservationFormDialogProps) => {
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accommodation_id: "",
      guest_name: "",
      guest_email: "",
      guest_phone: "",
      check_in_date: "",
      check_out_date: "",
      number_of_guests: 1,
      payment_method: "pix",
      total_price: 0,
      includes_breakfast: false,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      loadAccommodations();
      if (reservation) {
        form.reset({
          accommodation_id: reservation.accommodation_id,
          guest_name: reservation.guest_name,
          guest_email: reservation.guest_email,
          guest_phone: reservation.guest_phone || "",
          check_in_date: reservation.check_in_date,
          check_out_date: reservation.check_out_date,
          number_of_guests: reservation.number_of_guests,
          payment_method: reservation.payment_method,
          total_price: Number(reservation.total_price),
          includes_breakfast: reservation.includes_breakfast,
          notes: reservation.notes || "",
        });
      } else {
        form.reset();
      }
    }
  }, [open, reservation, form]);

  const loadAccommodations = async () => {
    try {
      const data = await getAllAccommodations();
      setAccommodations(data.filter(acc => !acc.isBlocked));
    } catch (error) {
      console.error('Error loading accommodations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as acomodações.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      if (reservation) {
        await updateReservation(reservation.id, data);
        toast({
          title: "Sucesso",
          description: "Reserva atualizada com sucesso.",
        });
      } else {
        const newReservation = await createReservation(data as CreateReservationData);
        if (newReservation) {
          // Try to sync with Google Calendar
          try {
            await supabase.functions.invoke('google-calendar', {
              body: {
                action: 'create',
                reservation: newReservation,
                calendarId: 'primary' // This should come from settings
              }
            });
          } catch (calendarError) {
            console.warn('Google Calendar sync failed:', calendarError);
            // Don't fail the reservation creation if calendar sync fails
          }
        }
        toast({
          title: "Sucesso",
          description: "Reserva criada com sucesso.",
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving reservation:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a reserva.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    pix: "PIX",
    credit_card: "Cartão de Crédito",
    debit_card: "Cartão de Débito",
    cash: "Dinheiro",
    transfer: "Transferência",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reservation ? "Editar Reserva" : "Nova Reserva"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accommodation_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acomodação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma acomodação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accommodations.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name} - Quarto {acc.roomNumber}
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
                name="guest_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Hóspede</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guest_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guest_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="check_in_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="check_out_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number_of_guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Hóspedes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(paymentMethodLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="total_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includes_breakfast"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Inclui Café da Manhã</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre a reserva..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : reservation ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};