-- Remove anonymous access to pricing data
DROP POLICY IF EXISTS "Allow anonymous select on prices_by_category_and_people" ON public.prices_by_category_and_people;

-- Also remove anonymous insert access which shouldn't exist
DROP POLICY IF EXISTS "Allow anonymous insert on prices_by_category_and_people" ON public.prices_by_category_and_people;

-- Ensure only authenticated users can access pricing data
-- This policy already exists but let's make sure it's properly configured
CREATE POLICY IF NOT EXISTS "Authenticated users can view category prices" 
ON public.prices_by_category_and_people 
FOR SELECT 
TO authenticated
USING (true);