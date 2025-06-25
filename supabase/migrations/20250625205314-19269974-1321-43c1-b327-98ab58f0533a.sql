
-- Drop existing policies more carefully, ignoring errors if they don't exist
DO $$
BEGIN
    -- Drop user_profiles policies if they exist
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Master users can view all profiles" ON public.user_profiles;
    DROP POLICY IF EXISTS "Master users can update all profiles" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Master can view all profiles" ON public.user_profiles;
    DROP POLICY IF EXISTS "Master can update all profiles" ON public.user_profiles;
    
    -- Drop prices_by_category_and_people policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated users to select prices" ON public.prices_by_category_and_people;
    DROP POLICY IF EXISTS "Allow authenticated users to insert prices" ON public.prices_by_category_and_people;
    DROP POLICY IF EXISTS "Allow authenticated users to update prices" ON public.prices_by_category_and_people;
    DROP POLICY IF EXISTS "Allow authenticated users to delete prices" ON public.prices_by_category_and_people;
    DROP POLICY IF EXISTS "Allow authenticated select on category prices" ON public.prices_by_category_and_people;
    DROP POLICY IF EXISTS "Allow authenticated insert on category prices" ON public.prices_by_category_and_people;
    DROP POLICY IF EXISTS "Allow authenticated update on category prices" ON public.prices_by_category_and_people;
    DROP POLICY IF EXISTS "Allow authenticated delete on category prices" ON public.prices_by_category_and_people;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors from dropping non-existent policies
END $$;

-- Create clean, simple policies for user_profiles using existing security definer functions
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Master can view all profiles" ON public.user_profiles
  FOR SELECT USING (public.is_current_user_master());

CREATE POLICY "Master can update all profiles" ON public.user_profiles
  FOR UPDATE USING (public.is_current_user_master());

-- Create simple policies for prices_by_category_and_people without user profile checks
CREATE POLICY "Allow authenticated select on category prices" ON public.prices_by_category_and_people
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on category prices" ON public.prices_by_category_and_people
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on category prices" ON public.prices_by_category_and_people
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on category prices" ON public.prices_by_category_and_people
  FOR DELETE TO authenticated USING (true);
