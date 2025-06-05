
import React from 'react';
import { CreditCard, Smartphone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethodSelectorProps {
  value: 'pix' | 'credit_card';
  onChange: (value: 'pix' | 'credit_card') => void;
  disabled?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Método de Pagamento</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pix" id="pix" />
          <Label htmlFor="pix" className="flex items-center space-x-2 cursor-pointer">
            <Smartphone className="h-4 w-4" />
            <span>PIX</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="credit_card" id="credit_card" />
          <Label htmlFor="credit_card" className="flex items-center space-x-2 cursor-pointer">
            <CreditCard className="h-4 w-4" />
            <span>Cartão de Crédito</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
