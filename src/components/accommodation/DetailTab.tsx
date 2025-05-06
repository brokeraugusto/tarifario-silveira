
import React from 'react';
import { Calendar, User, Coffee, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WhatsAppFormatter from '../WhatsAppFormatter';
import { SearchResult } from '@/types';
import { useSharingFunctions } from './useSharingFunctions';

interface DetailTabProps {
  result: SearchResult;
}

const DetailTab: React.FC<DetailTabProps> = ({ result }) => {
  const { 
    accommodation, 
    nights, 
    pricePerNight, 
    totalPrice, 
    includesBreakfast, 
    minimumStay 
  } = result;
  
  const { handleCopyToClipboard, handleShareWhatsApp } = useSharingFunctions(result);
  
  const hasAlbumUrl = accommodation?.albumUrl && accommodation.albumUrl.trim() !== '';

  return (
    <div className="space-y-4 mt-4">
      <div className="aspect-video bg-muted rounded-md overflow-hidden">
        {accommodation && (
          <img 
            src={accommodation.imageUrl} 
            alt={accommodation.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className="flex justify-end space-x-2">
        {accommodation && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyToClipboard}
              title="Copiar informações"
            >
              Copiar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShareWhatsApp}
              title="Compartilhar via WhatsApp"
            >
              Compartilhar
            </Button>
            
            {hasAlbumUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(accommodation.albumUrl, '_blank')}
                title="Ver álbum completo"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Álbum
              </Button>
            )}
          </>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Detalhes</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {accommodation && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Capacidade: {accommodation.capacity} pessoas</span>
            </div>
          )}
          
          {nights !== null && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{nights} {nights === 1 ? 'noite' : 'noites'}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-muted-foreground" />
            <span>{includesBreakfast ? 'Café da manhã incluso' : 'Café da manhã não incluso'}</span>
          </div>
          
          {minimumStay > 0 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Mínimo de {minimumStay} {minimumStay === 1 ? 'diária' : 'diárias'}</span>
            </div>
          )}

          {hasAlbumUrl && (
            <div className="flex items-center gap-2 col-span-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a 
                href={accommodation?.albumUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                Ver álbum completo
              </a>
            </div>
          )}
        </div>
      </div>
      
      {accommodation && (
        <>
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Descrição</h3>
            <div className="text-sm text-muted-foreground">
              <WhatsAppFormatter text={accommodation.description} />
            </div>
          </div>
        </>
      )}
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Preços</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diária:</span>
            <span>R$ {pricePerNight.toFixed(2)}</span>
          </div>
          
          {nights !== null && nights > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Período:</span>
                <span>{nights} {nights === 1 ? 'noite' : 'noites'}</span>
              </div>
              
              {totalPrice !== null && (
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailTab;
