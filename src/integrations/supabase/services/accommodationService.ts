
import { supabase } from '../client';
import { Accommodation, BlockReasonType, CategoryType } from '@/types';

/**
 * Fetches all accommodations from the database
 */
export const getAllAccommodations = async (): Promise<Accommodation[]> => {
  try {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .order('name');

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
  } catch (error) {
    console.error('Unexpected error in getAllAccommodations:', error);
    return [];
  }
};

/**
 * Fetches a single accommodation by ID
 */
export const getAccommodationById = async (id: string): Promise<Accommodation | null> => {
  try {
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
  } catch (error) {
    console.error('Unexpected error in getAccommodationById:', error);
    return null;
  }
};

/**
 * Creates a new accommodation in the database
 */
export const createAccommodation = async (accommodation: Omit<Accommodation, 'id'>): Promise<Accommodation | null> => {
  try {
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
  } catch (error) {
    console.error('Unexpected error in createAccommodation:', error);
    return null;
  }
};

/**
 * Updates an existing accommodation in the database
 */
export const updateAccommodation = async (id: string, updates: Partial<Accommodation>): Promise<Accommodation | null> => {
  try {
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
  } catch (error) {
    console.error('Unexpected error in updateAccommodation:', error);
    return null;
  }
};

/**
 * Deletes an accommodation and its related prices from the database
 */
export const deleteAccommodation = async (id: string): Promise<boolean> => {
  try {
    // First delete all related prices to prevent foreign key constraint issues
    const { error: pricesError } = await supabase
      .from('prices_by_people')
      .delete()
      .eq('accommodation_id', id);

    if (pricesError) {
      console.error('Error deleting related prices:', pricesError);
      return false;
    }
    
    // Then delete the accommodation
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting accommodation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deleteAccommodation:', error);
    return false;
  }
};

/**
 * Blocks an accommodation with a specific reason
 */
export const blockAccommodation = async (id: string, reason: BlockReasonType, note?: string): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: true, 
    blockReason: reason, 
    blockNote: note 
  });
};

/**
 * Unblocks an accommodation
 */
export const unblockAccommodation = async (id: string): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: false, 
    blockReason: undefined, 
    blockNote: undefined 
  });
};

/**
 * Updates multiple accommodations at once
 */
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

/**
 * Fetches accommodations by category
 */
export const getAccommodationsByCategory = async (category: CategoryType): Promise<Accommodation[]> => {
  try {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('category', category)
      .order('name');

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
  } catch (error) {
    console.error('Unexpected error in getAccommodationsByCategory:', error);
    return [];
  }
};

/**
 * Deletes all accommodations and their related prices from the database
 */
export const deleteAllAccommodations = async (): Promise<boolean> => {
  try {
    // We can't delete all prices here since this would also delete prices related to periods
    // The period service or price service will handle deleting all prices

    // Delete all accommodations
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error deleting all accommodations:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deleteAllAccommodations:', error);
    return false;
  }
};
