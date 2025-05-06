
import { Accommodation, BlockReasonType, CategoryType } from '@/types';
import { AccommodationMapper } from './types';
import { Database } from '@/integrations/supabase/types';

// Define the database insert type explicitly based on Supabase schema
type DbAccommodation = Database['public']['Tables']['accommodations']['Insert'];

export const accommodationMapper: AccommodationMapper = {
  toDatabase: (accommodation): Record<string, any> => {
    // Create the base object with all possible fields
    const dbObject: Record<string, any> = {
      name: accommodation.name,
      room_number: accommodation.roomNumber,
      category: accommodation.category,
      capacity: accommodation.capacity,
      description: accommodation.description,
      image_url: accommodation.imageUrl,
      images: accommodation.images,
      is_blocked: accommodation.isBlocked,
      block_reason: accommodation.blockReason,
      block_note: accommodation.blockNote
    };
    
    // Add block_period separately if it exists
    if (accommodation.blockPeriod) {
      dbObject.block_period = {
        from: accommodation.blockPeriod.from,
        to: accommodation.blockPeriod.to
      };
    }
    
    // Filter out undefined values to avoid setting null for optional fields during updates
    return Object.fromEntries(
      Object.entries(dbObject).filter(([_, value]) => value !== undefined)
    );
  },

  fromDatabase: (data): Accommodation => ({
    id: data.id,
    name: data.name,
    roomNumber: data.room_number,
    category: data.category as CategoryType,
    capacity: data.capacity,
    description: data.description,
    imageUrl: data.image_url || '',
    images: data.images || [],
    isBlocked: data.is_blocked || false,
    blockReason: data.block_reason as BlockReasonType | undefined,
    blockNote: data.block_note,
    blockPeriod: data.block_period,
    albumUrl: data.album_url
  })
};
