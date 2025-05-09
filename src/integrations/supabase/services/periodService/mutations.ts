
import { supabase } from '../../client';
import { PricePeriod } from '@/types';
import { toISODateString } from './dateUtils';

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
