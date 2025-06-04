
export type UserRole = 'master' | 'reception' | 'maintenance' | 'cleaning' | 'admin';
export type AreaType = 'accommodation' | 'common' | 'maintenance' | 'restaurant' | 'recreation';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ModulePermission {
  id: string;
  role: UserRole;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
}

export interface Area {
  id: string;
  name: string;
  code: string;
  area_type: AreaType;
  description?: string;
  location?: string;
  is_active: boolean;
  accommodation_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceOrder {
  id: string;
  order_number: string;
  area_id: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  requested_by: string;
  assigned_to?: string;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  area?: Area;
}

export interface MaintenanceHistory {
  id: string;
  maintenance_order_id: string;
  status: MaintenanceStatus;
  notes?: string;
  changed_by: string;
  created_at: string;
}
