import { Bed } from './bed.model';
import { Department } from './department.model';

export type PatientCondition = 'NORMAL' | 'SERIOUS' | 'CRITICAL';
export type PatientStatus = 'ADMITTED' | 'UNDER_TREATMENT' | 'DISCHARGED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Patient {
  id?: number;
  fullName: string;
  age: number;
  condition: PatientCondition;
  status?: PatientStatus;
  priorityLevel?: PriorityLevel;
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
  department?: Department | null;
  assignedDoctor?: any | null;
}
