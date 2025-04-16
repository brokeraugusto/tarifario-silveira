export type CategoryType = 'Standard' | 'Luxo' | 'Super Luxo' | 'De Luxe';

export type BlockReasonType = 'Reforma' | 'Manutenção' | 'Locação Mensal' | 'Locação Anual' | 'Outro';

export interface Accommodation {
  id: string;
  name: string;
  roomNumber: string;
  category: CategoryType;
  capacity: number;
  description: string;
  imageUrl: string;
  images: string[];  // New field for multiple images
  isBlocked: boolean;
  blockReason?: BlockReasonType;
  blockNote?: string;
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
  includesBreakfast: boolean;  // New field for breakfast option
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

export interface PriceOption {
  people: number;
  withBreakfast: number;
  withoutBreakfast: number;
}
