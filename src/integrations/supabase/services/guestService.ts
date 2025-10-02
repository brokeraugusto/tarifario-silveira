import { supabase } from "@/integrations/supabase/client";
import { Guest, CreateGuestData } from "@/types/guest";

export const guestService = {
  async getAllGuests(): Promise<Guest[]> {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("is_active", true)
      .order("last_name", { ascending: true });

    if (error) {
      console.error("Error fetching guests:", error);
      throw error;
    }

    return data || [];
  },

  async getGuestById(id: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching guest:", error);
      throw error;
    }

    return data;
  },

  async getGuestByEmail(email: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching guest by email:", error);
      throw error;
    }

    return data;
  },

  async createGuest(guestData: CreateGuestData): Promise<Guest | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const { data, error } = await supabase
      .from("guests")
      .insert({
        ...guestData,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating guest:", error);
      throw error;
    }

    return data;
  },

  async updateGuest(id: string, updates: Partial<CreateGuestData>): Promise<Guest | null> {
    const { data, error } = await supabase
      .from("guests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating guest:", error);
      throw error;
    }

    return data;
  },

  async deleteGuest(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("guests")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Error deleting guest:", error);
      throw error;
    }

    return true;
  },

  async searchGuests(query: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("is_active", true)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order("last_name", { ascending: true })
      .limit(20);

    if (error) {
      console.error("Error searching guests:", error);
      throw error;
    }

    return data || [];
  },

  async getGuestReservations(guestId: string) {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        accommodations:accommodation_id (
          id,
          name,
          room_number,
          category
        )
      `)
      .eq("guest_id", guestId)
      .order("check_in_date", { ascending: false });

    if (error) {
      console.error("Error fetching guest reservations:", error);
      throw error;
    }

    return data || [];
  }
};
