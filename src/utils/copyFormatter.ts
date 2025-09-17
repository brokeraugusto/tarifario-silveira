import { SearchResult } from '@/types';
import { CopyConfig } from '@/types/copyConfig';

export const formatAccommodationText = (result: SearchResult, config: CopyConfig): string => {
  const { accommodation } = result;
  if (!accommodation) return '';

  let text = '';

  // Nome da acomodação
  if (config.includeName) {
    text += `*${accommodation.name}*\n\n`;
  }

  // Categoria
  if (config.includeCategory) {
    text += `*Categoria:* ${accommodation.category}\n`;
  }

  // Capacidade
  if (config.includeCapacity) {
    text += `*Capacidade:* ${accommodation.capacity} pessoas\n`;
  }

  // Adicionar quebra de linha após informações básicas se alguma foi incluída
  if (config.includeCategory || config.includeCapacity) {
    text += '\n';
  }

  // Descrição
  if (config.includeDescription && accommodation.description) {
    text += `${accommodation.description}\n\n`;
  }

  // Álbum de fotos
  if (config.includeAlbumUrl && accommodation.albumUrl && accommodation.albumUrl.trim() !== '') {
    text += `*Álbum de fotos:* ${accommodation.albumUrl}\n\n`;
  }

  // Informações de preço
  const pixPrice = result.pixPrice || 0;
  const cardPrice = result.cardPrice || 0;
  const pixTotal = result.pixTotalPrice;
  const cardTotal = result.cardTotalPrice;
  const nights = result.nights || 0;

  let hasPriceInfo = false;

  if (pixPrice > 0 && cardPrice > 0) {
    // Preços PIX e Cartão disponíveis
    if (config.includePixPrice) {
      text += `*Valor da diária (PIX):* R$ ${pixPrice.toFixed(2)}\n`;
      hasPriceInfo = true;
    }
    
    if (config.includeCardPrice) {
      text += `*Valor da diária (Cartão):* R$ ${cardPrice.toFixed(2)}\n`;
      hasPriceInfo = true;
    }

    // Observação sobre múltiplos períodos
    if (result.hasMultiplePeriods && (config.includePixPrice || config.includeCardPrice)) {
      text += `*Observação:* O período solicitado compreende ${result.overlappingPeriodsCount || 2} períodos tarifários diferentes. O valor da diária apresentado representa uma média.\n`;
    }

    // Número de diárias
    if (config.includeNights && nights > 0) {
      text += `*Número de diárias:* ${nights}\n`;
    }

    // Valores totais
    if (nights > 0) {
      if (config.includePixTotal && pixTotal !== null) {
        text += `*Valor total (PIX):* R$ ${pixTotal.toFixed(2)}\n`;
      }
      if (config.includeCardTotal && cardTotal !== null) {
        text += `*Valor total (Cartão):* R$ ${cardTotal.toFixed(2)}\n`;
      }
    }
  } else if (result.pricePerNight && result.pricePerNight > 0) {
    // Apenas um tipo de preço disponível
    if (config.includePixPrice || config.includeCardPrice) {
      text += `*Valor da diária:* R$ ${result.pricePerNight.toFixed(2)}\n`;
      hasPriceInfo = true;
    }

    // Observação sobre múltiplos períodos
    if (result.hasMultiplePeriods && (config.includePixPrice || config.includeCardPrice)) {
      text += `*Observação:* O período solicitado compreende ${result.overlappingPeriodsCount || 2} períodos tarifários diferentes. O valor da diária apresentado representa uma média.\n`;
    }

    // Número de diárias
    if (config.includeNights && nights > 0) {
      text += `*Número de diárias:* ${nights}\n`;
    }

    // Valor total
    if (nights > 0 && result.totalPrice !== null && (config.includePixTotal || config.includeCardTotal)) {
      text += `*Valor total:* R$ ${result.totalPrice.toFixed(2)}\n`;
    }
  }

  return text.trim();
};

export const generatePreviewText = (config: CopyConfig): string => {
  const mockResult: SearchResult = {
    accommodation: {
      id: '1',
      name: 'Apartamento Standard',
      roomNumber: '101',
      category: 'Standard',
      capacity: 4,
      description: 'Apartamento no _térreo_, perfeito para sua estadia. O espaço conta com:\n\n🛏️ Quarto com cama de casal\n❄️ Ar-condicionado\n📺 TV\n🚿 Banheiro privativo\n🌿 Sacada com vista para o jardim',
      imageUrl: '',
      albumUrl: 'https://photos.app.goo.gl/rME3zV783tfK4hy37',
      isBlocked: false,
    },
    pricePerNight: 295,
    totalPrice: 885,
    nights: 3,
    includesBreakfast: false,
    pixPrice: 295,
    cardPrice: 310,
    pixTotalPrice: 885,
    cardTotalPrice: 930,
  };

  return formatAccommodationText(mockResult, config);
};