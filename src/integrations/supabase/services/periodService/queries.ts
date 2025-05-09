
import { supabase } from '../../client';
import { PricePeriod } from '@/types';
import { toISODateString } from './dateUtils';

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
