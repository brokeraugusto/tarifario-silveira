import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    date: string;
  };
  end: {
    date: string;
  };
  extendedProperties?: {
    private?: {
      reservation_id?: string;
      accommodation_id?: string;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, reservation, calendarId } = await req.json();
    
    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');
    const refreshToken = Deno.env.get('GOOGLE_CALENDAR_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Google Calendar credentials not configured');
    }

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Token refresh failed: ${tokenData.error_description}`);
    }

    const accessToken = tokenData.access_token;

    switch (action) {
      case 'create':
        return await createCalendarEvent(accessToken, calendarId, reservation);
      case 'update':
        return await updateCalendarEvent(accessToken, calendarId, reservation);
      case 'delete':
        return await deleteCalendarEvent(accessToken, calendarId, reservation.google_event_id);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in google-calendar function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createCalendarEvent(accessToken: string, calendarId: string, reservation: any) {
  const event: CalendarEvent = {
    summary: `Reserva: ${reservation.guest_name} - ${reservation.accommodation?.name}`,
    description: `
      Hóspede: ${reservation.guest_name}
      Email: ${reservation.guest_email}
      Telefone: ${reservation.guest_phone || 'Não informado'}
      Acomodação: ${reservation.accommodation?.name} (${reservation.accommodation?.room_number})
      Número de Hóspedes: ${reservation.number_of_guests}
      Inclui Café: ${reservation.includes_breakfast ? 'Sim' : 'Não'}
      Valor Total: R$ ${reservation.total_price}
      Observações: ${reservation.notes || 'Nenhuma'}
    `,
    start: {
      date: reservation.check_in_date,
    },
    end: {
      date: reservation.check_out_date,
    },
    extendedProperties: {
      private: {
        reservation_id: reservation.id,
        accommodation_id: reservation.accommodation_id,
      },
    },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Calendar API error: ${data.error?.message}`);
  }

  // Update reservation with Google event ID
  await supabase
    .from('reservations')
    .update({ google_event_id: data.id })
    .eq('id', reservation.id);

  return new Response(
    JSON.stringify({ eventId: data.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateCalendarEvent(accessToken: string, calendarId: string, reservation: any) {
  if (!reservation.google_event_id) {
    throw new Error('No Google event ID found for this reservation');
  }

  const event: CalendarEvent = {
    summary: `Reserva: ${reservation.guest_name} - ${reservation.accommodation?.name}`,
    description: `
      Hóspede: ${reservation.guest_name}
      Email: ${reservation.guest_email}
      Telefone: ${reservation.guest_phone || 'Não informado'}
      Acomodação: ${reservation.accommodation?.name} (${reservation.accommodation?.room_number})
      Número de Hóspedes: ${reservation.number_of_guests}
      Inclui Café: ${reservation.includes_breakfast ? 'Sim' : 'Não'}
      Valor Total: R$ ${reservation.total_price}
      Observações: ${reservation.notes || 'Nenhuma'}
    `,
    start: {
      date: reservation.check_in_date,
    },
    end: {
      date: reservation.check_out_date,
    },
    extendedProperties: {
      private: {
        reservation_id: reservation.id,
        accommodation_id: reservation.accommodation_id,
      },
    },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${reservation.google_event_id}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Calendar API error: ${data.error?.message}`);
  }

  return new Response(
    JSON.stringify({ eventId: data.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteCalendarEvent(accessToken: string, calendarId: string, eventId: string) {
  if (!eventId) {
    throw new Error('No Google event ID provided');
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const data = await response.json();
    throw new Error(`Calendar API error: ${data.error?.message}`);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}