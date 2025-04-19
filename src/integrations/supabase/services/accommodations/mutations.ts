
import { supabase } from '../../client';
import { Accommodation, BlockReasonType } from '@/types';
import { accommodationMapper } from './mapper';
import { AccommodationCreate, AccommodationUpdate } from './types';
import { Database } from '@/integrations/supabase/types';

// Define the database insert type explicitly
type DbAccommodation = Database['public']['Tables']['accommodations']['Insert'];

export const createAccommodation = async (accommodation: AccommodationCreate): Promise<Accommodation | null> => {
  try {
    console.log('Creating accommodation:', accommodation);
    const dbData = accommodationMapper.toDatabase(accommodation);
    
    // Ensure required fields are present for insert operation
    if (!dbData.name || !dbData.room_number || !dbData.category || dbData.capacity === undefined || !dbData.description) {
      console.error('Missing required fields for accommodation creation:', dbData);
      return null;
    }
    
    const { data, error } = await supabase
      .from('accommodations')
      .insert(dbData as DbAccommodation)
      .select()
      .single();

    if (error) {
      console.error('Error creating accommodation:', error);
      return null;
    }

    if (!data) {
      console.error('No data returned after creating accommodation');
      return null;
    }

    console.log('Successfully created accommodation:', data);
    return accommodationMapper.fromDatabase(data);
  } catch (error) {
    console.error('Unexpected error in createAccommodation:', error);
    return null;
  }
};

export const updateAccommodation = async (id: string, updates: AccommodationUpdate): Promise<Accommodation | null> => {
  try {
    console.log('Updating accommodation:', id, updates);
    const dbUpdates = accommodationMapper.toDatabase(updates);
    
    const { data, error } = await supabase
      .from('accommodations')
      .update(dbUpdates as DbAccommodation)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating accommodation:', error);
      return null;
    }

    if (!data) {
      console.error('No data returned after updating accommodation');
      return null;
    }

    console.log('Successfully updated accommodation:', data);
    return accommodationMapper.fromDatabase(data);
  } catch (error) {
    console.error('Unexpected error in updateAccommodation:', error);
    return null;
  }
};

export const deleteAccommodation = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting accommodation:', id);
    
    // First delete any related prices
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

    console.log('Successfully deleted accommodation:', id);
    return true;
  } catch (error) {
    console.error('Unexpected error in deleteAccommodation:', error);
    return false;
  }
};

export const deleteAllAccommodations = async (): Promise<boolean> => {
  try {
    console.log('Deleting all accommodations');
    
    // First delete all prices
    const { error: pricesError } = await supabase
      .from('prices_by_people')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (pricesError) {
      console.error('Error deleting all prices:', pricesError);
      return false;
    }
    
    // Then delete all accommodations
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error deleting all accommodations:', error);
      return false;
    }

    console.log('Successfully deleted all accommodations');
    return true;
  } catch (error) {
    console.error('Unexpected error in deleteAllAccommodations:', error);
    return false;
  }
};
