
import { Accommodation, BlockReasonType } from '@/types';
import { updateAccommodation } from './mutations';

export const blockAccommodation = async (
  id: string, 
  reason: BlockReasonType, 
  note?: string,
  blockPeriod?: { from: Date, to: Date }
): Promise<Accommodation | null> => {
  try {
    // Verificar se os parâmetros são válidos
    if (!id || !reason) {
      console.error('Parâmetros inválidos para bloquear acomodação:', { id, reason });
      throw new Error('Parâmetros inválidos');
    }

    // Garantir que as datas são objetos Date válidos
    if (blockPeriod) {
      // Formatação correta para armazenamento em JSONB no Postgres
      const formattedBlockPeriod = {
        from: blockPeriod.from instanceof Date ? blockPeriod.from.toISOString() : new Date(blockPeriod.from).toISOString(),
        to: blockPeriod.to instanceof Date ? blockPeriod.to.toISOString() : new Date(blockPeriod.to).toISOString()
      };

      return await updateAccommodation(id, { 
        isBlocked: true, 
        blockReason: reason, 
        blockNote: note,
        blockPeriod: formattedBlockPeriod
      });
    } else {
      return await updateAccommodation(id, { 
        isBlocked: true, 
        blockReason: reason, 
        blockNote: note
      });
    }
  } catch (error) {
    console.error('Erro ao bloquear acomodação:', error);
    throw error; // Re-throw para permitir tratamento adequado no nível de UI
  }
};

export const unblockAccommodation = async (id: string): Promise<Accommodation | null> => {
  try {
    if (!id) {
      console.error('ID inválido para desbloquear acomodação');
      throw new Error('ID inválido');
    }

    return await updateAccommodation(id, { 
      isBlocked: false, 
      blockReason: null, 
      blockNote: null,
      blockPeriod: null
    });
  } catch (error) {
    console.error('Erro ao desbloquear acomodação:', error);
    throw error; // Re-throw para permitir tratamento adequado no nível de UI
  }
};
