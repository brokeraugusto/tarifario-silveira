
import { supabase } from '../client';
import { SearchParams, SearchResult, Accommodation, PricePeriod } from '@/types';
import { accommodationMapper } from './accommodations/mapper';
import { getCompatiblePrices } from './categoryPriceService';
import { isWithinInterval, addDays, differenceInDays } from 'date-fns';

export const searchAvailableAccommodations = async (params: SearchParams): Promise<SearchResult[]> => {
  try {
    console.log('Searching accommodations with params:', params);
    
    const { checkIn, checkOut, guests, includesBreakfast = false } = params;
    
    if (!checkOut) {
      console.log('No checkout date provided');
      return [];
    }

    const nights = differenceInDays(checkOut, checkIn);
    console.log('Number of nights:', nights);

    // Get all accommodations that are not blocked and can accommodate the guests
    const { data: accommodationsData, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('*')
      .gte('capacity', guests)
      .or('is_blocked.is.null,is_blocked.eq.false'); // Exclude blocked accommodations

    if (accommodationsError) {
      console.error('Error fetching accommodations:', accommodationsError);
      return [];
    }

    if (!accommodationsData || accommodationsData.length === 0) {
      console.log('No accommodations found matching criteria');
      return [];
    }

    console.log(`Found ${accommodationsData.length} available accommodations`);

    // Get price periods that overlap with the search dates
    const { data: periodsData, error: periodsError } = await supabase
      .from('price_periods')
      .select('*')
      .lte('start_date', checkOut.toISOString().split('T')[0])
      .gte('end_date', checkIn.toISOString().split('T')[0]);

    if (periodsError) {
      console.error('Error fetching periods:', periodsError);
      return [];
    }

    if (!periodsData || periodsData.length === 0) {
      console.log('No price periods found for the given dates');
      return [];
    }

    console.log(`Found ${periodsData.length} overlapping price periods`);

    // Convert database periods to our format
    const periods: PricePeriod[] = periodsData.map(period => ({
      id: period.id,
      name: period.name,
      startDate: new Date(period.start_date),
      endDate: new Date(period.end_date),
      minimumStay: period.minimum_stay,
      isHoliday: period.is_holiday
    }));

    const results: SearchResult[] = [];

    for (const accommodationData of accommodationsData) {
      const accommodation = accommodationMapper.fromDatabase(accommodationData);
      
      // Check if accommodation has active maintenance orders that would block it
      const { data: maintenanceOrders } = await supabase
        .from('maintenance_orders')
        .select('*, areas!inner(*)')
        .eq('areas.accommodation_id', accommodation.id)
        .in('status', ['pending', 'in_progress']);

      // Skip if there are active maintenance orders
      if (maintenanceOrders && maintenanceOrders.length > 0) {
        console.log(`Skipping accommodation ${accommodation.name} due to active maintenance orders`);
        continue;
      }

      let totalPrice = 0;
      let canCalculatePrice = true;
      let isMinStayViolation = false;
      let minimumStay = 1;

      // Calculate price for each night using the new category-based system
      for (let currentDate = new Date(checkIn); currentDate < checkOut; currentDate = addDays(currentDate, 1)) {
        // Find the period that contains this date
        const activePeriod = periods.find(period =>
          isWithinInterval(currentDate, { start: period.startDate, end: period.endDate })
        );

        if (!activePeriod) {
          console.log(`No active period found for date ${currentDate.toISOString()}`);
          canCalculatePrice = false;
          break;
        }

        // Check minimum stay requirement from the period
        if (activePeriod.minimumStay && nights < activePeriod.minimumStay) {
          isMinStayViolation = true;
          minimumStay = Math.max(minimumStay, activePeriod.minimumStay);
        }

        // Get compatible prices for this accommodation's category
        try {
          const compatiblePrices = await getCompatiblePrices(
            accommodation.category,
            accommodation.capacity,
            activePeriod.id,
            guests
          );

          if (compatiblePrices.length === 0) {
            console.log(`No compatible prices found for accommodation ${accommodation.name} in period ${activePeriod.name}`);
            canCalculatePrice = false;
            break;
          }

          // For now, use PIX prices as default (you can modify this logic based on payment preference)
          const pixPrice = compatiblePrices.find(p => p.paymentMethod === 'pix');
          const priceToUse = pixPrice || compatiblePrices[0];

          // Check minimum stay from the price entry
          if (priceToUse.minNights && nights < priceToUse.minNights) {
            isMinStayViolation = true;
            minimumStay = Math.max(minimumStay, priceToUse.minNights);
          }

          totalPrice += Number(priceToUse.pricePerNight);
        } catch (error) {
          console.error(`Error getting prices for accommodation ${accommodation.name}:`, error);
          canCalculatePrice = false;
          break;
        }
      }

      if (canCalculatePrice) {
        const pricePerNight = totalPrice / nights;
        
        results.push({
          accommodation,
          pricePerNight,
          totalPrice,
          nights,
          isMinStayViolation,
          minimumStay,
          includesBreakfast
        });
      } else {
        // Still include the accommodation but without pricing
        results.push({
          accommodation,
          pricePerNight: 0,
          totalPrice: null,
          nights,
          isMinStayViolation,
          minimumStay,
          includesBreakfast
        });
      }
    }

    console.log(`Returning ${results.length} search results`);
    return results.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
  } catch (error) {
    console.error('Unexpected error in searchAvailableAccommodations:', error);
    return [];
  }
};

// Export the function with the expected name for backward compatibility
export const searchAccommodations = searchAvailableAccommodations;
