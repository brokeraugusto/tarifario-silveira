
import { differenceInDays } from 'date-fns';
import { SearchParams, SearchResult } from '@/types';
import { searchAccommodations as apiSearchAccommodations } from '@/utils/accommodationService';

export const validateSearchParams = (params: SearchParams): string | null => {
  if (!params.checkIn) {
    return "Selecione pelo menos uma data de check-in";
  }
  return null;
};

export const searchAccommodations = async (
  searchParams: SearchParams,
  forceSearch: boolean = false
): Promise<{
  results: SearchResult[];
  maxMinStay?: number;
  hasMinStayViolations?: boolean;
}> => {
  const results = await apiSearchAccommodations(searchParams);
  
  if (!forceSearch && searchParams.checkOut) {
    const days = differenceInDays(searchParams.checkOut, searchParams.checkIn);
    
    // Check for minimum stay violations
    const hasMinStayViolations = results.some(result => result.isMinStayViolation);
    
    if (hasMinStayViolations) {
      // Find the maximum minimum stay required
      const maxMinStayValue = Math.max(...results
        .filter(r => r.minimumStay)
        .map(r => r.minimumStay || 0)
      );
      
      return {
        results,
        maxMinStay: maxMinStayValue,
        hasMinStayViolations
      };
    }
  }
  
  return { results };
};
