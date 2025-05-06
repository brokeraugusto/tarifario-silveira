
import { useState } from 'react';
import { toast } from 'sonner';
import { SearchResult } from '@/types';

export const useSharingFunctions = () => {
  const [hasCopyFeature] = useState(() => !!navigator.clipboard);
  const [hasShareFeature] = useState(() => !!navigator.share);
  const [copied, setCopied] = useState(false);

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

  // Add the missing handleCopyToClipboard function
  const handleCopyToClipboard = () => {
    if (!hasCopyFeature) {
      toast.error('Seu navegador não suporta copiar para a área de transferência');
      return;
    }
    
    const text = document.querySelector('.whatsapp-formatted')?.textContent;
    
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          toast.success('Informações copiadas para a área de transferência');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Error copying text: ', err);
          toast.error('Erro ao copiar texto');
        });
    }
  };

  return {
    handleShare,
    handleWhatsApp,
    handleCopyToClipboard,
    hasCopyFeature,
    hasShareFeature,
    copied
  };
};

// This is necessary for importing the hook
export default useSharingFunctions;
