
import React, { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SearchParams, SearchResult } from '@/types';
import { searchAccommodations } from '@/integrations/supabase/accommodationService';
import { format, differenceInDays } from 'date-fns';
import AccommodationDialog from '@/components/AccommodationDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SearchPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined
  });
  const [guests, setGuests] = useState<number>(1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMinStayDialogOpen, setIsMinStayDialogOpen] = useState(false);
  const [maxMinStay, setMaxMinStay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (forceSearch = false) => {
    setError(null);
    
    if (!dateRange || !dateRange.from) {
      toast.error("Selecione pelo menos uma data de check-in");
      return;
    }

    const searchParams: SearchParams = {
      checkIn: dateRange.from,
      checkOut: dateRange.to || null,
      guests: guests
    };

    // Verificar se há estadia mínima violada antes de buscar
    if (dateRange.to && !forceSearch) {
      const days = differenceInDays(dateRange.to, dateRange.from);
      
      // Apenas para exibir o pop-up uma vez quando necessário
      try {
        setLoading(true);
        // Faz a busca para verificar requisitos de estadia mínima
        const preliminaryResults = await searchAccommodations(searchParams);
        
        // Verificar se existe alguma violação de estadia mínima
        const hasMinStayViolations = preliminaryResults.some(result => result.isMinStayViolation);
        
        if (hasMinStayViolations) {
          // Encontrar o maior período mínimo requerido
          const maxMinStayValue = Math.max(...preliminaryResults
            .filter(r => r.minimumStay)
            .map(r => r.minimumStay || 0)
          );
          setMaxMinStay(maxMinStayValue);
          setIsMinStayDialogOpen(true);
          return; // Não mostrar resultados ainda
        }
        
        // Se não há violações, mostrar os resultados normalmente
        setResults(preliminaryResults);
        setIsSearched(true);
        
        if (preliminaryResults.length === 0) {
          setError("Nenhuma acomodação encontrada com os critérios selecionados");
        }
      } catch (err) {
        console.error("Erro ao buscar acomodações:", err);
        setError("Ocorreu um erro ao buscar acomodações. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Realizar busca final (com forceSearch ou sem estadia mínima violada)
    try {
      setLoading(true);
      const searchResults = await searchAccommodations(searchParams);
      setResults(searchResults);
      setIsSearched(true);

      if (searchResults.length === 0) {
        setError("Nenhuma acomodação encontrada com os critérios selecionados");
      }
    } catch (err) {
      console.error("Erro ao buscar acomodações:", err);
      setError("Ocorreu um erro ao buscar acomodações. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithMinStayViolation = () => {
    setIsMinStayDialogOpen(false);
    handleSearch(true); // Força a busca mesmo com violação
  };

  const handleAccommodationClick = (result: SearchResult) => {
    setSelectedResult(result);
    setIsDialogOpen(true);
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

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-hotel-navy">Buscar Acomodações</h1>
        <p className="text-muted-foreground mt-2">Encontre acomodações disponíveis com base na sua data e número de hóspedes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Critérios de Busca</CardTitle>
          <CardDescription>Insira os detalhes da sua estadia para encontrar acomodações disponíveis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dates">Datas de Estadia</Label>
              <DatePickerWithRange 
                dateRange={dateRange} 
                onDateRangeChange={setDateRange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">Número de Hóspedes</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={10}
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleSearch(false)} 
            className="w-full md:w-auto"
            disabled={loading}
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Buscando..." : "Buscar Acomodações"}
          </Button>
        </CardFooter>
      </Card>

      {isSearched && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Resultados da Busca</h2>
            <Badge variant="outline" className="text-sm">
              {results.length} acomodações encontradas
            </Badge>
          </div>
          
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <Card 
                  key={result.accommodation.id} 
                  className={cn(
                    result.isMinStayViolation ? 'border-amber-400' : '',
                    'hover:shadow-lg transition-shadow cursor-pointer'
                  )}
                  onClick={() => handleAccommodationClick(result)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{result.accommodation.name}</CardTitle>
                      <Badge className={cn("ml-2", getCategoryColor(result.accommodation.category))}>
                        {result.accommodation.category}
                      </Badge>
                    </div>
                    <CardDescription>Capacidade: até {result.accommodation.capacity} pessoas</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
                      <img 
                        src={result.accommodation.imageUrl} 
                        alt={result.accommodation.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm line-clamp-2 mb-2">{result.accommodation.description}</p>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Diária:</span>
                        <span className="font-medium">R$ {result.pricePerNight.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Café da manhã:</span>
                        <span>{result.includesBreakfast ? 'Incluso' : 'Não incluso'}</span>
                      </div>
                      
                      {result.nights !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Noites:</span>
                          <span>{result.nights}</span>
                        </div>
                      )}
                      
                      {result.totalPrice !== null && (
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total:</span>
                          <span>R$ {result.totalPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  {result.isMinStayViolation && (
                    <CardFooter className="pt-0">
                      <Alert className="w-full bg-amber-50 text-amber-800 border-amber-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Requer estadia mínima de {result.minimumStay} {result.minimumStay === 1 ? 'diária' : 'diárias'}.
                        </AlertDescription>
                      </Alert>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <AccommodationDialog 
        result={selectedResult}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      {/* Dialog de aviso de estadia mínima */}
      <Dialog open={isMinStayDialogOpen} onOpenChange={setIsMinStayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estadia Mínima Requerida</DialogTitle>
            <DialogDescription>
              O período selecionado requer uma estadia mínima de {maxMinStay} {maxMinStay === 1 ? 'diária' : 'diárias'}.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <Alert className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                O período que você selecionou tem uma duração menor que o mínimo exigido.
                Algumas acomodações estarão disponíveis somente para um período maior.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMinStayDialogOpen(false)}>
              Ajustar Datas
            </Button>
            <Button onClick={handleContinueWithMinStayViolation}>
              Continuar Mesmo Assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchPage;
