import { useState, useEffect } from "react";
import { format, addDays, startOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { OccupancyData } from "@/types/guest";
import { occupancyService } from "@/integrations/supabase/services/occupancyService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const OccupancyMapView = () => {
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
    return occupancyData.find(
      (item) =>
        item.accommodation_id === accommodationId &&
        item.date_value === format(date, "yyyy-MM-dd")
    );
  };

  const getCellStyle = (cellData: OccupancyData | undefined) => {
    if (!cellData) return "bg-background";
    
    if (cellData.reservation_id) {
      switch (cellData.reservation_status) {
        case "confirmed":
          return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700";
        case "pending":
          return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700";
        case "checked_in":
          return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700";
        default:
          return "bg-gray-100 dark:bg-gray-800";
      }
    }
    
    if (cellData.is_blocked) {
      return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700";
    }
    
    return "bg-background hover:bg-muted/50";
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
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
        <CardContent>
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
                    const cellData = getCellData(accommodation.id, date);
                    return (
                      <div
                        key={`${accommodation.id}-${date.toISOString()}`}
                        className={cn(
                          "w-24 flex-shrink-0 p-1 border-l cursor-pointer transition-colors",
                          getCellStyle(cellData)
                        )}
                        title={
                          cellData?.guest_first_name
                            ? `${cellData.guest_first_name} ${cellData.guest_last_name || ""}`
                            : cellData?.guest_name || ""
                        }
                      >
                        {cellData?.guest_first_name && (
                          <div className="text-xs truncate">
                            {cellData.guest_first_name}
                          </div>
                        )}
                        {cellData?.number_of_guests && (
                          <div className="text-xs text-muted-foreground">
                            {cellData.number_of_guests} pax
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
