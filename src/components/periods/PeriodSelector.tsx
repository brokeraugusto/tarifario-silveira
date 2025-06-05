
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PricePeriod } from '@/types';

interface PeriodSelectorProps {
  periods: PricePeriod[];
  selectedPeriod: PricePeriod | null;
  onPeriodChange: (period: PricePeriod | null) => void;
  loading?: boolean;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periods,
  selectedPeriod,
  onPeriodChange,
  loading = false
}) => {
  const handleValueChange = (value: string) => {
    if (value === 'none') {
      onPeriodChange(null);
    } else {
      const period = periods.find(p => p.id === value);
      onPeriodChange(period || null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Selecionar Período</label>
      <Select
        value={selectedPeriod?.id || 'none'}
        onValueChange={handleValueChange}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um período para configurar preços" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Selecione um período...</SelectItem>
          {periods.map((period) => (
            <SelectItem key={period.id} value={period.id}>
              {period.name} ({period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PeriodSelector;
