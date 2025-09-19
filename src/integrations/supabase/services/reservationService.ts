import { supabase } from '../client';
import { Reservation, CreateReservationData, ReservationStatus, PaymentMethod } from '@/types';

export const getAllReservations = async (): Promise<Reservation[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        accommodation:accommodations(*)
      `)
      .order('check_in_date', { ascending: false });

    if (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getAllReservations:', error);
    return [];
  }
};

export const getReservationById = async (id: string): Promise<Reservation | null> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        accommodation:accommodations(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching reservation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getReservationById:', error);
    return null;
  }
};

export const getReservationsByDate = async (startDate: string, endDate: string): Promise<Reservation[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        accommodation:accommodations(*)
      `)
      .or(`check_in_date.lte.${endDate},check_out_date.gte.${startDate}`)
      .order('check_in_date');

    if (error) {
      console.error('Error fetching reservations by date:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getReservationsByDate:', error);
    return [];
  }
};

export const checkReservationAvailability = async (
  accommodationId: string,
  checkIn: string,
  checkOut: string,
  excludeReservationId?: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_reservation_availability', {
      p_accommodation_id: accommodationId,
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_exclude_reservation_id: excludeReservationId || null
    });

    if (error) {
      console.error('Error checking availability:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Unexpected error in checkReservationAvailability:', error);
    return false;
  }
};

export const createReservation = async (reservation: CreateReservationData): Promise<Reservation | null> => {
  try {
    // First check availability
    const isAvailable = await checkReservationAvailability(
      reservation.accommodation_id,
      reservation.check_in_date,
      reservation.check_out_date
    );

    if (!isAvailable) {
      throw new Error('Accommodation is not available for the selected dates');
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        ...reservation,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending' as ReservationStatus
      }])
      .select(`
        *,
        accommodation:accommodations(*)
      `)
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in createReservation:', error);
    throw error;
  }
};

export const updateReservation = async (
  id: string,
  updates: Partial<CreateReservationData & { status: ReservationStatus }>
): Promise<Reservation | null> => {
  try {
    // Check availability if dates are being changed
    if (updates.accommodation_id || updates.check_in_date || updates.check_out_date) {
      const currentReservation = await getReservationById(id);
      if (!currentReservation) {
        throw new Error('Reservation not found');
      }

      const isAvailable = await checkReservationAvailability(
        updates.accommodation_id || currentReservation.accommodation_id,
        updates.check_in_date || currentReservation.check_in_date,
        updates.check_out_date || currentReservation.check_out_date,
        id
      );

      if (!isAvailable) {
        throw new Error('Accommodation is not available for the selected dates');
      }
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        accommodation:accommodations(*)
      `)
      .single();

    if (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in updateReservation:', error);
    throw error;
  }
};

export const deleteReservation = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reservation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deleteReservation:', error);
    return false;
  }
};

export const updateReservationStatus = async (id: string, status: ReservationStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ 
        status,
        ...(status === 'checked_in' && { started_at: new Date().toISOString() }),
        ...(status === 'checked_out' && { completed_at: new Date().toISOString() })
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating reservation status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in updateReservationStatus:', error);
    return false;
  }
};