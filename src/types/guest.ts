export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  document_number: string | null;
  document_type: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip_code: string | null;
  address_country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  preferences: any;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateGuestData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_number?: string;
  document_type?: string;
  date_of_birth?: string;
  nationality?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  address_country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferences?: Record<string, any>;
  notes?: string;
}

export interface OccupancyData {
  accommodation_id: string;
  accommodation_name: string;
  room_number: string;
  category: string;
  capacity: number;
  is_blocked: boolean;
  block_reason?: string;
  date_value: string;
  reservation_id?: string;
  reservation_status?: string;
  guest_name?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  number_of_guests?: number;
}

export interface ExternalBookingConfig {
  id: string;
  platform: 'booking' | 'airbnb' | 'expedia' | 'vrbo' | 'other';
  api_key?: string;
  property_id?: string;
  webhook_url?: string;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync_at?: string;
  settings?: Record<string, any>;
}
