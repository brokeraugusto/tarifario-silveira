
import { accommodations, pricePeriods, pricesByPeople } from './mockData';
import { 
  Accommodation, 
  PricePeriod, 
  PriceByPeople, 
  SearchParams, 
  SearchResult,
  BlockReasonType,
  CategoryType
} from '../types';
import { differenceInDays, isWithinInterval } from 'date-fns';

// Função para buscar acomodações com base nos critérios
export const searchAccommodations = (params: SearchParams): SearchResult[] => {
  const { checkIn, checkOut, guests } = params;

  // Filtrar acomodações que comportam o número de pessoas e não estão bloqueadas
  const filteredAccommodations = accommodations.filter(
    accommodation => accommodation.capacity >= guests && !accommodation.isBlocked
  );

  const results: SearchResult[] = [];

  for (const accommodation of filteredAccommodations) {
    // Encontrar o período de preço correto
    const period = findPeriodForDate(checkIn);
    
    if (!period) continue;
    
    // Encontrar o preço para o número de pessoas
    const priceEntry = pricesByPeople.find(
      price => 
        price.accommodationId === accommodation.id && 
        price.periodId === period.id && 
        price.people <= guests &&
        (price.people === guests || !pricesByPeople.some(
          p => p.accommodationId === accommodation.id && 
               p.periodId === period.id && 
               p.people > price.people && 
               p.people <= guests
        ))
    );

    if (!priceEntry) continue;

    // Calcular o número de noites e preço total
    let nights: number | null = null;
    let totalPrice: number | null = null;
    if (checkOut) {
      nights = differenceInDays(checkOut, checkIn);
      totalPrice = nights * priceEntry.pricePerNight;
    }

    // Verificar restrição de estadia mínima baseada no período
    const isMinStayViolation = checkOut && 
      period.minimumStay !== undefined && 
      nights !== null && 
      nights < period.minimumStay;

    results.push({
      accommodation,
      pricePerNight: priceEntry.pricePerNight,
      totalPrice,
      nights,
      isMinStayViolation,
      minimumStay: period.minimumStay,
      includesBreakfast: priceEntry.includesBreakfast
    });
  }

  // Ordenar por preço (do mais barato ao mais caro)
  return results.sort((a, b) => a.pricePerNight - b.pricePerNight);
};

// Encontrar o período de preço para uma data específica
export const findPeriodForDate = (date: Date): PricePeriod | undefined => {
  // Primeiro verificamos períodos de feriado/especial
  const holidayPeriod = pricePeriods.find(
    period => 
      period.isHoliday && 
      isWithinInterval(date, { start: period.startDate, end: period.endDate })
  );

  if (holidayPeriod) return holidayPeriod;

  // Depois verificamos períodos regulares
  return pricePeriods.find(
    period => 
      !period.isHoliday && 
      isWithinInterval(date, { start: period.startDate, end: period.endDate })
  );
};

// CRUD para acomodações
let nextAccommodationId = accommodations.length + 1;

export const getAllAccommodations = (): Accommodation[] => {
  return [...accommodations];
};

export const getAccommodationById = (id: string): Accommodation | undefined => {
  return accommodations.find(accommodation => accommodation.id === id);
};

export const createAccommodation = (accommodation: Omit<Accommodation, 'id'>): Accommodation => {
  const newAccommodation = {
    ...accommodation,
    id: String(nextAccommodationId++),
    isBlocked: accommodation.isBlocked || false,
    images: accommodation.images || [],
    albumUrl: accommodation.albumUrl || ''
  };
  accommodations.push(newAccommodation);
  return newAccommodation;
};

export const updateAccommodation = (id: string, updates: Partial<Accommodation>): Accommodation | undefined => {
  const index = accommodations.findIndex(accommodation => accommodation.id === id);
  if (index === -1) return undefined;
  
  accommodations[index] = { ...accommodations[index], ...updates };
  return accommodations[index];
};

export const bulkUpdateAccommodations = (ids: string[], updates: Partial<Accommodation>): Accommodation[] => {
  const updatedAccommodations: Accommodation[] = [];
  
  for (const id of ids) {
    const updated = updateAccommodation(id, updates);
    if (updated) {
      updatedAccommodations.push(updated);
    }
  }
  
  return updatedAccommodations;
};

export const deleteAccommodation = (id: string): boolean => {
  const index = accommodations.findIndex(accommodation => accommodation.id === id);
  if (index === -1) return false;
  
  accommodations.splice(index, 1);
  return true;
};

// Block/Unblock accommodation
export const blockAccommodation = (id: string, reason: BlockReasonType, note?: string): Accommodation | undefined => {
  return updateAccommodation(id, { isBlocked: true, blockReason: reason, blockNote: note });
};

