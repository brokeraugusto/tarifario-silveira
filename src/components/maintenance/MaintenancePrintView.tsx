
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAllMaintenanceOrders } from '@/integrations/supabase/services/maintenanceService';
import { MaintenanceOrder } from '@/types/maintenance';

interface MaintenancePrintViewProps {
  period: 'day' | 'week' | 'month';
  selectedDate: Date;
}

export default function MaintenancePrintView({ period, selectedDate }: MaintenancePrintViewProps) {
  const { data: orders = [] } = useQuery({
    queryKey: ['maintenance-orders'],
    queryFn: getAllMaintenanceOrders,
  });

  const getDateRange = () => {
    switch (period) {
      case 'day':
        return {
          start: selectedDate,
          end: selectedDate,
          title: format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        };
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return {
          start: weekStart,
          end: weekEnd,
          title: `${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`
        };
      case 'month':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return {
          start: monthStart,
          end: monthEnd,
          title: format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })
        };
    }
  };

  const { start, end, title } = getDateRange();

  const filteredOrders = orders.filter(order => {
    if (!order.scheduled_date) return false;
    const orderDate = new Date(order.scheduled_date);
    return orderDate >= start && orderDate <= end;
  });

  const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
  const inProgressOrders = filteredOrders.filter(o => o.status === 'in_progress');
  const completedOrders = filteredOrders.filter(o => o.status === 'completed');

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortByPriority = (a: MaintenanceOrder, b: MaintenanceOrder) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  };

  return (
    <div className="print:block hidden">
      <div className="max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Checklist de Manutenção
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Período: {title}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Impresso em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-700">{pendingOrders.length}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-700">{inProgressOrders.length}</div>
            <div className="text-sm text-blue-600">Em Andamento</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-700">{completedOrders.length}</div>
            <div className="text-sm text-green-600">Concluídas</div>
          </div>
        </div>

        {/* Orders by Priority */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Ordens Pendentes</h2>
            <div className="space-y-3">
              {pendingOrders.sort(sortByPriority).map((order, index) => (
                <div key={order.id} className="flex items-start space-x-3 p-3 border rounded">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded mt-1 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">#{order.order_number}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        order.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        order.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        order.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.priority === 'urgent' && 'URGENTE'}
                        {order.priority === 'high' && 'ALTA'}
                        {order.priority === 'medium' && 'MÉDIA'}
                        {order.priority === 'low' && 'BAIXA'}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{order.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{order.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Área: {order.area?.name}</span>
                      {order.estimated_hours && <span>Estimativa: {order.estimated_hours}h</span>}
                      {order.scheduled_date && (
                        <span>Data: {format(new Date(order.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {inProgressOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Ordens em Andamento</h2>
            <div className="space-y-3">
              {inProgressOrders.sort(sortByPriority).map((order) => (
                <div key={order.id} className="flex items-start space-x-3 p-3 border rounded bg-blue-50">
                  <div className="w-6 h-6 border-2 border-blue-300 rounded mt-1 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">#{order.order_number}</span>
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">EM ANDAMENTO</span>
                    </div>
                    <h3 className="font-medium text-gray-900">{order.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{order.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Área: {order.area?.name}</span>
                      {order.estimated_hours && <span>Estimativa: {order.estimated_hours}h</span>}
                      {order.started_at && (
                        <span>Iniciado: {format(new Date(order.started_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Notes Section */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Avaliação de Desempenho</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações sobre o período:
              </label>
              <div className="border border-gray-300 rounded p-3 h-20"></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificuldades encontradas:
              </label>
              <div className="border border-gray-300 rounded p-3 h-20"></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Melhorias sugeridas:
              </label>
              <div className="border border-gray-300 rounded p-3 h-20"></div>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-12 flex justify-between items-end">
          <div className="text-center">
            <div className="border-b border-gray-300 w-48 mb-2"></div>
            <p className="text-sm text-gray-600">Responsável pela Manutenção</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-300 w-32 mb-2"></div>
            <p className="text-sm text-gray-600">Data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
