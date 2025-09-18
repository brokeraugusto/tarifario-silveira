-- Fix function search path security warnings by setting proper search_path
-- Update all functions to have secure search_path settings

-- Fix is_current_user_master function
CREATE OR REPLACE FUNCTION public.is_current_user_master()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'master' AND is_active = true
  );
$function$;

-- Fix is_current_user_admin_or_master function  
CREATE OR REPLACE FUNCTION public.is_current_user_admin_or_master()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('master', 'admin') AND is_active = true
  );
$function$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() AND role = required_role AND is_active = true
  );
$function$;

-- Fix get_current_user_role_safe function
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COALESCE(
    (SELECT up.role FROM public.user_profiles up
     WHERE up.id = auth.uid()),
    'reception'::user_role
  );
$function$;

-- Fix get_all_user_profiles function
CREATE OR REPLACE FUNCTION public.get_all_user_profiles()
RETURNS TABLE(id uuid, email text, full_name text, role user_role, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.is_active,
    up.created_at,
    up.updated_at,
    up.created_by
  FROM public.user_profiles up;
$function$;

-- Fix get_current_user_profile function
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE(id uuid, email text, full_name text, role user_role, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.is_active,
    up.created_at,
    up.updated_at,
    up.created_by
  FROM public.user_profiles up
  WHERE up.id = auth.uid();
$function$;

-- Fix is_user_admin_or_master function
CREATE OR REPLACE FUNCTION public.is_user_admin_or_master()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    JOIN public.user_profiles up ON au.id = up.id
    WHERE au.id = auth.uid() 
    AND up.role IN ('master', 'admin')
  );
$function$;

-- Fix get_compatible_prices function
CREATE OR REPLACE FUNCTION public.get_compatible_prices(p_category text, p_capacity integer, p_period_id uuid, p_guests integer)
RETURNS TABLE(id uuid, category text, number_of_people integer, payment_method payment_method, period_id uuid, price_per_night numeric, min_nights integer)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT 
    pbcp.id,
    pbcp.category,
    pbcp.number_of_people,
    pbcp.payment_method,
    pbcp.period_id,
    pbcp.price_per_night,
    pbcp.min_nights
  FROM public.prices_by_category_and_people pbcp
  WHERE pbcp.category = p_category
    AND pbcp.period_id = p_period_id
    AND pbcp.number_of_people = p_guests
    AND pbcp.number_of_people <= p_capacity;
$function$;