import { useState, useEffect } from "react";
import { Plus, Calendar, Users, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAllReservations, getReservationsByDate } from "@/integrations/supabase/services/reservationService";
import { Reservation } from "@/types";
import { ReservationsList } from "@/components/reservations/ReservationsList";
import { ReservationFormDialog } from "@/components/reservations/ReservationFormDialog";
import { ReservationCalendar } from "@/components/reservations/ReservationCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReservationsPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | undefined>();
  const { toast } = useToast();

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getAllReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as reservas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCreateReservation = () => {
    setSelectedReservation(undefined);
    setIsFormOpen(true);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedReservation(undefined);
    loadReservations();
  };

  // Calculate stats
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const totalRevenue = confirmedReservations.reduce((sum, r) => sum + Number(r.total_price), 0);
  const currentGuests = reservations.filter(r => r.status === 'checked_in').reduce((sum, r) => sum + r.number_of_guests, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservas</h1>
          <p className="text-muted-foreground">Gerencie todas as reservas do estabelecimento</p>
        </div>
        <Button onClick={handleCreateReservation} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations.length}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedReservations.length} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReservations.length}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hóspedes Atuais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGuests}</div>
            <p className="text-xs text-muted-foreground">
              Atualmente hospedados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Reservas confirmadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ReservationsList
            reservations={reservations}
            onEdit={handleEditReservation}
            onRefresh={loadReservations}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <ReservationCalendar
            reservations={reservations}
            onSelectReservation={handleEditReservation}
            onDateSelect={(date) => {
              // Future: filter reservations by selected date
              console.log('Selected date:', date);
            }}
          />
        </TabsContent>
      </Tabs>

      <ReservationFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        reservation={selectedReservation}
      />
    </div>
  );
};

export default ReservationsPage;