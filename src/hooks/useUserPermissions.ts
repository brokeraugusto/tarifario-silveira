
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = () => {
  const query = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      try {
        // Use the security definer function directly
        const { data, error } = await supabase
          .rpc('get_current_user_profile');
        
        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }
        
        return data?.[0] || null;
      } catch (error) {
        console.error('User profile query error:', error);
        throw error;
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 1, // Reduce retries to avoid infinite loops
    retryDelay: 1000,
  });

  return query;
};

export const useUserPermissions = () => {
  const query = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      try {
        // Get user profile first
        const { data: userProfile, error: profileError } = await supabase
          .rpc('get_current_user_profile');
        
        if (profileError) {
          console.error('Error fetching user profile for permissions:', profileError);
          throw profileError;
        }
        
        if (!userProfile?.[0]) {
          console.log('No user profile found');
          return [];
        }

        // Get permissions based on role
        const { data, error } = await supabase
          .from('module_permissions')
          .select('*')
          .eq('role', userProfile[0].role);
        
        if (error) {
          console.error('Error fetching permissions:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('User permissions query error:', error);
        throw error;
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 1, // Reduce retries to avoid infinite loops
    retryDelay: 1000,
  });

  return query;
};

export const useModulePermission = (moduleName: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
  const query = useQuery({
    queryKey: ['module-permission', moduleName, permission],
    queryFn: async () => {
      try {
        // Get user profile first
        const { data: userProfile, error: profileError } = await supabase
          .rpc('get_current_user_profile');
        
        if (profileError) {
          console.error('Error fetching user profile for module permission:', profileError);
          throw profileError;
        }
        
        if (!userProfile?.[0]) {
          console.log('No user profile found for module permission');
          return false;
        }

        // Get specific module permission
        const { data, error } = await supabase
          .from('module_permissions')
          .select('*')
          .eq('module_name', moduleName)
          .eq('role', userProfile[0].role);
        
        if (error) {
          console.error('Error checking module permission:', error);
          throw error;
        }
        
        const modulePermission = data?.[0];
        if (!modulePermission) {
          console.log('No module permission found');
          return false;
        }
        
        switch (permission) {
          case 'view': return modulePermission.can_view;
          case 'create': return modulePermission.can_create;
          case 'edit': return modulePermission.can_edit;
          case 'delete': return modulePermission.can_delete;
          default: return false;
        }
      } catch (error) {
        console.error('Module permission query error:', error);
        throw error;
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 1, // Reduce retries to avoid infinite loops
    retryDelay: 1000,
  });

  return query;
};
