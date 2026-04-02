export type BedType = 'NORMAL' | 'ICU';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED';

export interface Bed {
  id?: number;
  bedNumber: string;
  type: BedType;
  status: BedStatus;
  room?: Room | null;
}

import { Room } from './room.model';
