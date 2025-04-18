
import React from 'react';
import { DollarSign, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriceOption } from '@/types';

interface PriceOptionFormProps {
  option: PriceOption;
  index: number;
  onPriceChange: (index: number, field: keyof PriceOption, value: number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  disabled?: boolean;
}

const PriceOptionForm: React.FC<PriceOptionFormProps> = ({
  option,
  index,
  onPriceChange,
  onRemove,
  canRemove,
  disabled
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center border p-3 rounded-md">
      <div className="space-y-1">
        <Label htmlFor={`people-${index}`} className="text-xs text-muted-foreground">
          Pessoas
        </Label>
        <Select 
          value={String(option.people)} 
          onValueChange={(value) => onPriceChange(index, 'people', parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger id={`people-${index}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[...Array(10)].map((_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`with-breakfast-${index}`} className="text-xs text-muted-foreground">
          Com Café da Manhã
        </Label>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
          <Input
            id={`with-breakfast-${index}`}
            type="number"
            min="0"
            step="0.01"
            value={option.withBreakfast}
            onChange={(e) => onPriceChange(index, 'withBreakfast', Number(e.target.value))}
            disabled={disabled}
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`without-breakfast-${index}`} className="text-xs text-muted-foreground">
          Sem Café da Manhã
        </Label>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
          <Input
            id={`without-breakfast-${index}`}
            type="number"
            min="0"
            step="0.01"
            value={option.withoutBreakfast}
            onChange={(e) => onPriceChange(index, 'withoutBreakfast', Number(e.target.value))}
            disabled={disabled}
          />
        </div>
      </div>
      
      <div className="flex justify-end items-end h-full">
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 w-8 p-0"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default PriceOptionForm;
