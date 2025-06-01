
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = () => {
  const query = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      // Use the security definer function directly
      const { data, error } = await supabase
        .rpc('get_current_user_profile');
      
      if (error) throw error;
      return data?.[0] || null;
    },
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
    queryFn: async () => {
      const { data: userProfile } = await supabase
        .rpc('get_current_user_profile');
      
      if (!userProfile?.[0]) return [];

      const { data, error } = await supabase
        .from('module_permissions')
        .select('*')
        .eq('role', userProfile[0].role);
      
      if (error) throw error;
      return data || [];
    },
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
    queryFn: async () => {
      const { data: userProfile } = await supabase
        .rpc('get_current_user_profile');
      
      if (!userProfile?.[0]) return false;

      const { data, error } = await supabase
        .from('module_permissions')
        .select('*')
        .eq('module_name', moduleName)
        .eq('role', userProfile[0].role);
      
      if (error) throw error;
      
      const modulePermission = data?.[0];
      if (!modulePermission) return false;
      
      switch (permission) {
        case 'view': return modulePermission.can_view;
        case 'create': return modulePermission.can_create;
        case 'edit': return modulePermission.can_edit;
        case 'delete': return modulePermission.can_delete;
        default: return false;
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 2,
  });

  // Handle errors through logging
  if (query.error) {
    console.error('Error checking module permission:', query.error);
  }

  return query;
};
