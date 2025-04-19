
import { supabase } from '../../client';
import { Accommodation, CategoryType } from '@/types';
import { accommodationMapper } from './mapper';

export const getAllAccommodations = async (): Promise<Accommodation[]> => {
  try {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching accommodations:', error);
      return [];
    }

    return data.map(accommodationMapper.fromDatabase);
  } catch (error) {
    console.error('Unexpected error in getAllAccommodations:', error);
    return [];
  }
};

export const getAccommodationById = async (id: string): Promise<Accommodation | null> => {
  try {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching accommodation:', error);
      return null;
    }

    return accommodationMapper.fromDatabase(data);
  } catch (error) {
    console.error('Unexpected error in getAccommodationById:', error);
    return null;
  }
};

export const getAccommodationsByCategory = async (category: CategoryType): Promise<Accommodation[]> => {
  try {
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) {
      console.error('Error fetching accommodations by category:', error);
      return [];
    }

    return data.map(accommodationMapper.fromDatabase);
  } catch (error) {
    console.error('Unexpected error in getAccommodationsByCategory:', error);
    return [];
  }
};
