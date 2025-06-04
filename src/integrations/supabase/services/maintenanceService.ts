import { supabase } from '../client';
import { 
  MaintenanceOrder, 
  Area, 
  UserProfile, 
  MaintenancePriority, 
  MaintenanceStatus,
  AreaType 
} from '@/types/maintenance';

// User profile functions
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase.rpc('get_current_user_profile');
    
    if (error) {
      console.error('Error getting current user profile:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return null;
  }
};

export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase.rpc('get_all_user_profiles');
    
    if (error) {
      console.error('Error getting all user profiles:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllUserProfiles:', error);
    return [];
  }
};

export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        full_name: updates.full_name,
        email: updates.email,
        role: updates.role,
        is_active: updates.is_active
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

// Area management functions
export const getAllAreas = async (): Promise<Area[]> => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching areas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllAreas:', error);
    return [];
  }
};

export const createArea = async (areaData: Omit<Area, 'id' | 'created_at' | 'updated_at'>): Promise<Area | null> => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .insert({
        name: areaData.name,
        code: areaData.code,
        area_type: areaData.area_type,
        description: areaData.description,
        location: areaData.location,
        is_active: areaData.is_active,
        accommodation_id: areaData.accommodation_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating area:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createArea:', error);
    return null;
  }
};

export const updateArea = async (id: string, updates: Partial<Area>): Promise<Area | null> => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .update({
        name: updates.name,
        code: updates.code,
        area_type: updates.area_type,
        description: updates.description,
        location: updates.location,
        is_active: updates.is_active,
        accommodation_id: updates.accommodation_id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating area:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateArea:', error);
    return null;
  }
};

export const deleteArea = async (id: string): Promise<boolean> => {
  try {
    // Check if area has active maintenance orders
    const { data: orders, error: ordersError } = await supabase
      .from('maintenance_orders')
      .select('id')
      .eq('area_id', id)
      .in('status', ['pending', 'in_progress']);

    if (ordersError) {
      console.error('Error checking maintenance orders:', ordersError);
      return false;
    }

    if (orders && orders.length > 0) {
      throw new Error('Cannot delete area with active maintenance orders');
    }

    const { error } = await supabase
      .from('areas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting area:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteArea:', error);
    return false;
  }
};

// Maintenance order functions
export const getAllMaintenanceOrders = async (): Promise<MaintenanceOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_orders')
      .select(`
        *,
        area:areas(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllMaintenanceOrders:', error);
    return [];
  }
};

export const createMaintenanceOrder = async (orderData: {
  title: string;
  description: string;
  area_id: string;
  priority: MaintenancePriority;
  requested_by: string;
  assigned_to?: string;
  scheduled_date?: string;
  estimated_hours?: number;
  notes?: string;
}): Promise<MaintenanceOrder | null> => {
  try {
    // Generate order number
    const orderNumber = `MNT-${Date.now()}`;

    const { data, error } = await supabase
      .from('maintenance_orders')
      .insert({
        order_number: orderNumber,
        title: orderData.title,
        description: orderData.description,
        area_id: orderData.area_id,
        priority: orderData.priority,
        requested_by: orderData.requested_by,
        assigned_to: orderData.assigned_to,
        scheduled_date: orderData.scheduled_date,
        estimated_hours: orderData.estimated_hours,
        notes: orderData.notes,
        status: 'pending'
      })
      .select(`
        *,
        area:areas(*)
      `)
      .single();

    if (error) {
      console.error('Error creating maintenance order:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createMaintenanceOrder:', error);
    return null;
  }
};

export const updateMaintenanceOrder = async (
  id: string, 
  updates: Partial<MaintenanceOrder>
): Promise<MaintenanceOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_orders')
      .update({
        title: updates.title,
        description: updates.description,
        area_id: updates.area_id,
        priority: updates.priority,
        status: updates.status,
        assigned_to: updates.assigned_to,
        scheduled_date: updates.scheduled_date,
        started_at: updates.started_at,
        completed_at: updates.completed_at,
        estimated_hours: updates.estimated_hours,
        actual_hours: updates.actual_hours,
        cost: updates.cost,
        notes: updates.notes
      })
      .eq('id', id)
      .select(`
        *,
        area:areas(*)
      `)
      .single();

    if (error) {
      console.error('Error updating maintenance order:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateMaintenanceOrder:', error);
    return null;
  }
};

export const deleteMaintenanceOrder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('maintenance_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting maintenance order:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMaintenanceOrder:', error);
    return false;
  }
};
