import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Reservation, ReservationStatus } from "@/types";
import { updateReservationStatus, deleteReservation } from "@/integrations/supabase/services/reservationService";
import { DeleteReservationDialog } from "./DeleteReservationDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReservationsListProps {
  reservations: Reservation[];
  onEdit: (reservation: Reservation) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const ReservationsList = ({ reservations, onEdit, onRefresh, loading }: ReservationsListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleStatusUpdate = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      setUpdatingStatus(reservationId);
      await updateReservationStatus(reservationId, newStatus);
      toast({
        title: "Sucesso",
        description: "Status da reserva atualizado com sucesso.",
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da reserva.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReservation) return;

    try {
      await deleteReservation(selectedReservation.id);
      toast({
        title: "Sucesso",
        description: "Reserva excluída com sucesso.",
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a reserva.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReservation(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando reservas...</div>
      </Card>
    );
  }

  if (reservations.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhuma reserva encontrada.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hóspede</TableHead>
              <TableHead>Acomodação</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Hóspedes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{reservation.guest_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {reservation.guest_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {reservation.accommodation?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Quarto {reservation.accommodation?.roomNumber || 'N/A'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(reservation.check_in_date), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {format(new Date(reservation.check_out_date), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{reservation.number_of_guests}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(reservation.status)}>
                    {getStatusLabel(reservation.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  R$ {Number(reservation.total_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(reservation)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {reservation.status === 'pending' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                          disabled={updatingStatus === reservation.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirmar
                        </DropdownMenuItem>
                      )}
                      
                      {reservation.status === 'confirmed' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(reservation.id, 'checked_in')}
                          disabled={updatingStatus === reservation.id}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Check-in
                        </DropdownMenuItem>
                      )}
                      
                      {reservation.status === 'checked_in' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(reservation.id, 'checked_out')}
                          disabled={updatingStatus === reservation.id}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Check-out
                        </DropdownMenuItem>
                      )}
                      
                      {['pending', 'confirmed'].includes(reservation.status) && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                          disabled={updatingStatus === reservation.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(reservation)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <DeleteReservationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        reservation={selectedReservation}
      />
    </>
  );
};