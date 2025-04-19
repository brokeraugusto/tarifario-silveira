
import { Accommodation, BlockReasonType, CategoryType } from '@/types';
import { AccommodationMapper } from './types';

export const accommodationMapper: AccommodationMapper = {
  toDatabase: (accommodation) => {
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
    blockNote: data.block_note
  })
};
