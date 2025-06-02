
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, ModulePermission, Area, MaintenanceOrder, MaintenanceHistory, AreaType } from '@/types/maintenance';

// User Profile Services
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return null;
  }
};

export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('full_name');
    
    if (error) {
      console.error('Error fetching all user profiles:', error);
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
      .update(updates)
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

// Module Permissions Services
export const getUserPermissions = async (userId: string): Promise<ModulePermission[]> => {
  try {
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) return [];

    const { data, error } = await supabase
      .from('module_permissions')
      .select('*')
      .eq('role', userProfile.role);
    
    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    return [];
  }
};

export const hasModulePermission = async (moduleName: string, permission: 'view' | 'create' | 'edit' | 'delete'): Promise<boolean> => {
  try {
    const permissions = await getUserPermissions('');
    const modulePermission = permissions.find(p => p.module_name === moduleName);
    
    if (!modulePermission) return true; // Default to true for now
    
    switch (permission) {
      case 'view': return modulePermission.can_view;
      case 'create': return modulePermission.can_create;
      case 'edit': return modulePermission.can_edit;
      case 'delete': return modulePermission.can_delete;
      default: return false;
    }
  } catch (error) {
    console.error('Error in hasModulePermission:', error);
    return true; // Default to true on error
  }
};

// Areas Services
export const getAllAreas = async (): Promise<Area[]> => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
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

export const getAreasByType = async (areaType: AreaType): Promise<Area[]> => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('area_type', areaType)
      .order('name');
    
    if (error) {
      console.error('Error fetching areas by type:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAreasByType:', error);
    return [];
  }
};

export const createArea = async (area: Omit<Area, 'id' | 'created_at' | 'updated_at'>): Promise<Area | null> => {
  try {
    const { data, error } = await supabase
      .from('areas')
      .insert(area)
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
      .update(updates)
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

// Maintenance Orders Services
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

export const getMaintenanceOrderById = async (id: string): Promise<MaintenanceOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_orders')
      .select(`
        *,
        area:areas(*)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching maintenance order:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getMaintenanceOrderById:', error);
    return null;
  }
};

// Define a more specific type for creating maintenance orders
type CreateMaintenanceOrderInput = {
  area_id: string;
  title: string;
  description: string;
  priority: MaintenanceOrder['priority'];
  status?: MaintenanceOrder['status'];
  requested_by: string;
  assigned_to?: string;
  scheduled_date?: string;
  estimated_hours?: number;
  notes?: string;
  order_number?: string; // Made optional since it's auto-generated
};

export const createMaintenanceOrder = async (order: CreateMaintenanceOrderInput): Promise<MaintenanceOrder | null> => {
  try {
    // Prepare the data with a placeholder order_number that will be overridden by the trigger
    const orderData = {
      ...order,
      order_number: order.order_number || 'TEMP' // Placeholder that gets replaced by trigger
    };

    const { data, error } = await supabase
      .from('maintenance_orders')
      .insert(orderData)
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

export const updateMaintenanceOrder = async (id: string, updates: Partial<MaintenanceOrder>): Promise<MaintenanceOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_orders')
      .update(updates)
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

// Maintenance History Services
export const getMaintenanceHistory = async (orderId: string): Promise<MaintenanceHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_history')
      .select('*')
      .eq('maintenance_order_id', orderId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching maintenance history:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getMaintenanceHistory:', error);
    return [];
  }
};

export const addMaintenanceHistory = async (history: Omit<MaintenanceHistory, 'id' | 'created_at'>): Promise<MaintenanceHistory | null> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_history')
      .insert(history)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding maintenance history:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in addMaintenanceHistory:', error);
    return null;
  }
};
