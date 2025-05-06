
import { Accommodation, BlockReasonType } from '@/types';
import { updateAccommodation } from './mutations';

interface BlockPeriod {
  from: Date;
  to?: Date;
}

export const blockAccommodation = async (
  id: string, 
  reason: BlockReasonType, 
  note?: string,
  blockPeriod?: BlockPeriod
): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: true, 
    blockReason: reason, 
    blockNote: note,
    // Use optional chaining to safely access blockPeriod properties
    ...(blockPeriod && {
      blockPeriod: {
        from: blockPeriod.from,
        to: blockPeriod.to
      }
    })
  });
};

export const unblockAccommodation = async (id: string): Promise<Accommodation | null> => {
  return updateAccommodation(id, { 
    isBlocked: false, 
    blockReason: undefined, 
    blockNote: undefined,
    blockPeriod: undefined
  });
};
