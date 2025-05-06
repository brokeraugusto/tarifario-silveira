
import { Accommodation, BlockReasonType } from '@/types';
import { updateAccommodation } from './mutations';

export const blockAccommodation = async (
  id: string, 
  reason: BlockReasonType, 
  note?: string
): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: true, 
    blockReason: reason, 
    blockNote: note 
  });
};

export const unblockAccommodation = async (id: string): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: false, 
    blockReason: undefined, 
    blockNote: undefined 
  });
};
