
import { useState } from 'react';
import { toast } from 'sonner';
import { SearchResult } from '@/types';

export const useSharingFunctions = () => {
  const [hasCopyFeature] = useState(() => !!navigator.clipboard);
  const [hasShareFeature] = useState(() => !!navigator.share);

  const buildSharingText = (result: SearchResult) => {
    const accommodation = result?.accommodation;
    const pricePerNight = result?.pricePerNight || 0;
    const nights = result?.nights || 0;
    const totalPrice = result?.totalPrice || 0;
    
    if (!accommodation) return '';
    
    let text = `*${accommodation.name}*\n\n`;
    text += `*Categoria:* ${accommodation.category}\n`;
    text += `*Capacidade:* ${accommodation.capacity} pessoas\n\n`;
    text += `${accommodation.description}\n\n`;
    
    if (accommodation.albumUrl && accommodation.albumUrl.trim() !== '') {
      text += `*Álbum de fotos:* ${accommodation.albumUrl}\n\n`;
    }
    
    // Add price information if available
    if (pricePerNight > 0) {
      text += `*Valor da diária:* R$ ${pricePerNight.toFixed(2)}\n`;
      
      if (nights !== null && nights > 0) {
        text += `*Número de diárias:* ${nights}\n`;
        
        if (totalPrice !== null) {
          text += `*Valor total:* R$ ${totalPrice.toFixed(2)}\n`;
        }
      }
    }
    
    return text;
  };

  const handleShare = (result: SearchResult) => {
    if (!result?.accommodation || !hasShareFeature) return;
    
    const text = buildSharingText(result);
    
    navigator.share({
      title: result.accommodation.name,
      text: text
    }).catch((error) => {
      console.error('Error sharing:', error);
      toast.error('Erro ao compartilhar');
    });
  };

  const handleWhatsApp = (result: SearchResult) => {
    if (!result?.accommodation) return;
    
    const text = buildSharingText(result);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return {
    handleShare,
    handleWhatsApp,
    hasCopyFeature,
    hasShareFeature
  };
};
