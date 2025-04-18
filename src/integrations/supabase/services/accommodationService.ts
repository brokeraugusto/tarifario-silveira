
import { supabase } from '../client';
import { Accommodation, BlockReasonType, CategoryType } from '@/types';

// Function to fetch all accommodations
export const getAllAccommodations = async (): Promise<Accommodation[]> => {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*');

  if (error) {
    console.error('Error fetching accommodations:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    roomNumber: item.room_number,
    category: item.category as CategoryType,
    capacity: item.capacity,
    description: item.description,
    imageUrl: item.image_url || '',
    images: item.images || [],
    isBlocked: item.is_blocked || false,
    blockReason: item.block_reason as BlockReasonType | undefined,
    blockNote: item.block_note
  }));
};

export const getAccommodationById = async (id: string): Promise<Accommodation | null> => {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching accommodation:', error);
    return null;
  }

  return {
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
  };
};

export const createAccommodation = async (accommodation: Omit<Accommodation, 'id'>): Promise<Accommodation | null> => {
  const { data, error } = await supabase
    .from('accommodations')
    .insert({
      name: accommodation.name,
      room_number: accommodation.roomNumber,
      category: accommodation.category,
      capacity: accommodation.capacity,
      description: accommodation.description,
      image_url: accommodation.imageUrl,
      images: accommodation.images || [],
      is_blocked: accommodation.isBlocked || false,
      block_reason: accommodation.blockReason,
      block_note: accommodation.blockNote
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating accommodation:', error);
    return null;
  }

  return {
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
  };
};

export const updateAccommodation = async (id: string, updates: Partial<Accommodation>): Promise<Accommodation | null> => {
  const dbUpdates: any = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.roomNumber !== undefined) dbUpdates.room_number = updates.roomNumber;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.images !== undefined) dbUpdates.images = updates.images;
  if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;
  if (updates.blockReason !== undefined) dbUpdates.block_reason = updates.blockReason;
  if (updates.blockNote !== undefined) dbUpdates.block_note = updates.blockNote;

  const { data, error } = await supabase
    .from('accommodations')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating accommodation:', error);
    return null;
  }

  return {
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
  };
};

export const deleteAccommodation = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('accommodations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting accommodation:', error);
    return false;
  }

  return true;
};

export const blockAccommodation = async (id: string, reason: BlockReasonType, note?: string): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: true, 
    blockReason: reason, 
    blockNote: note 
  });
};

export const unblockAccommodation = async (id: string): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: false, 
    blockReason: undefined, 
    blockNote: undefined 
  });
};

export const bulkUpdateAccommodations = async (ids: string[], updates: Partial<Accommodation>): Promise<Accommodation[]> => {
  const updatedAccommodations: Accommodation[] = [];
  
  for (const id of ids) {
    const updated = await updateAccommodation(id, updates);
    if (updated) {
      updatedAccommodations.push(updated);
    }
  }
  
  return updatedAccommodations;
};

export const getAccommodationsByCategory = async (category: CategoryType): Promise<Accommodation[]> => {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('category', category);

  if (error) {
    console.error('Error fetching accommodations by category:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    roomNumber: item.room_number,
    category: item.category as CategoryType,
    capacity: item.capacity,
    description: item.description,
    imageUrl: item.image_url || '',
    images: item.images || [],
    isBlocked: item.is_blocked || false,
    blockReason: item.block_reason as BlockReasonType | undefined,
    blockNote: item.block_note
  }));
};
