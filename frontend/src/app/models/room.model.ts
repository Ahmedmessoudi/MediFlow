import { Department } from './department.model';

export interface Room {
  id?: number;
  name: string;
  department?: Department | null;
  capacity: number;
}
