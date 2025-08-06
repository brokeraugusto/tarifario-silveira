
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Filter, Calendar, User, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllAreas, getAllUserProfiles } from '@/integrations/supabase/services/maintenanceService';
import { getMaintenanceHistoryWithFilters } from '@/integrations/supabase/services/maintenanceHistoryService';
import { MaintenanceStatus } from '@/types/maintenance';

interface MaintenanceHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MaintenanceHistoryDialog = ({ isOpen, onOpenChange }: MaintenanceHistoryDialogProps) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    responsible: '',
    areaId: ''
  });

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: getAllAreas,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-user-profiles'],
    queryFn: getAllUserProfiles,
  });

  const { data: history = [], refetch, isLoading } = useQuery({
    queryKey: ['maintenance-history', filters],
    queryFn: () => getMaintenanceHistoryWithFilters(filters),
  });

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'pending': return 'bg-muted text-muted-foreground border-border';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-accent/10 text-accent border-accent/20';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: MaintenanceStatus) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      responsible: '',
      areaId: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Manutenção
          </DialogTitle>
          <DialogDescription>
            Visualize o histórico completo de todas as ordens de manutenção
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">Data Final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Select value={filters.responsible} onValueChange={(value) => handleFilterChange('responsible', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                <Select value={filters.areaId} onValueChange={(value) => handleFilterChange('areaId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => refetch()} size="sm">
                Aplicar Filtros
              </Button>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Histórico ({history.length} registros)
          </h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-navy"></div>
            </div>
          ) : history.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
                <p className="text-muted-foreground text-center">
                  Não há registros de histórico que correspondam aos filtros selecionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(entry.status)}>
                            {getStatusText(entry.status)}
                          </Badge>
                          <span className="font-medium">
                            {entry.maintenance_order?.title}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {entry.maintenance_order?.area?.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {entry.changed_by_profile?.full_name || 'Sistema'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(entry.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceHistoryDialog;
