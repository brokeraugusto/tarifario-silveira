
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchResult } from '@/types';

interface SearchResultsProps {
  results: SearchResult[];
  onAccommodationClick: (result: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onAccommodationClick }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result) => (
        <Card 
          key={result.accommodation.id} 
          className={cn(
            result.isMinStayViolation ? 'border-amber-400' : '',
            'hover:shadow-lg transition-shadow cursor-pointer'
          )}
          onClick={() => onAccommodationClick(result)}
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
              <Alert className="w-full bg-amber-50 text-amber-800 border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Requer estadia mínima de {result.minimumStay} {result.minimumStay === 1 ? 'diária' : 'diárias'}.
                </AlertDescription>
              </Alert>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default SearchResults;
