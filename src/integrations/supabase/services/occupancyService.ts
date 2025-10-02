import { supabase } from "@/integrations/supabase/client";
import { OccupancyData } from "@/types/guest";
import { format } from "date-fns";

export const occupancyService = {
  async getOccupancyData(startDate: Date, endDate: Date): Promise<OccupancyData[]> {
    const { data, error } = await supabase.rpc("get_occupancy_data", {
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    });

    if (error) {
      console.error("Error fetching occupancy data:", error);
      throw error;
    }

    return data || [];
  },

  async getOccupancyStats(startDate: Date, endDate: Date) {
    const data = await this.getOccupancyData(startDate, endDate);

    const totalDays = data.length;
    const occupiedDays = data.filter((d) => d.reservation_id).length;
    const blockedDays = data.filter((d) => d.is_blocked && !d.reservation_id).length;
    const availableDays = totalDays - occupiedDays - blockedDays;

    const occupancyRate = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;

    return {
      totalDays,
      occupiedDays,
      blockedDays,
      availableDays,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
    };
  },

  async getAccommodationOccupancy(accommodationId: string, startDate: Date, endDate: Date) {
    const allData = await this.getOccupancyData(startDate, endDate);
    return allData.filter((d) => d.accommodation_id === accommodationId);
  },
};
