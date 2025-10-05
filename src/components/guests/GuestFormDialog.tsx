import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import InputMask from "react-input-mask";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Guest } from "@/types/guest";
import { guestService } from "@/integrations/supabase/services/guestService";
import { useToast } from "@/hooks/use-toast";

// Validação robusta de CPF
const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

const formSchema = z.object({
  first_name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  last_name: z.string().trim().min(1, "Sobrenome é obrigatório").max(100, "Sobrenome deve ter no máximo 100 caracteres"),
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres"),
  phone: z.string().optional(),
  document_type: z.enum(["cpf", "rg", "passport", "other"]).default("cpf"),
  document_number: z.string().optional().refine((val) => {
    if (!val) return true; // Optional
    return val.length >= 3;
  }, "Documento inválido"),
  date_of_birth: z.string().optional(),
  nationality: z.string().trim().max(100).optional(),
  address_street: z.string().trim().max(255).optional(),
  address_city: z.string().trim().max(100).optional(),
  address_state: z.string().trim().max(100).optional(),
  address_zip_code: z.string().trim().max(20).optional(),
  address_country: z.string().trim().max(100).optional(),
  emergency_contact_name: z.string().trim().max(100).optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().trim().max(1000).optional(),
}).refine((data) => {
  if (data.document_type === "cpf" && data.document_number) {
    return validateCPF(data.document_number);
  }
  return true;
}, {
  message: "CPF inválido",
  path: ["document_number"],
});

interface GuestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Guest | null;
  onSuccess: (createdGuest?: Guest) => void;
}

export const GuestFormDialog = ({
  open,
  onOpenChange,
  guest,
  onSuccess,
}: GuestFormDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      document_number: "",
      document_type: "cpf",
      date_of_birth: "",
      nationality: "Brasil",
      address_street: "",
      address_city: "",
      address_state: "",
      address_zip_code: "",
      address_country: "Brasil",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (guest) {
      const docType = guest.document_type || "cpf";
      const validDocType = ["cpf", "rg", "passport", "other"].includes(docType) 
        ? docType as "cpf" | "rg" | "passport" | "other"
        : "cpf";
        
      form.reset({
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone || "",
        document_number: guest.document_number || "",
        document_type: validDocType,
        date_of_birth: guest.date_of_birth || "",
        nationality: guest.nationality || "Brasil",
        address_street: guest.address_street || "",
        address_city: guest.address_city || "",
        address_state: guest.address_state || "",
        address_zip_code: guest.address_zip_code || "",
        address_country: guest.address_country || "Brasil",
        emergency_contact_name: guest.emergency_contact_name || "",
        emergency_contact_phone: guest.emergency_contact_phone || "",
        notes: guest.notes || "",
      });
    } else {
      form.reset();
    }
  }, [guest, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      let savedGuest: Guest | null = null;
      
      if (guest) {
        savedGuest = await guestService.updateGuest(guest.id, values as any);
        toast({
          title: "Sucesso",
          description: "Hóspede atualizado com sucesso",
        });
      } else {
        savedGuest = await guestService.createGuest(values as any);
        toast({
          title: "Sucesso",
          description: "Hóspede cadastrado com sucesso",
        });
      }
      
      onSuccess(savedGuest || undefined);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar hóspede",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {guest ? "Editar Hóspede" : "Novo Hóspede"}
          </DialogTitle>
          <DialogDescription>
            {guest ? "Atualize as informações do hóspede" : "Preencha os dados do novo hóspede"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <InputMask
                        mask="(99) 99999-9999"
                        value={field.value || ""}
                        onChange={field.onChange}
                      >
                        {(inputProps: any) => <Input {...inputProps} />}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="rg">RG</SelectItem>
                        <SelectItem value="passport">Passaporte</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document_number"
                render={({ field }) => {
                  const documentType = form.watch("document_type");
                  const mask = documentType === "cpf" ? "999.999.999-99" : "";
                  
                  return (
                    <FormItem>
                      <FormLabel>Número do Documento</FormLabel>
                      <FormControl>
                        {mask ? (
                          <InputMask
                            mask={mask}
                            value={field.value || ""}
                            onChange={field.onChange}
                          >
                            {(inputProps: any) => <Input {...inputProps} />}
                          </InputMask>
                        ) : (
                          <Input {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacionalidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato de Emergência</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tel. de Emergência</FormLabel>
                    <FormControl>
                      <InputMask
                        mask="(99) 99999-9999"
                        value={field.value || ""}
                        onChange={field.onChange}
                      >
                        {(inputProps: any) => <Input {...inputProps} />}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address_street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
