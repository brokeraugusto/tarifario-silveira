
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#0f172a', '#f59e0b', '#ef4444', '#10b981'];

const PerformanceCharts = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['performance-charts'],
    queryFn: async () => {
      // Get maintenance orders by status
      const { data: maintenanceOrders, error: maintenanceError } = await supabase
        .from('maintenance_orders')
        .select('status, priority, created_at');
      
      if (maintenanceError) throw maintenanceError;

      // Get accommodations by category
      const { data: accommodations, error: accommodationsError } = await supabase
        .from('accommodations')
        .select('category, capacity');
      
      if (accommodationsError) throw accommodationsError;

      // Process maintenance data by status
      const maintenanceByStatus = [
        { name: 'Pendente', value: maintenanceOrders?.filter(o => o.status === 'pending').length || 0 },
        { name: 'Em Andamento', value: maintenanceOrders?.filter(o => o.status === 'in_progress').length || 0 },
        { name: 'Concluído', value: maintenanceOrders?.filter(o => o.status === 'completed').length || 0 },
        { name: 'Cancelado', value: maintenanceOrders?.filter(o => o.status === 'cancelled').length || 0 },
      ];

      // Process accommodations by category
      const accommodationsByCategory = accommodations?.reduce((acc: any, curr) => {
        const existing = acc.find((item: any) => item.name === curr.category);
        if (existing) {
          existing.value += 1;
          existing.capacity += curr.capacity;
        } else {
          acc.push({ 
            name: curr.category, 
            value: 1, 
            capacity: curr.capacity 
          });
        }
        return acc;
      }, []) || [];

      return {
        maintenanceByStatus: maintenanceByStatus.filter(item => item.value > 0),
        accommodationsByCategory,
      };
    },
    staleTime: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </CardHeader>
          <CardContent className="h-80">
            <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </CardHeader>
          <CardContent className="h-80">
            <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status das Manutenções</CardTitle>
          <CardDescription>
            Distribuição das ordens de manutenção por status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData?.maintenanceByStatus || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData?.maintenanceByStatus?.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acomodações por Categoria</CardTitle>
          <CardDescription>
            Número de acomodações e capacidade por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData?.accommodationsByCategory || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === 'value' ? 'Quantidade' : 'Capacidade Total'
                ]}
              />
              <Bar dataKey="value" fill="#0f172a" name="Quantidade" />
              <Bar dataKey="capacity" fill="#f59e0b" name="Capacidade Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceCharts;
