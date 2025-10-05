import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Guest } from "@/types/guest";
import { guestService } from "@/integrations/supabase/services/guestService";
import { useToast } from "@/hooks/use-toast";

interface GuestSelectorProps {
  value?: string;
  onValueChange: (guestId: string | undefined, guest: Guest | undefined) => void;
  onNewGuest: () => void;
}

export const GuestSelector = ({ value, onValueChange, onNewGuest }: GuestSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await guestService.getAllGuests();
      setGuests(data);
    } catch (error) {
      console.error("Error loading guests:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os hóspedes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const results = await guestService.searchGuests(query);
        setGuests(results);
      } catch (error) {
        console.error("Error searching guests:", error);
      }
    } else if (query.length === 0) {
      loadGuests();
    }
  };

  const selectedGuest = guests.find((guest) => guest.id === value);

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between"
          >
            {selectedGuest
              ? `${selectedGuest.first_name} ${selectedGuest.last_name}`
              : "Selecionar hóspede existente..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Buscar hóspede..."
              value={searchQuery}
              onValueChange={handleSearch}
            />
            <CommandEmpty>
              {loading ? "Carregando..." : "Nenhum hóspede encontrado."}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {guests.map((guest) => (
                <CommandItem
                  key={guest.id}
                  value={guest.id}
                  onSelect={(currentValue) => {
                    const selected = guests.find(g => g.id === currentValue);
                    onValueChange(
                      currentValue === value ? undefined : currentValue,
                      currentValue === value ? undefined : selected
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === guest.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {guest.first_name} {guest.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {guest.email} {guest.phone ? `• ${guest.phone}` : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onNewGuest}
        title="Cadastrar novo hóspede"
      >
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  );
};
