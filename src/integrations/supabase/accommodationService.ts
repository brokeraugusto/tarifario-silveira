
import { supabase } from './client';
import { Accommodation, BlockReasonType, CategoryType, PricePeriod, PriceByPeople, SearchParams, SearchResult, PriceOption } from '@/types';
import { differenceInDays, isWithinInterval, parseISO } from 'date-fns';

// Função para buscar todas as acomodações
export const getAllAccommodations = async (): Promise<Accommodation[]> => {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*');

  if (error) {
    console.error('Error fetching accommodations:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    roomNumber: item.room_number,
    category: item.category as CategoryType,
    capacity: item.capacity,
    description: item.description,
    imageUrl: item.image_url || '',
    images: item.images || [],
    isBlocked: item.is_blocked || false,
    blockReason: item.block_reason as BlockReasonType | undefined,
    blockNote: item.block_note
  }));
};

// Função para obter uma acomodação pelo ID
export const getAccommodationById = async (id: string): Promise<Accommodation | null> => {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching accommodation:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    roomNumber: data.room_number,
    category: data.category as CategoryType,
    capacity: data.capacity,
    description: data.description,
    imageUrl: data.image_url || '',
    images: data.images || [],
    isBlocked: data.is_blocked || false,
    blockReason: data.block_reason as BlockReasonType | undefined,
    blockNote: data.block_note
  };
};

// Função para criar uma nova acomodação
export const createAccommodation = async (accommodation: Omit<Accommodation, 'id'>): Promise<Accommodation | null> => {
  const { data, error } = await supabase
    .from('accommodations')
    .insert({
      name: accommodation.name,
      room_number: accommodation.roomNumber,
      category: accommodation.category,
      capacity: accommodation.capacity,
      description: accommodation.description,
      image_url: accommodation.imageUrl,
      images: accommodation.images || [],
      is_blocked: accommodation.isBlocked || false,
      block_reason: accommodation.blockReason,
      block_note: accommodation.blockNote
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating accommodation:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    roomNumber: data.room_number,
    category: data.category as CategoryType,
    capacity: data.capacity,
    description: data.description,
    imageUrl: data.image_url || '',
    images: data.images || [],
    isBlocked: data.is_blocked || false,
    blockReason: data.block_reason as BlockReasonType | undefined,
    blockNote: data.block_note
  };
};

// Função para atualizar uma acomodação existente
export const updateAccommodation = async (id: string, updates: Partial<Accommodation>): Promise<Accommodation | null> => {
  // Transforma o objeto do formato da aplicação para o formato do banco
  const dbUpdates: any = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.roomNumber !== undefined) dbUpdates.room_number = updates.roomNumber;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.images !== undefined) dbUpdates.images = updates.images;
  if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;
  if (updates.blockReason !== undefined) dbUpdates.block_reason = updates.blockReason;
  if (updates.blockNote !== undefined) dbUpdates.block_note = updates.blockNote;

  const { data, error } = await supabase
    .from('accommodations')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating accommodation:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    roomNumber: data.room_number,
    category: data.category as CategoryType,
    capacity: data.capacity,
    description: data.description,
    imageUrl: data.image_url || '',
    images: data.images || [],
    isBlocked: data.is_blocked || false,
    blockReason: data.block_reason as BlockReasonType | undefined,
    blockNote: data.block_note
  };
};

// Função para excluir uma acomodação
export const deleteAccommodation = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('accommodations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting accommodation:', error);
    return false;
  }

  return true;
};

// Função para bloquear uma acomodação
export const blockAccommodation = async (id: string, reason: BlockReasonType, note?: string): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: true, 
    blockReason: reason, 
    blockNote: note 
  });
};

// Função para desbloquear uma acomodação
export const unblockAccommodation = async (id: string): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: false, 
    blockReason: undefined, 
    blockNote: undefined 
  });
};

// Função para atualizar múltiplas acomodações
export const bulkUpdateAccommodations = async (ids: string[], updates: Partial<Accommodation>): Promise<Accommodation[]> => {
  const updatedAccommodations: Accommodation[] = [];
  
  for (const id of ids) {
    const updated = await updateAccommodation(id, updates);
    if (updated) {
      updatedAccommodations.push(updated);
    }
  }
  
  return updatedAccommodations;
};

