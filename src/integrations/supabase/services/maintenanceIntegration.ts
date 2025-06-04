
import { supabase } from '../client';
import { Accommodation } from '@/types';

/**
 * Service to handle integration between maintenance and accommodation modules
 */

// Check if an accommodation has active maintenance orders
export const hasActiveMaintenanceOrders = async (accommodationId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_orders')
      .select('id, areas!inner(accommodation_id)')
      .eq('areas.accommodation_id', accommodationId)
      .in('status', ['pending', 'in_progress']);

    if (error) {
      console.error('Error checking maintenance orders:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in hasActiveMaintenanceOrders:', error);
    return false;
  }
};

// Get all accommodations that are available (not blocked and no active maintenance)
export const getAvailableAccommodations = async (): Promise<Accommodation[]> => {
  try {
    const { data: accommodationsData, error } = await supabase
      .from('accommodations')
      .select('*')
      .or('is_blocked.is.null,is_blocked.eq.false');

    if (error) {
      console.error('Error fetching accommodations:', error);
      return [];
    }

    if (!accommodationsData) {
      return [];
    }

    // Filter out accommodations with active maintenance orders
    const availableAccommodations = [];
    
    for (const accommodationData of accommodationsData) {
      const hasActiveMaintenance = await hasActiveMaintenanceOrders(accommodationData.id);
      
      if (!hasActiveMaintenance) {
        // Map database format to application format
        const accommodation: Accommodation = {
          id: accommodationData.id,
          name: accommodationData.name,
          roomNumber: accommodationData.room_number,
          category: accommodationData.category as any,
          capacity: accommodationData.capacity,
          description: accommodationData.description,
          imageUrl: accommodationData.image_url || '',
          images: accommodationData.images || [],
          albumUrl: accommodationData.album_url || undefined,
          isBlocked: accommodationData.is_blocked || false,
          blockReason: accommodationData.block_reason as any,
          blockNote: accommodationData.block_note || undefined,
          blockPeriod: accommodationData.block_period ? {
            from: new Date((accommodationData.block_period as any).from),
            to: new Date((accommodationData.block_period as any).to)
          } : undefined
        };
        
        availableAccommodations.push(accommodation);
      }
    }

    return availableAccommodations;
  } catch (error) {
    console.error('Error in getAvailableAccommodations:', error);
    return [];
  }
};

// Get maintenance orders for a specific accommodation
export const getMaintenanceOrdersForAccommodation = async (accommodationId: string) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_orders')
      .select(`
        *,
        areas!inner(
          id,
          name,
          code,
          area_type,
          accommodation_id
        )
      `)
      .eq('areas.accommodation_id', accommodationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance orders for accommodation:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMaintenanceOrdersForAccommodation:', error);
    return [];
  }
};

// Create a maintenance order for an accommodation when it's blocked
export const createMaintenanceOrderForBlocking = async (
  accommodationId: string,
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
) => {
  try {
    // First, ensure there's an area for this accommodation
    let { data: area, error: areaError } = await supabase
      .from('areas')
      .select('id')
      .eq('accommodation_id', accommodationId)
      .eq('area_type', 'accommodation')
      .single();

    if (areaError || !area) {
      // Create area if it doesn't exist
      const { data: accommodationData } = await supabase
        .from('accommodations')
        .select('name, room_number')
        .eq('id', accommodationId)
        .single();

      if (accommodationData) {
        const { data: newArea, error: createAreaError } = await supabase
          .from('areas')
          .insert({
            name: accommodationData.name,
            code: accommodationData.room_number,
            area_type: 'accommodation',
            accommodation_id: accommodationId,
            description: `Área da acomodação ${accommodationData.name}`,
            is_active: true
          })
          .select('id')
          .single();

        if (createAreaError || !newArea) {
          console.error('Error creating area for accommodation:', createAreaError);
          return null;
        }

        area = newArea;
      } else {
        console.error('Could not find accommodation for area creation');
        return null;
      }
    }

    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    // Generate order number
    const orderNumber = `MNT-${Date.now()}`;

    // Create maintenance order
    const { data, error } = await supabase
      .from('maintenance_orders')
      .insert({
        order_number: orderNumber,
        area_id: area.id,
        title,
        description,
        priority,
        status: 'pending',
        requested_by: userId,
        notes: 'Ordem criada automaticamente pelo bloqueio da acomodação'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating maintenance order:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createMaintenanceOrderForBlocking:', error);
    return null;
  }
};

// Ensure areas exist for all accommodations
export const ensureAreasForAccommodations = async (): Promise<void> => {
  try {
    // Get all accommodations
    const { data: accommodations, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('id, name, room_number');

    if (accommodationsError || !accommodations) {
      console.error('Error fetching accommodations:', accommodationsError);
      return;
    }

    // Get existing areas for accommodations
    const { data: existingAreas, error: areasError } = await supabase
      .from('areas')
      .select('accommodation_id')
      .eq('area_type', 'accommodation')
      .not('accommodation_id', 'is', null);

    if (areasError) {
      console.error('Error fetching existing areas:', areasError);
      return;
    }

    const existingAccommodationIds = new Set(
      existingAreas?.map(area => area.accommodation_id) || []
    );

    // Create areas for accommodations that don't have them
    const areasToCreate = accommodations
      .filter(acc => !existingAccommodationIds.has(acc.id))
      .map(acc => ({
        name: acc.name,
        code: acc.room_number,
        area_type: 'accommodation' as const,
        accommodation_id: acc.id,
        description: `Área da acomodação ${acc.name}`,
        is_active: true
      }));

    if (areasToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('areas')
        .insert(areasToCreate);

      if (insertError) {
        console.error('Error creating areas for accommodations:', insertError);
      } else {
        console.log(`Created ${areasToCreate.length} areas for accommodations`);
      }
    }
  } catch (error) {
    console.error('Error in ensureAreasForAccommodations:', error);
  }
};
