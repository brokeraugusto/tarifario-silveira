-- Insert user profile for the current user
INSERT INTO public.user_profiles (id, email, full_name, role, created_by, is_active)
VALUES (
  'd26ac6fd-7f24-41fd-81a7-ebd6e66b31d6',
  'recepcaomorrodasilveira@gmail.com',
  'Recepção Morro da Silveira',
  'master',
  'd26ac6fd-7f24-41fd-81a7-ebd6e66b31d6',
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;