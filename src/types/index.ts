
export type CategoryType = 'Standard' | 'Luxo' | 'Super Luxo' | 'De Luxe';
export type BlockReasonType = 'maintenance' | 'reserved' | 'unavailable' | 'other' | 'Reforma' | 'Manutenção' | 'Locação Mensal' | 'Locação Anual' | 'Outro';

export interface Accommodation {
  id: string;
  name: string;
  roomNumber: string;
  category: CategoryType;
  capacity: number;
  description: string;
  imageUrl: string;
  images?: string[];
  albumUrl?: string; // External album URL
  isBlocked: boolean;
  blockReason?: BlockReasonType;
  blockNote?: string;
}

export interface PricePeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  minimumStay?: number;
  isHoliday?: boolean;
}

export interface PriceByPeople {
  id: string;
  accommodationId: string;
  periodId: string;
  people: number;
  pricePerNight: number;
  includesBreakfast: boolean;
}

export interface PriceOption {
  people: number;
  withBreakfast: number; 
  withoutBreakfast: number;
}

export interface SearchParams {
  checkIn: Date;
  checkOut: Date | null;
  guests: number;
}

export interface SearchResult {
  accommodation: Accommodation;
  pricePerNight: number;
  totalPrice: number | null;
  nights: number | null;
  isMinStayViolation?: boolean;
  minimumStay?: number;
  includesBreakfast: boolean;
}
