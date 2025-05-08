
import { Accommodation } from "@/types";
import { AccommodationCreate, AccommodationUpdate, AccommodationMapper } from "./types";

// Convert accommodation object to database format
const toDatabase = (
  accommodation: AccommodationCreate | AccommodationUpdate
): Record<string, any> => {
  const result: Record<string, any> = {
    ...(accommodation.name !== undefined && { name: accommodation.name }),
    ...(accommodation.roomNumber !== undefined && { room_number: accommodation.roomNumber }),
    ...(accommodation.category !== undefined && { category: accommodation.category }),
    ...(accommodation.capacity !== undefined && { capacity: accommodation.capacity }),
    ...(accommodation.description !== undefined && { description: accommodation.description }),
    ...(accommodation.imageUrl !== undefined && { image_url: accommodation.imageUrl }),
    ...(accommodation.images !== undefined && { images: accommodation.images }),
    ...(accommodation.albumUrl !== undefined && { album_url: accommodation.albumUrl }),
    ...(accommodation.isBlocked !== undefined && { is_blocked: accommodation.isBlocked }),
    ...(accommodation.blockReason !== undefined && { block_reason: accommodation.blockReason }),
    ...(accommodation.blockNote !== undefined && { block_note: accommodation.blockNote }),
    ...(accommodation.blockPeriod !== undefined && { block_period: accommodation.blockPeriod }),
  };

  return result;
};

// Convert database object to accommodation format
const fromDatabase = (data: Record<string, any>): Accommodation => {
  // Parse dates if they exist
  let blockPeriod = undefined;
  
  if (data.block_period) {
    try {
      // Se já é um objeto, converter as datas para objetos Date
      if (typeof data.block_period === 'object') {
        blockPeriod = {
          from: new Date(data.block_period.from),
          to: new Date(data.block_period.to)
        };
      } else {
        // Se for uma string JSON, parsear primeiro
        const parsed = typeof data.block_period === 'string' 
          ? JSON.parse(data.block_period)
          : data.block_period;
        
        blockPeriod = {
          from: new Date(parsed.from),
          to: new Date(parsed.to)
        };
      }
    } catch (error) {
      console.error('Erro ao converter block_period:', error);
      blockPeriod = undefined;
    }
  }
  
  return {
    id: data.id,
    name: data.name,
    roomNumber: data.room_number,
    category: data.category,
    capacity: data.capacity,
    description: data.description,
    imageUrl: data.image_url || '/placeholder.svg',
    images: data.images || [],
    albumUrl: data.album_url,
    isBlocked: data.is_blocked || false,
    blockReason: data.block_reason,
    blockNote: data.block_note,
    blockPeriod: blockPeriod,
  };
};

export const accommodationMapper: AccommodationMapper = {
  toDatabase,
  fromDatabase,
};
