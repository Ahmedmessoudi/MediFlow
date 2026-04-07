export type PatientCondition = 'NORMAL' | 'SERIOUS' | 'CRITICAL';

export interface Patient {
  id?: number;
  fullName: string;
  age: number;
  condition: PatientCondition;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  addressCity?: string;
  addressStreet?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalNotes?: string;
  admissionDate?: string;
  dischargeDate?: string;
  bed?: Bed | null;
}

import { Bed } from './bed.model';
