import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchResult } from "@/types";

interface MakeReservationButtonProps {
  accommodation: SearchResult;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

export const MakeReservationButton = ({
  accommodation,
  checkIn,
  checkOut,
  guests,
}: MakeReservationButtonProps) => {
  const navigate = useNavigate();

  const handleReserve = () => {
    // Navigate to reservations page with pre-filled data
    const params = new URLSearchParams({
      accommodationId: accommodation.accommodation.id,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      guests: guests.toString(),
      price: accommodation.totalPrice?.toString() || "0",
    });
    
    navigate(`/reservations?${params.toString()}`);
  };

  return (
    <Button onClick={handleReserve} className="w-full">
      <Calendar className="h-4 w-4 mr-2" />
      Fazer Reserva
    </Button>
  );
};
