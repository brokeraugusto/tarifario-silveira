
import { supabase } from '../client';
import { PricePeriod } from '@/types';
import { isWithinInterval } from 'date-fns';

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
      startDate: new Date(period.start_date),
      endDate: new Date(period.end_date),
      isHoliday: period.is_holiday || false,
      minimumStay: period.minimum_stay || 1
    }));
  } catch (error) {
    console.error('Error in getAllPricePeriods:', error);
    return [];
  }
};

export const createPricePeriod = async (period: Omit<PricePeriod, 'id'>): Promise<PricePeriod | null> => {
  try {
    const { data, error } = await supabase
      .from('price_periods')
      .insert({
        name: period.name,
        start_date: period.startDate.toISOString().split('T')[0],
        end_date: period.endDate.toISOString().split('T')[0],
        is_holiday: period.isHoliday,
        minimum_stay: period.minimumStay
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating price period:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      isHoliday: data.is_holiday || false,
      minimumStay: data.minimum_stay || 1
    };
  } catch (error) {
    console.error('Error in createPricePeriod:', error);
    return null;
  }
};

export const updatePricePeriod = async (id: string, updates: Partial<PricePeriod>): Promise<PricePeriod | null> => {
  try {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate.toISOString().split('T')[0];
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate.toISOString().split('T')[0];
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
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      isHoliday: data.is_holiday || false,
      minimumStay: data.minimum_stay || 1
    };
  } catch (error) {
    console.error('Error in updatePricePeriod:', error);
    return null;
  }
};

export const deletePricePeriod = async (id: string): Promise<boolean> => {
  try {
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
    console.error('Error in deletePricePeriod:', error);
    return false;
  }
};

export const findPeriodForDate = async (date: Date): Promise<PricePeriod | null> => {
  try {
    const dateString = date.toISOString().split('T')[0];

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
        startDate: new Date(period.start_date),
        endDate: new Date(period.end_date),
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
        startDate: new Date(period.start_date),
        endDate: new Date(period.end_date),
        isHoliday: period.is_holiday || false,
        minimumStay: period.minimum_stay || 1
      };
    }

    return null;
  } catch (error) {
    console.error('Error in findPeriodForDate:', error);
    return null;
  }
};
