
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Users, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getAllUserProfiles, updateUserProfile } from '@/integrations/supabase/services/maintenanceService';
import { UserProfile } from '@/types/maintenance';

interface UserManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserManagementDialog = ({ isOpen, onOpenChange }: UserManagementDialogProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'reception' as UserProfile['role'],
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-user-profiles'],
    queryFn: getAllUserProfiles,
    enabled: isOpen,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<UserProfile> }) => 
      updateUserProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-profiles'] });
      toast.success('Usuário atualizado com sucesso');
      handleCloseForm();
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar usuário');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        updates: formData
      });
    }
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    });
    setIsFormOpen(true);
  };

  const handleToggleActive = async (user: UserProfile) => {
    updateUserMutation.mutate({
      id: user.id,
      updates: { is_active: !user.is_active }
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData({
      full_name: '',
      email: '',
      role: 'reception',
      is_active: true
    });
  };

  const getRoleLabel = (role: UserProfile['role']) => {
    const labels = {
      master: 'Master',
      admin: 'Administrador',
      maintenance: 'Manutenção',
      reception: 'Recepção'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: UserProfile['role']) => {
    const colors = {
      master: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      maintenance: 'bg-orange-100 text-orange-800',
      reception: 'bg-blue-100 text-blue-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Usuários e Permissões
          </DialogTitle>
          <DialogDescription>
            Gerencie usuários do sistema e seus níveis de permissão
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Usuários do Sistema</h3>
              <div className="text-sm text-muted-foreground">
                Total: {users.length} usuários
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium">
                            {user.full_name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {user.email}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={user.is_active}
                              onCheckedChange={() => handleToggleActive(user)}
                              disabled={updateUserMutation.isPending}
                            />
                            <span className="text-xs text-muted-foreground">
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-xs text-muted-foreground">
                        Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Níveis de Permissão
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Master</CardTitle>
                    <CardDescription className="text-xs">
                      Acesso total ao sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Gerenciar todos os módulos</li>
                      <li>• Gerenciar usuários e permissões</li>
                      <li>• Configurações do sistema</li>
                      <li>• Relatórios e backup</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Administrador</CardTitle>
                    <CardDescription className="text-xs">
                      Acesso administrativo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Gerenciar acomodações</li>
                      <li>• Gerenciar períodos e preços</li>
                      <li>• Gerenciar manutenção</li>
                      <li>• Relatórios operacionais</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Manutenção</CardTitle>
                    <CardDescription className="text-xs">
                      Acesso ao módulo de manutenção
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Visualizar ordens de manutenção</li>
                      <li>• Atualizar status das ordens</li>
                      <li>• Registrar tempo e custos</li>
                      <li>• Gerenciar áreas</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recepção</CardTitle>
                    <CardDescription className="text-xs">
                      Acesso básico ao sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Buscar acomodações</li>
                      <li>• Visualizar disponibilidade</li>
                      <li>• Consultar preços</li>
                      <li>• Relatórios básicos</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Edite as informações e permissões do usuário
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="role">Nível de Permissão</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserProfile['role']) => 
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="reception">Recepção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="is_active">Usuário Ativo</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementDialog;
