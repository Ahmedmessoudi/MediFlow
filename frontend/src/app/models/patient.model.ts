export type PatientCondition = 'NORMAL' | 'SERIOUS' | 'CRITICAL';

export interface Patient {
  id?: number;
  name: string;
  age: number;
  condition: PatientCondition;
  admissionDate?: string;
  dischargeDate?: string;
  bed?: Bed | null;
}

import { Bed } from './bed.model';
