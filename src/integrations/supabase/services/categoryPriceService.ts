
import { supabase } from '../client';

export interface CategoryPrice {
  id: string;
  category: string;
  number_of_people: number;
  payment_method: 'pix' | 'credit_card';
  period_id: string;
  price_per_night: number;
  min_nights: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPriceData {
  category: string;
  number_of_people: number;
  payment_method: 'pix' | 'credit_card';
  period_id: string;
  price_per_night: number;
  min_nights?: number;
}

export interface UpdateCategoryPriceData {
  category?: string;
  number_of_people?: number;
  payment_method?: 'pix' | 'credit_card';
  period_id?: string;
  price_per_night?: number;
  min_nights?: number;
}

// Get all category prices
export const getAllCategoryPrices = async (): Promise<CategoryPrice[]> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_category_and_people')
      .select('*')
      .order('category')
      .order('number_of_people')
      .order('payment_method');

    if (error) {
      console.error('Error fetching category prices:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllCategoryPrices:', error);
    return [];
  }
};

// Get category prices by period
export const getCategoryPricesByPeriod = async (periodId: string): Promise<CategoryPrice[]> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_category_and_people')
      .select('*')
      .eq('period_id', periodId)
      .order('category')
      .order('number_of_people')
      .order('payment_method');

    if (error) {
      console.error('Error fetching category prices by period:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategoryPricesByPeriod:', error);
    return [];
  }
};

// Get compatible prices for accommodation
export const getCompatiblePrices = async (
  category: string,
  capacity: number,
  periodId: string,
  guests: number
): Promise<Omit<CategoryPrice, 'created_at' | 'updated_at'>[]> => {
  try {
    const { data, error } = await supabase.rpc('get_compatible_prices', {
      p_category: category,
      p_capacity: capacity,
      p_period_id: periodId,
      p_guests: guests
    });

    if (error) {
      console.error('Error fetching compatible prices:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCompatiblePrices:', error);
    return [];
  }
};

// Create category price
export const createCategoryPrice = async (priceData: CreateCategoryPriceData): Promise<CategoryPrice | null> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_category_and_people')
      .insert({
        category: priceData.category,
        number_of_people: priceData.number_of_people,
        payment_method: priceData.payment_method,
        period_id: priceData.period_id,
        price_per_night: priceData.price_per_night,
        min_nights: priceData.min_nights || 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category price:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createCategoryPrice:', error);
    return null;
  }
};

// Update category price
export const updateCategoryPrice = async (
  id: string,
  updates: UpdateCategoryPriceData
): Promise<CategoryPrice | null> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_category_and_people')
      .update({
        category: updates.category,
        number_of_people: updates.number_of_people,
        payment_method: updates.payment_method,
        period_id: updates.period_id,
        price_per_night: updates.price_per_night,
        min_nights: updates.min_nights
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category price:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCategoryPrice:', error);
    return null;
  }
};

// Delete category price
export const deleteCategoryPrice = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prices_by_category_and_people')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category price:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCategoryPrice:', error);
    return false;
  }
};

// Delete category prices by period
export const deleteCategoryPricesByPeriod = async (periodId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prices_by_category_and_people')
      .delete()
      .eq('period_id', periodId);

    if (error) {
      console.error('Error deleting category prices by period:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCategoryPricesByPeriod:', error);
    return false;
  }
};

// Bulk create category prices
export const bulkCreateCategoryPrices = async (pricesData: CreateCategoryPriceData[]): Promise<CategoryPrice[]> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_category_and_people')
      .insert(pricesData.map(price => ({
        category: price.category,
        number_of_people: price.number_of_people,
        payment_method: price.payment_method,
        period_id: price.period_id,
        price_per_night: price.price_per_night,
        min_nights: price.min_nights || 1
      })))
      .select();

    if (error) {
      console.error('Error bulk creating category prices:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in bulkCreateCategoryPrices:', error);
    return [];
  }
};
