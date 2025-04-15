
export type CategoryType = 'Standard' | 'Luxo' | 'Super Luxo';

export interface Accommodation {
  id: string;
  name: string;
  roomNumber: string;
  category: CategoryType;
  capacity: number;
  description: string;
  imageUrl: string;
}

export interface PricePeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isHoliday: boolean;
  minimumStay: number;
}

export interface PriceByPeople {
  id: string;
  accommodationId: string;
  periodId: string;
  people: number;
  pricePerNight: number;
}

export interface SearchParams {
  checkIn: Date;
  checkOut?: Date | null;
  guests: number;
}

export interface SearchResult {
  accommodation: Accommodation;
  pricePerNight: number;
  totalPrice: number | null;
  nights: number | null;
  isMinStayViolation: boolean;
  minimumStay?: number; // Added for display purposes
}
