
import { supabase } from '../client';
import { CategoryType } from '@/types';

export interface CategoryPriceEntry {
  id: string;
  category: CategoryType;
  numberOfPeople: number;
  paymentMethod: 'pix' | 'credit_card';
  periodId: string;
  pricePerNight: number;
  minNights: number;
}

export interface CategoryPriceCreate {
  category: CategoryType;
  numberOfPeople: number;
  paymentMethod: 'pix' | 'credit_card';
  periodId: string;
  pricePerNight: number;
  minNights?: number;
}

export const getCategoryPrices = async (periodId?: string): Promise<CategoryPriceEntry[]> => {
  try {
    let query = supabase
      .from('prices_by_category_and_people')
      .select('*')
      .order('category, number_of_people, payment_method');

    if (periodId) {
      query = query.eq('period_id', periodId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching category prices:', error);
      throw error;
    }

    return (data || []).map(mapFromDatabase);
  } catch (error) {
    console.error('Error in getCategoryPrices:', error);
    throw error;
  }
};

export const getCompatiblePrices = async (
  category: CategoryType,
  capacity: number,
  periodId: string,
  guests: number
): Promise<CategoryPriceEntry[]> => {
  try {
    const { data, error } = await supabase.rpc('get_compatible_prices', {
      p_category: category,
      p_capacity: capacity,
      p_period_id: periodId,
      p_guests: guests
    });

    if (error) {
      console.error('Error fetching compatible prices:', error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      category: item.category as CategoryType,
      numberOfPeople: item.number_of_people,
      paymentMethod: item.payment_method as 'pix' | 'credit_card',
      periodId: item.period_id,
      pricePerNight: Number(item.price_per_night),
      minNights: item.min_nights || 1
    }));
  } catch (error) {
    console.error('Error in getCompatiblePrices:', error);
    throw error;
  }
};

export const createCategoryPrice = async (priceData: CategoryPriceCreate): Promise<CategoryPriceEntry> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_category_and_people')
      .insert({
        category: priceData.category,
        number_of_people: priceData.numberOfPeople,
        payment_method: priceData.paymentMethod,
        period_id: priceData.periodId,
        price_per_night: priceData.pricePerNight,
        min_nights: priceData.minNights || 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category price:', error);
      throw error;
    }

    return mapFromDatabase(data);
  } catch (error) {
    console.error('Error in createCategoryPrice:', error);
    throw error;
  }
};

export const updateCategoryPrice = async (
  id: string,
  priceData: Partial<CategoryPriceCreate>
): Promise<CategoryPriceEntry> => {
  try {
    const updateData: any = {};
    
    if (priceData.category) updateData.category = priceData.category;
    if (priceData.numberOfPeople) updateData.number_of_people = priceData.numberOfPeople;
    if (priceData.paymentMethod) updateData.payment_method = priceData.paymentMethod;
    if (priceData.periodId) updateData.period_id = priceData.periodId;
    if (priceData.pricePerNight) updateData.price_per_night = priceData.pricePerNight;
    if (priceData.minNights !== undefined) updateData.min_nights = priceData.minNights;

    const { data, error } = await supabase
      .from('prices_by_category_and_people')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category price:', error);
      throw error;
    }

    return mapFromDatabase(data);
  } catch (error) {
    console.error('Error in updateCategoryPrice:', error);
    throw error;
  }
};

export const deleteCategoryPrice = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('prices_by_category_and_people')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category price:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCategoryPrice:', error);
    throw error;
  }
};

export const getCategoryPricesByPeriod = async (periodId: string): Promise<CategoryPriceEntry[]> => {
  return getCategoryPrices(periodId);
};

// Helper function to map database records to our interface
const mapFromDatabase = (data: any): CategoryPriceEntry => ({
  id: data.id,
  category: data.category as CategoryType,
  numberOfPeople: data.number_of_people,
  paymentMethod: data.payment_method as 'pix' | 'credit_card',
  periodId: data.period_id,
  pricePerNight: Number(data.price_per_night),
  minNights: data.min_nights || 1
});
