
import React, { useState, useEffect } from 'react';
import { Plus, Database } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accommodation, CategoryType } from '@/types';
import { 
  getAllAccommodations, 
  deleteAccommodation,
} from '@/integrations/supabase';
import {
  blockAccommodation,
  unblockAccommodation
} from '@/integrations/supabase/services/accommodations/blocking';
import AccommodationDetails from '@/components/AccommodationDetails';
import AccommodationBlockDialog from '@/components/AccommodationBlockDialog';
import CategoryManagementDialog from '@/components/CategoryManagementDialog';
import DatabaseCleanupDialog from '@/components/DatabaseCleanupDialog';
import AccommodationsTable from '@/components/accommodations/AccommodationsTable';
import AccommodationForm from '@/components/accommodations/AccommodationForm';
import AccommodationFormDialog from '@/components/accommodations/AccommodationFormDialog';
import DeleteConfirmationDialog from '@/components/accommodations/DeleteConfirmationDialog';

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

  const handleActivateAccommodation = async (ids: string[]) => {
    if (ids.length !== 1) {
      toast.error("Selecione apenas uma acomodação para ativar");
      return;
    }
    
    setLoading(true);
    try {
      console.log('Activating accommodation:', ids[0]);
      const updated = await unblockAccommodation(ids[0]);
      
      if (updated) {
        toast.success("Acomodação ativada com sucesso");
        await fetchAccommodations(); // Re-fetch after update
      } else {
        toast.error("Erro ao ativar acomodação");
      }
    } catch (error) {
      console.error("Error activating accommodation:", error);
      toast.error("Erro ao ativar acomodação");
    } finally {
      setLoading(false);
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
          
          <AccommodationsTable
            accommodations={accommodations}
            onEdit={handleEditAccommodations}
            onDelete={handleDeleteAccommodations}
            onBlock={handleOpenBlockDialog}
            onActivate={handleActivateAccommodation}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
        
        <TabsContent value="new" className="space-y-4 mt-4">
          <AccommodationForm
            formData={formData}
            setFormData={setFormData}
            editingAccommodationId={editingAccommodationId}
            onSuccess={fetchAccommodations}
            loading={loading}
            setLoading={setLoading}
          />
        </TabsContent>
      </Tabs>
      
      <AccommodationFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        setFormData={setFormData}
        editingAccommodationId={editingAccommodationId}
        onSuccess={fetchAccommodations}
        loading={loading}
        setLoading={setLoading}
      />
      
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
        onUpdate={(updated) => {
          setAccommodations(prev => prev.map(acc => 
            acc.id === updated.id ? updated : acc
          ));
          setIsBlockDialogOpen(false);
        }}
      />
      
      <CategoryManagementDialog
        isOpen={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onUpdate={fetchAccommodations}
      />
      
      <DatabaseCleanupDialog
        isOpen={isCleanupDialogOpen}
        onOpenChange={setIsCleanupDialogOpen}
        onCleanupComplete={fetchAccommodations}
      />
      
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedIds={selectedAccommodationIds}
        onConfirm={confirmDelete}
        loading={loading}
      />
    </div>
  );
};

export default AccommodationsPage;
