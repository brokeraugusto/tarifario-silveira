-- Create enum types for reservations
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  accommodation_id UUID NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INTEGER NOT NULL,
  includes_breakfast BOOLEAN NOT NULL DEFAULT false,
  total_price NUMERIC NOT NULL,
  payment_method payment_method NOT NULL,
  status reservation_status NOT NULL DEFAULT 'pending',
  google_event_id TEXT,
  created_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT positive_guests CHECK (number_of_guests > 0),
  CONSTRAINT positive_price CHECK (total_price >= 0)
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create policies for reservations
CREATE POLICY "All authenticated users can view reservations" 
ON public.reservations 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can create reservations" 
ON public.reservations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "All authenticated users can update reservations" 
ON public.reservations 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and master can delete reservations" 
ON public.reservations 
FOR DELETE 
USING (is_current_user_admin_or_master());

-- Add trigger for updated_at
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint (accommodations table exists)
ALTER TABLE public.reservations 
ADD CONSTRAINT fk_reservations_accommodation 
FOREIGN KEY (accommodation_id) REFERENCES public.accommodations(id) ON DELETE RESTRICT;

-- Add foreign key constraint for created_by
ALTER TABLE public.reservations 
ADD CONSTRAINT fk_reservations_created_by 
FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE RESTRICT;

-- Create index for better performance
CREATE INDEX idx_reservations_accommodation_id ON public.reservations(accommodation_id);
CREATE INDEX idx_reservations_dates ON public.reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservations_status ON public.reservations(status);

-- Function to check reservation availability
CREATE OR REPLACE FUNCTION public.check_reservation_availability(
  p_accommodation_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_exclude_reservation_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.accommodation_id = p_accommodation_id
    AND r.status IN ('confirmed', 'pending')
    AND (p_exclude_reservation_id IS NULL OR r.id != p_exclude_reservation_id)
    AND (
      (p_check_in >= r.check_in_date AND p_check_in < r.check_out_date) OR
      (p_check_out > r.check_in_date AND p_check_out <= r.check_out_date) OR
      (p_check_in <= r.check_in_date AND p_check_out >= r.check_out_date)
    )
  );
$$;