
import { supabase } from '../client';
import { SearchParams, SearchResult, Accommodation } from '@/types';
import { differenceInDays } from 'date-fns';
import { findPeriodForDate } from './periodService/queries';
import { getCompatiblePrices } from './categoryPriceService';

export interface NewSearchResult extends SearchResult {
  paymentMethod: 'pix' | 'credit_card';
  minimumNights: number;
}

/**
 * Search for available accommodations using the new category-based pricing system
 */
export const searchWithNewPricing = async (
  searchParams: SearchParams,
  paymentMethod: 'pix' | 'credit_card' = 'pix'
): Promise<{
  results: NewSearchResult[];
  hasMinStayViolations: boolean;
  maxMinStay: number;
}> => {
  try {
    console.log('Starting new pricing search with params:', searchParams, 'payment method:', paymentMethod);

    // Get all active accommodations
    const { data: accommodations, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('*')
      .eq('is_blocked', false)
      .order('category')
      .order('name');

    if (accommodationsError) {
      console.error('Error fetching accommodations:', accommodationsError);
      return { results: [], hasMinStayViolations: false, maxMinStay: 1 };
    }

    if (!accommodations || accommodations.length === 0) {
      console.log('No accommodations found');
      return { results: [], hasMinStayViolations: false, maxMinStay: 1 };
    }

    // Find the pricing period for the check-in date
    const period = await findPeriodForDate(searchParams.checkIn);
    if (!period) {
      console.log('No pricing period found for date:', searchParams.checkIn);
      return { results: [], hasMinStayViolations: false, maxMinStay: 1 };
    }

    console.log('Found pricing period:', period);

    const results: NewSearchResult[] = [];
    let hasMinStayViolations = false;
    let maxMinStay = 1;

    // Calculate number of nights if checkout date is provided
    const nights = searchParams.checkOut 
      ? differenceInDays(searchParams.checkOut, searchParams.checkIn)
      : null;

    for (const accommodation of accommodations) {
      // Skip if accommodation capacity is less than requested guests
      if (accommodation.capacity < searchParams.guests) {
        continue;
      }

      // Get compatible prices for this accommodation
      const compatiblePrices = await getCompatiblePrices(
        accommodation.category,
        accommodation.capacity,
        period.id,
        searchParams.guests
      );

      // Find price for the specified payment method
      const priceRule = compatiblePrices.find(p => p.payment_method === paymentMethod);
      
      if (!priceRule) {
        console.log(`No price rule found for accommodation ${accommodation.name} with payment method ${paymentMethod}`);
        continue;
      }

      // Check minimum stay requirements
      const requiredMinStay = Math.max(priceRule.min_nights || 1, period.minimumStay || 1);
      const isMinStayViolation = nights !== null && nights < requiredMinStay;
      
      if (isMinStayViolation) {
        hasMinStayViolations = true;
        maxMinStay = Math.max(maxMinStay, requiredMinStay);
      }

      // Calculate total price
      const totalPrice = nights ? priceRule.price_per_night * nights : null;

      const result: NewSearchResult = {
        accommodation: {
          id: accommodation.id,
          name: accommodation.name,
          roomNumber: accommodation.room_number,
          category: accommodation.category as any,
          capacity: accommodation.capacity,
          description: accommodation.description,
          imageUrl: accommodation.image_url || '',
          images: accommodation.images || [],
          albumUrl: accommodation.album_url || undefined,
          isBlocked: accommodation.is_blocked || false,
          blockReason: accommodation.block_reason as any,
          blockNote: accommodation.block_note || undefined,
          blockPeriod: accommodation.block_period ? {
            from: new Date(accommodation.block_period.from),
            to: new Date(accommodation.block_period.to)
          } : undefined
        },
        pricePerNight: Number(priceRule.price_per_night),
        totalPrice,
        nights,
        isMinStayViolation,
        minimumStay: requiredMinStay,
        includesBreakfast: searchParams.includesBreakfast || false,
        paymentMethod,
        minimumNights: requiredMinStay
      };

      results.push(result);
    }

    console.log(`Found ${results.length} available accommodations`);
    
    return {
      results: results.sort((a, b) => a.pricePerNight - b.pricePerNight),
      hasMinStayViolations,
      maxMinStay
    };

  } catch (error) {
    console.error('Error in searchWithNewPricing:', error);
    return { results: [], hasMinStayViolations: false, maxMinStay: 1 };
  }
};
