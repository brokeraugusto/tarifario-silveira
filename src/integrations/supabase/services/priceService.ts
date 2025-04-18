
import { supabase } from '../client';
import { PriceByPeople, PriceOption, CategoryType } from '@/types';

export const getPricesForAccommodation = async (accommodationId: string): Promise<PriceByPeople[]> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_people')
      .select('*')
      .eq('accommodation_id', accommodationId);
    
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
    console.error('Error in getPricesForAccommodation:', error);
    return [];
  }
};

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
    console.error('Error in createPrice:', error);
    return null;
  }
};

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
    console.error('Error in updatePrice:', error);
    return null;
  }
};

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
    console.error('Error in deletePrice:', error);
    return false;
  }
};

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
      return true;
    }
    
    for (const accommodation of accommodationsData) {
      const maxPeopleForAccommodation = accommodation.capacity;
      
      for (const option of priceOptions.filter(opt => opt.people <= maxPeopleForAccommodation)) {
        // Check existing prices with breakfast
        const { data: existingPricesWithBreakfast, error: errorWithBreakfast } = await supabase
          .from('prices_by_people')
          .select('*')
          .eq('accommodation_id', accommodation.id)
          .eq('period_id', periodId)
          .eq('people', option.people)
          .eq('includes_breakfast', true);
          
        if (errorWithBreakfast) {
          console.error('Error checking existing prices with breakfast:', errorWithBreakfast);
          continue;
        }
        
        // Check existing prices without breakfast
        const { data: existingPricesWithoutBreakfast, error: errorWithoutBreakfast } = await supabase
          .from('prices_by_people')
          .select('*')
          .eq('accommodation_id', accommodation.id)
          .eq('period_id', periodId)
          .eq('people', option.people)
          .eq('includes_breakfast', false);
          
        if (errorWithoutBreakfast) {
          console.error('Error checking existing prices without breakfast:', errorWithoutBreakfast);
          continue;
        }
        
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
              accommodation_id: accommodation.id,
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
              accommodation_id: accommodation.id,
              period_id: periodId,
              people: option.people,
              price_per_night: option.withoutBreakfast,
              includes_breakfast: false
            });
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updatePricesByCategory:', error);
    return false;
  }
};
