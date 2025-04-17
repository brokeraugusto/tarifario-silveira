
import React from 'react';
import { DateRange } from 'react-day-picker';
import { Search } from 'lucide-react';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { SearchParams } from '@/types';

interface SearchFormProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  guests: number;
  setGuests: (guests: number) => void;
  onSearch: (forceSearch?: boolean) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  dateRange, 
  setDateRange, 
  guests, 
  setGuests, 
  onSearch,
  loading 
}) => {
  return (
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
          onClick={() => onSearch(false)} 
          className="w-full md:w-auto"
          disabled={loading}
        >
          <Search className="mr-2 h-4 w-4" />
          {loading ? "Buscando..." : "Buscar Acomodações"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SearchForm;
