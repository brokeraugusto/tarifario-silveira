
import { supabase } from '../client';
import { MaintenanceHistory, MaintenanceStatus } from '@/types/maintenance';

export const createMaintenanceHistory = async (
  maintenanceOrderId: string,
  status: MaintenanceStatus,
  notes?: string,
  changedBy?: string
): Promise<MaintenanceHistory | null> => {
  try {
    const userId = changedBy || (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      console.error('No user ID available for maintenance history');
      return null;
    }

    const { data, error } = await supabase
      .from('maintenance_history')
      .insert({
        maintenance_order_id: maintenanceOrderId,
        status,
        notes,
        changed_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating maintenance history:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createMaintenanceHistory:', error);
    return null;
  }
};

export const getMaintenanceHistory = async (
  maintenanceOrderId?: string
): Promise<MaintenanceHistory[]> => {
  try {
    let query = supabase
      .from('maintenance_history')
      .select(`
        *,
        changed_by_profile:user_profiles!maintenance_history_changed_by_fkey(full_name),
        maintenance_order:maintenance_orders(
          title,
          area:areas(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (maintenanceOrderId) {
      query = query.eq('maintenance_order_id', maintenanceOrderId);
    }

    const { data, error } = await query;

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

export const getMaintenanceHistoryWithFilters = async (filters: {
  startDate?: string;
  endDate?: string;
  responsible?: string;
  areaId?: string;
}): Promise<MaintenanceHistory[]> => {
  try {
    let query = supabase
      .from('maintenance_history')
      .select(`
        *,
        changed_by_profile:user_profiles!maintenance_history_changed_by_fkey(full_name),
        maintenance_order:maintenance_orders(
          title,
          area:areas(name, id)
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters.responsible) {
      query = query.eq('changed_by', filters.responsible);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching filtered maintenance history:', error);
      return [];
    }

    let filteredData = data || [];

    // Filter by area if specified
    if (filters.areaId) {
      filteredData = filteredData.filter(
        item => item.maintenance_order?.area?.id === filters.areaId
      );
    }

    return filteredData;
  } catch (error) {
    console.error('Error in getMaintenanceHistoryWithFilters:', error);
    return [];
  }
};
