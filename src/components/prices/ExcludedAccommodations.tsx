
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accommodation } from '@/types';

interface ExcludedAccommodationsProps {
  accommodations: Accommodation[];
  excludedAccommodations: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
}

const ExcludedAccommodations: React.FC<ExcludedAccommodationsProps> = ({
  accommodations,
  excludedAccommodations,
  onToggle,
  disabled
}) => {
  if (!accommodations.length) return null;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Apartamentos ({accommodations.length})
      </Label>
      <p className="text-sm text-muted-foreground mb-2">
        Desmarque os apartamentos que terão preços diferentes do padrão da categoria.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
        {accommodations.map((acc) => (
          <div key={acc.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`acc-${acc.id}`} 
              checked={!excludedAccommodations.includes(acc.id)}
              onCheckedChange={() => onToggle(acc.id)}
              disabled={disabled}
            />
            <Label 
              htmlFor={`acc-${acc.id}`} 
              className="text-sm cursor-pointer"
            >
              {acc.roomNumber} - {acc.name}
            </Label>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {excludedAccommodations.length} apartamentos excluídos da atualização em massa
      </p>
    </div>
  );
};

export default ExcludedAccommodations;
