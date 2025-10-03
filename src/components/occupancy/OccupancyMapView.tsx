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
import { cn } from "@/lib/utils";
import { ReservationDetailsDialog } from "./ReservationDetailsDialog";
import { supabase } from "@/integrations/supabase/client";

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
    return occupancyData.filter(
      (item) =>
        item.accommodation_id === accommodationId &&
        item.date_value === dateStr
    );
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

  const getReservationStyle = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700";
      case "checked_in":
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const accommodations = getAccommodations();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Carregando mapa de ocupação...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
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
        <CardContent className="flex-1 min-h-0 overflow-auto p-6">
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded" />
              <span className="text-sm">Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded" />
              <span className="text-sm">Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded" />
              <span className="text-sm">Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded" />
              <span className="text-sm">Bloqueada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-background border rounded" />
              <span className="text-sm">Disponível</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="flex border-b">
                <div className="w-40 flex-shrink-0 p-2 font-semibold">
                  Acomodação
                </div>
                {dates.map((date) => (
                  <div
                    key={date.toISOString()}
                    className="w-24 flex-shrink-0 p-2 text-center border-l"
                  >
                    <div className="text-xs font-medium">
                      {format(date, "EEE", { locale: ptBR })}
                    </div>
                    <div className="text-sm">{format(date, "dd/MM")}</div>
                  </div>
                ))}
              </div>

              {accommodations.map((accommodation) => (
                <div key={accommodation.id} className="flex border-b">
                  <div className="w-40 flex-shrink-0 p-2 border-r">
                    <div className="font-medium text-sm">
                      {accommodation.room_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {accommodation.name}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {accommodation.category}
                    </Badge>
                  </div>
                  {dates.map((date) => {
                    const cellDataArray = getCellData(accommodation.id, date);
                    const hasReservation = cellDataArray.some(c => c.reservation_id);
                    const isBlocked = cellDataArray.some(c => c.is_blocked && !c.reservation_id);
                    
                    return (
                      <div
                        key={`${accommodation.id}-${date.toISOString()}`}
                        className={cn(
                          "w-24 flex-shrink-0 border-l transition-colors min-h-[60px]",
                          !hasReservation && !isBlocked && "bg-background hover:bg-muted/50",
                          isBlocked && "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                        )}
                      >
                        <div className="flex flex-col h-full">
                          {cellDataArray.map((cellData, idx) => {
                            if (!cellData.reservation_id) return null;
                            
                            return (
                              <div
                                key={`${cellData.reservation_id}-${idx}`}
                                className={cn(
                                  "flex-1 p-1 cursor-pointer hover:opacity-80 transition-opacity",
                                  getReservationStyle(cellData.reservation_status || ''),
                                  idx > 0 && "border-t border-border/50"
                                )}
                                title={
                                  cellData.guest_first_name
                                    ? `${cellData.guest_first_name} ${cellData.guest_last_name || ""}`
                                    : cellData.guest_name || ""
                                }
                                onClick={() => handleCellClick(cellData.reservation_id!, cellDataArray)}
                              >
                                {cellData.guest_first_name && (
                                  <div className="text-xs truncate font-medium">
                                    {cellData.guest_first_name}
                                  </div>
                                )}
                                {cellData.number_of_guests && (
                                  <div className="text-xs text-muted-foreground">
                                    {cellData.number_of_guests} pax
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
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
