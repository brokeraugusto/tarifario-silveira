import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Plus, Filter, Calendar, AlertTriangle, Eye, CheckCircle, X, LayoutGrid, List, MapPin, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { getAllMaintenanceOrders, getAllAreas, updateMaintenanceOrder } from '@/integrations/supabase/services/maintenanceService';
import { MaintenanceOrder, MaintenancePriority, MaintenanceStatus } from '@/types/maintenance';
import CreateMaintenanceOrderDialog from '@/components/maintenance/CreateMaintenanceOrderDialog';
import AreasManagementDialog from '@/components/maintenance/AreasManagementDialog';
import MaintenanceKanbanBoard from '@/components/maintenance/MaintenanceKanbanBoard';
import MaintenanceHistoryDialog from '@/components/maintenance/MaintenanceHistoryDialog';

const MaintenancePage = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<MaintenancePriority | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<MaintenanceOrder | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAreasDialogOpen, setIsAreasDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const { data: maintenanceOrders = [], isLoading: loadingOrders, refetch } = useQuery({
    queryKey: ['maintenance-orders'],
    queryFn: getAllMaintenanceOrders,
  });

  const { data: areas = [], isLoading: loadingAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: getAllAreas,
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MaintenanceOrder> }) => 
      updateMaintenanceOrder(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      toast.success('Ordem de manutenção atualizada com sucesso');
      setIsDetailDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating maintenance order:', error);
      toast.error('Erro ao atualizar ordem de manutenção');
    },
  });

  const filteredOrders = maintenanceOrders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false;
    return true;
  });

  const getPriorityColor = (priority: MaintenancePriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'pending': return 'bg-muted text-muted-foreground border-border';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-accent/10 text-accent border-accent/20';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleOrderClick = (order: MaintenanceOrder) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleStatusUpdate = (newStatus: MaintenanceStatus) => {
    if (!selectedOrder) return;
    
    updateOrderMutation.mutate({
      id: selectedOrder.id,
      updates: { 
        status: newStatus,
        ...(newStatus === 'in_progress' && { started_at: new Date().toISOString() }),
        ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
      }
    });
  };

  if (loadingOrders || loadingAreas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-navy mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando ordens de manutenção...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-6 md:pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-hotel-navy">Manutenção</h1>
        <p className="text-muted-foreground mt-2">Gerencie ordens de manutenção e áreas do estabelecimento.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ordens</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {maintenanceOrders.filter(o => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {maintenanceOrders.filter(o => o.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Áreas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {areas.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as MaintenancePriority | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setIsHistoryDialogOpen(true)}
          >
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsAreasDialogOpen(true)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Gerenciar Áreas
          </Button>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ordem
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'kanban' ? (
        <MaintenanceKanbanBoard 
          orders={filteredOrders} 
          onOrderClick={handleOrderClick}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOrderClick(order)}>
              <CardHeader className={isMobile ? "p-4" : ""}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{order.title}</CardTitle>
                    <CardDescription className="text-sm">
                      #{order.order_number} • {order.area?.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-col ml-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status === 'pending' && 'Pendente'}
                      {order.status === 'in_progress' && 'Em Andamento'}
                      {order.status === 'completed' && 'Concluído'}
                      {order.status === 'cancelled' && 'Cancelado'}
                    </Badge>
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority === 'urgent' && 'Urgente'}
                      {order.priority === 'high' && 'Alta'}
                      {order.priority === 'medium' && 'Média'}
                      {order.priority === 'low' && 'Baixa'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={isMobile ? "p-4 pt-0" : "pt-0"}>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{order.description}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Criado em {new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                  {order.estimated_hours && (
                    <span>{order.estimated_hours}h estimadas</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma ordem encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Não há ordens de manutenção que correspondam aos filtros selecionados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Order Dialog */}
      <CreateMaintenanceOrderDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Areas Management Dialog */}
      <AreasManagementDialog
        isOpen={isAreasDialogOpen}
        onOpenChange={setIsAreasDialogOpen}
      />

      {/* Maintenance History Dialog */}
      <MaintenanceHistoryDialog
        isOpen={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalhes da Ordem #{selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Visualize e gerencie esta ordem de manutenção
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={`${getStatusColor(selectedOrder.status)} mt-1 block w-fit`}>
                    {selectedOrder.status === 'pending' && 'Pendente'}
                    {selectedOrder.status === 'in_progress' && 'Em Andamento'}
                    {selectedOrder.status === 'completed' && 'Concluído'}
                    {selectedOrder.status === 'cancelled' && 'Cancelado'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <Badge className={`${getPriorityColor(selectedOrder.priority)} mt-1 block w-fit`}>
                    {selectedOrder.priority === 'urgent' && 'Urgente'}
                    {selectedOrder.priority === 'high' && 'Alta'}
                    {selectedOrder.priority === 'medium' && 'Média'}
                    {selectedOrder.priority === 'low' && 'Baixa'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Título</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedOrder.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedOrder.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Área</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedOrder.area?.name}</p>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <label className="text-sm font-medium">Observações</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedOrder.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Criado em</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {selectedOrder.estimated_hours && (
                  <div>
                    <label className="text-sm font-medium">Horas Estimadas</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedOrder.estimated_hours}h</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
            
            {selectedOrder?.status === 'pending' && (
              <Button 
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={updateOrderMutation.isPending}
              >
                Iniciar Manutenção
              </Button>
            )}
            
            {selectedOrder?.status === 'in_progress' && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updateOrderMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updateOrderMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluir
                </Button>
              </>
            )}
            
            {(selectedOrder?.status === 'completed' || selectedOrder?.status === 'cancelled') && (
              <Button 
                variant="outline"
                onClick={() => handleStatusUpdate('pending')}
                disabled={updateOrderMutation.isPending}
              >
                Reabrir
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenancePage;
