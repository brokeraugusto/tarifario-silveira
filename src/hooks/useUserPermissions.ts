
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = () => {
  const query = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      try {
        console.log('Fetching current user profile...');
        
        // Use the security definer function directly
        const { data, error } = await supabase
          .rpc('get_current_user_profile');
        
        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }
        
        console.log('User profile fetched:', data?.[0]);
        return data?.[0] || null;
      } catch (error) {
        console.error('User profile query error:', error);
        throw error;
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  return query;
};

export const useUserPermissions = () => {
  const query = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      try {
        console.log('Fetching user permissions...');
        
        // Get current user role using the security definer function
        const { data: currentRole, error: roleError } = await supabase
          .rpc('get_current_user_role_safe');
        
        if (roleError) {
          console.error('Error fetching user role:', roleError);
          throw roleError;
        }
        
        console.log('Current user role:', currentRole);
        
        if (!currentRole) {
          console.log('No user role found');
          return [];
        }

        // Get permissions based on role
        const { data, error } = await supabase
          .from('module_permissions')
          .select('*')
          .eq('role', currentRole);
        
        if (error) {
          console.error('Error fetching permissions:', error);
          throw error;
        }
        
        console.log('Permissions fetched:', data);
        return data || [];
      } catch (error) {
        console.error('User permissions query error:', error);
        throw error;
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  return query;
};

export const useModulePermission = (moduleName: string, permission: 'view' | 'create' | 'edit' | 'delete') => {
  const query = useQuery({
    queryKey: ['module-permission', moduleName, permission],
    queryFn: async () => {
      try {
        console.log('Checking module permission:', { moduleName, permission });
        
        // Get current user role using the security definer function
        const { data: currentRole, error: roleError } = await supabase
          .rpc('get_current_user_role_safe');
        
        if (roleError) {
          console.error('Error fetching user role for module permission:', roleError);
          throw roleError;
        }
        
        if (!currentRole) {
          console.log('No user role found for module permission');
          return false;
        }

        // Get specific module permission
        const { data, error } = await supabase
          .from('module_permissions')
          .select('*')
          .eq('module_name', moduleName)
          .eq('role', currentRole);
        
        if (error) {
          console.error('Error checking module permission:', error);
          throw error;
        }
        
        const modulePermission = data?.[0];
        if (!modulePermission) {
          console.log('No module permission found');
          return false;
        }
        
        let hasPermission = false;
        switch (permission) {
          case 'view': hasPermission = modulePermission.can_view; break;
          case 'create': hasPermission = modulePermission.can_create; break;
          case 'edit': hasPermission = modulePermission.can_edit; break;
          case 'delete': hasPermission = modulePermission.can_delete; break;
          default: hasPermission = false;
        }
        
        console.log('Module permission result:', hasPermission);
        return hasPermission;
      } catch (error) {
        console.error('Module permission query error:', error);
        throw error;
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  return query;
};
