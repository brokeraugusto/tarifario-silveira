import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/types';

interface SearchResultsProps {
  results: SearchResult[];
  onAccommodationClick: (result: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onAccommodationClick }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Standard':
        return 'bg-secondary text-secondary-foreground';
      case 'Luxo':
        return 'bg-accent text-accent-foreground';
      case 'Super Luxo':
        return 'bg-primary text-primary-foreground';
      case 'Master':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result) => {
        const hasAlbumUrl = result.accommodation.albumUrl && result.accommodation.albumUrl.trim() !== '';
        
        return (
          <Card 
            key={result.accommodation.id} 
            className={cn(
              result.isMinStayViolation ? 'border-amber-500 bg-amber-50' : '',
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
              
              {hasAlbumUrl && (
                <div className="flex justify-end mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(result.accommodation.albumUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Álbum de fotos
                  </Button>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                {result.pixPrice && result.cardPrice && result.pixPrice > 0 && result.cardPrice > 0 ? (
                  <>
                     <div className="flex justify-between items-center">
                       <span className="text-muted-foreground">PIX:</span>
                       <span className="font-medium text-accent">R$ {result.pixPrice.toFixed(2)}</span>
                     </div>
                     
                     <div className="flex justify-between items-center">
                       <span className="text-muted-foreground">Cartão:</span>
                       <span className="font-medium text-primary">R$ {result.cardPrice.toFixed(2)}</span>
                     </div>
                  </>
                ) : result.pricePerNight > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diária:</span>
                    <span className="font-medium">R$ {result.pricePerNight.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço:</span>
                    <span className="font-medium text-muted-foreground">Consulte</span>
                  </div>
                )}
                
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
                  <>
                    {result.pixTotalPrice && result.cardTotalPrice ? (
                      <>
                         <div className="flex justify-between text-lg font-semibold text-accent">
                           <span>Total PIX:</span>
                           <span>R$ {result.pixTotalPrice.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-lg font-semibold text-primary">
                           <span>Total Cartão:</span>
                           <span>R$ {result.cardTotalPrice.toFixed(2)}</span>
                         </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>R$ {result.totalPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
            
            {result.isMinStayViolation && (
              <CardFooter className="pt-0">
                <Alert className="w-full bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Requer estadia mínima de {result.minimumStay} {result.minimumStay === 1 ? 'diária' : 'diárias'}.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default SearchResults;
