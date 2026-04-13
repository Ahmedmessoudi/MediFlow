export type EquipmentStatus = 'AVAILABLE' | 'IN_USE';

export interface Equipment {
  id?: number;
  name: string;
  type: string;
  status: EquipmentStatus;
  room?: any; // Room object
  department?: any; // Department object
}
