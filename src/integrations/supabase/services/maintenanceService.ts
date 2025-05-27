
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, ModulePermission, Area, MaintenanceOrder, MaintenanceHistory } from '@/types/maintenance';

// User Profile Services
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('full_name');
  
  if (error) throw error;
  return data || [];
};

export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Module Permissions Services
export const getUserPermissions = async (userId: string): Promise<ModulePermission[]> => {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) throw new Error('User not found');

  const { data, error } = await supabase
    .from('module_permissions')
    .select('*')
    .eq('role', userProfile.role);
  
  if (error) throw error;
  return data || [];
};

export const hasModulePermission = async (moduleName: string, permission: 'view' | 'create' | 'edit' | 'delete'): Promise<boolean> => {
  const permissions = await getUserPermissions('');
  const modulePermission = permissions.find(p => p.module_name === moduleName);
  
  if (!modulePermission) return false;
  
  switch (permission) {
    case 'view': return modulePermission.can_view;
    case 'create': return modulePermission.can_create;
    case 'edit': return modulePermission.can_edit;
    case 'delete': return modulePermission.can_delete;
    default: return false;
  }
};

// Areas Services
export const getAllAreas = async (): Promise<Area[]> => {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const getAreasByType = async (areaType: string): Promise<Area[]> => {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .eq('area_type', areaType)
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createArea = async (area: Omit<Area, 'id' | 'created_at' | 'updated_at'>): Promise<Area> => {
  const { data, error } = await supabase
    .from('areas')
    .insert(area)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateArea = async (id: string, updates: Partial<Area>): Promise<Area> => {
  const { data, error } = await supabase
    .from('areas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteArea = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('areas')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Maintenance Orders Services
export const getAllMaintenanceOrders = async (): Promise<MaintenanceOrder[]> => {
  const { data, error } = await supabase
    .from('maintenance_orders')
    .select(`
      *,
      area:areas(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getMaintenanceOrderById = async (id: string): Promise<MaintenanceOrder | null> => {
  const { data, error } = await supabase
    .from('maintenance_orders')
    .select(`
      *,
      area:areas(*)
    `)
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createMaintenanceOrder = async (order: Omit<MaintenanceOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<MaintenanceOrder> => {
  const { data, error } = await supabase
    .from('maintenance_orders')
    .insert(order)
    .select(`
      *,
      area:areas(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateMaintenanceOrder = async (id: string, updates: Partial<MaintenanceOrder>): Promise<MaintenanceOrder> => {
  const { data, error } = await supabase
    .from('maintenance_orders')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      area:areas(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteMaintenanceOrder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('maintenance_orders')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Maintenance History Services
export const getMaintenanceHistory = async (orderId: string): Promise<MaintenanceHistory[]> => {
  const { data, error } = await supabase
    .from('maintenance_history')
    .select('*')
    .eq('maintenance_order_id', orderId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addMaintenanceHistory = async (history: Omit<MaintenanceHistory, 'id' | 'created_at'>): Promise<MaintenanceHistory> => {
  const { data, error } = await supabase
    .from('maintenance_history')
    .insert(history)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
