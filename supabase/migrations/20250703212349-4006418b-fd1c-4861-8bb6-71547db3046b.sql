
-- Primeiro, remover todas as políticas conflitantes na tabela user_profiles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow insert for new users" ON public.user_profiles;
DROP POLICY IF EXISTS "Master can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master users can create profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master users can delete profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master users can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Masters can manage profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Masters can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON public.user_profiles;

-- Criar políticas mais simples e não recursivas
CREATE POLICY "Enable read access for authenticated users" ON public.user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.user_profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.user_profiles
    FOR DELETE USING (auth.role() = 'authenticated');

-- Simplificar também as políticas das outras tabelas para remover dependências recursivas
DROP POLICY IF EXISTS "Admin and master users can delete areas" ON public.areas;
DROP POLICY IF EXISTS "Users with permissions can manage areas" ON public.areas;

CREATE POLICY "Enable all operations for authenticated users on areas" ON public.areas
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin and master users can delete maintenance orders" ON public.maintenance_orders;
DROP POLICY IF EXISTS "Users can manage maintenance orders based on permissions" ON public.maintenance_orders;
DROP POLICY IF EXISTS "Users can view maintenance orders based on permissions" ON public.maintenance_orders;

CREATE POLICY "Enable all operations for authenticated users on maintenance orders" ON public.maintenance_orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Simplificar políticas de preços por categoria
DROP POLICY IF EXISTS "Admin and master can create price rules" ON public.prices_by_category_and_people;
DROP POLICY IF EXISTS "Admin and master can delete price rules" ON public.prices_by_category_and_people;
DROP POLICY IF EXISTS "Admin and master can update price rules" ON public.prices_by_category_and_people;
DROP POLICY IF EXISTS "Users can view price rules" ON public.prices_by_category_and_people;

-- Manter apenas as políticas simples que já funcionam
-- (As políticas "Allow authenticated..." já existem e funcionam bem)
