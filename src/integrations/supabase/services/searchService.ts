
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
      .or('is_blocked.is.null,is_blocked.eq.false');

    if (accommodationsError) {
      console.error('Error fetching accommodations:', accommodationsError);
      return [];
    }

    if (!accommodationsData || accommodationsData.length === 0) {
      console.log('No accommodations found matching criteria');
      return [];
    }

    console.log(`Found ${accommodationsData.length} available accommodations`);

    // Get all price periods (we'll filter overlapping ones later)
    const { data: periodsData, error: periodsError } = await supabase
      .from('price_periods')
      .select('*')
      .order('start_date');

    if (periodsError) {
      console.error('Error fetching periods:', periodsError);
      return [];
    }

    if (!periodsData || periodsData.length === 0) {
      console.log('No price periods found');
      return [];
    }

    console.log(`Found ${periodsData.length} price periods`);

    // Convert database periods to our format
    const allPeriods: PricePeriod[] = periodsData.map(period => ({
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

      let totalPixPrice = 0;
      let totalCardPrice = 0;
      let canCalculatePrice = true;
      let isMinStayViolation = false;
      let minimumStay = 1;
      let nightsWithPrices = 0;

      // Get all periods that overlap with our date range
      const overlappingPeriods = allPeriods.filter(period => {
        const periodStart = period.startDate;
        const periodEnd = period.endDate;
        
        // Check if periods overlap with our search range
        return (
          (checkIn <= periodEnd && checkOut >= periodStart)
        );
      }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      console.log(`Found ${overlappingPeriods.length} overlapping periods for ${accommodation.name}:`, 
        overlappingPeriods.map(p => `${p.name} (${p.startDate.toISOString().split('T')[0]} to ${p.endDate.toISOString().split('T')[0]})`));

      if (overlappingPeriods.length === 0) {
        console.log(`No overlapping periods found for accommodation ${accommodation.name}`);
        canCalculatePrice = false;
      } else {
        // Calculate price for each night, determining which period it falls in
        let datesWithoutPrices: string[] = [];
        
        for (let currentDate = new Date(checkIn); currentDate < checkOut; currentDate = addDays(currentDate, 1)) {
          // Find the period that contains this specific date
          // Check if the current date falls within any period (inclusive of start, exclusive of end for transition logic)
          const activePeriod = overlappingPeriods.find(period => {
            const currentDateOnly = new Date(currentDate);
            currentDateOnly.setHours(0, 0, 0, 0);
            
            const periodStart = new Date(period.startDate);
            periodStart.setHours(0, 0, 0, 0);
            
            const periodEnd = new Date(period.endDate);
            periodEnd.setHours(23, 59, 59, 999);
            
            // Current date should be >= period start and <= period end
            return currentDateOnly >= periodStart && currentDateOnly <= periodEnd;
          });

          if (!activePeriod) {
            console.log(`No active period found for date ${currentDate.toISOString().split('T')[0]} among periods:`, 
              overlappingPeriods.map(p => `${p.name}: ${p.startDate.toISOString().split('T')[0]} to ${p.endDate.toISOString().split('T')[0]}`));
            datesWithoutPrices.push(currentDate.toISOString().split('T')[0]);
            canCalculatePrice = false;
            break; // Stop processing if we find a gap
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
              console.log(`No compatible prices found for accommodation ${accommodation.name} in period ${activePeriod.name} for date ${currentDate.toISOString().split('T')[0]}`);
              datesWithoutPrices.push(currentDate.toISOString().split('T')[0]);
              continue; // Continue instead of breaking to try other dates
            }

            // Get both PIX and card prices
            const pixPrice = compatiblePrices.find(p => p.paymentMethod === 'pix');
            const cardPrice = compatiblePrices.find(p => p.paymentMethod === 'credit_card');

            console.log(`Found prices for ${accommodation.name} on ${currentDate.toISOString().split('T')[0]}:`, { pixPrice, cardPrice });

            let dateHasPrice = false;

            if (pixPrice && pixPrice.pricePerNight > 0) {
              // Check minimum stay from the PIX price entry
              if (pixPrice.minNights && nights < pixPrice.minNights) {
                isMinStayViolation = true;
                minimumStay = Math.max(minimumStay, pixPrice.minNights);
              }
              totalPixPrice += Number(pixPrice.pricePerNight);
              dateHasPrice = true;
            }

            if (cardPrice && cardPrice.pricePerNight > 0) {
              // Check minimum stay from the card price entry
              if (cardPrice.minNights && nights < cardPrice.minNights) {
                isMinStayViolation = true;
                minimumStay = Math.max(minimumStay, cardPrice.minNights);
              }
              totalCardPrice += Number(cardPrice.pricePerNight);
              dateHasPrice = true;
            }

            // If no specific payment method prices found, use the first available
            if (!dateHasPrice && compatiblePrices.length > 0) {
              const priceToUse = compatiblePrices[0];
              console.log(`Using fallback price for ${accommodation.name} on ${currentDate.toISOString().split('T')[0]}:`, priceToUse);
              if (priceToUse && priceToUse.pricePerNight > 0) {
                if (priceToUse.minNights && nights < priceToUse.minNights) {
                  isMinStayViolation = true;
                  minimumStay = Math.max(minimumStay, priceToUse.minNights);
                }
                // Use the same price for both payment methods as fallback
                totalPixPrice += Number(priceToUse.pricePerNight);
                totalCardPrice += Number(priceToUse.pricePerNight);
                dateHasPrice = true;
              }
            }

            if (dateHasPrice) {
              nightsWithPrices++;
            } else {
              datesWithoutPrices.push(currentDate.toISOString().split('T')[0]);
            }
          } catch (error) {
            console.error(`Error getting prices for accommodation ${accommodation.name} on ${currentDate.toISOString().split('T')[0]}:`, error);
            datesWithoutPrices.push(currentDate.toISOString().split('T')[0]);
            continue; // Continue instead of breaking to try other dates
          }
        }

        // Update canCalculatePrice based on whether we found prices for any nights
        canCalculatePrice = nightsWithPrices > 0;
        
        if (datesWithoutPrices.length > 0) {
          console.log(`Accommodation ${accommodation.name} missing prices for dates:`, datesWithoutPrices);
        }

        console.log(`Price calculation summary for ${accommodation.name}: ${nightsWithPrices}/${nights} nights with prices`);
      }

      // Only include results with pricing if we have at least some valid prices
      if (canCalculatePrice && nightsWithPrices > 0) {
        // Calculate average price per night only for display purposes - using REAL totals
        const pixAveragePrice = totalPixPrice > 0 && nightsWithPrices > 0 ? totalPixPrice / nightsWithPrices : 0;
        const cardAveragePrice = totalCardPrice > 0 && nightsWithPrices > 0 ? totalCardPrice / nightsWithPrices : 0;
        const defaultAveragePrice = pixAveragePrice || cardAveragePrice;
        
        console.log(`Final price calculation for ${accommodation.name}:`, {
          totalPixPrice, // Real sum of all nights with prices
          totalCardPrice, // Real sum of all nights with prices
          pixAveragePrice, // Only for display
          cardAveragePrice, // Only for display
          nights,
          nightsWithPrices,
          missingNights: nights - nightsWithPrices,
          overlappingPeriodsCount: overlappingPeriods.length
        });
        
        results.push({
          accommodation,
          pricePerNight: defaultAveragePrice, // Average for display
          totalPrice: totalPixPrice || totalCardPrice, // REAL total (sum of actual nights)
          nights,
          isMinStayViolation,
          minimumStay,
          includesBreakfast,
          pixPrice: pixAveragePrice > 0 ? pixAveragePrice : null,
          cardPrice: cardAveragePrice > 0 ? cardAveragePrice : null,
          pixTotalPrice: totalPixPrice > 0 ? totalPixPrice : null, // REAL total
          cardTotalPrice: totalCardPrice > 0 ? totalCardPrice : null, // REAL total
          hasMultiplePeriods: overlappingPeriods.length > 1,
          overlappingPeriodsCount: overlappingPeriods.length
        });
      } else {
        // No pricing data available
        console.log(`No valid pricing found for ${accommodation.name} (nights with prices: ${nightsWithPrices}/${nights}), including without prices`);
        results.push({
          accommodation,
          pricePerNight: 0,
          totalPrice: null,
          nights,
          isMinStayViolation,
          minimumStay,
          includesBreakfast,
          pixPrice: null,
          cardPrice: null,
          pixTotalPrice: null,
          cardTotalPrice: null,
          hasMultiplePeriods: overlappingPeriods.length > 1,
          overlappingPeriodsCount: overlappingPeriods.length
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
