
import { Accommodation, BlockReasonType } from '@/types';
import { updateAccommodation } from './mutations';

export const blockAccommodation = async (
  id: string, 
  reason: BlockReasonType, 
  note?: string,
  blockPeriod?: { from: Date, to: Date }
): Promise<Accommodation | null> => {
  try {
    return await updateAccommodation(id, { 
      isBlocked: true, 
      blockReason: reason, 
      blockNote: note,
      blockPeriod: blockPeriod
    });
  } catch (error) {
    console.error('Error blocking accommodation:', error);
    throw error; // Re-throw to allow proper handling at UI level
  }
};

export const unblockAccommodation = async (id: string): Promise<Accommodation | null> => {
  try {
    return await updateAccommodation(id, { 
      isBlocked: false, 
      blockReason: null, 
      blockNote: null,
      blockPeriod: null
    });
  } catch (error) {
    console.error('Error unblocking accommodation:', error);
    throw error; // Re-throw to allow proper handling at UI level
  }
};
