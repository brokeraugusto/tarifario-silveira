import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { GuestsList } from "@/components/guests/GuestsList";
import { GuestFormDialog } from "@/components/guests/GuestFormDialog";
import { Guest } from "@/types/guest";
import { guestService } from "@/integrations/supabase/services/guestService";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
const GuestsPage = () => {
  const {
    toast
  } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await guestService.getAllGuests();
      setGuests(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar hóspedes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadGuests();
  }, []);
  const handleNewGuest = () => {
    setSelectedGuest(null);
    setIsFormOpen(true);
  };
  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsFormOpen(true);
  };
  const handleDeleteGuest = (guest: Guest) => {
    setGuestToDelete(guest);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!guestToDelete) return;
    try {
      await guestService.deleteGuest(guestToDelete.id);
      toast({
        title: "Sucesso",
        description: "Hóspede excluído com sucesso"
      });
      loadGuests();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir hóspede",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setGuestToDelete(null);
    }
  };
  return <Layout>
      <div className="container mx-auto p-6 space-y-6 py-0 px-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hóspedes</h1>
          <p className="text-muted-foreground">Gerencie o cadastro de hóspedes</p>
        </div>
        
        <GuestsList guests={guests} onEdit={handleEditGuest} onDelete={handleDeleteGuest} onNewGuest={handleNewGuest} loading={loading} />
      </div>

      <GuestFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} guest={selectedGuest} onSuccess={loadGuests} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Hóspede</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o hóspede{" "}
              <strong>
                {guestToDelete?.first_name} {guestToDelete?.last_name}
              </strong>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>;
};
export default GuestsPage;