export const unblockAccommodation = (id: string): Accommodation | undefined => {
  return updateAccommodation(id, { isBlocked: false, blockReason: undefined, blockNote: undefined });
};

// CRUD para períodos de preços
let nextPeriodId = pricePeriods.length + 1;

export const getAllPricePeriods = (): PricePeriod[] => {
  return [...pricePeriods];
};

export const createPricePeriod = (period: Omit<PricePeriod, 'id'>): PricePeriod => {
  const newPeriod = {
    ...period,
    id: String(nextPeriodId++)
  };
  pricePeriods.push(newPeriod);
  return newPeriod;
};

export const updatePricePeriod = (id: string, updates: Partial<PricePeriod>): PricePeriod | undefined => {
  const index = pricePeriods.findIndex(period => period.id === id);
  if (index === -1) return undefined;
  
  pricePeriods[index] = { ...pricePeriods[index], ...updates };
  return pricePeriods[index];
};

export const deletePricePeriod = (id: string): boolean => {
  const index = pricePeriods.findIndex(period => period.id === id);
  if (index === -1) return false;
  
  // Also delete associated prices when a period is deleted
  const relatedPrices = pricesByPeople.filter(price => price.periodId === id);
  relatedPrices.forEach(price => {
    deletePrice(price.id);
  });
  
  // Now delete the period
  pricePeriods.splice(index, 1);
  return true;
};

// CRUD para preços por número de pessoas
let nextPriceId = pricesByPeople.length + 1;

export const getPricesForAccommodation = (accommodationId: string): PriceByPeople[] => {
  return pricesByPeople.filter(price => price.accommodationId === accommodationId);
};

export const createPrice = (price: Omit<PriceByPeople, 'id'>): PriceByPeople => {
  const newPrice = {
    ...price,
    id: String(nextPriceId++)
  };
  pricesByPeople.push(newPrice);
  return newPrice;
};

export const updatePrice = (id: string, updates: Partial<PriceByPeople>): PriceByPeople | undefined => {
  const index = pricesByPeople.findIndex(price => price.id === id);
  if (index === -1) return undefined;
  
  pricesByPeople[index] = { ...pricesByPeople[index], ...updates };
  return pricesByPeople[index];
};

export const deletePrice = (id: string): boolean => {
  const index = pricesByPeople.findIndex(price => price.id === id);
  if (index === -1) return false;
  
  pricesByPeople.splice(index, 1);
  return true;
};

// Funções para preços por categoria
export const updatePricesByCategory = (
  category: CategoryType, 
  periodId: string, 
  priceOptions: { people: number, withBreakfast: number, withoutBreakfast: number }[],
  excludedAccommodationIds: string[] = []
): void => {
  // Obter todas as acomodações da categoria que não estão na lista de exceções
  const categoryAccommodations = accommodations.filter(
    acc => acc.category === category && !excludedAccommodationIds.includes(acc.id)
  );
  
  // Para cada acomodação, atualizar os preços
  for (const accommodation of categoryAccommodations) {
    // Verificar capacidade da acomodação para determinar quais opções de preço aplicar
    const maxPeopleForAccommodation = accommodation.capacity;
    
    // Para cada opção de preço que não excede a capacidade da acomodação
    for (const option of priceOptions.filter(opt => opt.people <= maxPeopleForAccommodation)) {
      // Verificar se já existe um preço com essas características
      const existingPriceWithBreakfast = pricesByPeople.find(
        p => p.accommodationId === accommodation.id && 
             p.periodId === periodId && 
             p.people === option.people &&
             p.includesBreakfast === true
      );
      
      const existingPriceWithoutBreakfast = pricesByPeople.find(
        p => p.accommodationId === accommodation.id && 
             p.periodId === periodId && 
             p.people === option.people &&
             p.includesBreakfast === false
      );
      
      // Atualizar ou criar preço com café da manhã
      if (existingPriceWithBreakfast) {
        updatePrice(existingPriceWithBreakfast.id, { pricePerNight: option.withBreakfast });
      } else {
        createPrice({
          accommodationId: accommodation.id,
          periodId,
          people: option.people,
          pricePerNight: option.withBreakfast,
          includesBreakfast: true
        });
      }
      
      // Atualizar ou criar preço sem café da manhã
      if (existingPriceWithoutBreakfast) {
        updatePrice(existingPriceWithoutBreakfast.id, { pricePerNight: option.withoutBreakfast });
      } else {
        createPrice({
          accommodationId: accommodation.id,
          periodId,
          people: option.people,
          pricePerNight: option.withoutBreakfast,
          includesBreakfast: false
        });
      }
    }
  }
};

export const getAccommodationsByCategory = (category: CategoryType): Accommodation[] => {
  return accommodations.filter(acc => acc.category === category);
};
