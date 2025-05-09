
import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryType } from '@/types';

interface CategoryPricesGridProps {
  handleOpenCategoryPrice: (category: CategoryType) => void;
}

const CategoryPricesGrid: React.FC<CategoryPricesGridProps> = ({ handleOpenCategoryPrice }) => {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Selecione uma categoria para definir os preços para todas as acomodações dessa categoria.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['Standard', 'Luxo', 'Super Luxo', 'Master'] as CategoryType[]).map(category => (
          <Button 
            key={category} 
            variant="outline" 
            className="h-auto flex-col py-6 border-2" 
            onClick={() => handleOpenCategoryPrice(category)}
          >
            <FileSpreadsheet className="mb-2 h-8 w-8" />
            <span className="text-lg font-semibold">{category}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryPricesGrid;
