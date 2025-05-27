
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wrench, Plus, Filter, Calendar, AlertTriangle, Kanban, List, CalendarIcon, Printer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllMaintenanceOrders, getAllAreas } from '@/integrations/supabase/services/maintenanceService';
import { MaintenanceOrder, MaintenancePriority, MaintenanceStatus } from '@/types/maintenance';
import CreateMaintenanceOrderDialog from '@/components/maintenance/CreateMaintenanceOrderDialog';
import MaintenanceKanban from '@/components/maintenance/MaintenanceKanban';
import MaintenancePrintView from '@/components/maintenance/MaintenancePrintView';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MaintenancePage = () => {
  const isMobile = useIsMobile();
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<MaintenancePriority | 'all'>('all');
  const [activeTab, setActiveTab] = useState('kanban');
  const [printPeriod, setPrintPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: maintenanceOrders = [], isLoading: loadingOrders, error: ordersError } = useQuery({
    queryKey: ['maintenance-orders'],
    queryFn: getAllMaintenanceOrders,
    staleTime: 30000,
    retry: 3,
  });

  const { data: areas = [], isLoading: loadingAreas, error: areasError } = useQuery({
    queryKey: ['areas'],
    queryFn: getAllAreas,
    staleTime: 60000,
    retry: 3,
  });

  // Show error state if either query failed
  if (ordersError || areasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Erro ao carregar dados de manutenção</p>
          <p className="text-xs text-muted-foreground mt-1">
            {ordersError?.message || areasError?.message || 'Erro desconhecido'}
          </p>
        </div>
      </div>
    );
  }

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
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePrint = () => {
    window.print();
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
    <>
      <div className="space-y-4 md:space-y-6 pb-6 md:pb-10 print:hidden">
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
              <div className="text-2xl font-bold text-blue-600">
                {maintenanceOrders.filter(o => o.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {maintenanceOrders.filter(o => o.priority === 'urgent').length}
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

            {/* Print Controls */}
            <div className="flex gap-2">
              <Select value={printPeriod} onValueChange={(value: 'day' | 'week' | 'month') => setPrintPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(selectedDate, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>
          
          <CreateMaintenanceOrderDialog>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Ordem de Manutenção
            </Button>
          </CreateMaintenanceOrderDialog>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban" className="mt-6">
            <MaintenanceKanban />
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            {/* Maintenance Orders List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className={isMobile ? "p-4" : ""}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.title}</CardTitle>
                        <CardDescription className="text-sm">
                          #{order.order_number} • {order.area?.name}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 flex-col">
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
                    <p className="text-sm text-muted-foreground mb-3">{order.description}</p>
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

            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma ordem encontrada</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Não há ordens de manutenção que correspondam aos filtros selecionados.
                  </p>
                  <CreateMaintenanceOrderDialog>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Nova Ordem
                    </Button>
                  </CreateMaintenanceOrderDialog>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Print View */}
      <MaintenancePrintView period={printPeriod} selectedDate={selectedDate} />
    </>
  );
};

export default MaintenancePage;
