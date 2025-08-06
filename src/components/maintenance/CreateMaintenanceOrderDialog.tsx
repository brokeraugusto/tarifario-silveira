
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getAllAreas, createMaintenanceOrder, getAllUserProfiles } from '@/integrations/supabase/services/maintenanceService';
import { MaintenancePriority } from '@/types/maintenance';
import { useUserProfile } from '@/hooks/useUserPermissions';

interface CreateMaintenanceOrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateMaintenanceOrderDialog = ({ isOpen, onOpenChange }: CreateMaintenanceOrderDialogProps) => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useUserProfile();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area_id: '',
    priority: 'medium' as MaintenancePriority,
    assigned_to: '',
    scheduled_date: '',
    estimated_hours: '',
    notes: ''
  });

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: getAllAreas,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-user-profiles'],
    queryFn: getAllUserProfiles,
  });

  const createOrderMutation = useMutation({
    mutationFn: createMaintenanceOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      toast.success('Ordem de manutenção criada com sucesso');
      setFormData({
        title: '',
        description: '',
        area_id: '',
        priority: 'medium',
        assigned_to: '',
        scheduled_date: '',
        estimated_hours: '',
        notes: ''
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creating maintenance order:', error);
      toast.error('Erro ao criar ordem de manutenção');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação apenas dos campos obrigatórios
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }
    
    if (!formData.area_id) {
      toast.error('Área é obrigatória');
      return;
    }
    
    if (!currentUser?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    console.log('Creating maintenance order with data:', {
      title: formData.title,
      description: formData.description,
      area_id: formData.area_id,
      priority: formData.priority,
      requested_by: currentUser.id,
      assigned_to: formData.assigned_to || undefined,
      scheduled_date: formData.scheduled_date || undefined,
      estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : undefined,
      notes: formData.notes || undefined,
    });

    createOrderMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      area_id: formData.area_id,
      priority: formData.priority,
      requested_by: currentUser.id,
      assigned_to: formData.assigned_to || undefined,
      scheduled_date: formData.scheduled_date || undefined,
      estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : undefined,
      notes: formData.notes.trim() || undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Ordem de Manutenção
          </DialogTitle>
          <DialogDescription>
            Crie uma nova ordem de manutenção para ser executada
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Troca de lâmpada"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="area">Área *</Label>
              <Select value={formData.area_id} onValueChange={(value) => handleInputChange('area_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name} ({area.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva detalhadamente o problema ou serviço necessário"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Responsável</Label>
              <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange('assigned_to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(user => user.role === 'maintenance').map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Data Agendada</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Horas Estimadas</Label>
              <Input
                id="estimated_hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                placeholder="Ex: 2"
                min="0.5"
                step="0.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observações adicionais (opcional)"
              rows={2}
            />
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? 'Criando...' : 'Criar Ordem'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMaintenanceOrderDialog;
