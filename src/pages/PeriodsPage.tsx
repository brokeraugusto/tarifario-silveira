
import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Calendar, DollarSign } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PricePeriod, PriceByPeople, Accommodation } from '@/types';
import { 
  getAllPricePeriods, 
  createPricePeriod, 
  updatePricePeriod, 
  deletePricePeriod,
  getAllAccommodations,
  getPricesForAccommodation,
  createPrice,
  updatePrice,
  deletePrice
} from '@/utils/accommodationService';

interface PeriodFormData {
  name: string;
  dateRange: DateRange;
  isHoliday: boolean;
  minimumStay: number;
}

interface PriceFormData {
  accommodationId: string;
  periodId: string;
  people: number;
  pricePerNight: number;
}

const initialPeriodForm: PeriodFormData = {
  name: '',
  dateRange: {
    from: new Date(),
    to: new Date()
  },
  isHoliday: false,
  minimumStay: 1
};

const initialPriceForm: PriceFormData = {
  accommodationId: '',
  periodId: '',
  people: 1,
  pricePerNight: 0
};

const PeriodsPage = () => {
  // Estados para períodos
  const [periods, setPeriods] = useState<PricePeriod[]>(getAllPricePeriods());
  const [periodForm, setPeriodForm] = useState<PeriodFormData>({...initialPeriodForm});
  const [editPeriodId, setEditPeriodId] = useState<string | null>(null);
  const [isPeriodDialogOpen, setIsPeriodDialogOpen] = useState(false);
  
  // Estados para preços
  const [accommodations] = useState<Accommodation[]>(getAllAccommodations());
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<string>('');
  const [prices, setPrices] = useState<PriceByPeople[]>([]);
  const [priceForm, setPriceForm] = useState<PriceFormData>({...initialPriceForm});
  const [editPriceId, setEditPriceId] = useState<string | null>(null);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedAccommodationId) {
      setPrices(getPricesForAccommodation(selectedAccommodationId));
    } else {
      setPrices([]);
    }
  }, [selectedAccommodationId]);

  // Gerenciamento de períodos
  const handlePeriodInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPeriodForm({
      ...periodForm,
      [name]: type === 'checkbox' ? checked : 
              name === 'minimumStay' ? parseInt(value) : value
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setPeriodForm({
        ...periodForm,
        dateRange: range
      });
    }
  };

  const handleIsHolidayChange = (checked: boolean) => {
    setPeriodForm({
      ...periodForm,
      isHoliday: checked
    });
  };

  const resetPeriodForm = () => {
    setPeriodForm({...initialPeriodForm});
    setEditPeriodId(null);
  };

  const handleOpenPeriodDialog = (period?: PricePeriod) => {
    if (period) {
      setPeriodForm({
        name: period.name,
        dateRange: {
          from: period.startDate,
          to: period.endDate
        },
        isHoliday: period.isHoliday,
        minimumStay: period.minimumStay
      });
      setEditPeriodId(period.id);
    } else {
      resetPeriodForm();
    }
    setIsPeriodDialogOpen(true);
  };

  const handleClosePeriodDialog = () => {
    resetPeriodForm();
    setIsPeriodDialogOpen(false);
  };

  const handlePeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!periodForm.dateRange.from || !periodForm.dateRange.to) {
      toast.error("Selecione as datas de início e fim do período");
      return;
    }
    
    try {
      const periodData = {
        name: periodForm.name,
        startDate: periodForm.dateRange.from,
        endDate: periodForm.dateRange.to,
        isHoliday: periodForm.isHoliday,
        minimumStay: periodForm.minimumStay
      };
      
      if (editPeriodId) {
        // Atualizar período existente
        const updated = updatePricePeriod(editPeriodId, periodData);
        if (updated) {
          toast.success("Período atualizado com sucesso");
          setPeriods(getAllPricePeriods());
        }
      } else {
        // Criar novo período
        const created = createPricePeriod(periodData);
        toast.success("Período criado com sucesso");
        setPeriods(getAllPricePeriods());
      }
      
      handleClosePeriodDialog();
    } catch (error) {
      toast.error("Erro ao salvar período");
      console.error(error);
    }
  };

  const handleDeletePeriod = (id: string) => {
    const deleted = deletePricePeriod(id);
    if (deleted) {
      toast.success("Período excluído com sucesso");
      setPeriods(getAllPricePeriods());
    } else {
      toast.error("Erro ao excluir período");
    }
  };

  // Gerenciamento de preços
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceForm({
      ...priceForm,
      [name]: name === 'pricePerNight' || name === 'people' ? parseFloat(value) : value
    });
  };

  const handlePriceSelectChange = (name: string, value: string) => {
    setPriceForm({
      ...priceForm,
      [name]: value
    });
  };

  const resetPriceForm = () => {
    setPriceForm({
      ...initialPriceForm,
      accommodationId: selectedAccommodationId,
    });
    setEditPriceId(null);
  };

  const handleOpenPriceDialog = (price?: PriceByPeople) => {
    if (!selectedAccommodationId) {
      toast.error("Selecione uma acomodação primeiro");
      return;
    }
    
    if (price) {
      setPriceForm({
        accommodationId: price.accommodationId,
        periodId: price.periodId,
        people: price.people,
        pricePerNight: price.pricePerNight
      });
      setEditPriceId(price.id);
    } else {
      resetPriceForm();
    }
    setIsPriceDialogOpen(true);
  };

  const handleClosePriceDialog = () => {
    resetPriceForm();
    setIsPriceDialogOpen(false);
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editPriceId) {
        // Atualizar preço existente
        const updated = updatePrice(editPriceId, priceForm);
        if (updated) {
          toast.success("Preço atualizado com sucesso");
          setPrices(getPricesForAccommodation(selectedAccommodationId));
        }
      } else {
        // Criar novo preço
        const created = createPrice(priceForm);
        toast.success("Preço criado com sucesso");
        setPrices(getPricesForAccommodation(selectedAccommodationId));
      }
      
      handleClosePriceDialog();
    } catch (error) {
      toast.error("Erro ao salvar preço");
      console.error(error);
    }
  };

  const handleDeletePrice = (id: string) => {
    const deleted = deletePrice(id);
    if (deleted) {
      toast.success("Preço excluído com sucesso");
      setPrices(getPricesForAccommodation(selectedAccommodationId));
    } else {
      toast.error("Erro ao excluir preço");
    }
  };

  // Funções auxiliares
  const getAccommodationById = (id: string): Accommodation | undefined => {
    return accommodations.find(acc => acc.id === id);
  };

  const getPeriodById = (id: string): PricePeriod | undefined => {
    return periods.find(period => period.id === id);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-hotel-navy">Períodos e Preços</h1>
        <p className="text-muted-foreground mt-2">Gerencie períodos sazonais e preços por acomodação e número de hóspedes.</p>
      </div>

      <Tabs defaultValue="periods" className="space-y-6">
        <TabsList>
          <TabsTrigger value="periods" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Períodos
          </TabsTrigger>
          <TabsTrigger value="prices" className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Preços
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="periods" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Gerenciar Períodos</h2>
            <Button onClick={() => handleOpenPeriodDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Período
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Fim</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                    <TableHead className="text-center">Diárias Mínimas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">{period.name}</TableCell>
                      <TableCell>{format(period.startDate, 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(period.endDate, 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={period.isHoliday ? "default" : "outline"}>
                          {period.isHoliday ? 'Feriado' : 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{period.minimumStay}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenPeriodDialog(period)}
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
                                  Tem certeza que deseja excluir o período "{period.name}"?
                                  Esta ação não pode ser desfeita e pode afetar os preços relacionados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePeriod(period.id)}
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
        </TabsContent>
        
        <TabsContent value="prices" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h2 className="text-2xl font-semibold">Gerenciar Preços</h2>
            
            <div className="w-full md:w-[300px]">
              <Select 
                value={selectedAccommodationId} 
                onValueChange={setSelectedAccommodationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma acomodação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Acomodações</SelectLabel>
                    {accommodations.map((accommodation) => (
                      <SelectItem key={accommodation.id} value={accommodation.id}>
                        {accommodation.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => handleOpenPriceDialog()} 
              disabled={!selectedAccommodationId}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Preço
            </Button>
          </div>
          
          {selectedAccommodationId ? (
            <Card>
              <CardHeader>
                <CardTitle>Preços para {getAccommodationById(selectedAccommodationId)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {prices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-center">Pessoas</TableHead>
                        <TableHead className="text-right">Valor (diária)</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prices.map((price) => {
                        const period = getPeriodById(price.periodId);
                        return (
                          <TableRow key={price.id}>
                            <TableCell className="font-medium">
                              {period?.name || 'Período desconhecido'}
                            </TableCell>
                            <TableCell className="text-center">{price.people}</TableCell>
                            <TableCell className="text-right">R$ {price.pricePerNight.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleOpenPriceDialog(price)}
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
                                        Tem certeza que deseja excluir este preço?
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeletePrice(price.id)}
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
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhum preço cadastrado para esta acomodação.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="bg-muted/40 rounded-lg p-10 text-center">
              <p className="text-muted-foreground">
                Selecione uma acomodação para gerenciar seus preços.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para períodos */}
      <Dialog open={isPeriodDialogOpen} onOpenChange={setIsPeriodDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editPeriodId ? 'Editar Período' : 'Novo Período'}</DialogTitle>
            <DialogDescription>
              {editPeriodId 
                ? 'Atualize os detalhes do período existente.' 
                : 'Defina um novo período para aplicação de preços.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePeriodSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Período</Label>
                <Input
                  id="name"
                  name="name"
                  value={periodForm.name}
                  onChange={handlePeriodInputChange}
                  placeholder="Ex: Alta Temporada, Feriado de Carnaval"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Período</Label>
                <DatePickerWithRange 
                  dateRange={periodForm.dateRange} 
                  onDateRangeChange={handleDateRangeChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minimumStay">Diárias Mínimas</Label>
                <Input
                  id="minimumStay"
                  name="minimumStay"
                  type="number"
                  min={1}
                  value={periodForm.minimumStay}
                  onChange={handlePeriodInputChange}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isHoliday" 
                  checked={periodForm.isHoliday} 
                  onCheckedChange={handleIsHolidayChange}
                />
                <Label htmlFor="isHoliday">Feriado ou Data Especial</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClosePeriodDialog}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para preços */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editPriceId ? 'Editar Preço' : 'Novo Preço'}</DialogTitle>
            <DialogDescription>
              {editPriceId 
                ? 'Atualize os detalhes do preço existente.' 
                : 'Defina um novo preço para a acomodação selecionada.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePriceSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="periodId">Período</Label>
                <Select 
                  value={priceForm.periodId} 
                  onValueChange={(value) => handlePriceSelectChange('periodId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Períodos Disponíveis</SelectLabel>
                      {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name} ({format(period.startDate, 'dd/MM/yyyy')} - {format(period.endDate, 'dd/MM/yyyy')})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="people">Número de Pessoas</Label>
                <Input
                  id="people"
                  name="people"
                  type="number"
                  min={1}
                  max={10}
                  value={priceForm.people}
                  onChange={handlePriceInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pricePerNight">Valor da Diária (R$)</Label>
                <Input
                  id="pricePerNight"
                  name="pricePerNight"
                  type="number"
                  step="0.01"
                  min={0}
                  value={priceForm.pricePerNight}
                  onChange={handlePriceInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClosePriceDialog}>
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

export default PeriodsPage;
