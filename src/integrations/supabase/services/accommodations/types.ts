
import { Accommodation, BlockReasonType, CategoryType } from '@/types';

export interface AccommodationUpdate {
  name?: string;
  roomNumber?: string;
  category?: CategoryType;
  capacity?: number;
  description?: string;
  imageUrl?: string;
  images?: string[];
  albumUrl?: string;
  isBlocked?: boolean;
  blockReason?: BlockReasonType;
  blockNote?: string;
  blockPeriod?: {
    from: Date;
    to: Date;
  };
}

export interface AccommodationCreate extends Omit<Accommodation, 'id'> {}

export interface AccommodationMapper {
  toDatabase: (accommodation: AccommodationCreate | AccommodationUpdate) => Record<string, any>;
  fromDatabase: (data: Record<string, any>) => Accommodation;
}
