
import React from 'react';
import { Copy, Check, WhatsApp, Image, Images } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Accommodation } from '@/types';

interface AccommodationDetailsProps {
  accommodation: Accommodation;
}

const AccommodationDetails: React.FC<AccommodationDetailsProps> = ({ accommodation }) => {
  const [copied, setCopied] = React.useState(false);

  const generateWhatsAppText = () => {
    const text = `*${accommodation.category}*\n\n` +
      `*Apto ${accommodation.roomNumber}*\n\n` +
      `${accommodation.description}\n\n` +
      `*Conheça por dentro:* ${accommodation.imageUrl}\n\n` +
      `*Capacidade:* Até ${accommodation.capacity} pessoas`;
    
    return text;
  };

  const copyToClipboard = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast.success('Texto copiado para a área de transferência');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Falha ao copiar texto');
      });
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Luxo':
        return 'bg-purple-100 text-purple-800';
      case 'Super Luxo':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge className={getCategoryColor(accommodation.category)}>
            {accommodation.category}
          </Badge>
          <span className="text-sm font-medium">Apto {accommodation.roomNumber}</span>
        </div>
        <CardTitle>{accommodation.name}</CardTitle>
        <CardDescription>Capacidade para até {accommodation.capacity} pessoas</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{accommodation.description}</p>
        
        {accommodation.images && accommodation.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {accommodation.images.slice(0, 4).map((img, index) => (
              <div key={index} className="aspect-video bg-gray-100 rounded overflow-hidden">
                <img 
                  src={img} 
                  alt={`Imagem ${index + 1} de ${accommodation.name}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {accommodation.images.length > 4 && (
              <div className="col-span-2 text-center text-sm text-muted-foreground">
                + {accommodation.images.length - 4} imagens adicionais
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-gray-100 rounded mb-4">
            <Images className="h-10 w-10 text-gray-400" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado' : 'Copiar Detalhes'}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
          onClick={shareOnWhatsApp}
        >
          <WhatsApp className="h-4 w-4" />
          Compartilhar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccommodationDetails;
