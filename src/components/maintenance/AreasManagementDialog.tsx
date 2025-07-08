
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, MapPin, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getAllAreas, createArea, updateArea, deleteArea } from '@/integrations/supabase/services/maintenanceService';
import { ensureAreasForAccommodations } from '@/integrations/supabase/services/maintenanceIntegration';
import { Area, AreaType } from '@/types/maintenance';

interface AreasManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AreasManagementDialog = ({ isOpen, onOpenChange }: AreasManagementDialogProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    area_type: 'common' as AreaType,
    description: '',
    location: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: areas = [], isLoading, refetch } = useQuery({
    queryKey: ['areas'],
    queryFn: getAllAreas,
    enabled: isOpen,
  });

  // Ensure areas exist for accommodations when dialog opens
  useEffect(() => {
    if (isOpen) {
      ensureAreasForAccommodations().then(() => {
        refetch();
      });
    }
  }, [isOpen, refetch]);

  const createAreaMutation = useMutation({
    mutationFn: createArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Área criada com sucesso');
      handleCloseForm();
      refetch(); // Força refresh imediato
    },
    onError: (error) => {
      console.error('Error creating area:', error);
      toast.error('Erro ao criar área. Verifique se o código não está duplicado.');
    },
  });

  const updateAreaMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Area> }) => 
      updateArea(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Área atualizada com sucesso');
      handleCloseForm();
      refetch(); // Força refresh imediato
    },
    onError: (error) => {
      console.error('Error updating area:', error);
      toast.error('Erro ao atualizar área');
    },
  });

  const deleteAreaMutation = useMutation({
    mutationFn: deleteArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Área removida com sucesso');
      refetch(); // Força refresh imediato
    },
    onError: (error) => {
      console.error('Error deleting area:', error);
      if (error.message?.includes('active maintenance orders')) {
        toast.error('Não é possível excluir área com ordens de manutenção ativas');
      } else {
        toast.error('Erro ao remover área');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      toast.error('Nome e código são obrigatórios');
      return;
    }
    
    if (editingArea) {
      updateAreaMutation.mutate({
        id: editingArea.id,
        updates: formData
      });
    } else {
      createAreaMutation.mutate(formData);
    }
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      code: area.code,
      area_type: area.area_type,
      description: area.description || '',
      location: area.location || '',
      is_active: area.is_active
    });
    setIsFormOpen(true);
  };

  const handleDelete = (areaId: string) => {
    if (confirm('Tem certeza que deseja remover esta área?')) {
      deleteAreaMutation.mutate(areaId);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingArea(null);
    setFormData({
      name: '',
      code: '',
      area_type: 'common' as AreaType,
      description: '',
      location: '',
      is_active: true
    });
  };

  const handleRefreshAreas = async () => {
    try {
      await ensureAreasForAccommodations();
      await refetch();
      toast.success('Áreas atualizadas com sucesso');
    } catch (error) {
      console.error('Error refreshing areas:', error);
      toast.error('Erro ao atualizar áreas');
    }
  };

  const getAreaTypeLabel = (type: AreaType) => {
    const labels = {
      accommodation: 'Acomodação',
      common: 'Área Comum',
      maintenance: 'Manutenção',
      restaurant: 'Restaurante',
      recreation: 'Recreação'
    };
    return labels[type] || type;
  };

  const getAreaTypeColor = (type: AreaType) => {
    const colors = {
      accommodation: 'bg-primary/10 text-primary',
      common: 'bg-muted text-muted-foreground',
      maintenance: 'bg-destructive/10 text-destructive',
      restaurant: 'bg-accent/10 text-accent',
      recreation: 'bg-secondary text-secondary-foreground'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Gerenciar Áreas
          </DialogTitle>
          <DialogDescription>
            Gerencie as áreas disponíveis para ordens de manutenção
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Áreas Cadastradas ({areas.length})</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefreshAreas}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Área
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Carregando áreas...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {areas.map((area) => (
                <Card key={area.id}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm font-medium">
                          {area.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Código: {area.code}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(area)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        {area.area_type !== 'accommodation' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(area.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <Badge className={getAreaTypeColor(area.area_type)}>
                        {getAreaTypeLabel(area.area_type)}
                      </Badge>
                      {area.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {area.location}
                        </p>
                      )}
                      {area.description && (
                        <p className="text-xs text-muted-foreground">
                          {area.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Form Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingArea ? 'Editar Área' : 'Nova Área'}
                </DialogTitle>
                <DialogDescription>
                  {editingArea 
                    ? 'Edite as informações da área' 
                    : 'Preencha as informações para criar uma nova área'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Área</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Código</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area_type">Tipo de Área</Label>
                    <Select
                      value={formData.area_type}
                      onValueChange={(value: AreaType) => 
                        setFormData(prev => ({ ...prev, area_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accommodation">Acomodação</SelectItem>
                        <SelectItem value="common">Área Comum</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="restaurant">Restaurante</SelectItem>
                        <SelectItem value="recreation">Recreação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAreaMutation.isPending || updateAreaMutation.isPending}
                  >
                    {editingArea ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AreasManagementDialog;
