import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  CreditCard,
  LogIn,
  LogOut,
  Users,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { updateReservationStatus } from "@/integrations/supabase/services/reservationService";

interface ReservationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: {
    id: string;
    accommodation_id: string;
    accommodation_name: string;
    room_number: string;
    check_in_date: string;
    check_out_date: string;
    guest_id?: string;
    guest_name?: string;
    guest_first_name?: string;
    guest_last_name?: string;
    number_of_guests: number;
    status: string;
    total_price?: number;
  } | null;
  onRefresh: () => void;
}

export const ReservationDetailsDialog = ({
  open,
  onOpenChange,
  reservation,
  onRefresh,
}: ReservationDetailsDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!reservation) return null;

  const guestFullName = reservation.guest_first_name
    ? `${reservation.guest_first_name} ${reservation.guest_last_name || ""}`
    : reservation.guest_name || "Nome não informado";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      case "checked_in":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
      case "checked_out":
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendente";
      case "checked_in":
        return "Check-in Realizado";
      case "checked_out":
        return "Check-out Realizado";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      await updateReservationStatus(reservation.id, "checked_in");
      toast({
        title: "Sucesso",
        description: "Check-in realizado com sucesso",
      });
      onRefresh();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar check-in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      await updateReservationStatus(reservation.id, "checked_out");
      toast({
        title: "Sucesso",
        description: "Check-out realizado com sucesso",
      });
      onRefresh();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar check-out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToGuest = () => {
    if (reservation.guest_id) {
      navigate(`/guests?id=${reservation.guest_id}`);
    } else {
      navigate("/guests");
    }
  };

  const handleGoToReservation = () => {
    navigate(`/reservations?id=${reservation.id}`);
  };

  const handleGoToPayments = () => {
    navigate(`/reservations?id=${reservation.id}&tab=payment`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes da Reserva
          </DialogTitle>
          <DialogDescription>
            Visualize e gerencie as informações da reserva
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={getStatusColor(reservation.status)}>
              {getStatusLabel(reservation.status)}
            </Badge>
          </div>

          <Separator />

          {/* Accommodation Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Acomodação:</span>
              <span>{reservation.accommodation_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm pl-6">
              <span className="text-muted-foreground">Quarto:</span>
              <span>{reservation.room_number}</span>
            </div>
          </div>

          <Separator />

          {/* Guest Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Hóspede:</span>
              <span>{guestFullName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm pl-6">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Pessoas:</span>
              <span>{reservation.number_of_guests}</span>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <LogIn className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Check-in:</span>
              </div>
              <div className="pl-6 text-sm">
                {format(new Date(reservation.check_in_date), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Check-out:</span>
              </div>
              <div className="pl-6 text-sm">
                {format(new Date(reservation.check_out_date), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </div>
            </div>
          </div>

          {/* Price */}
          {reservation.total_price && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Valor Total:</span>
                </div>
                <span className="text-lg font-bold">
                  R$ {reservation.total_price.toFixed(2)}
                </span>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {reservation.status === "confirmed" && (
              <Button
                onClick={handleCheckIn}
                disabled={isLoading}
                className="w-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Realizar Check-in
              </Button>
            )}

            {reservation.status === "checked_in" && (
              <Button
                onClick={handleCheckOut}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Realizar Check-out
              </Button>
            )}

            <Button
              onClick={handleGoToGuest}
              variant="outline"
              className="w-full"
            >
              <User className="h-4 w-4 mr-2" />
              Ver Hóspede
            </Button>

            <Button
              onClick={handleGoToReservation}
              variant="outline"
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ver Reserva
            </Button>

            <Button
              onClick={handleGoToPayments}
              variant="outline"
              className="w-full col-span-2"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Ver Pagamentos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
