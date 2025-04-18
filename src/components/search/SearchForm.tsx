
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface SearchFormProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  guests: number;
  setGuests: (guests: number) => void;
  onSearch: () => void;
  loading: boolean;
  disablePastDates?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  dateRange,
  setDateRange,
  guests,
  setGuests,
  onSearch,
  loading,
  disablePastDates = false
}) => {
  const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Datas</Label>
            <DatePickerWithRange 
              dateRange={dateRange} 
              onDateRangeChange={setDateRange} 
              disablePastDates={disablePastDates}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Hóspedes</Label>
            <Select value={String(guests)} onValueChange={(value) => setGuests(parseInt(value))}>
              <SelectTrigger>
                <SelectValue>{guests} {guests === 1 ? 'hóspede' : 'hóspedes'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {guestOptions.map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} {num === 1 ? 'hóspede' : 'hóspedes'}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={onSearch}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
