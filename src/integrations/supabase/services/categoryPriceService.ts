
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
  minNights: number;
}

export const getCategoryPricesByPeriod = async (periodId: string): Promise<CategoryPriceEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_category_and_people')
      .select('*')
      .eq('period_id', periodId)
      .order('category', { ascending: true })
      .order('number_of_people', { ascending: true });

    if (error) {
      console.error('Error fetching category prices:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      category: item.category as CategoryType,
      numberOfPeople: item.number_of_people,
      paymentMethod: item.payment_method,
      periodId: item.period_id,
      pricePerNight: Number(item.price_per_night),
      minNights: item.min_nights || 1
    }));
  } catch (error) {
    console.error('Error in getCategoryPricesByPeriod:', error);
    return [];
  }
};

export const createCategoryPrice = async (data: CategoryPriceCreate): Promise<CategoryPriceEntry | null> => {
  try {
    const { data: result, error } = await supabase
      .from('prices_by_category_and_people')
      .insert({
        category: data.category,
        number_of_people: data.numberOfPeople,
        payment_method: data.paymentMethod,
        period_id: data.periodId,
        price_per_night: data.pricePerNight,
        min_nights: data.minNights
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category price:', error);
      return null;
    }

    return {
      id: result.id,
      category: result.category as CategoryType,
      numberOfPeople: result.number_of_people,
      paymentMethod: result.payment_method,
      periodId: result.period_id,
      pricePerNight: Number(result.price_per_night),
      minNights: result.min_nights || 1
    };
  } catch (error) {
    console.error('Error in createCategoryPrice:', error);
    return null;
  }
};

export const updateCategoryPrice = async (id: string, data: Partial<CategoryPriceCreate>): Promise<CategoryPriceEntry | null> => {
  try {
    const updateData: any = {};
    
    if (data.category !== undefined) updateData.category = data.category;
    if (data.numberOfPeople !== undefined) updateData.number_of_people = data.numberOfPeople;
    if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;
    if (data.pricePerNight !== undefined) updateData.price_per_night = data.pricePerNight;
    if (data.minNights !== undefined) updateData.min_nights = data.minNights;

    const { data: result, error } = await supabase
      .from('prices_by_category_and_people')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category price:', error);
      return null;
    }

    return {
      id: result.id,
      category: result.category as CategoryType,
      numberOfPeople: result.number_of_people,
      paymentMethod: result.payment_method,
      periodId: result.period_id,
      pricePerNight: Number(result.price_per_night),
      minNights: result.min_nights || 1
    };
  } catch (error) {
    console.error('Error in updateCategoryPrice:', error);
    return null;
  }
};

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

// Nova função para atualizar categoria em todos os preços
export const updateCategoryName = async (oldCategory: CategoryType, newCategory: CategoryType): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prices_by_category_and_people')
      .update({ category: newCategory })
      .eq('category', oldCategory);

    if (error) {
      console.error('Error updating category name:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateCategoryName:', error);
    return false;
  }
};
