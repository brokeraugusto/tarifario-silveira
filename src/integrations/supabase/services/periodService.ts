
import { supabase } from '../client';
import { PricePeriod } from '@/types';

/**
 * Helper function to ensure consistent date handling
 * Uses noon UTC to avoid timezone issues
 */
const toISODateString = (date: Date): string => {
  // Ensure we're working with a fresh date object
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create a new date at noon UTC
  const utcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
  
  // Return only the date part (YYYY-MM-DD)
  return utcDate.toISOString().split('T')[0];
};

/**
 * Fetches all price periods from the database
 */
export const getAllPricePeriods = async (): Promise<PricePeriod[]> => {
  try {
    const { data, error } = await supabase
      .from('price_periods')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching price periods:', error);
      return [];
    }
    
    return data.map(period => ({
      id: period.id,
      name: period.name,
      // Parse dates correctly with proper timezone handling
      startDate: new Date(period.start_date + 'T12:00:00Z'),
      endDate: new Date(period.end_date + 'T12:00:00Z'),
      isHoliday: period.is_holiday || false,
      minimumStay: period.minimum_stay || 1
    }));
  } catch (error) {
    console.error('Unexpected error in getAllPricePeriods:', error);
    return [];
  }
};

/**
 * Creates a new price period in the database
 */
export const createPricePeriod = async (period: Omit<PricePeriod, 'id'>): Promise<PricePeriod | null> => {
  try {
    console.log('Creating price period:', period);
    
    // Use our helper function to ensure consistent date strings
    const startDateStr = toISODateString(period.startDate);
    const endDateStr = toISODateString(period.endDate);
    
    console.log(`Using start_date: ${startDateStr}, end_date: ${endDateStr}`);
    
    const { data, error } = await supabase
      .from('price_periods')
      .insert({
        name: period.name,
        start_date: startDateStr,
        end_date: endDateStr,
        is_holiday: period.isHoliday,
        minimum_stay: period.minimumStay
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating price period:', error);
      return null;
    }
    
    if (!data) {
      console.error('No data returned after creating price period');
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      // Parse dates with proper timezone handling
      startDate: new Date(data.start_date + 'T12:00:00Z'),
      endDate: new Date(data.end_date + 'T12:00:00Z'),
      isHoliday: data.is_holiday || false,
      minimumStay: data.minimum_stay || 1
    };
  } catch (error) {
    console.error('Unexpected error in createPricePeriod:', error);
    return null;
  }
};

/**
 * Updates an existing price period in the database
 */
export const updatePricePeriod = async (id: string, updates: Partial<PricePeriod>): Promise<PricePeriod | null> => {
  try {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.startDate !== undefined) dbUpdates.start_date = toISODateString(updates.startDate);
    if (updates.endDate !== undefined) dbUpdates.end_date = toISODateString(updates.endDate);
    if (updates.isHoliday !== undefined) dbUpdates.is_holiday = updates.isHoliday;
    if (updates.minimumStay !== undefined) dbUpdates.minimum_stay = updates.minimumStay;
    
    const { data, error } = await supabase
      .from('price_periods')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating price period:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      // Parse dates with proper timezone handling
      startDate: new Date(data.start_date + 'T12:00:00Z'),
      endDate: new Date(data.end_date + 'T12:00:00Z'),
      isHoliday: data.is_holiday || false,
      minimumStay: data.minimum_stay || 1
    };
  } catch (error) {
    console.error('Unexpected error in updatePricePeriod:', error);
    return null;
  }
};

/**
 * Deletes a price period and its associated prices from the database
 */
export const deletePricePeriod = async (id: string): Promise<boolean> => {
  try {
    // First delete all related prices to prevent foreign key constraint issues
    const { error: pricesError } = await supabase
      .from('prices_by_people')
      .delete()
      .eq('period_id', id);

    if (pricesError) {
      console.error('Error deleting related prices:', pricesError);
      return false;
    }

    // Then delete the period
    const { error } = await supabase
      .from('price_periods')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting price period:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deletePricePeriod:', error);
    return false;
  }
};

/**
 * Finds a price period for a specific date
 */
export const findPeriodForDate = async (date: Date): Promise<PricePeriod | null> => {
  try {
    const dateString = toISODateString(date);

    // First check holiday periods
    const { data: holidayPeriods, error: holidayError } = await supabase
      .from('price_periods')
      .select('*')
      .eq('is_holiday', true)
      .lte('start_date', dateString)
      .gte('end_date', dateString);

    if (holidayError) {
      console.error('Error fetching holiday periods:', holidayError);
      return null;
    }

    if (holidayPeriods && holidayPeriods.length > 0) {
      const period = holidayPeriods[0];
      return {
        id: period.id,
        name: period.name,
        // Parse dates with proper timezone handling
        startDate: new Date(period.start_date + 'T12:00:00Z'),
        endDate: new Date(period.end_date + 'T12:00:00Z'),
        isHoliday: period.is_holiday || false,
        minimumStay: period.minimum_stay || 1
      };
    }

    // Then check regular periods
    const { data: regularPeriods, error: regularError } = await supabase
      .from('price_periods')
      .select('*')
      .eq('is_holiday', false)
      .lte('start_date', dateString)
      .gte('end_date', dateString);

    if (regularError) {
      console.error('Error fetching regular periods:', regularError);
      return null;
    }

    if (regularPeriods && regularPeriods.length > 0) {
      const period = regularPeriods[0];
      return {
        id: period.id,
        name: period.name,
        // Parse dates with proper timezone handling
        startDate: new Date(period.start_date + 'T12:00:00Z'),
        endDate: new Date(period.end_date + 'T12:00:00Z'),
        isHoliday: period.is_holiday || false,
        minimumStay: period.minimum_stay || 1
      };
    }

    return null;
  } catch (error) {
    console.error('Unexpected error in findPeriodForDate:', error);
    return null;
  }
};

/**
 * Deletes all price periods from the database
 */
export const deleteAllPricePeriods = async (): Promise<boolean> => {
  try {
    // We don't delete prices here because that's handled by the price service's deleteAllPrices method
    
    // Delete all periods
    const { error } = await supabase
      .from('price_periods')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error deleting all price periods:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deleteAllPricePeriods:', error);
    return false;
  }
};

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
