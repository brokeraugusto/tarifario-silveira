
import React, { useState } from 'react';
import { Users, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Accommodation } from '@/types';
import WhatsAppFormatter from './WhatsAppFormatter';

interface Props {
  accommodation: Accommodation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onBlock?: () => void;
  onDelete?: () => void;
}

const AccommodationDetails: React.FC<Props> = ({ 
  accommodation, 
  open, 
  onOpenChange,
  onEdit,
  onBlock,
  onDelete
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    accommodation ? accommodation.imageUrl : null
  );

  // If accommodation changes, update the selected image
  React.useEffect(() => {
    if (accommodation) {
      setSelectedImage(accommodation.imageUrl);
    }
  }, [accommodation]);

  // If there's no accommodation, don't render anything
  if (!accommodation) return null;

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

  const copyToClipboard = () => {
    const description = `
*${accommodation.name} (${accommodation.roomNumber})*
_Categoria: ${accommodation.category}_
Capacidade: ${accommodation.capacity} pessoas

${accommodation.description}

${accommodation.images && accommodation.images.length > 0 ? 
  '\n' + accommodation.images.join('\n') : ''}
    `.trim();
    
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasAdditionalImages = accommodation.images && accommodation.images.length > 0;

  const accommodationContent = (
    <div className="space-y-6">
      {/* Imagem principal com galeria de miniaturas */}
      <div className="space-y-3">
        <div className="relative w-full h-64 overflow-hidden rounded-lg bg-gray-100">
          {selectedImage ? (
            <img 
              src={selectedImage} 
              alt={accommodation.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Sem imagem
            </div>
          )}
        </div>
        
        {/* Miniaturas de imagens */}
        {hasAdditionalImages && (
          <div className="flex overflow-x-auto gap-2 pb-2">
            {/* Mostrar imagem principal como primeira miniatura */}
            <button 
              onClick={() => setSelectedImage(accommodation.imageUrl)}
              className={`flex-shrink-0 w-16 h-16 overflow-hidden rounded border-2 ${selectedImage === accommodation.imageUrl ? 'border-primary' : 'border-transparent'}`}
            >
              <img 
                src={accommodation.imageUrl} 
                alt="Principal" 
                className="w-full h-full object-cover"
              />
            </button>
            
            {/* Mostrar imagens adicionais como miniaturas */}
            {accommodation.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedImage(img)}
                className={`flex-shrink-0 w-16 h-16 overflow-hidden rounded border-2 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
              >
                <img 
                  src={img} 
                  alt={`Imagem ${idx + 1}`} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(accommodation.category)}>
              {accommodation.category}
            </Badge>
            <Badge variant="outline" className="flex gap-1 items-center">
              <Users className="h-3 w-3" />
              {accommodation.capacity}
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={copyToClipboard}
            className="flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar Descrição</span>
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{accommodation.name}</h3>
          <p className="text-muted-foreground text-sm">Número: {accommodation.roomNumber}</p>
          
          {accommodation.isBlocked && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <p className="text-red-700 font-medium">
                  Bloqueado: {accommodation.blockReason}
                </p>
                {accommodation.blockNote && (
                  <p className="text-red-600 text-sm mt-1">{accommodation.blockNote}</p>
                )}
              </CardContent>
            </Card>
          )}
          
          <div className="p-4 rounded-lg bg-gray-50 border">
            <WhatsAppFormatter text={accommodation.description} />
          </div>
        </div>

        {/* Action buttons for edit, block, delete */}
        {(onEdit || onBlock || onDelete) && (
          <div className="flex items-center justify-end gap-2 pt-4">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Editar
              </Button>
            )}
            {onBlock && (
              <Button variant="outline" size="sm" onClick={onBlock}>
                {accommodation.isBlocked ? 'Desbloquear' : 'Bloquear'}
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                Excluir
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Return the component as a Sheet component
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detalhes da Acomodação</SheetTitle>
          <SheetDescription>
            Informações detalhadas sobre a acomodação
          </SheetDescription>
        </SheetHeader>
        
        {accommodationContent}
        
        <SheetFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AccommodationDetails;
