
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserProfile, getAllUserProfiles } from '@/integrations/supabase/services/maintenanceService';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getCurrentUserProfile,
  });
};

export const useAllUserProfiles = () => {
  return useQuery({
    queryKey: ['all-user-profiles'],
    queryFn: getAllUserProfiles,
  });
};

// Simplified permission hook - for now just check if user exists
export const useModulePermission = (moduleName: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
  const { data: userProfile } = useUserProfile();
  
  return useQuery({
    queryKey: ['module-permission', moduleName, permission, userProfile?.id],
    queryFn: () => {
      // For now, give all authenticated users full permissions
      // This can be enhanced later with proper role-based permissions
      return userProfile ? true : false;
    },
    enabled: !!userProfile,
  });
};
