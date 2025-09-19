import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reservation, ReservationStatus } from "@/types";
import { format, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReservationCalendarProps {
  reservations: Reservation[];
  onSelectReservation: (reservation: Reservation) => void;
  onDateSelect: (date: Date) => void;
}

export const ReservationCalendar = ({
  reservations,
  onSelectReservation,
  onDateSelect,
}: ReservationCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      case 'checked_in':
        return 'Check-in';
      case 'checked_out':
        return 'Check-out';
      default:
        return status;
    }
  };

  // Get reservations for selected date
  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      const checkIn = parseISO(reservation.check_in_date);
      const checkOut = parseISO(reservation.check_out_date);
      
      try {
        return isWithinInterval(date, { start: checkIn, end: checkOut });
      } catch {
        return false;
      }
    });
  };

  // Create modifiers for calendar dates that have reservations
  const createDateModifiers = () => {
    const reservationDates: Date[] = [];
    
    reservations.forEach(reservation => {
      try {
        const checkIn = parseISO(reservation.check_in_date);
        const checkOut = parseISO(reservation.check_out_date);
        
        // Add all dates in the reservation range
        let currentDate = new Date(checkIn);
        while (currentDate <= checkOut) {
          reservationDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (error) {
        console.warn('Invalid date in reservation:', reservation);
      }
    });

    return {
      hasReservation: reservationDates,
    };
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  const modifiers = createDateModifiers();
  const selectedDateReservations = selectedDate ? getReservationsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={ptBR}
              modifiers={modifiers}
              modifiersStyles={{
                hasReservation: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold',
                },
              }}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Reservas para {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data selecionada'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateReservations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma reserva para esta data.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedDateReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onSelectReservation(reservation)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{reservation.guest_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {reservation.accommodation?.name} - Quarto {reservation.accommodation?.roomNumber}
                        </p>
                      </div>
                      <Badge className={getStatusColor(reservation.status)}>
                        {getStatusLabel(reservation.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Check-in:</span>{" "}
                        {format(parseISO(reservation.check_in_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div>
                        <span className="font-medium">Check-out:</span>{" "}
                        {format(parseISO(reservation.check_out_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div>
                        <span className="font-medium">Hóspedes:</span> {reservation.number_of_guests}
                      </div>
                      <div>
                        <span className="font-medium">Valor:</span>{" "}
                        R$ {Number(reservation.total_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {reservation.notes && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Observações:</span> {reservation.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};