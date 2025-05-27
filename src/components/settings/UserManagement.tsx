
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllUserProfiles, updateUserProfile } from '@/integrations/supabase/services/maintenanceService';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/maintenance';

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(1, 'Nome é obrigatório'),
  role: z.enum(['master', 'reception', 'maintenance', 'cleaning', 'admin'] as const),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const roleLabels = {
  master: 'Master',
  reception: 'Recepção',
  maintenance: 'Manutenção',
  cleaning: 'Limpeza',
  admin: 'Administrador',
};

const roleColors = {
  master: 'bg-purple-100 text-purple-800',
  reception: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-orange-100 text-orange-800',
  cleaning: 'bg-green-100 text-green-800',
  admin: 'bg-red-100 text-red-800',
};

export default function UserManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: getAllUserProfiles,
    staleTime: 30000,
    retry: 3,
  });

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'reception',
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      console.log('Creating user with data:', data);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        user_metadata: {
          full_name: data.full_name,
        },
        email_confirm: true,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      console.log('User created in auth:', authData);

      // Update the user profile with the correct role
      if (authData.user) {
        const updatedProfile = await updateUserProfile(authData.user.id, {
          role: data.role,
          full_name: data.full_name,
        });
        console.log('Profile updated:', updatedProfile);
      }

      return authData;
    },
    onSuccess: () => {
      toast({
        title: 'Usuário criado com sucesso',
        description: 'O novo usuário foi adicionado ao sistema.',
      });
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      form.reset();
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast({
        title: 'Erro ao criar usuário',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });

  const toggleUserActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      console.log('Toggling user active status:', { userId, isActive });
      return updateUserProfile(userId, { is_active: isActive });
    },
    onSuccess: () => {
      toast({
        title: 'Status atualizado',
        description: 'O status do usuário foi alterado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
    },
    onError: (error) => {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });

  const changeUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      console.log('Changing user role:', { userId, newRole });
      return updateUserProfile(userId, { role: newRole });
    },
    onSuccess: () => {
      toast({
        title: 'Função atualizada',
        description: 'A função do usuário foi alterada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
    },
    onError: (error) => {
      console.error('Error changing user role:', error);
      toast({
        title: 'Erro ao atualizar função',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateUserFormData) => {
    console.log('Form submitted with data:', data);
    createUserMutation.mutate(data);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Erro ao carregar usuários</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-navy mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciamento de Usuários
              </CardTitle>
              <CardDescription>
                Gerencie usuários e suas funções no sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={rolesDialogOpen} onOpenChange={setRolesDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Gerenciar Funções
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Funções do Sistema</DialogTitle>
                    <DialogDescription>
                      Informações sobre as funções disponíveis no sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <div key={role} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <Badge className={roleColors[role as UserRole]}>{label}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {role === 'master' && 'Acesso total ao sistema'}
                          {role === 'reception' && 'Gestão de reservas e hospedagem'}
                          {role === 'maintenance' && 'Ordens de manutenção'}
                          {role === 'cleaning' && 'Gestão de limpeza'}
                          {role === 'admin' && 'Administração geral'}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Adicione um novo usuário ao sistema
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do usuário" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Senha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Função</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(roleLabels).map(([role, label]) => (
                                  <SelectItem key={role} value={role}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createUserMutation.isPending}>
                          {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(newRole: UserRole) => 
                        changeUserRoleMutation.mutate({ userId: user.id, newRole })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([role, label]) => (
                          <SelectItem key={role} value={role}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={(checked) =>
                        toggleUserActiveMutation.mutate({ userId: user.id, isActive: checked })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">Comece criando o primeiro usuário do sistema.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
