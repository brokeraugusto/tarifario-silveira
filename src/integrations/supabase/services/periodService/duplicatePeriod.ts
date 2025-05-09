
import { supabase } from '../../client';
import { PricePeriod } from '@/types';

/**
 * Duplicates an existing price period with all its prices
 * The new period will have the same configuration but different dates
 */
export const duplicatePricePeriod = async (periodId: string, newName: string): Promise<PricePeriod | null> => {
  try {
    // Get the original period
    const { data: originalPeriodData, error: periodError } = await supabase
      .from('price_periods')
      .select('*')
      .eq('id', periodId)
      .single();
    
    if (periodError || !originalPeriodData) {
      console.error('Error fetching original period:', periodError);
      return null;
    }
    
    // Create new period with same data but new name
    const { data: newPeriodData, error: createError } = await supabase
      .from('price_periods')
      .insert({
        name: newName,
        start_date: originalPeriodData.start_date,
        end_date: originalPeriodData.end_date,
        is_holiday: originalPeriodData.is_holiday,
        minimum_stay: originalPeriodData.minimum_stay
      })
      .select()
      .single();
    
    if (createError || !newPeriodData) {
      console.error('Error creating duplicated period:', createError);
      return null;
    }
    
    // Get all prices associated with the original period
    const { data: pricesData, error: pricesError } = await supabase
      .from('prices_by_people')
      .select('*')
      .eq('period_id', periodId);
    
    if (pricesError) {
      console.error('Error fetching prices for original period:', pricesError);
      // Continue anyway, we already have the new period
    } else if (pricesData && pricesData.length > 0) {
      // Duplicate all prices
      const newPrices = pricesData.map(price => ({
        accommodation_id: price.accommodation_id,
        period_id: newPeriodData.id,
        people: price.people,
        price_per_night: price.price_per_night,
        includes_breakfast: price.includes_breakfast
      }));
      
      const { error: insertPricesError } = await supabase
        .from('prices_by_people')
        .insert(newPrices);
      
      if (insertPricesError) {
        console.error('Error duplicating prices:', insertPricesError);
        // Continue anyway, we already have the new period
      }
    }
    
    return {
      id: newPeriodData.id,
      name: newPeriodData.name,
      // Parse dates with proper timezone handling
      startDate: new Date(newPeriodData.start_date + 'T12:00:00Z'),
      endDate: new Date(newPeriodData.end_date + 'T12:00:00Z'),
      isHoliday: newPeriodData.is_holiday || false,
      minimumStay: newPeriodData.minimum_stay || 1
    };
    
  } catch (error) {
    console.error('Unexpected error in duplicatePricePeriod:', error);
    return null;
  }
};
