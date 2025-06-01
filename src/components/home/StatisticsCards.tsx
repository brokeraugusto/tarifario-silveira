
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Bed, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StatisticsData {
  totalMaintenanceOrders: number;
  pendingMaintenanceOrders: number;
  totalAccommodations: number;
  totalCapacity: number;
}

const StatisticsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['home-statistics'],
    queryFn: async (): Promise<StatisticsData> => {
      // Get maintenance orders count
      const { data: maintenanceOrders, error: maintenanceError } = await supabase
        .from('maintenance_orders')
        .select('id, status');
      
      if (maintenanceError) throw maintenanceError;

      // Get accommodations data
      const { data: accommodations, error: accommodationsError } = await supabase
        .from('accommodations')
        .select('id, capacity');
      
      if (accommodationsError) throw accommodationsError;

      const totalMaintenanceOrders = maintenanceOrders?.length || 0;
      const pendingMaintenanceOrders = maintenanceOrders?.filter(order => order.status === 'pending').length || 0;
      const totalAccommodations = accommodations?.length || 0;
      const totalCapacity = accommodations?.reduce((sum, acc) => sum + acc.capacity, 0) || 0;

      return {
        totalMaintenanceOrders,
        pendingMaintenanceOrders,
        totalAccommodations,
        totalCapacity,
      };
    },
    staleTime: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Manutenções</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalMaintenanceOrders || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.pendingMaintenanceOrders || 0} pendentes
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Acomodações</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalAccommodations || 0}</div>
          <p className="text-xs text-muted-foreground">
            Unidades cadastradas
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capacidade Máxima</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalCapacity || 0}</div>
          <p className="text-xs text-muted-foreground">
            Pessoas no total
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">
            Em breve
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
