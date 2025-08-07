
import { supabase } from '../../client';
import { Accommodation } from '@/types';
import { accommodationMapper } from './mapper';

export const updateAccommodation = async (
  id: string,
  updates: Partial<Accommodation>
): Promise<Accommodation | null> => {
  try {
    console.log('Updating accommodation:', id, updates);
    
    // Convert the frontend data to database format
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.roomNumber !== undefined) dbUpdates.room_number = updates.roomNumber;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.albumUrl !== undefined) dbUpdates.album_url = updates.albumUrl;
    if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;
    if (updates.blockReason !== undefined) dbUpdates.block_reason = updates.blockReason;
    if (updates.blockNote !== undefined) dbUpdates.block_note = updates.blockNote;
    if (updates.blockPeriod !== undefined) {
      dbUpdates.block_period = updates.blockPeriod ? {
        from: updates.blockPeriod.from.toISOString(),
        to: updates.blockPeriod.to.toISOString()
      } : null;
    }

    console.log('Database updates:', dbUpdates);

    const { data, error } = await supabase
      .from('accommodations')
      .update(dbUpdates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating accommodation:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No accommodation found with id:', id);
      throw new Error('Accommodation not found or you do not have permission to update it');
    }
    
    const updatedAccommodation = data[0];

    console.log('Updated accommodation data:', updatedAccommodation);
    return accommodationMapper.fromDatabase(updatedAccommodation);
  } catch (error) {
    console.error('Error in updateAccommodation:', error);
    throw error;
  }
};

export const createAccommodation = async (
  accommodation: Omit<Accommodation, 'id'>
): Promise<Accommodation | null> => {
  try {
    console.log('Creating accommodation:', accommodation);
    
    const dbData = {
      name: accommodation.name,
      room_number: accommodation.roomNumber,
      category: accommodation.category,
      capacity: accommodation.capacity,
      description: accommodation.description,
      image_url: accommodation.imageUrl,
      images: accommodation.images || [],
      album_url: accommodation.albumUrl,
      is_blocked: accommodation.isBlocked || false,
      block_reason: accommodation.blockReason,
      block_note: accommodation.blockNote,
      block_period: accommodation.blockPeriod ? {
        from: accommodation.blockPeriod.from.toISOString(),
        to: accommodation.blockPeriod.to.toISOString()
      } : null
    };

    console.log('Database data for creation:', dbData);

    const { data, error } = await supabase
      .from('accommodations')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating accommodation:', error);
      throw error;
    }

    console.log('Created accommodation data:', data);
    return accommodationMapper.fromDatabase(data);
  } catch (error) {
    console.error('Error in createAccommodation:', error);
    throw error;
  }
};

export const deleteAccommodation = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting accommodation:', id);
    
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting accommodation:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAccommodation:', error);
    throw error;
  }
};

export const deleteAllAccommodations = async (): Promise<boolean> => {
  try {
    console.log('Deleting all accommodations');
    
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.error('Error deleting all accommodations:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAllAccommodations:', error);
    throw error;
  }
};
