
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
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
import { searchAccommodations } from '@/utils/accommodationService';
import { format } from 'date-fns';
import AccommodationDialog from '@/components/AccommodationDialog';

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

  const handleSearch = () => {
    if (!dateRange || !dateRange.from) {
      toast.error("Selecione pelo menos uma data de check-in");
      return;
    }

    const searchParams: SearchParams = {
      checkIn: dateRange.from,
      checkOut: dateRange.to || null,
      guests: guests
    };

    const searchResults = searchAccommodations(searchParams);
    setResults(searchResults);
    setIsSearched(true);

    if (searchResults.length === 0) {
      toast.info("Nenhuma acomodação encontrada com os critérios selecionados");
    } else {
      // Verificar se existe alguma violação de estadia mínima
      const hasMinStayViolations = searchResults.some(result => result.isMinStayViolation);
      
      if (hasMinStayViolations && dateRange.to) {
        // Encontrar o maior período mínimo requerido
        const maxMinStay = Math.max(...searchResults.filter(r => r.minimumStay).map(r => r.minimumStay || 0));
        
        toast.warning(
          `Alguns períodos requerem estadia mínima de ${maxMinStay} ${maxMinStay === 1 ? 'diária' : 'diárias'}`,
          {
            duration: 5000,
          }
        );
      }
    }
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
          <Button onClick={handleSearch} className="w-full md:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Buscar Acomodações
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
          
          {results.length === 0 ? (
            <Alert>
              <AlertTitle>Nenhum resultado encontrado</AlertTitle>
              <AlertDescription>
                Nenhuma acomodação disponível com os critérios selecionados. Tente modificar sua busca.
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
                      <Alert variant="warning" className="w-full">
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
    </div>
  );
};

export default SearchPage;
