
import React, { useState } from 'react';
import { PlusCircle, Pencil, Trash2, X } from 'lucide-react';
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Accommodation, CategoryType } from '@/types';
import { 
  getAllAccommodations, 
  createAccommodation, 
  updateAccommodation, 
  deleteAccommodation 
} from '@/utils/accommodationService';

interface AccommodationFormData {
  name: string;
  roomNumber: string;
  category: CategoryType;
  capacity: number;
  description: string;
  imageUrl: string;
}

const initialFormData: AccommodationFormData = {
  name: '',
  roomNumber: '',
  category: 'Standard',
  capacity: 2,
  description: '',
  imageUrl: '/placeholder.svg'
};

const AccommodationsPage = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>(getAllAccommodations());
  const [formData, setFormData] = useState<AccommodationFormData>({...initialFormData});
  const [editId, setEditId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacity' ? parseInt(value) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({...initialFormData});
    setEditId(null);
  };

  const handleOpenDialog = (accommodation?: Accommodation) => {
    if (accommodation) {
      setFormData({
        name: accommodation.name,
        roomNumber: accommodation.roomNumber,
        category: accommodation.category,
        capacity: accommodation.capacity,
        description: accommodation.description,
        imageUrl: accommodation.imageUrl
      });
      setEditId(accommodation.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    resetForm();
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editId) {
        // Atualizar acomodação existente
        const updated = updateAccommodation(editId, formData);
        if (updated) {
          toast.success("Acomodação atualizada com sucesso");
          setAccommodations(getAllAccommodations());
        }
      } else {
        // Criar nova acomodação
        const created = createAccommodation(formData);
        toast.success("Acomodação criada com sucesso");
        setAccommodations(getAllAccommodations());
      }
      
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar acomodação");
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    const deleted = deleteAccommodation(id);
    if (deleted) {
      toast.success("Acomodação excluída com sucesso");
      setAccommodations(getAllAccommodations());
    } else {
      toast.error("Erro ao excluir acomodação");
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Luxo':
        return 'bg-purple-100 text-purple-800';
      case 'Super Luxo':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-hotel-navy">Gerenciar Acomodações</h1>
          <p className="text-muted-foreground mt-2">Cadastre e edite as acomodações disponíveis.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Acomodação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Acomodações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Número</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Capacidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accommodations.map((accommodation) => (
                <TableRow key={accommodation.id}>
                  <TableCell className="font-medium">{accommodation.roomNumber}</TableCell>
                  <TableCell>{accommodation.name}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(accommodation.category)}>
                      {accommodation.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{accommodation.capacity} pessoas</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenDialog(accommodation)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmação</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a acomodação "{accommodation.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(accommodation.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Acomodação' : 'Nova Acomodação'}</DialogTitle>
            <DialogDescription>
              {editId 
                ? 'Atualize os detalhes da acomodação existente.' 
                : 'Preencha os campos para cadastrar uma nova acomodação.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Número do Quarto</Label>
                  <Input
                    id="roomNumber"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Acomodação</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categorias</SelectLabel>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Luxo">Luxo</SelectItem>
                        <SelectItem value="Super Luxo">Super Luxo</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade (pessoas)</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="/placeholder.svg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccommodationsPage;
