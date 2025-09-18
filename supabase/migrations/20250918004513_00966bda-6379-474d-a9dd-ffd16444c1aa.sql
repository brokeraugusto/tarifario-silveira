-- Remove anonymous access to pricing data
DROP POLICY IF EXISTS "Allow anonymous select on prices_by_category_and_people" ON public.prices_by_category_and_people;

-- Also remove anonymous insert access which shouldn't exist
DROP POLICY IF EXISTS "Allow anonymous insert on prices_by_category_and_people" ON public.prices_by_category_and_people;

-- Ensure only authenticated users can access pricing data (the existing policy already covers this)
-- The "All users can view category prices" policy with auth.role() = 'authenticated' already exists