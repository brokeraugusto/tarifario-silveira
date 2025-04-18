
import { supabase } from '../client';
import { Accommodation, SearchParams, SearchResult } from '@/types';
import { differenceInDays } from 'date-fns';
import { findPeriodForDate } from './periodService';

export const searchAccommodations = async (params: SearchParams): Promise<SearchResult[]> => {
  const { checkIn, checkOut, guests } = params;
  
  try {
    // Get available accommodations with sufficient capacity
    const { data: accommodationsData, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('*')
      .gte('capacity', guests)
      .eq('is_blocked', false);
    
    if (accommodationsError) {
      console.error('Error fetching accommodations:', accommodationsError);
      return [];
    }
    
    if (!accommodationsData || accommodationsData.length === 0) {
      return [];
    }

    // Convert to application model with proper type casting
    const accommodations: Accommodation[] = accommodationsData.map(item => ({
      id: item.id,
      name: item.name,
      roomNumber: item.room_number,
      category: item.category as CategoryType, // Cast string to CategoryType
      capacity: item.capacity,
      description: item.description,
      imageUrl: item.image_url || '',
      images: item.images || [],
      isBlocked: item.is_blocked || false,
      blockReason: item.block_reason,
      blockNote: item.block_note
    }));

    // Find applicable price period
    const period = await findPeriodForDate(checkIn);
    if (!period) {
      console.warn('No price period found for the selected date.');
      return [];
    }

    const results: SearchResult[] = [];
    
    for (const accommodation of accommodations) {
      // Get prices for this accommodation and period
      const { data: pricesData, error: pricesError } = await supabase
        .from('prices_by_people')
        .select('*')
        .eq('accommodation_id', accommodation.id)
        .eq('period_id', period.id)
        .lte('people', guests)
        .order('people', { ascending: false })
        .limit(1);
      
      if (pricesError || !pricesData || pricesData.length === 0) {
        console.warn(`No price found for accommodation ${accommodation.id}`);
        continue;
      }

      const priceEntry = pricesData[0];
      
      // Calculate nights and total price
      let nights: number | null = null;
      let totalPrice: number | null = null;
      if (checkOut) {
        nights = differenceInDays(checkOut, checkIn);
        totalPrice = nights * Number(priceEntry.price_per_night);
      }

      // Check minimum stay requirement
      const isMinStayViolation = checkOut && 
        period.minimumStay !== undefined && 
        nights !== null && 
        nights < period.minimumStay;

      results.push({
        accommodation,
        pricePerNight: Number(priceEntry.price_per_night),
        totalPrice,
        nights,
        isMinStayViolation,
        minimumStay: period.minimumStay,
        includesBreakfast: priceEntry.includes_breakfast || false
      });
    }

    // Sort by price ascending
    return results.sort((a, b) => a.pricePerNight - b.pricePerNight);
    
  } catch (error) {
    console.error('Error in searchAccommodations:', error);
    return [];
  }
};
