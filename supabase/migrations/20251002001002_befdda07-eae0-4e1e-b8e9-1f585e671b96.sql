-- Fix security issue: Remove SECURITY DEFINER from view and use regular view
DROP VIEW IF EXISTS public.occupancy_map_view;

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

-- Update the function to not use SECURITY DEFINER for this use case
DROP FUNCTION IF EXISTS public.get_occupancy_data(DATE, DATE);

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
$$ LANGUAGE plpgsql STABLE SET search_path = public;