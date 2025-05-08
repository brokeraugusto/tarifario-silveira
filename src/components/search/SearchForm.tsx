import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { buttonVariants } from "@/components/ui/button"

interface SearchFormProps {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  guests: number;
  setGuests: (guests: number) => void;
  includesBreakfast: boolean;
  setIncludesBreakfast: (includesBreakfast: boolean) => void;
  onSearch: () => void;
  loading: boolean;
  disablePastDates?: boolean;
}

type CalendarProps = React.ComponentProps<typeof Calendar>;

export type DatePickerWithRangeProps = {
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  className?: string;
  disablePastDates?: boolean;
  align?: "start" | "center" | "end";
};

const SearchForm = ({
  dateRange,
  setDateRange,
  guests,
  setGuests,
  includesBreakfast,
  setIncludesBreakfast,
  onSearch,
  loading,
  disablePastDates = true
}: SearchFormProps) => {
  const handleSearch = () => {
    onSearch();
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="dates">Datas</Label>
          <DatePickerWithRange 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            disablePastDates={disablePastDates}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="guests">Hóspedes</Label>
          <Select 
            value={guests.toString()} 
            onValueChange={value => setGuests(Number(value))}
          >
            <SelectTrigger id="guests">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 hóspedes</SelectItem>
              <SelectItem value="3">3 hóspedes</SelectItem>
              <SelectItem value="4">4 hóspedes</SelectItem>
              <SelectItem value="5">5 hóspedes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="breakfast" className="mb-2 block">Café da manhã</Label>
          <div className="flex items-center space-x-2">
            <Switch 
              id="breakfast" 
              checked={includesBreakfast} 
              onCheckedChange={setIncludesBreakfast}
            />
            <Label htmlFor="breakfast" className="cursor-pointer">
              {includesBreakfast ? 'Incluído' : 'Não incluído'}
            </Label>
          </div>
        </div>
        
        <div className="flex items-end">
          <Button 
            className="w-full" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
