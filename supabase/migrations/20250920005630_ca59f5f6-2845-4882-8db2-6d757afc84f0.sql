-- Create guests table for guest management
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  document_number TEXT,
  document_type TEXT DEFAULT 'cpf',
  date_of_birth DATE,
  nationality TEXT DEFAULT 'Brasil',
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip_code TEXT,
  address_country TEXT DEFAULT 'Brasil',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferences JSONB DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS on guests table
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Create policies for guests table
CREATE POLICY "All authenticated users can view guests" 
ON public.guests 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can create guests" 
ON public.guests 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "All authenticated users can update guests" 
ON public.guests 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and master can delete guests" 
ON public.guests 
FOR DELETE 
USING (is_current_user_admin_or_master());

-- Add guest_id to reservations table
ALTER TABLE public.reservations ADD COLUMN guest_id UUID REFERENCES public.guests(id);

-- Create index for better performance
CREATE INDEX idx_guests_email ON public.guests(email);
CREATE INDEX idx_guests_created_by ON public.guests(created_by);
CREATE INDEX idx_reservations_guest_id ON public.reservations(guest_id);

-- Create trigger for automatic timestamp updates on guests
CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for occupancy map data
CREATE OR REPLACE VIEW public.occupancy_map_view AS
SELECT 
  a.id as accommodation_id,
  a.name as accommodation_name,
  a.room_number,
  a.category,
  a.capacity,
  a.is_blocked,
  a.block_reason,
  a.block_note,
  r.id as reservation_id,
  r.check_in_date,
  r.check_out_date,
  r.status as reservation_status,
  r.guest_name,
  r.number_of_guests,
  g.first_name as guest_first_name,
  g.last_name as guest_last_name,
  g.email as guest_email,
  g.phone as guest_phone
FROM public.accommodations a
LEFT JOIN public.reservations r ON a.id = r.accommodation_id 
  AND r.status IN ('confirmed', 'pending', 'checked_in')
LEFT JOIN public.guests g ON r.guest_id = g.id
ORDER BY a.room_number, r.check_in_date;

-- Create function to get occupancy data for date range
CREATE OR REPLACE FUNCTION public.get_occupancy_data(
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE DEFAULT CURRENT_DATE + INTERVAL '30 days'
)
RETURNS TABLE(
  accommodation_id UUID,
  accommodation_name TEXT,
  room_number TEXT,
  category TEXT,
  capacity INTEGER,
  is_blocked BOOLEAN,
  block_reason TEXT,
  date_value DATE,
  reservation_id UUID,
  reservation_status reservation_status,
  guest_name TEXT,
  guest_first_name TEXT,
  guest_last_name TEXT,
  number_of_guests INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS date_value
  ),
  accommodation_dates AS (
    SELECT 
      a.id as accommodation_id,
      a.name as accommodation_name,
      a.room_number,
      a.category,
      a.capacity,
      a.is_blocked,
      a.block_reason,
      ds.date_value
    FROM public.accommodations a
    CROSS JOIN date_series ds
  )
  SELECT 
    ad.accommodation_id,
    ad.accommodation_name,
    ad.room_number,
    ad.category,
    ad.capacity,
    ad.is_blocked,
    ad.block_reason,
    ad.date_value,
    r.id as reservation_id,
    r.status as reservation_status,
    r.guest_name,
    g.first_name as guest_first_name,
    g.last_name as guest_last_name,
    r.number_of_guests
  FROM accommodation_dates ad
  LEFT JOIN public.reservations r ON ad.accommodation_id = r.accommodation_id
    AND ad.date_value >= r.check_in_date 
    AND ad.date_value < r.check_out_date
    AND r.status IN ('confirmed', 'pending', 'checked_in')
  LEFT JOIN public.guests g ON r.guest_id = g.id
  ORDER BY ad.room_number, ad.date_value;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;