
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

// Enhanced permission hook with proper role-based access control
export const useModulePermission = (moduleName: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
  const { data: userProfile } = useUserProfile();
  
  return useQuery({
    queryKey: ['module-permission', moduleName, permission, userProfile?.id],
    queryFn: () => {
      if (!userProfile) return false;
      
      // Define permissions by role and module
      const rolePermissions = {
        master: {
          periods: { view: true, create: true, edit: true, delete: true },
          accommodations: { view: true, create: true, edit: true, delete: true },
          maintenance: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, create: true, edit: true, delete: true },
          users: { view: true, create: true, edit: true, delete: true }
        },
        admin: {
          periods: { view: true, create: true, edit: true, delete: true },
          accommodations: { view: true, create: true, edit: true, delete: true },
          maintenance: { view: true, create: true, edit: true, delete: false },
          settings: { view: true, create: false, edit: false, delete: false },
          users: { view: true, create: false, edit: false, delete: false }
        },
        maintenance: {
          periods: { view: true, create: false, edit: false, delete: false },
          accommodations: { view: true, create: false, edit: false, delete: false },
          maintenance: { view: true, create: true, edit: true, delete: false },
          settings: { view: false, create: false, edit: false, delete: false },
          users: { view: false, create: false, edit: false, delete: false }
        },
        reception: {
          periods: { view: true, create: false, edit: false, delete: false },
          accommodations: { view: true, create: false, edit: false, delete: false },
          maintenance: { view: false, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false },
          users: { view: false, create: false, edit: false, delete: false }
        },
        cleaning: {
          periods: { view: false, create: false, edit: false, delete: false },
          accommodations: { view: true, create: false, edit: false, delete: false },
          maintenance: { view: true, create: true, edit: true, delete: false },
          settings: { view: false, create: false, edit: false, delete: false },
          users: { view: false, create: false, edit: false, delete: false }
        }
      };
      
      const userRole = userProfile.role;
      const modulePermissions = rolePermissions[userRole]?.[moduleName];
      
      console.log(`Permission check: ${userRole} -> ${moduleName} -> ${permission}:`, modulePermissions?.[permission]);
      
      return modulePermissions?.[permission] || false;
    },
    enabled: !!userProfile,
  });
};
