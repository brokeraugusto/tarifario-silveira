
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserProfile, getUserPermissions, hasModulePermission } from '@/integrations/supabase/services/maintenanceService';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getCurrentUserProfile,
    staleTime: 300000, // 5 minutes
    retry: 2,
    // Add error handling to gracefully handle any remaining RLS issues
    onError: (error) => {
      console.error('Error fetching user profile:', error);
    }
  });
};

export const useUserPermissions = () => {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => getUserPermissions(''),
    staleTime: 300000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching user permissions:', error);
    }
  });
};

export const useModulePermission = (moduleName: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
  return useQuery({
    queryKey: ['module-permission', moduleName, permission],
    queryFn: () => hasModulePermission(moduleName, permission),
    staleTime: 300000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error checking module permission:', error);
    }
  });
};
