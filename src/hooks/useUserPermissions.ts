
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserProfile, getUserPermissions, hasModulePermission } from '@/integrations/supabase/services/maintenanceService';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getCurrentUserProfile,
  });
};

export const useUserPermissions = () => {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => getUserPermissions(''),
  });
};

export const useModulePermission = (moduleName: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
  return useQuery({
    queryKey: ['module-permission', moduleName, permission],
    queryFn: () => hasModulePermission(moduleName, permission),
  });
};
