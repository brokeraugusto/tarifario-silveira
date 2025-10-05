import React from "react";
import { format } from "date-fns";
import { LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { OccupancyData } from "@/types/guest";

interface OccupancyCellProps {
  cellDataArray: OccupancyData[];
  date: Date;
  accommodationId: string;
  onCellClick: (reservationId: string, cellDataArray: OccupancyData[]) => void;
}

const getReservationStyle = (status: string, isCheckout: boolean = false) => {
  const baseStyles = {
    confirmed: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
    pending: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
    checked_in: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
  }[status] || "bg-gray-100 dark:bg-gray-800";

  if (isCheckout) {
    return `${baseStyles} opacity-60`;
  }
  return baseStyles;
};

export const OccupancyCell = React.memo(({ 
  cellDataArray, 
  date, 
  accommodationId,
  onCellClick 
}: OccupancyCellProps) => {
  const hasReservation = cellDataArray.some(c => c.reservation_id);
  const isBlocked = cellDataArray.some(c => c.is_blocked && !c.reservation_id);
  
  if (!hasReservation && !isBlocked) {
    return (
      <div className="w-32 flex-shrink-0 border-l transition-colors min-h-[72px] bg-background hover:bg-muted/50" />
    );
  }

  if (isBlocked) {
    return (
      <div className="w-32 flex-shrink-0 border-l min-h-[72px] bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
        <div className="flex items-center justify-center h-full">
          <span className="text-xs text-muted-foreground">Bloqueada</span>
        </div>
      </div>
    );
  }

  // Separate checkout and checkin events
  const dateStr = format(date, "yyyy-MM-dd");
  const checkoutReservations = cellDataArray.filter(c => 
    c.reservation_id && c.check_out_date === dateStr
  );
  const checkinReservations = cellDataArray.filter(c => 
    c.reservation_id && c.check_in_date === dateStr
  );
  const occupiedReservations = cellDataArray.filter(c => 
    c.reservation_id && c.check_in_date !== dateStr && c.check_out_date !== dateStr
  );

  return (
    <div className="w-32 flex-shrink-0 border-l min-h-[72px]">
      <div className="flex flex-col h-full">
        {/* Checkout cell - top half */}
        {checkoutReservations.map((cellData, idx) => (
          <div
            key={`checkout-${cellData.reservation_id}-${idx}`}
            className={cn(
              "flex-1 p-1.5 cursor-pointer hover:opacity-80 transition-opacity border-b border-border/30",
              "rounded-t-md",
              getReservationStyle(cellData.reservation_status || '', true)
            )}
            title={`Check-out: ${cellData.guest_first_name ? `${cellData.guest_first_name} ${cellData.guest_last_name || ""}` : cellData.guest_name || ""}`}
            onClick={() => onCellClick(cellData.reservation_id!, cellDataArray)}
          >
            <div className="flex items-center gap-1">
              <LogOut className="h-3 w-3 text-muted-foreground" />
              {cellData.guest_first_name && (
                <div className="text-xs truncate font-medium flex-1">
                  {cellData.guest_first_name}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Occupied (mid-stay) cell */}
        {occupiedReservations.map((cellData, idx) => (
          <div
            key={`occupied-${cellData.reservation_id}-${idx}`}
            className={cn(
              "flex-1 p-1.5 cursor-pointer hover:opacity-80 transition-opacity",
              getReservationStyle(cellData.reservation_status || ''),
              checkoutReservations.length > 0 && checkinReservations.length > 0 && "border-y border-border/30"
            )}
            title={cellData.guest_first_name ? `${cellData.guest_first_name} ${cellData.guest_last_name || ""}` : cellData.guest_name || ""}
            onClick={() => onCellClick(cellData.reservation_id!, cellDataArray)}
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
        ))}

        {/* Checkin cell - bottom half */}
        {checkinReservations.map((cellData, idx) => (
          <div
            key={`checkin-${cellData.reservation_id}-${idx}`}
            className={cn(
              "flex-1 p-1.5 cursor-pointer hover:opacity-80 transition-opacity border-t border-border/30",
              "rounded-b-md",
              getReservationStyle(cellData.reservation_status || '')
            )}
            title={`Check-in: ${cellData.guest_first_name ? `${cellData.guest_first_name} ${cellData.guest_last_name || ""}` : cellData.guest_name || ""}`}
            onClick={() => onCellClick(cellData.reservation_id!, cellDataArray)}
          >
            <div className="flex items-center gap-1">
              <LogIn className="h-3 w-3 text-muted-foreground" />
              {cellData.guest_first_name && (
                <div className="text-xs truncate font-medium flex-1">
                  {cellData.guest_first_name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

OccupancyCell.displayName = "OccupancyCell";