// Função para buscar acomodações por categoria
export const getAccommodationsByCategory = async (category: CategoryType): Promise<Accommodation[]> => {
  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .eq('category', category);

  if (error) {
    console.error('Error fetching accommodations by category:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    roomNumber: item.room_number,
    category: item.category as CategoryType,
    capacity: item.capacity,
    description: item.description,
    imageUrl: item.image_url || '',
    images: item.images || [],
    isBlocked: item.is_blocked || false,
    blockReason: item.block_reason as BlockReasonType | undefined,
    blockNote: item.block_note
  }));
};

// Função para buscar acomodações com base nos critérios
export const searchAccommodations = async (params: SearchParams): Promise<SearchResult[]> => {
  const { checkIn, checkOut, guests } = params;
  
  try {
    // Buscar todas as acomodações que não estão bloqueadas e com capacidade suficiente
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

    // Converter os dados para o formato do aplicativo
    const accommodations: Accommodation[] = accommodationsData.map(item => ({
      id: item.id,
      name: item.name,
      roomNumber: item.room_number,
      category: item.category as CategoryType,
      capacity: item.capacity,
      description: item.description,
      imageUrl: item.image_url || '',
      images: item.images || [],
      isBlocked: item.is_blocked || false,
      blockReason: item.block_reason as BlockReasonType | undefined,
      blockNote: item.block_note
    }));

    // Buscar o período para a data de check-in
    const period = await findPeriodForDate(checkIn);
    if (!period) {
      console.warn('No price period found for the selected date.');
      return [];
    }

    // Buscar todos os preços para cada acomodação
    const results: SearchResult[] = [];
    
    for (const accommodation of accommodations) {
      // Buscar preços para esta acomodação e período
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
      
      // Calcular o número de noites e preço total
      let nights: number | null = null;
      let totalPrice: number | null = null;
      if (checkOut) {
        nights = differenceInDays(checkOut, checkIn);
        totalPrice = nights * Number(priceEntry.price_per_night);
      }

      // Verificar restrição de estadia mínima baseada no período
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

    // Ordenar por preço (do mais barato ao mais caro)
    return results.sort((a, b) => a.pricePerNight - b.pricePerNight);
    
  } catch (error) {
    console.error('Error in searchAccommodations:', error);
    return [];
  }
};

// Encontrar o período de preço para uma data específica
export const findPeriodForDate = async (date: Date): Promise<PricePeriod | null> => {
  try {
    // Converter a data para o formato ISO (YYYY-MM-DD)
    const dateString = date.toISOString().split('T')[0];

    // Primeiro verificamos períodos de feriado/especial
    const { data: holidayPeriods, error: holidayError } = await supabase
      .from('price_periods')
      .select('*')
      .eq('is_holiday', true)
      .lte('start_date', dateString)
      .gte('end_date', dateString);

    if (holidayError) {
      console.error('Error fetching holiday periods:', holidayError);
      return null;
    }

    if (holidayPeriods && holidayPeriods.length > 0) {
      const period = holidayPeriods[0];
      return {
        id: period.id,
        name: period.name,
        startDate: new Date(period.start_date),
        endDate: new Date(period.end_date),
        isHoliday: period.is_holiday || false,
        minimumStay: period.minimum_stay || 1
      };
    }

    // Depois verificamos períodos regulares
    const { data: regularPeriods, error: regularError } = await supabase
      .from('price_periods')
      .select('*')
      .eq('is_holiday', false)
      .lte('start_date', dateString)
      .gte('end_date', dateString);

    if (regularError) {
      console.error('Error fetching regular periods:', regularError);
      return null;
    }

    if (regularPeriods && regularPeriods.length > 0) {
      const period = regularPeriods[0];
      return {
        id: period.id,
        name: period.name,
        startDate: new Date(period.start_date),
        endDate: new Date(period.end_date),
        isHoliday: period.is_holiday || false,
        minimumStay: period.minimum_stay || 1
      };
    }

    return null;
  } catch (error) {
    console.error('Error in findPeriodForDate:', error);
    return null;
  }
};

// Buscar todos os períodos de preço
export const getAllPricePeriods = async (): Promise<PricePeriod[]> => {
  try {
    const { data, error } = await supabase
      .from('price_periods')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching price periods:', error);
      return [];
    }
    
    return data.map(period => ({
      id: period.id,
      name: period.name,
      startDate: new Date(period.start_date),
      endDate: new Date(period.end_date),
      isHoliday: period.is_holiday || false,
      minimumStay: period.minimum_stay || 1
    }));
  } catch (error) {
    console.error('Error in getAllPricePeriods:', error);
    return [];
  }
};

