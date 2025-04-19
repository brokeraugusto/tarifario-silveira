
import { supabase } from '../client';
import { PriceByPeople, PriceOption, CategoryType } from '@/types';

/**
 * Fetches all prices for a specific accommodation
 */
export const getPricesForAccommodation = async (accommodationId: string): Promise<PriceByPeople[]> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_people')
      .select('*')
      .eq('accommodation_id', accommodationId)
      .order('people');
    
    if (error) {
      console.error('Error fetching prices for accommodation:', error);
      return [];
    }
    
    return data.map(price => ({
      id: price.id,
      accommodationId: price.accommodation_id || '',
      periodId: price.period_id || '',
      people: price.people,
      pricePerNight: Number(price.price_per_night),
      includesBreakfast: price.includes_breakfast || false
    }));
  } catch (error) {
    console.error('Unexpected error in getPricesForAccommodation:', error);
    return [];
  }
};

/**
 * Creates a new price in the database
 */
export const createPrice = async (price: Omit<PriceByPeople, 'id'>): Promise<PriceByPeople | null> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_people')
      .insert({
        accommodation_id: price.accommodationId,
        period_id: price.periodId,
        people: price.people,
        price_per_night: price.pricePerNight,
        includes_breakfast: price.includesBreakfast
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating price:', error);
      return null;
    }

    return {
      id: data.id,
      accommodationId: data.accommodation_id || '',
      periodId: data.period_id || '',
      people: data.people,
      pricePerNight: Number(data.price_per_night),
      includesBreakfast: data.includes_breakfast || false
    };
  } catch (error) {
    console.error('Unexpected error in createPrice:', error);
    return null;
  }
};

/**
 * Updates an existing price in the database
 */
export const updatePrice = async (id: string, updates: Partial<PriceByPeople>): Promise<PriceByPeople | null> => {
  try {
    const dbUpdates: any = {};
    
    if (updates.accommodationId !== undefined) dbUpdates.accommodation_id = updates.accommodationId;
    if (updates.periodId !== undefined) dbUpdates.period_id = updates.periodId;
    if (updates.people !== undefined) dbUpdates.people = updates.people;
    if (updates.pricePerNight !== undefined) dbUpdates.price_per_night = updates.pricePerNight;
    if (updates.includesBreakfast !== undefined) dbUpdates.includes_breakfast = updates.includesBreakfast;
    
    const { data, error } = await supabase
      .from('prices_by_people')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating price:', error);
      return null;
    }

    return {
      id: data.id,
      accommodationId: data.accommodation_id || '',
      periodId: data.period_id || '',
      people: data.people,
      pricePerNight: Number(data.price_per_night),
      includesBreakfast: data.includes_breakfast || false
    };
  } catch (error) {
    console.error('Unexpected error in updatePrice:', error);
    return null;
  }
};

/**
 * Deletes a price from the database
 */
export const deletePrice = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prices_by_people')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting price:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deletePrice:', error);
    return false;
  }
};

/**
 * Updates prices for a category of accommodations
 */
export const updatePricesByCategory = async (
  category: CategoryType,
  periodId: string,
  priceOptions: PriceOption[],
  excludedAccommodationIds: string[] = []
): Promise<boolean> => {
  try {
    // Get all accommodations of the category not in excluded list
    const { data: accommodationsData, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('*')
      .eq('category', category)
      .not('id', 'in', excludedAccommodationIds.length > 0 ? `(${excludedAccommodationIds.join(',')})` : '()');
    
    if (accommodationsError) {
      console.error('Error fetching accommodations for category:', accommodationsError);
      return false;
    }
    
    if (!accommodationsData || accommodationsData.length === 0) {
      // No accommodations to update
      return true;
    }
    
    // Update prices for each accommodation
    for (const accommodation of accommodationsData) {
      const maxPeopleForAccommodation = accommodation.capacity;
      
      // Only update prices for options that don't exceed accommodation capacity
      for (const option of priceOptions.filter(opt => opt.people <= maxPeopleForAccommodation)) {
        await updateOrCreatePrice(accommodation.id, periodId, option);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in updatePricesByCategory:', error);
    return false;
  }
};

/**
 * Helper function to update or create prices for an accommodation
 */
const updateOrCreatePrice = async (
  accommodationId: string,
  periodId: string,
  option: PriceOption
): Promise<void> => {
  try {
    // Check existing prices with breakfast
    const { data: existingPricesWithBreakfast } = await supabase
      .from('prices_by_people')
      .select('*')
      .eq('accommodation_id', accommodationId)
      .eq('period_id', periodId)
      .eq('people', option.people)
      .eq('includes_breakfast', true);
      
    // Check existing prices without breakfast
    const { data: existingPricesWithoutBreakfast } = await supabase
      .from('prices_by_people')
      .select('*')
      .eq('accommodation_id', accommodationId)
      .eq('period_id', periodId)
      .eq('people', option.people)
      .eq('includes_breakfast', false);
      
    // Update or create price with breakfast
    if (existingPricesWithBreakfast && existingPricesWithBreakfast.length > 0) {
      await supabase
        .from('prices_by_people')
        .update({ price_per_night: option.withBreakfast })
        .eq('id', existingPricesWithBreakfast[0].id);
    } else {
      await supabase
        .from('prices_by_people')
        .insert({
          accommodation_id: accommodationId,
          period_id: periodId,
          people: option.people,
          price_per_night: option.withBreakfast,
          includes_breakfast: true
        });
    }
    
    // Update or create price without breakfast
    if (existingPricesWithoutBreakfast && existingPricesWithoutBreakfast.length > 0) {
      await supabase
        .from('prices_by_people')
        .update({ price_per_night: option.withoutBreakfast })
        .eq('id', existingPricesWithoutBreakfast[0].id);
    } else {
      await supabase
        .from('prices_by_people')
        .insert({
          accommodation_id: accommodationId,
          period_id: periodId,
          people: option.people,
          price_per_night: option.withoutBreakfast,
          includes_breakfast: false
        });
    }
  } catch (error) {
    console.error(`Error updating prices for accommodation ${accommodationId}:`, error);
  }
};

/**
 * Deletes all prices from the database
 */
export const deleteAllPrices = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prices_by_people')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error deleting all prices:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deleteAllPrices:', error);
    return false;
  }
};
