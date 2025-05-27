
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Clock, User, Calendar, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { getAllMaintenanceOrders, updateMaintenanceOrder } from '@/integrations/supabase/services/maintenanceService';
import { updateAccommodation } from '@/integrations/supabase/services/accommodations';
import { MaintenanceOrder, MaintenanceStatus } from '@/types/maintenance';

const statusConfig = {
  pending: { title: 'Pendente', color: 'bg-gray-100 text-gray-800' },
  in_progress: { title: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
  completed: { title: 'Concluído', color: 'bg-green-100 text-green-800' },
  cancelled: { title: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

const priorityConfig = {
  urgent: { color: 'bg-red-100 text-red-800 border-red-200' },
  high: { color: 'bg-orange-100 text-orange-800 border-orange-200' },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  low: { color: 'bg-green-100 text-green-800 border-green-200' },
};

interface KanbanColumnProps {
  status: MaintenanceStatus;
  orders: MaintenanceOrder[];
  onStatusChange: (orderId: string, newStatus: MaintenanceStatus) => void;
}

function KanbanColumn({ status, orders, onStatusChange }: KanbanColumnProps) {
  const config = statusConfig[status];

  return (
    <div className="flex-1 min-w-[300px]">
      <div className="bg-muted/50 p-3 rounded-t-lg border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{config.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {orders.length}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 p-3 bg-muted/20 min-h-[400px] rounded-b-lg">
        {orders.map((order) => (
          <MaintenanceCard
            key={order.id}
            order={order}
            onStatusChange={onStatusChange}
          />
        ))}
        {orders.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Nenhuma ordem neste status
          </div>
        )}
      </div>
    </div>
  );
}

interface MaintenanceCardProps {
  order: MaintenanceOrder;
  onStatusChange: (orderId: string, newStatus: MaintenanceStatus) => void;
}

function MaintenanceCard({ order, onStatusChange }: MaintenanceCardProps) {
  const priorityStyle = priorityConfig[order.priority];

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {order.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              #{order.order_number}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(statusConfig).map(([status, config]) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onStatusChange(order.id, status as MaintenanceStatus)}
                  disabled={order.status === status}
                >
                  Mover para {config.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-0">
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {order.description}
        </p>
        
        <div className="space-y-2">
          <Badge className={priorityStyle.color} variant="outline">
            {order.priority === 'urgent' && 'Urgente'}
            {order.priority === 'high' && 'Alta'}
            {order.priority === 'medium' && 'Média'}
            {order.priority === 'low' && 'Baixa'}
          </Badge>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-current rounded-full mr-1" />
              {order.area?.name}
            </div>
          </div>
          
          {order.estimated_hours && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {order.estimated_hours}h estimadas
            </div>
          )}
          
          {order.scheduled_date && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(order.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MaintenanceKanban() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['maintenance-orders'],
    queryFn: getAllMaintenanceOrders,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: MaintenanceStatus }) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Ordem não encontrada');

      const updates: any = { status: newStatus };
      
      // Set timestamps based on status changes
      if (newStatus === 'in_progress' && order.status === 'pending') {
        updates.started_at = new Date().toISOString();
      } else if (newStatus === 'completed' && order.status !== 'completed') {
        updates.completed_at = new Date().toISOString();
        
        // Unblock accommodation if this was a maintenance order for an accommodation
        if (order.area?.accommodation_id) {
          await updateAccommodation(order.area.accommodation_id, {
            isBlocked: false,
            blockReason: null,
            blockNote: null,
          });
        }
      }

      return updateMaintenanceOrder(orderId, updates);
    },
    onSuccess: () => {
      toast({
        title: 'Status atualizado',
        description: 'A ordem foi movida com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      queryClient.invalidateQueries({ queryKey: ['accommodations'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: MaintenanceStatus) => {
    updateOrderMutation.mutate({ orderId, newStatus });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-navy mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando painel Kanban...</p>
        </div>
      </div>
    );
  }

  const ordersByStatus = {
    pending: orders.filter(order => order.status === 'pending'),
    in_progress: orders.filter(order => order.status === 'in_progress'),
    completed: orders.filter(order => order.status === 'completed'),
    cancelled: orders.filter(order => order.status === 'cancelled'),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-lg font-semibold">Painel Kanban - Ordens de Manutenção</h2>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        <KanbanColumn
          status="pending"
          orders={ordersByStatus.pending}
          onStatusChange={handleStatusChange}
        />
        <KanbanColumn
          status="in_progress"
          orders={ordersByStatus.in_progress}
          onStatusChange={handleStatusChange}
        />
        <KanbanColumn
          status="completed"
          orders={ordersByStatus.completed}
          onStatusChange={handleStatusChange}
        />
        <KanbanColumn
          status="cancelled"
          orders={ordersByStatus.cancelled}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
