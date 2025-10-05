import { useState, useEffect } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { OccupancyData } from "@/types/guest";
import { occupancyService } from "@/integrations/supabase/services/occupancyService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ReservationDetailsDialog } from "./ReservationDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { OccupancyCell } from "./OccupancyCell";
import { OccupancyLegend } from "./OccupancyLegend";
import { OccupancyMapSkeleton } from "./OccupancyMapSkeleton";

export const OccupancyMapView = () => {
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [loading, setLoading] = useState(true);
  const daysToShow = 14;

  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(startDate, i));

  const loadOccupancyData = async () => {
    try {
      setLoading(true);
      const endDate = addDays(startDate, daysToShow - 1);
      const data = await occupancyService.getOccupancyData(startDate, endDate);
      setOccupancyData(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de ocupação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOccupancyData();
  }, [startDate]);

  const handlePrevious = () => {
    setStartDate((prev) => addDays(prev, -daysToShow));
  };

  const handleNext = () => {
    setStartDate((prev) => addDays(prev, daysToShow));
  };

  const handleToday = () => {
    setStartDate(startOfDay(new Date()));
  };

  const getAccommodations = () => {
    const accommodations = new Map();
    occupancyData.forEach((item) => {
      if (!accommodations.has(item.accommodation_id)) {
        accommodations.set(item.accommodation_id, {
          id: item.accommodation_id,
          name: item.accommodation_name,
          room_number: item.room_number,
          category: item.category,
        });
      }
    });
    return Array.from(accommodations.values()).sort((a, b) =>
      a.room_number.localeCompare(b.room_number)
    );
  };

  const getCellData = (accommodationId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Get all data for this accommodation and date
    const cellData = occupancyData.filter(
      (item) =>
        item.accommodation_id === accommodationId &&
        item.date_value === dateStr
    );
    
    // Also check for checkout on this date (where check_out_date matches)
    const checkoutData = occupancyData.filter(
      (item) =>
        item.accommodation_id === accommodationId &&
        item.check_out_date === dateStr
    );
    
    // Also check for checkin on this date (where check_in_date matches)
    const checkinData = occupancyData.filter(
      (item) =>
        item.accommodation_id === accommodationId &&
        item.check_in_date === dateStr
    );
    
    // Combine and deduplicate
    const combined = [...cellData, ...checkoutData, ...checkinData];
    const unique = Array.from(
      new Map(combined.map(item => [item.reservation_id || item.accommodation_id, item])).values()
    );
    
    return unique;
  };

  const handleCellClick = async (reservationId: string, cellDataArray: OccupancyData[]) => {
    if (!reservationId) return;
    
    try {
      const cellData = cellDataArray.find(c => c.reservation_id === reservationId);
      if (!cellData) return;

      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          accommodations:accommodation_id (
            id,
            name,
            room_number
          )
        `)
        .eq("id", reservationId)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedReservation({
          id: data.id,
          accommodation_id: data.accommodation_id,
          accommodation_name: data.accommodations?.name || cellData.accommodation_name,
          room_number: data.accommodations?.room_number || cellData.room_number,
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
          guest_id: data.guest_id,
          guest_name: data.guest_name,
          guest_first_name: cellData.guest_first_name,
          guest_last_name: cellData.guest_last_name,
          number_of_guests: data.number_of_guests,
          status: data.status,
          total_price: data.total_price,
        });
        setIsDetailsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching reservation:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes da reserva",
        variant: "destructive",
      });
    }
  };

  const accommodations = getAccommodations();

  if (loading) {
    return <OccupancyMapSkeleton />;
  }

  return (
    <>
      <Card className="h-full w-full flex flex-col border-0 shadow-none">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mapa de Ocupação
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-auto p-0">
          <div className="mb-4">
            <OccupancyLegend />
          </div>

          <div className="overflow-x-auto snap-x snap-mandatory scrollbar-thin">
            <div className="min-w-max">
              {/* Sticky header */}
              <div className="flex border-b sticky top-0 bg-card z-10">
                <div className="w-40 flex-shrink-0 p-2 font-semibold bg-card">
                  Acomodação
                </div>
                {dates.map((date) => (
                  <div
                    key={date.toISOString()}
                    className="w-32 flex-shrink-0 p-2 text-center border-l bg-card snap-start"
                  >
                    <div className="text-xs font-medium">
                      {format(date, "EEE", { locale: ptBR })}
                    </div>
                    <div className="text-sm">{format(date, "dd/MM")}</div>
                  </div>
                ))}
              </div>

              {/* Accommodation rows */}
              {accommodations.map((accommodation) => (
                <div key={accommodation.id} className="flex border-b">
                  <div className="w-40 flex-shrink-0 p-2 border-r bg-card sticky left-0 z-10">
                    <div className="font-medium text-sm">
                      {accommodation.room_number}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {accommodation.name}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {accommodation.category}
                    </Badge>
                  </div>
                  {dates.map((date) => {
                    const cellDataArray = getCellData(accommodation.id, date);
                    
                    return (
                      <OccupancyCell
                        key={`${accommodation.id}-${date.toISOString()}`}
                        cellDataArray={cellDataArray}
                        date={date}
                        accommodationId={accommodation.id}
                        onCellClick={handleCellClick}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <ReservationDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        reservation={selectedReservation}
        onRefresh={loadOccupancyData}
      />
    </>
  );
};
