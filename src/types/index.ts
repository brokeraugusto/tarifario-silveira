
export type CategoryType = 'Standard' | 'Luxo' | 'Super Luxo' | 'Master';
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
  blockPeriod?: {
    from: Date;
    to: Date;
  };
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
  includesBreakfast?: boolean;
}

export interface SearchResult {
  accommodation: Accommodation;
  pricePerNight: number;
  totalPrice: number | null;
  nights: number | null;
  isMinStayViolation?: boolean;
  minimumStay?: number;
  includesBreakfast: boolean;
  pixPrice?: number;
  cardPrice?: number;
  pixTotalPrice?: number | null;
  cardTotalPrice?: number | null;
  hasMultiplePeriods?: boolean;
  overlappingPeriodsCount?: number;
}

// Re-export maintenance types for consistency
export type UserRole = 'master' | 'reception' | 'maintenance' | 'cleaning' | 'admin';
export type AreaType = 'accommodation' | 'common' | 'maintenance' | 'restaurant' | 'recreation';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ModulePermission {
  id: string;
  role: UserRole;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
}

export interface Area {
  id: string;
  name: string;
  code: string;
  area_type: AreaType;
  description?: string;
  location?: string;
  is_active: boolean;
  accommodation_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceOrder {
  id: string;
  order_number: string;
  area_id: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  requested_by: string;
  assigned_to?: string;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  area?: Area;
}

// Reservation types
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer';

export interface Reservation {
  id: string;
  accommodation_id: string;
  guest_id?: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  status: ReservationStatus;
  payment_method: PaymentMethod;
  total_price: number;
  includes_breakfast: boolean;
  notes?: string;
  google_event_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  accommodation?: Accommodation;
}

export interface CreateReservationData {
  accommodation_id: string;
  guest_id?: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  payment_method: PaymentMethod;
  total_price: number;
  includes_breakfast: boolean;
  notes?: string;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    date: string;
  };
  end: {
    date: string;
  };
  extendedProperties?: {
    private?: {
      reservation_id?: string;
      accommodation_id?: string;
    };
  };
}

// Re-export copy configuration types
export * from './copyConfig';
export * from './guest';
