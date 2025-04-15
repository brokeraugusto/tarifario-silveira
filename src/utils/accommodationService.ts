
import { accommodations, pricePeriods, pricesByPeople } from './mockData';
import { 
  Accommodation, 
  PricePeriod, 
  PriceByPeople, 
  SearchParams, 
  SearchResult 
} from '../types';
import { differenceInDays, isWithinInterval, parseISO } from 'date-fns';

// Função para buscar acomodações com base nos critérios
export const searchAccommodations = (params: SearchParams): SearchResult[] => {
  const { checkIn, checkOut, guests } = params;

  // Filtrar acomodações que comportam o número de pessoas
  const filteredAccommodations = accommodations.filter(
    accommodation => accommodation.capacity >= guests
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
      minimumStay: period.minimumStay
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
    id: String(nextAccommodationId++)
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

export const deleteAccommodation = (id: string): boolean => {
  const index = accommodations.findIndex(accommodation => accommodation.id === id);
  if (index === -1) return false;
  
  accommodations.splice(index, 1);
  return true;
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
