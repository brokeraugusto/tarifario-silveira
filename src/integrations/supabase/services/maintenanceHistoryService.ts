
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
      .select('*')
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
      .select('*')
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

    // Note: Area filtering would need to be implemented by joining with maintenance_orders
    // For now, we'll skip this filter since we're not loading related data

    return filteredData;
  } catch (error) {
    console.error('Error in getMaintenanceHistoryWithFilters:', error);
    return [];
  }
};
