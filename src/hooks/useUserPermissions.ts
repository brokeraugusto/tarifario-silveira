
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserProfile, getUserPermissions, hasModulePermission } from '@/integrations/supabase/services/maintenanceService';

export const useUserProfile = () => {
  const query = useQuery({
    queryKey: ['user-profile'],
    queryFn: getCurrentUserProfile,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });

  // Handle errors through logging
  if (query.error) {
    console.error('Error fetching user profile:', query.error);
  }

  return query;
};

export const useUserPermissions = () => {
  const query = useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => getUserPermissions(''),
    staleTime: 300000, // 5 minutes
    retry: 2,
  });

  // Handle errors through logging
  if (query.error) {
    console.error('Error fetching user permissions:', query.error);
  }

  return query;
};

export const useModulePermission = (moduleName: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
  const query = useQuery({
    queryKey: ['module-permission', moduleName, permission],
    queryFn: () => hasModulePermission(moduleName, permission),
    staleTime: 300000, // 5 minutes
    retry: 2,
  });

  // Handle errors through logging
  if (query.error) {
    console.error('Error checking module permission:', query.error);
  }

  return query;
};
