
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchParams, SearchResult } from '@/types';
import AccommodationDialog from '@/components/AccommodationDialog';
import SearchForm from '@/components/search/SearchForm';
import SearchResults from '@/components/search/SearchResults';
import MinStayDialog from '@/components/search/MinStayDialog';
import { validateSearchParams, searchAccommodations } from '@/utils/searchUtils';

const SearchPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined
  });
  const [guests, setGuests] = useState<number>(2);
  const [includesBreakfast, setIncludesBreakfast] = useState<boolean>(false);
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
    
    const searchParams: SearchParams = {
      checkIn: dateRange?.from || new Date(),
      checkOut: dateRange?.to || null,
      guests: guests,
      includesBreakfast: includesBreakfast
    };
    
    const validationError = validateSearchParams(searchParams);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);
      const { results: searchResults, maxMinStay: minStayValue, hasMinStayViolations } = 
        await searchAccommodations(searchParams, forceSearch);
      
      // Show min stay dialog if violations are found and not forcing search
      if (hasMinStayViolations && !forceSearch) {
        setMaxMinStay(minStayValue || 1);
        setIsMinStayDialogOpen(true);
        return;
      }
      
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
    handleSearch(true); // Force search even with minimum stay violation
  };

  const handleAccommodationClick = (result: SearchResult) => {
    setSelectedResult(result);
    setIsDialogOpen(true);
  };

  const handleReload = () => {
    handleSearch();
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-hotel-navy">Buscar Acomodações</h1>
        <p className="text-muted-foreground mt-2">Encontre acomodações disponíveis com base na sua data e número de hóspedes.</p>
      </div>

      <SearchForm 
        dateRange={dateRange}
        setDateRange={setDateRange}
        guests={guests}
        setGuests={setGuests}
        includesBreakfast={includesBreakfast}
        setIncludesBreakfast={setIncludesBreakfast}
        onSearch={handleSearch}
        loading={loading}
        disablePastDates={false}
      />

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
            <SearchResults 
              results={results} 
              onAccommodationClick={handleAccommodationClick} 
            />
          )}
        </div>
      )}

      <AccommodationDialog 
        result={selectedResult}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onReload={handleReload}
      />

      <MinStayDialog 
        isOpen={isMinStayDialogOpen}
        onOpenChange={setIsMinStayDialogOpen}
        maxMinStay={maxMinStay}
        onContinue={handleContinueWithMinStayViolation}
        onCancel={() => setIsMinStayDialogOpen(false)}
      />
    </div>
  );
};

export default SearchPage;
