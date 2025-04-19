
import { supabase } from '../../client';
import { Accommodation, BlockReasonType } from '@/types';
import { accommodationMapper } from './mapper';
import { AccommodationCreate, AccommodationUpdate } from './types';
import { Database } from '@/integrations/supabase/types';

// Define the database insert type explicitly
type DbAccommodation = Database['public']['Tables']['accommodations']['Insert'];

export const createAccommodation = async (accommodation: AccommodationCreate): Promise<Accommodation | null> => {
  try {
    const dbData = accommodationMapper.toDatabase(accommodation);
    
    // Ensure required fields are present for insert operation
    if (!dbData.name || !dbData.room_number || !dbData.category || dbData.capacity === undefined || !dbData.description) {
      console.error('Missing required fields for accommodation creation');
      return null;
    }
    
    const { data, error } = await supabase
      .from('accommodations')
      .insert(dbData as DbAccommodation)
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating accommodation:', error);
      return null;
    }

    return accommodationMapper.fromDatabase(data);
  } catch (error) {
    console.error('Unexpected error in createAccommodation:', error);
    return null;
  }
};

export const updateAccommodation = async (id: string, updates: AccommodationUpdate): Promise<Accommodation | null> => {
  try {
    const dbUpdates = accommodationMapper.toDatabase(updates);
    
    const { data, error } = await supabase
      .from('accommodations')
      .update(dbUpdates as DbAccommodation)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating accommodation:', error);
      return null;
    }

    return accommodationMapper.fromDatabase(data);
  } catch (error) {
    console.error('Unexpected error in updateAccommodation:', error);
    return null;
  }
};

export const deleteAccommodation = async (id: string): Promise<boolean> => {
  try {
    const { error: pricesError } = await supabase
      .from('prices_by_people')
      .delete()
      .eq('accommodation_id', id);

    if (pricesError) {
      console.error('Error deleting related prices:', pricesError);
      return false;
    }
    
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

export const deleteAllAccommodations = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

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
