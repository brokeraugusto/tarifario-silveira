
import React, { useState, useEffect } from 'react';
import { 
  Plus, Filter, RotateCcw, Trash2, MoreHorizontal, 
  Users, Lock, Unlock, Pencil, Images, X, ExternalLink, Database
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MultiSelectTable from '@/components/ui/multi-select-table';
import { ItemActions } from '@/components/ui/multi-select-actions';
import { Accommodation, CategoryType } from '@/types';
import { 
  getAllAccommodations, 
  updateAccommodation,
  createAccommodation,
  deleteAccommodation
} from '@/integrations/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import AccommodationDetails from '@/components/AccommodationDetails';
import AccommodationBlockDialog from '@/components/AccommodationBlockDialog';
import CategoryManagementDialog from '@/components/CategoryManagementDialog';
import ImageUploader from '@/components/ImageUploader';
import DatabaseCleanupDialog from '@/components/DatabaseCleanupDialog';

interface AccommodationFormData {
  name: string;
  roomNumber: string;
  category: CategoryType;
  capacity: number;
  description: string;
  imageUrl: string;
  images: string[];
  albumUrl?: string;
  isBlocked?: boolean;
}

const initialFormData: AccommodationFormData = {
  name: '',
  roomNumber: '',
  category: 'Standard',
  capacity: 2,
  description: '',
  imageUrl: '/placeholder.svg',
  images: [],
  albumUrl: ''
};

const AccommodationsPage: React.FC = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedAccommodationIds, setSelectedAccommodationIds] = useState<string[]>([]);
  const [editingAccommodationId, setEditingAccommodationId] = useState<string | null>(null);
  const [detailsAccommodation, setDetailsAccommodation] = useState<Accommodation | null>(null);
  const [formData, setFormData] = useState<AccommodationFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("list");
  const [loading, setLoading] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchAccommodations();
  }, []);
  
  const fetchAccommodations = async () => {
    setLoading(true);
    try {
      console.log('Fetching accommodations...');
      const data = await getAllAccommodations();
      console.log('Fetched accommodations:', data);
      setAccommodations(data);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      toast.error("Erro ao buscar acomodações");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAccommodation = () => {
    setFormData(initialFormData);
    setEditingAccommodationId(null);
    setIsDialogOpen(true);
  };
  
  const handleEditAccommodations = (ids: string[]) => {
    if (ids.length === 1) {
      const accommodationToEdit = accommodations.find(acc => acc.id === ids[0]);
      if (accommodationToEdit) {
        setFormData({
          name: accommodationToEdit.name,
          roomNumber: accommodationToEdit.roomNumber,
          category: accommodationToEdit.category,
          capacity: accommodationToEdit.capacity,
          description: accommodationToEdit.description,
          imageUrl: accommodationToEdit.imageUrl || '/placeholder.svg',
          images: accommodationToEdit.images || [],
          albumUrl: accommodationToEdit.albumUrl || '',
        });
        setEditingAccommodationId(ids[0]);
        setIsDialogOpen(true);
      }
    } else {
      toast.error("Selecione apenas uma acomodação para editar");
    }
  };
  
  const handleDeleteAccommodations = (ids: string[]) => {
    setSelectedAccommodationIds(ids);
    setIsDeleteDialogOpen(true);
  };
  
  const handleViewDetails = (id: string) => {
    const accommodationDetails = accommodations.find(acc => acc.id === id);
    if (accommodationDetails) {
      setDetailsAccommodation(accommodationDetails);
      setIsDetailsOpen(true);
    }
  };
  
  const handleOpenBlockDialog = (id: string) => {
    const accommodationToBlock = accommodations.find(acc => acc.id === id);
    if (accommodationToBlock) {
      setSelectedAccommodation(accommodationToBlock);
      setIsBlockDialogOpen(true);
    }
  };
  
  const confirmDelete = async () => {
    setLoading(true);
    try {
      console.log('Deleting accommodations:', selectedAccommodationIds);
      let successCount = 0;
      
      for (const id of selectedAccommodationIds) {
        const success = await deleteAccommodation(id);
        if (success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} acomodação(ões) excluída(s) com sucesso`);
        await fetchAccommodations(); // Re-fetch after deletion
      } else {
        toast.error("Não foi possível excluir nenhuma acomodação");
      }
    } catch (error) {
      console.error("Error deleting accommodations:", error);
      toast.error("Erro ao excluir acomodações");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedAccommodationIds([]);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
  };

  const handleImagesUpload = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images
    }));
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('Submitting accommodation form:', formData);
      const accommodationData = {
        ...formData,
        capacity: Number(formData.capacity),
        isBlocked: formData.isBlocked || false
      };
      
      if (editingAccommodationId) {
        const updated = await updateAccommodation(editingAccommodationId, accommodationData);
        if (updated) {
          toast.success("Acomodação atualizada com sucesso");
          await fetchAccommodations(); // Re-fetch after update
        } else {
          toast.error("Erro ao atualizar acomodação");
        }
      } else {
        const created = await createAccommodation(accommodationData);
        if (created) {
          toast.success("Acomodação criada com sucesso");
          await fetchAccommodations(); // Re-fetch after create
        } else {
          toast.error("Erro ao criar acomodação");
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving accommodation:", error);
      toast.error("Erro ao salvar acomodação");
    } finally {
      setLoading(false);
    }
  };
  
  const accommodationColumns = [
    {
      id: "name",
      header: "Nome",
      cell: (row: Accommodation) => (
        <div className="font-medium">{row.name}</div>
      ),
    },
    {
      id: "roomNumber",
      header: "Número",
      cell: (row: Accommodation) => (
        <div>{row.roomNumber}</div>
      ),
    },
    {
      id: "category",
      header: "Categoria",
      cell: (row: Accommodation) => (
        <div>{row.category}</div>
      ),
    },
    {
      id: "capacity",
      header: "Capacidade",
      cell: (row: Accommodation) => (
        <div>{row.capacity}</div>
      ),
    },
    {
      id: "albumLink",
      header: "Álbum",
      cell: (row: Accommodation) => (
        <div>
          {row.albumUrl ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                window.open(row.albumUrl, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acomodações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as acomodações disponíveis para reserva.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setIsCleanupDialogOpen(true)}
        >
          <Database className="h-4 w-4" />
          Limpar Banco de Dados
        </Button>
      </div>
      
      <Separator />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="new">Nova Acomodação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={handleAddAccommodation}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Acomodação
            </Button>
          </div>
          
          <MultiSelectTable
            data={accommodations}
            columns={accommodationColumns}
            getRowId={(row) => row.id}
            onEdit={handleEditAccommodations}
            onDelete={handleDeleteAccommodations}
            onRowClick={(row) => handleViewDetails(row.id)}
          />
        </TabsContent>
        
        <TabsContent value="new" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingAccommodationId ? 'Editar Acomodação' : 'Nova Acomodação'}</CardTitle>
              <CardDescription>
                Preencha os campos abaixo para {editingAccommodationId ? 'editar' : 'criar'} uma nova acomodação.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div>
                  <Label htmlFor="roomNumber">Número do Quarto</Label>
                  <Input 
                    type="text" 
                    id="roomNumber" 
                    name="roomNumber" 
                    value={formData.roomNumber} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as CategoryType }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categoria</SelectLabel>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Luxo">Luxo</SelectItem>
                        <SelectItem value="Super Luxo">Super Luxo</SelectItem>
                        <SelectItem value="De Luxe">De Luxe</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="capacity">Capacidade</Label>
                  <Input 
                    type="number" 
                    id="capacity" 
                    name="capacity" 
                    value={formData.capacity} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="albumUrl">Link para Álbum Externo</Label>
                <Input 
                  type="url" 
                  id="albumUrl" 
                  name="albumUrl" 
                  placeholder="https://exemplo.com/album" 
                  value={formData.albumUrl || ''} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                />
              </div>

              <div>
                <Label>Imagens</Label>
                <ImageUploader 
                  onImageUploaded={handleImageUpload} 
                  initialImages={formData.images}
                />
              </div>
              
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingAccommodationId ? 'Editar Acomodação' : 'Nova Acomodação'}</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para {editingAccommodationId ? 'editar' : 'criar'} uma nova acomodação.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="roomNumber">Número do Quarto</Label>
                <Input 
                  type="text" 
                  id="roomNumber" 
                  name="roomNumber" 
                  value={formData.roomNumber} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as CategoryType }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categoria</SelectLabel>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Luxo">Luxo</SelectItem>
                      <SelectItem value="Super Luxo">Super Luxo</SelectItem>
                      <SelectItem value="De Luxe">De Luxe</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input 
                  type="number" 
                  id="capacity" 
                  name="capacity" 
                  value={formData.capacity} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="albumUrl">Link para Álbum Externo</Label>
              <Input 
                type="url" 
                id="albumUrl" 
                name="albumUrl" 
                placeholder="https://exemplo.com/album" 
                value={formData.albumUrl || ''} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="grid gap-2">
              <Label>Imagem</Label>
              <ImageUploader 
                onImageUploaded={handleImageUpload}
                initialImages={formData.images}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AccommodationDetails 
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        accommodation={detailsAccommodation}
        onEdit={() => {
          if (detailsAccommodation) {
            handleEditAccommodations([detailsAccommodation.id]);
            setIsDetailsOpen(false);
          }
        }}
        onBlock={() => {
          if (detailsAccommodation) {
            handleOpenBlockDialog(detailsAccommodation.id);
            setIsDetailsOpen(false);
          }
        }}
        onDelete={() => {
          if (detailsAccommodation) {
            handleDeleteAccommodations([detailsAccommodation.id]);
            setIsDetailsOpen(false);
          }
        }}
      />
      
      <AccommodationBlockDialog
        isOpen={isBlockDialogOpen}
        onOpenChange={setIsBlockDialogOpen}
        accommodation={selectedAccommodation}
        onUpdate={() => {
          setIsBlockDialogOpen(false);
          fetchAccommodations();
        }}
      />
      
      <CategoryManagementDialog
        isOpen={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onUpdate={() => fetchAccommodations()}
      />
      
      <DatabaseCleanupDialog
        isOpen={isCleanupDialogOpen}
        onOpenChange={setIsCleanupDialogOpen}
        onCleanupComplete={fetchAccommodations}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedAccommodationIds.length} acomodação(ões)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={loading}>
              {loading ? "Processando..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccommodationsPage;
