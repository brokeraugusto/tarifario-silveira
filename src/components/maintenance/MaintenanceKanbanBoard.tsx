
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, User, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MaintenanceOrder, MaintenanceStatus } from '@/types/maintenance';
import { updateMaintenanceOrder } from '@/integrations/supabase/services/maintenanceService';

interface MaintenanceKanbanBoardProps {
  orders: MaintenanceOrder[];
  onOrderClick: (order: MaintenanceOrder) => void;
}

const MaintenanceKanbanBoard = ({ orders, onOrderClick }: MaintenanceKanbanBoardProps) => {
  const queryClient = useQueryClient();

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MaintenanceOrder> }) => 
      updateMaintenanceOrder(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating maintenance order:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  const handleDragStart = (e: React.DragEvent, order: MaintenanceOrder) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(order));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: MaintenanceStatus) => {
    e.preventDefault();
    const orderData = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (orderData.status !== newStatus) {
      updateOrderMutation.mutate({
        id: orderData.id,
        updates: { 
          status: newStatus,
          ...(newStatus === 'in_progress' && { started_at: new Date().toISOString() }),
          ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
        }
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusOrders = (status: MaintenanceStatus) => {
    return orders.filter(order => order.status === status);
  };

  const columns = [
    { 
      id: 'pending' as MaintenanceStatus, 
      title: 'Pendente', 
      color: 'bg-gray-50 border-gray-200',
      headerColor: 'text-gray-700'
    },
    { 
      id: 'in_progress' as MaintenanceStatus, 
      title: 'Em Andamento', 
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'text-blue-700'
    },
    { 
      id: 'completed' as MaintenanceStatus, 
      title: 'Concluído', 
      color: 'bg-green-50 border-green-200',
      headerColor: 'text-green-700'
    },
    { 
      id: 'cancelled' as MaintenanceStatus, 
      title: 'Cancelado', 
      color: 'bg-red-50 border-red-200',
      headerColor: 'text-red-700'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`rounded-lg border-2 border-dashed p-4 min-h-[500px] ${column.color}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="mb-4">
            <h3 className={`font-semibold text-lg ${column.headerColor}`}>
              {column.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getStatusOrders(column.id).length} ordem(s)
            </p>
          </div>

          <div className="space-y-3">
            {getStatusOrders(column.id).map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                draggable
                onDragStart={(e) => handleDragStart(e, order)}
                onClick={() => onOrderClick(order)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {order.title}
                    </CardTitle>
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority === 'urgent' && 'Urgente'}
                      {order.priority === 'high' && 'Alta'}
                      {order.priority === 'medium' && 'Média'}
                      {order.priority === 'low' && 'Baixa'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    #{order.order_number}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {order.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{order.area?.name}</span>
                    </div>
                    
                    {order.estimated_hours && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{order.estimated_hours}h estimadas</span>
                      </div>
                    )}
                    
                    {order.scheduled_date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Agendado: {new Date(order.scheduled_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Criado: {new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceKanbanBoard;
