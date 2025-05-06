
export type CategoryType = 'Standard' | 'Luxo' | 'Super Luxo' | 'Master';

export interface SearchParams {
  checkIn: Date;
  checkOut: Date | null;
  guests: number;
  includesBreakfast: boolean;
}

export interface SearchResult {
  accommodation: Accommodation;
  pricePerNight: number;
  totalPrice: number | null;
  nights: number | null;
  isMinStayViolation: boolean;
  minimumStay: number | null;
  includesBreakfast: boolean;
}

export type BlockReasonType = 'maintenance' | 'reserved' | 'unavailable' | 'other';

export interface BlockPeriod {
  from: Date;
  to?: Date;
}

export interface Accommodation {
  id: string;
  name: string;
  roomNumber: string;
  category: CategoryType;
  capacity: number;
  description: string;
  imageUrl: string;
  images?: string[];
  albumUrl?: string;
  isBlocked?: boolean;
  blockReason?: BlockReasonType;
  blockNote?: string;
  blockPeriod?: BlockPeriod;
}

export interface PricePeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isHoliday: boolean;
  minimumStay?: number;
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