// Criar um novo período de preço
export const createPricePeriod = async (period: Omit<PricePeriod, 'id'>): Promise<PricePeriod | null> => {
  try {
    const { data, error } = await supabase
      .from('price_periods')
      .insert({
        name: period.name,
        start_date: period.startDate.toISOString().split('T')[0],
        end_date: period.endDate.toISOString().split('T')[0],
        is_holiday: period.isHoliday,
        minimum_stay: period.minimumStay
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating price period:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      isHoliday: data.is_holiday || false,
      minimumStay: data.minimum_stay || 1
    };
  } catch (error) {
    console.error('Error in createPricePeriod:', error);
    return null;
  }
};

// Atualizar um período de preço existente
export const updatePricePeriod = async (id: string, updates: Partial<PricePeriod>): Promise<PricePeriod | null> => {
  try {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate.toISOString().split('T')[0];
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate.toISOString().split('T')[0];
    if (updates.isHoliday !== undefined) dbUpdates.is_holiday = updates.isHoliday;
    if (updates.minimumStay !== undefined) dbUpdates.minimum_stay = updates.minimumStay;
    
    const { data, error } = await supabase
      .from('price_periods')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating price period:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      isHoliday: data.is_holiday || false,
      minimumStay: data.minimum_stay || 1
    };
  } catch (error) {
    console.error('Error in updatePricePeriod:', error);
    return null;
  }
};

// Excluir um período de preço
export const deletePricePeriod = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('price_periods')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting price period:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePricePeriod:', error);
    return false;
  }
};

// Buscar preços para uma acomodação específica
export const getPricesForAccommodation = async (accommodationId: string): Promise<PriceByPeople[]> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_people')
      .select('*')
      .eq('accommodation_id', accommodationId);
    
    if (error) {
      console.error('Error fetching prices for accommodation:', error);
      return [];
    }
    
    return data.map(price => ({
      id: price.id,
      accommodationId: price.accommodation_id || '',
      periodId: price.period_id || '',
      people: price.people,
      pricePerNight: Number(price.price_per_night),
      includesBreakfast: price.includes_breakfast || false
    }));
  } catch (error) {
    console.error('Error in getPricesForAccommodation:', error);
    return [];
  }
};

// Criar um novo preço
export const createPrice = async (price: Omit<PriceByPeople, 'id'>): Promise<PriceByPeople | null> => {
  try {
    const { data, error } = await supabase
      .from('prices_by_people')
      .insert({
        accommodation_id: price.accommodationId,
        period_id: price.periodId,
        people: price.people,
        price_per_night: price.pricePerNight,
        includes_breakfast: price.includesBreakfast
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating price:', error);
      return null;
    }

    return {
      id: data.id,
      accommodationId: data.accommodation_id || '',
      periodId: data.period_id || '',
      people: data.people,
      pricePerNight: Number(data.price_per_night),
      includesBreakfast: data.includes_breakfast || false
    };
  } catch (error) {
    console.error('Error in createPrice:', error);
    return null;
  }
};

// Atualizar um preço existente
export const updatePrice = async (id: string, updates: Partial<PriceByPeople>): Promise<PriceByPeople | null> => {
  try {
    const dbUpdates: any = {};
    
    if (updates.accommodationId !== undefined) dbUpdates.accommodation_id = updates.accommodationId;
    if (updates.periodId !== undefined) dbUpdates.period_id = updates.periodId;
    if (updates.people !== undefined) dbUpdates.people = updates.people;
    if (updates.pricePerNight !== undefined) dbUpdates.price_per_night = updates.pricePerNight;
    if (updates.includesBreakfast !== undefined) dbUpdates.includes_breakfast = updates.includesBreakfast;
    
    const { data, error } = await supabase
      .from('prices_by_people')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating price:', error);
      return null;
    }

    return {
      id: data.id,
      accommodationId: data.accommodation_id || '',
      periodId: data.period_id || '',
      people: data.people,
      pricePerNight: Number(data.price_per_night),
      includesBreakfast: data.includes_breakfast || false
    };
  } catch (error) {
    console.error('Error in updatePrice:', error);
    return null;
  }
};

