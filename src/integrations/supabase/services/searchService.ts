
import { supabase } from '../client';
import { SearchParams, SearchResult, Accommodation, PricePeriod } from '@/types';
import { accommodationMapper } from './accommodations/mapper';
import { getCategoryPricesByPeriod } from './categoryPriceService';
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
      let pixNights = 0;
      let cardNights = 0;
      let canCalculatePrice = true;
      let isMinStayViolation = false;
      let minimumStay = 1;
      
      // Cache for period prices to avoid repeated queries
      const periodPricesCache = new Map<string, any[]>();

      // Get all periods that overlap with our date range
      const overlappingPeriods = allPeriods.filter(period => {
        const periodStart = period.startDate;
        const periodEnd = period.endDate;
        
        // Check if periods overlap with our search range
        return (
          (checkIn <= periodEnd && checkOut >= periodStart)
        );
      }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      console.log(`\n=== Processing ${accommodation.name} (${accommodation.category}) ===`);
      console.log(`Search period: ${checkIn.toISOString().split('T')[0]} to ${checkOut.toISOString().split('T')[0]} (${nights} nights)`);
      console.log(`Found ${overlappingPeriods.length} overlapping periods:`, 
        overlappingPeriods.map(p => `${p.name} (${p.startDate.toISOString().split('T')[0]} to ${p.endDate.toISOString().split('T')[0]})`));

      if (overlappingPeriods.length === 0) {
        console.log(`No overlapping periods found for accommodation ${accommodation.name}`);
        canCalculatePrice = false;
      } else {
        // NEW SEGMENTED APPROACH: Calculate by tariff periods instead of day-by-day
        for (const period of overlappingPeriods) {
          // Calculate the intersection of search dates with this period
          const segmentStart = new Date(Math.max(checkIn.getTime(), period.startDate.getTime()));
          const segmentEnd = new Date(Math.min(checkOut.getTime(), addDays(period.endDate, 1).getTime()));
          const nightsInSegment = Math.max(0, differenceInDays(segmentEnd, segmentStart));
          
          if (nightsInSegment <= 0) {
            console.log(`Period ${period.name} has no nights in search range`);
            continue;
          }
          
          console.log(`\n--- Period: ${period.name} ---`);
          console.log(`Period dates: ${period.startDate.toISOString().split('T')[0]} to ${period.endDate.toISOString().split('T')[0]}`);
          console.log(`Segment dates: ${segmentStart.toISOString().split('T')[0]} to ${segmentEnd.toISOString().split('T')[0]}`);
          console.log(`Nights in this segment: ${nightsInSegment}`);

          // Check minimum stay requirement from the period
          if (period.minimumStay && nights < period.minimumStay) {
            isMinStayViolation = true;
            minimumStay = Math.max(minimumStay, period.minimumStay);
          }

          // Get prices for this period (use cache)
          const cacheKey = `${period.id}-${accommodation.category}-${guests}`;
          let categoryPrices;
          
          if (periodPricesCache.has(cacheKey)) {
            categoryPrices = periodPricesCache.get(cacheKey);
          } else {
            try {
              const allPricesForPeriod = await getCategoryPricesByPeriod(period.id);
              categoryPrices = allPricesForPeriod.filter(p => 
                p.category === accommodation.category && 
                p.numberOfPeople === guests
              );
              periodPricesCache.set(cacheKey, categoryPrices);
            } catch (error) {
              console.error(`Error getting prices for period ${period.name}:`, error);
              categoryPrices = [];
            }
          }

          if (categoryPrices.length === 0) {
            console.log(`No prices found for category ${accommodation.category}, ${guests} people in period ${period.name}`);
            continue;
          }

          // Find PIX and Card prices
          const pixPrice = categoryPrices.find(p => p.paymentMethod === 'pix');
          const cardPrice = categoryPrices.find(p => p.paymentMethod === 'credit_card');

          console.log(`Available prices:`, {
            pixPrice: pixPrice ? `R$ ${pixPrice.pricePerNight}` : 'Not found',
            cardPrice: cardPrice ? `R$ ${cardPrice.pricePerNight}` : 'Not found'
          });

          // Calculate subtotals for this segment
          if (pixPrice && pixPrice.pricePerNight > 0) {
            const segmentPixTotal = Number(pixPrice.pricePerNight) * nightsInSegment;
            totalPixPrice += segmentPixTotal;
            pixNights += nightsInSegment;
            
            // Check minimum stay from price entry
            if (pixPrice.minNights && nights < pixPrice.minNights) {
              isMinStayViolation = true;
              minimumStay = Math.max(minimumStay, pixPrice.minNights);
            }
            
            console.log(`PIX: ${nightsInSegment} nights × R$ ${pixPrice.pricePerNight} = R$ ${segmentPixTotal}`);
          } else {
            console.log(`PIX: No valid price found for this segment`);
          }

          if (cardPrice && cardPrice.pricePerNight > 0) {
            const segmentCardTotal = Number(cardPrice.pricePerNight) * nightsInSegment;
            totalCardPrice += segmentCardTotal;
            cardNights += nightsInSegment;
            
            // Check minimum stay from price entry
            if (cardPrice.minNights && nights < cardPrice.minNights) {
              isMinStayViolation = true;
              minimumStay = Math.max(minimumStay, cardPrice.minNights);
            }
            
            console.log(`Card: ${nightsInSegment} nights × R$ ${cardPrice.pricePerNight} = R$ ${segmentCardTotal}`);
          } else {
            console.log(`Card: No valid price found for this segment`);
          }
        }

        console.log(`\n--- Final Calculation Summary ---`);
        console.log(`PIX: ${pixNights}/${nights} nights covered, Total: R$ ${totalPixPrice}`);
        console.log(`Card: ${cardNights}/${nights} nights covered, Total: R$ ${totalCardPrice}`);
        
        // Only consider prices complete if ALL nights are covered
        const hasCompletePixPricing = pixNights === nights;
        const hasCompleteCardPricing = cardNights === nights;
        
        if (!hasCompletePixPricing && !hasCompleteCardPricing) {
          console.log(`Incomplete pricing: PIX missing ${nights - pixNights} nights, Card missing ${nights - cardNights} nights`);
          canCalculatePrice = false;
        } else {
          canCalculatePrice = true;
          console.log(`Complete pricing available: PIX=${hasCompletePixPricing}, Card=${hasCompleteCardPricing}`);
        }
      }

      // Determine final prices based on completeness
      const hasCompletePixPricing = pixNights === nights && totalPixPrice > 0;
      const hasCompleteCardPricing = cardNights === nights && totalCardPrice > 0;
      
      // Calculate averages only for complete pricing
      const pixAveragePrice = hasCompletePixPricing ? totalPixPrice / nights : 0;
      const cardAveragePrice = hasCompleteCardPricing ? totalCardPrice / nights : 0;
      const defaultAveragePrice = pixAveragePrice || cardAveragePrice;
      
      console.log(`\n=== FINAL RESULT for ${accommodation.name} ===`);
      console.log(`PIX: ${hasCompletePixPricing ? `R$ ${totalPixPrice} total, R$ ${pixAveragePrice.toFixed(2)} average` : 'Incomplete pricing'}`);
      console.log(`Card: ${hasCompleteCardPricing ? `R$ ${totalCardPrice} total, R$ ${cardAveragePrice.toFixed(2)} average` : 'Incomplete pricing'}`);
      console.log(`Can calculate price: ${canCalculatePrice}`);
      console.log(`Min stay violation: ${isMinStayViolation}`);
      
      results.push({
        accommodation,
        pricePerNight: defaultAveragePrice,
        totalPrice: hasCompletePixPricing ? totalPixPrice : (hasCompleteCardPricing ? totalCardPrice : null),
        nights,
        isMinStayViolation,
        minimumStay,
        includesBreakfast,
        pixPrice: hasCompletePixPricing ? pixAveragePrice : null,
        cardPrice: hasCompleteCardPricing ? cardAveragePrice : null,
        pixTotalPrice: hasCompletePixPricing ? totalPixPrice : null,
        cardTotalPrice: hasCompleteCardPricing ? totalCardPrice : null,
        hasMultiplePeriods: overlappingPeriods.length > 1,
        overlappingPeriodsCount: overlappingPeriods.length
      });
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
