
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#0f172a', '#f59e0b', '#ef4444', '#10b981'];

const PerformanceCharts = () => {
  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['performance-charts'],
    queryFn: async () => {
      try {
        console.log('Fetching performance charts data...');

        // Get maintenance orders by status
        const { data: maintenanceOrders, error: maintenanceError } = await supabase
          .from('maintenance_orders')
          .select('status, priority, created_at');
        
        if (maintenanceError) {
          console.error('Error fetching maintenance orders for charts:', maintenanceError);
          throw maintenanceError;
        }

        console.log('Maintenance orders for charts:', maintenanceOrders?.length);

        // Get accommodations by category
        const { data: accommodations, error: accommodationsError } = await supabase
          .from('accommodations')
          .select('category, capacity');
        
        if (accommodationsError) {
          console.error('Error fetching accommodations for charts:', accommodationsError);
          throw accommodationsError;
        }

        console.log('Accommodations for charts:', accommodations?.length);

        // Process maintenance data by status
        const maintenanceByStatus = [
          { 
            name: 'Pendente', 
            value: maintenanceOrders?.filter(o => o.status === 'pending').length || 0,
            color: '#ef4444'
          },
          { 
            name: 'Em Andamento', 
            value: maintenanceOrders?.filter(o => o.status === 'in_progress').length || 0,
            color: '#f59e0b'
          },
          { 
            name: 'Concluído', 
            value: maintenanceOrders?.filter(o => o.status === 'completed').length || 0,
            color: '#10b981'
          },
          { 
            name: 'Cancelado', 
            value: maintenanceOrders?.filter(o => o.status === 'cancelled').length || 0,
            color: '#6b7280'
          },
        ].filter(item => item.value > 0);

        // Process accommodations by category
        const accommodationsByCategory = accommodations?.reduce((acc: any[], curr) => {
          const existing = acc.find((item: any) => item.name === curr.category);
          if (existing) {
            existing.value += 1;
            existing.capacity += curr.capacity || 0;
          } else {
            acc.push({ 
              name: curr.category, 
              value: 1, 
              capacity: curr.capacity || 0
            });
          }
          return acc;
        }, []) || [];

        const result = {
          maintenanceByStatus,
          accommodationsByCategory,
        };

        console.log('Charts data calculated:', result);
        return result;
      } catch (error) {
        console.error('Error in charts query:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
    retry: 2,
    retryDelay: 1000,
  });

  if (error) {
    console.error('Charts error:', error);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar gráficos</CardTitle>
            <CardDescription className="text-red-500">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center text-red-500">
              Não foi possível carregar os dados dos gráficos
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {chartData?.maintenanceByStatus && chartData.maintenanceByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.maintenanceByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.maintenanceByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">Nenhuma ordem de manutenção</p>
                <p className="text-sm">Dados aparecerão quando ordens forem criadas</p>
              </div>
            </div>
          )}
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
          {chartData?.accommodationsByCategory && chartData.accommodationsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.accommodationsByCategory}>
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
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">Nenhuma acomodação cadastrada</p>
                <p className="text-sm">Dados aparecerão quando acomodações forem criadas</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceCharts;
