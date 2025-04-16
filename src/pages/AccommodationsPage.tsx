
import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Users, Images, Lock, Unlock } from 'lucide-react';
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
  CardDescription,
} from "@/components/ui/card";
import { Accommodation, CategoryType } from '@/types';
import { 
  getAllAccommodations, 
  createAccommodation, 
  updateAccommodation, 
  deleteAccommodation,
} from '@/integrations/supabase/accommodationService';
import AccommodationBlockDialog from '@/components/AccommodationBlockDialog';
import CategoryPriceDialog from '@/components/CategoryPriceDialog';
import AccommodationDetails from '@/components/AccommodationDetails';
import ImageUploader from '@/components/ImageUploader';
import { uploadImage } from '@/integrations/supabase/storageService';

interface AccommodationFormData {
  name: string;
  roomNumber: string;
  category: CategoryType;
  capacity: number;
  description: string;
  imageUrl: string;
  images: string[];
}

const initialFormData: AccommodationFormData = {
  name: '',
  roomNumber: '',
  category: 'Standard',
  capacity: 2,
  description: '',
  imageUrl: '/placeholder.svg',
  images: []
};

const AccommodationsPage = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [formData, setFormData] = useState<AccommodationFormData>({...initialFormData});
  const [editId, setEditId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [imageInputs, setImageInputs] = useState<string[]>(['']);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [categoryPriceDialogOpen, setCategoryPriceDialogOpen] = useState(false);
  const [selectedCategoryForPrices, setSelectedCategoryForPrices] = useState<CategoryType>('Standard');
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch accommodations when component mounts
  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    setLoading(true);
    try {
      const data = await getAllAccommodations();
      setAccommodations(data);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      toast.error("Erro ao carregar acomodações");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetailsDialog = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setDetailsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacity' ? parseInt(value) : value
    });
  };

  const handleImageInputChange = (index: number, value: string) => {
    const updatedInputs = [...imageInputs];
    updatedInputs[index] = value;
    
    // If the last input is filled, add a new empty input
    if (index === updatedInputs.length - 1 && value) {
      updatedInputs.push('');
    }
    
    setImageInputs(updatedInputs);
    
    // Update formData with non-empty image URLs
    const nonEmptyUrls = updatedInputs.filter(url => url.trim() !== '');
    setFormData({
      ...formData,
      images: nonEmptyUrls
    });
  };

  const removeImageInput = (index: number) => {
    const updatedInputs = imageInputs.filter((_, i) => i !== index);
    setImageInputs(updatedInputs);
    
    // Update formData with non-empty image URLs
    const nonEmptyUrls = updatedInputs.filter(url => url.trim() !== '');
    setFormData({
      ...formData,
      images: nonEmptyUrls
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
    setImageInputs(['']);
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData({
      ...formData,
      imageUrl
    });
  };

  const handleOpenDialog = (accommodation?: Accommodation) => {
    if (accommodation) {
      setFormData({
        name: accommodation.name,
        roomNumber: accommodation.roomNumber,
        category: accommodation.category,
        capacity: accommodation.capacity,
        description: accommodation.description,
        imageUrl: accommodation.imageUrl,
        images: accommodation.images || []
      });
      setEditId(accommodation.id);
      
      // Set image inputs based on existing images
      const inputs = accommodation.images && accommodation.images.length > 0 
        ? [...accommodation.images, ''] 
        : [''];
      setImageInputs(inputs);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    resetForm();
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editId) {
        // Atualizar acomodação existente
        const updated = await updateAccommodation(editId, formData);
        if (updated) {
          toast.success("Acomodação atualizada com sucesso");
          await fetchAccommodations();
        } else {
          toast.error("Erro ao atualizar acomodação");
        }
      } else {
        // Criar nova acomodação
        const created = await createAccommodation({
          ...formData,
          isBlocked: false
        });
        
        if (created) {
          toast.success("Acomodação criada com sucesso");
          await fetchAccommodations();
        } else {
          toast.error("Erro ao criar acomodação");
        }
      }
      
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar acomodação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const deleted = await deleteAccommodation(id);
      if (deleted) {
        toast.success("Acomodação excluída com sucesso");
        await fetchAccommodations();
      } else {
        toast.error("Erro ao excluir acomodação");
      }
    } catch (error) {
      toast.error("Erro ao excluir acomodação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedAccommodations(prev => {
      if (prev.includes(id)) {
        return prev.filter(accId => accId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAll) {
      setSelectedAccommodations([]);
    } else {
      const allIds = accommodations.map(acc => acc.id);
      setSelectedAccommodations(allIds);
    }
    setSelectedAll(!selectedAll);
  };
  
  const handleOpenBlockDialog = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setBlockDialogOpen(true);
  };

  const openCategoryPriceDialog = (category: CategoryType) => {
    setSelectedCategoryForPrices(category);
    setCategoryPriceDialogOpen(true);
  };

  const handleAccommodationUpdate = () => {
    fetchAccommodations();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Luxo':
        return 'bg-purple-100 text-purple-800';
      case 'Super Luxo':
        return 'bg-amber-100 text-amber-800';
      case 'De Luxe':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const countByCategory = (category: CategoryType) => {
    return accommodations.filter(acc => acc.category === category).length;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-hotel-navy">Gerenciar Acomodações</h1>
          <p className="text-muted-foreground mt-2">Cadastre e edite as acomodações disponíveis.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nova Acomodação</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Acomodações</CardTitle>
          {selectedAccommodations.length > 0 && (
            <CardDescription>
              {selectedAccommodations.length} acomodações selecionadas
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={selectedAll} 
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todas as acomodações" 
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">Número</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Capacidade</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accommodations.map((accommodation) => (
                  <TableRow 
                    key={accommodation.id}
                    className={accommodation.isBlocked ? "bg-gray-50" : ""}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedAccommodations.includes(accommodation.id)}
                        onCheckedChange={() => handleCheckboxChange(accommodation.id)}
                        aria-label={`Selecionar ${accommodation.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{accommodation.roomNumber}</TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal" 
                        onClick={() => handleOpenDetailsDialog(accommodation)}
                      >
                        {accommodation.name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(accommodation.category)}>
                        {accommodation.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Users className="h-4 w-4 mr-1" />
                        {accommodation.capacity}
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      {accommodation.isBlocked ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <Lock className="h-3 w-3 mr-1" />
                          Bloqueado: {accommodation.blockReason}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Disponível
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={accommodation.isBlocked ? "text-red-600" : "text-blue-600"}
                          onClick={() => handleOpenBlockDialog(accommodation)}
                        >
                          {accommodation.isBlocked ? (
                            <Unlock className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </Button>
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
                {accommodations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {loading ? "Carregando acomodações..." : "Nenhuma acomodação encontrada"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar uma acomodação individual */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                        <SelectItem value="De Luxe">De Luxe</SelectItem>
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
                <Label htmlFor="imageUrl">Imagem Principal (Upload)</Label>
                <div className="grid gap-2">
                  <ImageUploader onImageUploaded={handleImageUploaded} />
                  {formData.imageUrl && formData.imageUrl !== '/placeholder.svg' && (
                    <div className="mt-2 relative">
                      <img 
                        src={formData.imageUrl} 
                        alt="Imagem principal" 
                        className="w-full h-32 object-cover rounded-md" 
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        type="button"
                        onClick={() => setFormData({...formData, imageUrl: '/placeholder.svg'})}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Images className="h-4 w-4" />
                  Links para Imagens Adicionais
                </Label>
                <div className="space-y-2">
                  {imageInputs.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) => handleImageInputChange(index, e.target.value)}
                        placeholder="URL da imagem"
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImageInput(index)}
                          className="h-10 w-10 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione URLs de imagens para compartilhar com clientes via WhatsApp. Uma nova linha aparecerá automaticamente.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleCloseDialog} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para detalhes da acomodação com botão de compartilhamento */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Acomodação</DialogTitle>
          </DialogHeader>
          {selectedAccommodation && (
            <AccommodationDetails accommodation={selectedAccommodation} />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog para bloquear/desbloquear acomodação */}
      {selectedAccommodation && (
        <AccommodationBlockDialog
          accommodation={selectedAccommodation}
          isOpen={blockDialogOpen}
          onOpenChange={setBlockDialogOpen}
          onUpdate={handleAccommodationUpdate}
        />
      )}
      
      {/* Dialog para gerenciar preços por categoria */}
      <CategoryPriceDialog
        category={selectedCategoryForPrices}
        isOpen={categoryPriceDialogOpen}
        onOpenChange={setCategoryPriceDialogOpen}
        onUpdate={handleAccommodationUpdate}
      />
    </div>
  );
};

export default AccommodationsPage;
