
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
    
    // Create corresponding area for the accommodation
    const { error: areaError } = await supabase
      .from('areas')
      .insert({
        name: data.name,
        code: data.room_number,
        area_type: 'accommodation',
        accommodation_id: data.id,
        description: `Área da acomodação ${data.name}`,
        is_active: true
      });

    if (areaError) {
      console.error('Error creating area for accommodation:', areaError);
      // Continue anyway, the accommodation was created
    }

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

    // Update corresponding area if accommodation name or room number changed
    if (updates.name || updates.roomNumber) {
      const { error: areaError } = await supabase
        .from('areas')
        .update({
          name: data.name,
          code: data.room_number,
          description: `Área da acomodação ${data.name}`
        })
        .eq('accommodation_id', id)
        .eq('area_type', 'accommodation');

      if (areaError) {
        console.error('Error updating area for accommodation:', areaError);
        // Continue anyway, the accommodation was updated
      }
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

    // Delete related areas (this will cascade to maintenance orders)
    const { error: areasError } = await supabase
      .from('areas')
      .delete()
      .eq('accommodation_id', id);

    if (areasError) {
      console.error('Error deleting related areas:', areasError);
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

/**
 * Duplicates an accommodation with all its data except for the name
 */
export const duplicateAccommodation = async (id: string, newName: string): Promise<Accommodation | null> => {
  try {
    console.log('Duplicating accommodation:', id, 'with new name:', newName);
    
    // Get the original accommodation
    const { data: originalAccommodationData, error: accommodationError } = await supabase
      .from('accommodations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (accommodationError || !originalAccommodationData) {
      console.error('Error fetching original accommodation:', accommodationError);
      return null;
    }
    
    // Create a new accommodation with the same data but a new name
    const newAccommodation = {
      ...originalAccommodationData,
      id: undefined, // Let Supabase generate new id
      name: newName
    };
    
    delete newAccommodation.id;
    delete newAccommodation.created_at;
    delete newAccommodation.updated_at;
    
    const { data: newAccommodationData, error: createError } = await supabase
      .from('accommodations')
      .insert(newAccommodation)
      .select()
      .single();
    
    if (createError || !newAccommodationData) {
      console.error('Error creating duplicated accommodation:', createError);
      return null;
    }
    
    // Create corresponding area for the new accommodation
    const { error: areaError } = await supabase
      .from('areas')
      .insert({
        name: newAccommodationData.name,
        code: newAccommodationData.room_number,
        area_type: 'accommodation',
        accommodation_id: newAccommodationData.id,
        description: `Área da acomodação ${newAccommodationData.name}`,
        is_active: true
      });

    if (areaError) {
      console.error('Error creating area for duplicated accommodation:', areaError);
      // Continue anyway, the accommodation was created
    }
    
    // Get prices associated with the original accommodation
    const { data: pricesData, error: pricesError } = await supabase
      .from('prices_by_people')
      .select('*')
      .eq('accommodation_id', id);
    
    if (pricesError) {
      console.error('Error fetching prices for original accommodation:', pricesError);
      // Continue anyway, we already have the new accommodation
    } else if (pricesData && pricesData.length > 0) {
      // Duplicate prices for the new accommodation
      const newPrices = pricesData.map(price => ({
        accommodation_id: newAccommodationData.id,
        period_id: price.period_id,
        people: price.people,
        price_per_night: price.price_per_night,
        includes_breakfast: price.includes_breakfast
      }));
      
      const { error: insertPricesError } = await supabase
        .from('prices_by_people')
        .insert(newPrices);
      
      if (insertPricesError) {
        console.error('Error duplicating prices:', insertPricesError);
        // Continue anyway, we already have the new accommodation
      }
    }
    
    console.log('Successfully duplicated accommodation:', newAccommodationData);
    return accommodationMapper.fromDatabase(newAccommodationData);
  } catch (error) {
    console.error('Unexpected error in duplicateAccommodation:', error);
    return null;
  }
};
