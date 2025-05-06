
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Search } from 'lucide-react';
import { Accommodation } from '@/types';
import { getAllAccommodations, createAccommodation, updateAccommodation, deleteAccommodation } from '@/integrations/supabase';
import AccommodationDetails from '@/components/AccommodationDetails';
import AccommodationForm from '@/components/AccommodationForm';

// Add imports for ContextMenu components
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Lock, Unlock } from "lucide-react";
import AccommodationBlockDialog from "@/components/AccommodationBlockDialog";

const AccommodationsPage = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState<Accommodation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [accommodationToEdit, setAccommodationToEdit] = useState<Accommodation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add these new state variables
  const [selectedAccommodationForBlocking, setSelectedAccommodationForBlocking] = useState<Accommodation | null>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  const loadAccommodations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllAccommodations();
      setAccommodations(data);
    } catch (error) {
      console.error("Error loading accommodations:", error);
      toast.error("Failed to load accommodations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccommodations();
  }, [loadAccommodations]);

  useEffect(() => {
    let results = [...accommodations];

    if (searchQuery) {
      results = results.filter(acc =>
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter) {
      results = results.filter(acc => acc.category === categoryFilter);
    }

    setFilteredAccommodations(results);
  }, [accommodations, searchQuery, categoryFilter]);

  const handleAccommodationClick = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedAccommodation(null);
  };

  const handleCreateAccommodation = () => {
    setAccommodationToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditAccommodation = (accommodation: Accommodation) => {
    setAccommodationToEdit(accommodation);
    setIsFormOpen(true);
  };

  const handleDeleteAccommodation = async (accommodation: Accommodation) => {
    try {
      const success = await deleteAccommodation(accommodation.id);
      if (success) {
        toast.success("Accommodation deleted successfully");
        loadAccommodations();
      } else {
        toast.error("Failed to delete accommodation");
      }
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      toast.error("Failed to delete accommodation");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setAccommodationToEdit(null);
  };

  const handleAccommodationUpdate = (updatedAccommodation: Accommodation) => {
    setAccommodations(accommodations.map(acc =>
      acc.id === updatedAccommodation.id ? updatedAccommodation : acc
    ));
    setFilteredAccommodations(filteredAccommodations.map(acc =>
      acc.id === updatedAccommodation.id ? updatedAccommodation : acc
    ));
  };

  // Add this new function
  const handleBlockAccommodation = (accommodation: Accommodation) => {
    setSelectedAccommodationForBlocking(accommodation);
    setIsBlockDialogOpen(true);
  };

  const handleUpdateAccommodation = (updated: Accommodation) => {
    loadAccommodations(); // Reload the accommodations after an update
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-hotel-navy">Gerenciar Acomodações</h1>
        <p className="text-muted-foreground mt-2">
          Visualize, edite e gerencie as acomodações disponíveis.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          type="search"
          placeholder="Buscar acomodação..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        <Select onValueChange={setCategoryFilter} defaultValue={categoryFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as categorias</SelectItem>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Luxo">Luxo</SelectItem>
            <SelectItem value="Super Luxo">Super Luxo</SelectItem>
            <SelectItem value="Master">Master</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleCreateAccommodation}>Adicionar Acomodação</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAccommodations.map((accommodation) => (
          <ContextMenu key={accommodation.id}>
            <ContextMenuTrigger>
              <Card
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  accommodation.isBlocked ? 'border-red-300 bg-red-50' : ''
                }`}
                onClick={() => handleAccommodationClick(accommodation)}
              >
                <CardHeader>
                  <CardTitle>{accommodation.name}</CardTitle>
                  <CardDescription>Número: {accommodation.roomNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  Categoria: {accommodation.category}
                  <br />
                  Capacidade: {accommodation.capacity}
                </CardContent>
                {accommodation.isBlocked && (
                  <CardFooter className="justify-between items-center">
                    <Label className="text-red-600">Bloqueado</Label>
                  </CardFooter>
                )}
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleAccommodationClick(accommodation)}>
                Ver Detalhes
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleEditAccommodation(accommodation)}>
                Editar
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleBlockAccommodation(accommodation)}>
                {accommodation.isBlocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Desbloquear
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Bloquear
                  </>
                )}
              </ContextMenuItem>
              <ContextMenuItem
                className="text-red-600"
                onClick={() => handleDeleteAccommodation(accommodation)}
              >
                Excluir
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      <AccommodationDetails
        accommodation={selectedAccommodation}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={() => {
          handleEditAccommodation(selectedAccommodation!);
          setIsDetailsOpen(false);
        }}
        onBlock={() => {
          handleBlockAccommodation(selectedAccommodation!);
          setIsDetailsOpen(false);
        }}
        onDelete={() => {
          handleDeleteAccommodation(selectedAccommodation!);
          setIsDetailsOpen(false);
        }}
      />

      <AccommodationForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        accommodation={accommodationToEdit}
        onUpdate={handleAccommodationUpdate}
        loadAccommodations={loadAccommodations}
      />

      <AccommodationBlockDialog
        accommodation={selectedAccommodationForBlocking}
        isOpen={isBlockDialogOpen}
        onOpenChange={setIsBlockDialogOpen}
        onUpdate={handleUpdateAccommodation}
      />
    </div>
  );
};

export default AccommodationsPage;