// Excluir um preço
export const deletePrice = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prices_by_people')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting price:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePrice:', error);
    return false;
  }
};

// Atualizar preços por categoria
export const updatePricesByCategory = async (
  category: CategoryType,
  periodId: string,
  priceOptions: PriceOption[],
  excludedAccommodationIds: string[] = []
): Promise<boolean> => {
  try {
    // Obter todas as acomodações da categoria que não estão na lista de exceções
    const { data: accommodationsData, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('*')
      .eq('category', category)
      .not('id', 'in', excludedAccommodationIds.length > 0 ? `(${excludedAccommodationIds.join(',')})` : '()');
    
    if (accommodationsError) {
      console.error('Error fetching accommodations for category:', accommodationsError);
      return false;
    }
    
    if (!accommodationsData || accommodationsData.length === 0) {
      return true; // Nenhuma acomodação para atualizar
    }
    
    // Para cada acomodação, atualizar os preços
    for (const accommodation of accommodationsData) {
      // Verificar capacidade da acomodação para determinar quais opções de preço aplicar
      const maxPeopleForAccommodation = accommodation.capacity;
      
      // Para cada opção de preço que não excede a capacidade da acomodação
      for (const option of priceOptions.filter(opt => opt.people <= maxPeopleForAccommodation)) {
        // Verificar se já existe um preço com essas características
        const { data: existingPricesWithBreakfast, error: errorWithBreakfast } = await supabase
          .from('prices_by_people')
          .select('*')
          .eq('accommodation_id', accommodation.id)
          .eq('period_id', periodId)
          .eq('people', option.people)
          .eq('includes_breakfast', true);
          
        if (errorWithBreakfast) {
          console.error('Error checking for existing prices with breakfast:', errorWithBreakfast);
          continue;
        }
        
        const { data: existingPricesWithoutBreakfast, error: errorWithoutBreakfast } = await supabase
          .from('prices_by_people')
          .select('*')
          .eq('accommodation_id', accommodation.id)
          .eq('period_id', periodId)
          .eq('people', option.people)
          .eq('includes_breakfast', false);
          
        if (errorWithoutBreakfast) {
          console.error('Error checking for existing prices without breakfast:', errorWithoutBreakfast);
          continue;
        }
        
        // Atualizar ou criar preço com café da manhã
        if (existingPricesWithBreakfast && existingPricesWithBreakfast.length > 0) {
          await supabase
            .from('prices_by_people')
            .update({ price_per_night: option.withBreakfast })
            .eq('id', existingPricesWithBreakfast[0].id);
        } else {
          await supabase
            .from('prices_by_people')
            .insert({
              accommodation_id: accommodation.id,
              period_id: periodId,
              people: option.people,
              price_per_night: option.withBreakfast,
              includes_breakfast: true
            });
        }
        
        // Atualizar ou criar preço sem café da manhã
        if (existingPricesWithoutBreakfast && existingPricesWithoutBreakfast.length > 0) {
          await supabase
            .from('prices_by_people')
            .update({ price_per_night: option.withoutBreakfast })
            .eq('id', existingPricesWithoutBreakfast[0].id);
        } else {
          await supabase
            .from('prices_by_people')
            .insert({
              accommodation_id: accommodation.id,
              period_id: periodId,
              people: option.people,
              price_per_night: option.withoutBreakfast,
              includes_breakfast: false
            });
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updatePricesByCategory:', error);
    return false;
  }
};
